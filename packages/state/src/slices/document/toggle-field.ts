import type {
  DefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLNamedType,
  GraphQLSchema,
  NameNode,
  OperationDefinitionNode,
  SelectionNode,
  SelectionSetNode,
} from 'graphql'
import {
  getNamedType,
  isInterfaceType,
  isObjectType,
  isUnionType,
  Kind,
  OperationTypeNode,
  parse,
  print,
} from 'graphql'

import type { ObjectFieldInsertionMode } from '../settings/types'

import type { ToggleFieldTarget } from './types'

export type ComputeToggleParams = {
  query: string
  cursor: number
  schema: GraphQLSchema
  target: ToggleFieldTarget
  mode: ObjectFieldInsertionMode
}

export type ComputeToggleResult = { query: string; selection?: number }

// The only definition kinds we insert into: named/anonymous operations and
// fragment definitions. Both carry a `selectionSet`.
type TargetableDefinition = OperationDefinitionNode | FragmentDefinitionNode

// Unique token inserted as the sole child of a new object field in
// `empty-braces` mode. It forces `print` to emit braces (graphql prints
// nothing for an empty selection set), then we splice it out and return its
// offset so the caret lands between the braces.
const CARET_SENTINEL = '__AGI_CARET__'

/**
 * Toggle a field path into or out of the GraphQL document, targeting the
 * operation or fragment the cursor is inside. Pure: no CodeMirror, no store.
 * Returns the original query unchanged on any condition it cannot handle
 * safely (parse failure, unresolved path, unions/arguments, missing types).
 */
export function computeToggle({
  query,
  cursor,
  schema,
  target,
  mode,
}: ComputeToggleParams): ComputeToggleResult {
  if (target.path.length === 0) return { query }

  // Empty document: start from zero definitions. A half-typed query that fails
  // to parse is left untouched.
  let definitions: DefinitionNode[]
  if (query.trim() === '') {
    definitions = []
  } else {
    try {
      definitions = [...parse(query).definitions]
    } catch {
      return { query }
    }
  }

  // Find the active operation/fragment, or synthesize one when the doc is empty.
  const targetable = definitions.filter(
    (d): d is TargetableDefinition =>
      d.kind === Kind.OPERATION_DEFINITION ||
      d.kind === Kind.FRAGMENT_DEFINITION
  )
  let activeDef: TargetableDefinition
  if (targetable.length === 0) {
    activeDef = {
      kind: Kind.OPERATION_DEFINITION,
      operation: target.rootOperation as OperationTypeNode,
      selectionSet: makeSelectionSet([]),
    }
    definitions = [...definitions, activeDef]
  } else {
    const found = targetable[selectActiveDefIndex(targetable, cursor)]
    if (!found) return { query }
    activeDef = found
  }

  // Resolve the base type the path is relative to.
  const baseType = definitionBaseType(activeDef, schema)
  if (!baseType) return { query }

  // Resolve each path segment against the schema; bail on anything we defer.
  const steps = resolvePath(baseType, target.path)
  if (!steps) return { query }
  const leaf = steps[steps.length - 1]
  if (!leaf || isUnionType(leaf.namedType)) return { query } // unions deferred
  const leafNeedsSelection =
    isObjectType(leaf.namedType) || isInterfaceType(leaf.namedType)

  const activeSelections = getSelections(activeDef)
  const names = target.path

  let newSelections: SelectionNode[]
  let insertedCaret = false
  if (pathExists(activeSelections, names, 0)) {
    newSelections = removeField(activeSelections, names, 0)
  } else {
    newSelections = insertField(
      activeSelections,
      names,
      0,
      leafNeedsSelection,
      mode
    )
    insertedCaret = leafNeedsSelection && mode === 'empty-braces'
  }

  const newDef = withSelections(activeDef, newSelections)
  const newDefinitions = definitions.map(d => (d === activeDef ? newDef : d))
  const printed = print({ kind: Kind.DOCUMENT, definitions: newDefinitions })

  if (insertedCaret) {
    const at = printed.indexOf(CARET_SENTINEL)
    if (at !== -1) {
      return {
        query: printed.slice(0, at) + printed.slice(at + CARET_SENTINEL.length),
        selection: at,
      }
    }
  }
  return { query: printed }
}

// --- definition + type resolution ---------------------------------------

type ResolvedStep = { name: string; namedType: GraphQLNamedType }

/** GraphiQL-style: the def containing the cursor, else the last starting before it, else the first. */
function selectActiveDefIndex(
  defs: readonly DefinitionNode[],
  cursor: number
): number {
  const containing = defs.findIndex(
    d => d.loc && cursor >= d.loc.start && cursor <= d.loc.end
  )
  if (containing !== -1) return containing
  let before = -1
  for (let i = 0; i < defs.length; i++) {
    const loc = defs[i]?.loc
    if (loc && loc.start <= cursor) before = i
  }
  return before === -1 ? 0 : before
}

function definitionBaseType(
  def: TargetableDefinition,
  schema: GraphQLSchema
): GraphQLNamedType | null | undefined {
  if (def.kind === Kind.OPERATION_DEFINITION) {
    if (def.operation === OperationTypeNode.QUERY) return schema.getQueryType()
    if (def.operation === OperationTypeNode.MUTATION)
      return schema.getMutationType()
    return schema.getSubscriptionType()
  }
  return schema.getType(def.typeCondition.name.value)
}

/** Walk the path against the schema; null if any segment cannot be descended/resolved. */
function resolvePath(
  baseType: GraphQLNamedType,
  path: string[]
): ResolvedStep[] | null {
  const steps: ResolvedStep[] = []
  let currentType: GraphQLNamedType = baseType
  for (const segment of path) {
    if (!isObjectType(currentType) && !isInterfaceType(currentType)) return null
    const field = currentType.getFields()[segment]
    if (!field) return null
    const namedType = getNamedType(field.type)
    steps.push({ name: segment, namedType })
    currentType = namedType
  }
  return steps
}

// --- selection-set editing (pure, functional) ---------------------------

function pathExists(
  selections: readonly SelectionNode[],
  names: string[],
  i: number
): boolean {
  const field = selections.find(
    (s): s is FieldNode => s.kind === Kind.FIELD && s.name.value === names[i]
  )
  if (!field) return false
  if (i === names.length - 1) return true
  return pathExists(field.selectionSet?.selections ?? [], names, i + 1)
}

function insertField(
  selections: readonly SelectionNode[],
  names: string[],
  i: number,
  leafNeedsSelection: boolean,
  mode: ObjectFieldInsertionMode
): SelectionNode[] {
  const name = names[i]
  if (name === undefined) return [...selections]
  const isLeaf = i === names.length - 1
  const idx = selections.findIndex(
    s => s.kind === Kind.FIELD && s.name.value === name
  )

  if (isLeaf) {
    return [...selections, buildLeaf(name, leafNeedsSelection, mode)]
  }

  if (idx !== -1) {
    const existing = selections[idx] as FieldNode
    const child = insertField(
      existing.selectionSet?.selections ?? [],
      names,
      i + 1,
      leafNeedsSelection,
      mode
    )
    return replaceAt(selections, idx, {
      ...existing,
      selectionSet: makeSelectionSet(child),
    })
  }

  const child = insertField([], names, i + 1, leafNeedsSelection, mode)
  return [...selections, makeField(name, makeSelectionSet(child))]
}

function removeField(
  selections: readonly SelectionNode[],
  names: string[],
  i: number
): SelectionNode[] {
  const name = names[i]
  const idx = selections.findIndex(
    s => s.kind === Kind.FIELD && s.name.value === name
  )
  if (idx === -1) return [...selections]

  if (i === names.length - 1) {
    return [...selections.slice(0, idx), ...selections.slice(idx + 1)]
  }

  const existing = selections[idx] as FieldNode
  const child = removeField(existing.selectionSet?.selections ?? [], names, i + 1)
  // Prune an intermediate whose selection set is now empty.
  if (child.length === 0) {
    return [...selections.slice(0, idx), ...selections.slice(idx + 1)]
  }
  return replaceAt(selections, idx, {
    ...existing,
    selectionSet: makeSelectionSet(child),
  })
}

// --- node builders ------------------------------------------------------

function buildLeaf(
  name: string,
  needsSelection: boolean,
  mode: ObjectFieldInsertionMode
): FieldNode {
  if (!needsSelection) return makeField(name)
  const child = mode === 'typename' ? '__typename' : CARET_SENTINEL
  return makeField(name, makeSelectionSet([makeField(child)]))
}

function makeName(value: string): NameNode {
  return { kind: Kind.NAME, value }
}

function makeField(name: string, selectionSet?: SelectionSetNode): FieldNode {
  return {
    kind: Kind.FIELD,
    name: makeName(name),
    ...(selectionSet ? { selectionSet } : {}),
  }
}

function makeSelectionSet(selections: readonly SelectionNode[]): SelectionSetNode {
  return { kind: Kind.SELECTION_SET, selections }
}

function replaceAt(
  selections: readonly SelectionNode[],
  idx: number,
  next: SelectionNode
): SelectionNode[] {
  return [...selections.slice(0, idx), next, ...selections.slice(idx + 1)]
}

function getSelections(def: TargetableDefinition): readonly SelectionNode[] {
  return def.selectionSet.selections
}

function withSelections(
  def: TargetableDefinition,
  selections: SelectionNode[]
): TargetableDefinition {
  return { ...def, selectionSet: makeSelectionSet(selections) }
}
