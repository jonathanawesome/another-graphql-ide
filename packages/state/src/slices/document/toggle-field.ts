import type {
  ArgumentNode,
  DefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLField,
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLSchema,
  InlineFragmentNode,
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

// What subselection a freshly inserted leaf needs.
type LeafSelection = 'none' | 'typename'

/**
 * Toggle a field path (or one of its arguments) into or out of the GraphQL
 * document, targeting the operation or fragment the cursor is inside. Pure: no
 * CodeMirror, no store. Returns the original query unchanged on any condition
 * it cannot handle safely (parse failure, unresolved path, missing types or
 * arguments). Union members are addressed via inline fragments (`... on Type`).
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
  // Toggleable leaves are always fields (union `... on Type` nodes are not
  // clickable), so a fragment-terminated path is not something we handle.
  if (leaf?.kind !== 'field') return { query }

  // Object/interface leaves get `{ __typename }` (or nothing in bare mode).
  // Union leaves always need a subselection and `__typename` is valid on any
  // member, so use it regardless of mode.
  const leafSelection: LeafSelection = isUnionType(leaf.namedType)
    ? 'typename'
    : isObjectType(leaf.namedType) || isInterfaceType(leaf.namedType)
      ? mode === 'bare'
        ? 'none'
        : 'typename'
      : 'none'

  const activeSelections = getSelections(activeDef)

  let newSelections: SelectionNode[]

  if (target.argument !== undefined) {
    const arg = leaf.field.args.find(a => a.name === target.argument)
    if (!arg) return { query }

    const existingField = fieldAtPath(activeSelections, steps, 0)
    const hasArg =
      existingField?.arguments?.some(a => a.name.value === target.argument) ??
      false

    if (hasArg) {
      newSelections = updateFieldAtPath(activeSelections, steps, 0, field => ({
        ...field,
        arguments: (field.arguments ?? []).filter(
          a => a.name.value !== target.argument
        ),
      }))
    } else {
      // Ensure the field exists, then add the argument with a placeholder value.
      const ensured = existingField
        ? activeSelections
        : insertField(activeSelections, steps, 0, leafSelection)
      const argNode = makeArgument(arg.name, placeholderValue(arg.type))
      newSelections = updateFieldAtPath(ensured, steps, 0, field => ({
        ...field,
        arguments: [...(field.arguments ?? []), argNode],
      }))
    }
  } else if (fieldAtPath(activeSelections, steps, 0)) {
    newSelections = removeField(activeSelections, steps, 0)
  } else {
    newSelections = insertField(activeSelections, steps, 0, leafSelection)
  }

  const newDef = withSelections(activeDef, newSelections)
  const newDefinitions = definitions.map(d => (d === activeDef ? newDef : d))
  const printed = print({ kind: Kind.DOCUMENT, definitions: newDefinitions })

  // Move the caret into a freshly created operation so it becomes the active
  // (highlighted) one. The op is appended last, so its unique name is the last
  // occurrence.
  if (createdOpName !== undefined) {
    const at = printed.lastIndexOf(createdOpName)
    if (at !== -1)
      return { query: printed, selection: { anchor: at, head: at } }
  }
  return { query: printed }
}

// --- definition + type resolution ---------------------------------------

/**
 * A resolved path segment. A `field` step descends a field; a `fragment` step
 * descends into a union member, i.e. an inline fragment `... on <typeName>`.
 */
type FieldStep = {
  kind: 'field'
  name: string
  field: GraphQLField<unknown, unknown>
  namedType: GraphQLNamedType
}
type FragmentStep = {
  kind: 'fragment'
  typeName: string
  namedType: GraphQLNamedType
}
type ResolvedStep = FieldStep | FragmentStep

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

/**
 * Walk the path against the schema; null if any segment cannot be resolved. A
 * segment under an object/interface is a field; a segment under a union names a
 * member type (an inline fragment).
 */
function resolvePath(
  baseType: GraphQLNamedType,
  path: string[]
): ResolvedStep[] | null {
  const steps: ResolvedStep[] = []
  let currentType: GraphQLNamedType = baseType
  for (const segment of path) {
    if (isObjectType(currentType) || isInterfaceType(currentType)) {
      const field = currentType.getFields()[segment]
      if (!field) return null
      const namedType = getNamedType(field.type)
      steps.push({ kind: 'field', name: segment, field, namedType })
      currentType = namedType
    } else if (isUnionType(currentType)) {
      const member = currentType.getTypes().find(t => t.name === segment)
      if (!member) return null
      steps.push({ kind: 'fragment', typeName: segment, namedType: member })
      currentType = member
    } else {
      return null
    }
  }
  return steps
}

// --- selection-set editing (pure, functional) ---------------------------
//
// A path is a list of steps: `field` steps descend a field, `fragment` steps
// descend into a union member via an inline fragment (`... on Type`). The four
// walkers below share the same shape: find the selection matching this step,
// then recurse into its children (or act, at the leaf). These helpers hold the
// per-step logic so each walker reads as just its own intent.

// A step is always satisfied by a field or an inline fragment, never a spread.
type Container = FieldNode | InlineFragmentNode

/** Does a selection node correspond to this step (field name or `... on Type`)? */
function matchesStep(selection: SelectionNode, step: ResolvedStep): boolean {
  return step.kind === 'fragment'
    ? selection.kind === Kind.INLINE_FRAGMENT &&
        selection.typeCondition?.name.value === step.typeName
    : selection.kind === Kind.FIELD && selection.name.value === step.name
}

/** The selection matching this step, narrowed to a field/fragment container. */
function findContainer(
  selections: readonly SelectionNode[],
  step: ResolvedStep
): Container | undefined {
  return selections.find((s): s is Container => matchesStep(s, step))
}

/** Child selections of a field or inline fragment. */
function stepChildren(node: Container): readonly SelectionNode[] {
  return node.selectionSet?.selections ?? []
}

/** Rebuild a field/fragment container around a new set of child selections. */
function withChildren(
  node: Container,
  selections: readonly SelectionNode[]
): Container {
  return { ...node, selectionSet: makeSelectionSet(selections) }
}

/** A container for a non-leaf step (an inline fragment or a field), wrapping `children`. */
function makeContainer(
  step: ResolvedStep,
  children: readonly SelectionNode[]
): SelectionNode {
  return step.kind === 'fragment'
    ? makeInlineFragment(step.typeName, children)
    : makeField(step.name, makeSelectionSet(children))
}

function removeAt(
  selections: readonly SelectionNode[],
  idx: number
): SelectionNode[] {
  return [...selections.slice(0, idx), ...selections.slice(idx + 1)]
}

/**
 * The field node at the end of the path, or null if any step is absent. Doubles
 * as the "does this path exist?" check.
 */
function fieldAtPath(
  selections: readonly SelectionNode[],
  steps: readonly ResolvedStep[],
  i: number
): FieldNode | null {
  const step = steps[i]
  if (!step) return null
  const match = findContainer(selections, step)
  if (!match) return null
  if (i === steps.length - 1) {
    return match.kind === Kind.FIELD ? match : null
  }
  return fieldAtPath(stepChildren(match), steps, i + 1)
}

/** Insert the leaf field, creating intermediate fields and inline fragments. */
function insertField(
  selections: readonly SelectionNode[],
  steps: readonly ResolvedStep[],
  i: number,
  leafSelection: LeafSelection
): SelectionNode[] {
  const step = steps[i]
  if (!step) return [...selections]

  // The leaf is always a field; append it.
  if (i === steps.length - 1) {
    return step.kind === 'field'
      ? [...selections, buildLeaf(step.name, leafSelection)]
      : [...selections]
  }

  // Descend into the matching container, creating it if absent.
  const match = findContainer(selections, step)
  if (!match) {
    const child = insertField([], steps, i + 1, leafSelection)
    return [...selections, makeContainer(step, child)]
  }
  const child = insertField(stepChildren(match), steps, i + 1, leafSelection)
  return replaceAt(
    selections,
    selections.indexOf(match),
    withChildren(match, child)
  )
}

/** Remove the leaf field, pruning any container left empty on the way up. */
function removeField(
  selections: readonly SelectionNode[],
  steps: readonly ResolvedStep[],
  i: number
): SelectionNode[] {
  const step = steps[i]
  if (!step) return [...selections]
  const match = findContainer(selections, step)
  if (!match) return [...selections]
  const idx = selections.indexOf(match)

  if (i === steps.length - 1) return removeAt(selections, idx)

  const child = removeField(stepChildren(match), steps, i + 1)
  return child.length === 0
    ? removeAt(selections, idx)
    : replaceAt(selections, idx, withChildren(match, child))
}

/** Rebuild the selections applying `update` to the field node at the path. */
function updateFieldAtPath(
  selections: readonly SelectionNode[],
  steps: readonly ResolvedStep[],
  i: number,
  update: (field: FieldNode) => FieldNode
): SelectionNode[] {
  const step = steps[i]
  if (!step) return [...selections]
  const match = findContainer(selections, step)
  if (!match) return [...selections]
  const idx = selections.indexOf(match)

  if (i === steps.length - 1) {
    return match.kind === Kind.FIELD
      ? replaceAt(selections, idx, update(match))
      : [...selections]
  }
  const child = updateFieldAtPath(stepChildren(match), steps, i + 1, update)
  return replaceAt(selections, idx, withChildren(match, child))
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

function buildLeaf(name: string, leafSelection: LeafSelection): FieldNode {
  if (leafSelection === 'none') return makeField(name)
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

function makeInlineFragment(
  typeName: string,
  selections: readonly SelectionNode[]
): InlineFragmentNode {
  return {
    kind: Kind.INLINE_FRAGMENT,
    typeCondition: { kind: Kind.NAMED_TYPE, name: makeName(typeName) },
    selectionSet: makeSelectionSet(selections),
  }
}

function makeSelectionSet(
  selections: readonly SelectionNode[]
): SelectionSetNode {
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
