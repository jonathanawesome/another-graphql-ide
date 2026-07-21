import type {
  ArgumentNode,
  DefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLField,
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLSchema,
  NameNode,
  OperationDefinitionNode,
  SelectionNode,
  SelectionSetNode,
  ValueNode,
} from 'graphql'
import {
  getNamedType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isNonNullType,
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

export type ComputeToggleResult = {
  query: string
  selection?: { anchor: number; head: number }
}

// The only definition kinds we insert into: named/anonymous operations and
// fragment definitions. Both carry a `selectionSet`.
type TargetableDefinition = OperationDefinitionNode | FragmentDefinitionNode

/**
 * Toggle a field path (or one of its arguments) into or out of the GraphQL
 * document, targeting the operation or fragment the cursor is inside. Pure: no
 * CodeMirror, no store. Returns the original query unchanged on any condition
 * it cannot handle safely (parse failure, unresolved path, unions, missing
 * types or arguments).
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

  // Add to the active (cursor) operation only when it is of the clicked field's
  // root type; otherwise start a fresh named operation. Adding to some other
  // existing operation requires the user to highlight it first.
  const rootOp = target.rootOperation as OperationTypeNode
  const operations = definitions.filter(
    (d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION
  )
  const activeOp =
    operations.length > 0
      ? operations[selectActiveDefIndex(operations, cursor)]
      : undefined

  let activeDef: TargetableDefinition
  let createdOpName: string | undefined
  if (activeOp?.operation === rootOp) {
    activeDef = activeOp
  } else {
    createdOpName = uniqueOperationName(definitions, rootOp)
    activeDef = {
      kind: Kind.OPERATION_DEFINITION,
      operation: rootOp,
      name: makeName(createdOpName),
      selectionSet: makeSelectionSet([]),
    }
    definitions = [...definitions, activeDef]
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

  if (target.argument !== undefined) {
    const arg = leaf.field.args.find(a => a.name === target.argument)
    if (!arg) return { query }

    const existingField = getFieldAtPath(activeSelections, names, 0)
    const hasArg =
      existingField?.arguments?.some(a => a.name.value === target.argument) ??
      false

    if (hasArg) {
      newSelections = updateFieldAtPath(activeSelections, names, 0, field => ({
        ...field,
        arguments: (field.arguments ?? []).filter(
          a => a.name.value !== target.argument
        ),
      }))
    } else {
      // Ensure the field exists, then add the argument with a placeholder value.
      const ensured = existingField
        ? activeSelections
        : insertField(activeSelections, names, 0, leafNeedsSelection, mode)
      const argNode = makeArgument(arg.name, placeholderValue(arg.type))
      newSelections = updateFieldAtPath(ensured, names, 0, field => ({
        ...field,
        arguments: [...(field.arguments ?? []), argNode],
      }))
    }
  } else if (pathExists(activeSelections, names, 0)) {
    newSelections = removeField(activeSelections, names, 0)
  } else {
    newSelections = insertField(
      activeSelections,
      names,
      0,
      leafNeedsSelection,
      mode
    )
  }

  const newDef = withSelections(activeDef, newSelections)
  const newDefinitions = definitions.map(d => (d === activeDef ? newDef : d))
  const printed = print({ kind: Kind.DOCUMENT, definitions: newDefinitions })

  // Move the caret into a freshly created operation so it becomes the active
  // (highlighted) one. The op is appended last, so its unique name is the last
  // occurrence.
  if (createdOpName !== undefined) {
    const at = printed.lastIndexOf(createdOpName)
    if (at !== -1) return { query: printed, selection: { anchor: at, head: at } }
  }
  return { query: printed }
}

// --- definition + type resolution ---------------------------------------

type ResolvedStep = {
  name: string
  field: GraphQLField<unknown, unknown>
  namedType: GraphQLNamedType
}

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

/** A fresh operation name like `NewQuery`, suffixed to avoid collisions. */
function uniqueOperationName(
  definitions: readonly DefinitionNode[],
  operation: OperationTypeNode
): string {
  const label =
    operation === OperationTypeNode.MUTATION
      ? 'Mutation'
      : operation === OperationTypeNode.SUBSCRIPTION
        ? 'Subscription'
        : 'Query'
  const base = `New${label}`

  const taken = new Set<string>()
  for (const def of definitions) {
    if (def.kind === Kind.OPERATION_DEFINITION && def.name) {
      taken.add(def.name.value)
    }
  }
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}${n}`)) n++
  return `${base}${n}`
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
    steps.push({ name: segment, field, namedType })
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

/** The field node at the given path, or null if any segment is absent. */
function getFieldAtPath(
  selections: readonly SelectionNode[],
  names: string[],
  i: number
): FieldNode | null {
  const field = selections.find(
    (s): s is FieldNode => s.kind === Kind.FIELD && s.name.value === names[i]
  )
  if (!field) return null
  if (i === names.length - 1) return field
  return getFieldAtPath(field.selectionSet?.selections ?? [], names, i + 1)
}

/** Rebuild the selections applying `update` to the field node at the path. */
function updateFieldAtPath(
  selections: readonly SelectionNode[],
  names: string[],
  i: number,
  update: (field: FieldNode) => FieldNode
): SelectionNode[] {
  const idx = selections.findIndex(
    s => s.kind === Kind.FIELD && s.name.value === names[i]
  )
  if (idx === -1) return [...selections]

  const field = selections[idx] as FieldNode
  if (i === names.length - 1) {
    return replaceAt(selections, idx, update(field))
  }
  const child = updateFieldAtPath(
    field.selectionSet?.selections ?? [],
    names,
    i + 1,
    update
  )
  return replaceAt(selections, idx, {
    ...field,
    selectionSet: makeSelectionSet(child),
  })
}

/** A self-contained placeholder literal matching the argument type. */
function placeholderValue(type: GraphQLInputType): ValueNode {
  if (isNonNullType(type)) return placeholderValue(type.ofType)
  if (isListType(type)) return { kind: Kind.LIST, values: [] }

  const named = getNamedType(type)
  if (isEnumType(named)) {
    const first = named.getValues()[0]
    return first ? { kind: Kind.ENUM, value: first.name } : { kind: Kind.NULL }
  }
  if (isInputObjectType(named)) return { kind: Kind.OBJECT, fields: [] }

  switch (named.name) {
    case 'Int':
      return { kind: Kind.INT, value: '0' }
    case 'Float':
      return { kind: Kind.FLOAT, value: '0' }
    case 'Boolean':
      return { kind: Kind.BOOLEAN, value: false }
    default:
      // String, ID, and custom scalars get an empty string.
      return { kind: Kind.STRING, value: '' }
  }
}

// --- node builders ------------------------------------------------------

function makeArgument(name: string, value: ValueNode): ArgumentNode {
  return { kind: Kind.ARGUMENT, name: makeName(name), value }
}

function buildLeaf(
  name: string,
  needsSelection: boolean,
  mode: ObjectFieldInsertionMode
): FieldNode {
  // `bare` leaves an object field with no subselection for the user to fill.
  if (!needsSelection || mode === 'bare') return makeField(name)
  return makeField(name, makeSelectionSet([makeField('__typename')]))
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
