import type {
  GraphQLArgument,
  GraphQLField,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
} from 'graphql'
import {
  getNamedType,
  isInterfaceType,
  isObjectType,
  isUnionType,
} from 'graphql'

/**
 * The tree is LAZY: a node describes itself and nothing below it. Children are
 * derived on demand by `getNodeChildren`, one level at a time. Schemas are
 * cyclic graphs, so materializing children up front means either an arbitrary
 * depth cap or an unbounded walk.
 *
 * `id` is the dotted path from the root operation (`query.user.posts.title`,
 * `query.user.arguments.id`). That string is the contract with
 * `computePresentPaths` and with the document slice's `toggleField`, so it must
 * keep its exact shape.
 */
export type TreeNode = {
  id: string
  name: string
  type: 'root' | 'field' | 'type' | 'argument' | 'arguments'
  graphqlType?: GraphQLType
  graphqlField?: GraphQLField<unknown, unknown>
  graphqlArgument?: GraphQLArgument
  /** Composite types seen on the path to here, for detecting recursion. */
  chain?: TypeChain
  /** This node's type already appears above it, so expanding here loops. */
  isRecursive?: boolean
}

/** Linked list rather than a Set: extending is O(1) and shares its tail. */
export type TypeChain = { readonly name: string; readonly next?: TypeChain }

export type TabType = 'query' | 'mutation' | 'subscription' | 'favorites'

/**
 * How deep a user can drill. Not a limit on what exists (cycles make that
 * infinite) but a bound on manual expansion, which also bounds node id length.
 */
export const MAX_TREE_DEPTH = 50

/** One rendered row: a node plus where it sits in the currently visible tree. */
export type FlatRow = {
  node: TreeNode
  depth: number
  hasChildren: boolean
  isExpanded: boolean
  /**
   * One entry per ancestor column, innermost last: whether that ancestor still
   * has rows below this one, so the indent rail should run the full height
   * rather than stop at this row's elbow. Nested markup gave this for free;
   * flattened, each row has to draw its own rails.
   */
  guides: readonly boolean[]
}

const NO_GUIDES: readonly boolean[] = []

const isComposite = (type: GraphQLNamedType) =>
  isObjectType(type) || isInterfaceType(type) || isUnionType(type)

const chainHas = (chain: TypeChain | undefined, name: string): boolean => {
  for (let link = chain; link; link = link.next) {
    if (link.name === name) return true
  }
  return false
}

const extendChain = (
  chain: TypeChain | undefined,
  name: string
): TypeChain => ({ name, next: chain })

/**
 * Whether a node can be expanded, without building its children. Exact rather
 * than a guess: GraphQL forbids object, interface, and union types with no
 * members, so a composite type always yields at least one child.
 */
export function nodeHasChildren(node: TreeNode): boolean {
  switch (node.type) {
    case 'argument':
      return false
    // Only created when the field has arguments.
    case 'arguments':
      return true
    case 'field':
      if ((node.graphqlField?.args.length ?? 0) > 0) return true
      return node.graphqlType
        ? isComposite(getNamedType(node.graphqlType))
        : false
    default:
      return node.graphqlType
        ? isComposite(getNamedType(node.graphqlType))
        : false
  }
}

/**
 * Sort nodes with expandable types first, then leaf fields
 */
function sortTreeNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.sort((a, b) => {
    const aHasChildren = nodeHasChildren(a)
    const bHasChildren = nodeHasChildren(b)

    // If one has children and the other doesn't, prioritize the one with children
    if (aHasChildren && !bHasChildren) return -1
    if (!aHasChildren && bHasChildren) return 1

    // If both have children or both are leaves, sort alphabetically
    return a.name.localeCompare(b.name)
  })
}

/** A field node, carrying enough to derive its own children later. */
function makeFieldNode(
  id: string,
  name: string,
  field: GraphQLField<unknown, unknown>,
  parentChain: TypeChain | undefined
): TreeNode {
  const namedType = getNamedType(field.type)

  // Scalars and enums repeat everywhere, so recursion only means something for
  // composite types.
  if (!isComposite(namedType)) {
    return {
      id,
      name,
      type: 'field',
      graphqlType: field.type,
      graphqlField: field,
    }
  }

  return {
    id,
    name,
    type: 'field',
    graphqlType: field.type,
    graphqlField: field,
    chain: extendChain(parentChain, namedType.name),
    isRecursive: chainHas(parentChain, namedType.name),
  }
}

/**
 * The `ARGUMENTS` node for a field, or nothing when the field takes none. It
 * holds the field so its own children can be derived on expand.
 */
function createArgumentsNode(
  fieldId: string,
  field: GraphQLField<unknown, unknown> | undefined
): TreeNode[] {
  if (!field || field.args.length === 0) return []

  return [
    {
      id: `${fieldId}.arguments`,
      name: 'ARGUMENTS',
      type: 'arguments',
      graphqlField: field,
    },
  ]
}

/** The arguments themselves, in declaration order. */
function createArgumentChildren(
  argumentsId: string,
  field: GraphQLField<unknown, unknown> | undefined
): TreeNode[] {
  return (field?.args ?? []).map(arg => ({
    id: `${argumentsId}.${arg.name}`,
    name: arg.name,
    type: 'argument' as const,
    graphqlType: arg.type,
    graphqlArgument: arg,
  }))
}

/**
 * One level of children for a type. Objects and interfaces yield their fields;
 * unions yield their members as `... on <Type>`; everything else is a leaf.
 */
function createTypeChildren(
  parentId: string,
  type: GraphQLType | undefined,
  parentChain: TypeChain | undefined
): TreeNode[] {
  if (!type) return []

  const namedType = getNamedType(type)

  if (isObjectType(namedType) || isInterfaceType(namedType)) {
    return sortTreeNodes(
      Object.entries(namedType.getFields()).map(([fieldName, field]) =>
        makeFieldNode(`${parentId}.${fieldName}`, fieldName, field, parentChain)
      )
    )
  }

  if (isUnionType(namedType)) {
    return sortTreeNodes(
      namedType.getTypes().map(possibleType => ({
        id: `${parentId}.${possibleType.name}`,
        name: `... on ${possibleType.name}`,
        type: 'type' as const,
        graphqlType: possibleType,
        chain: extendChain(parentChain, possibleType.name),
        isRecursive: chainHas(parentChain, possibleType.name),
      }))
    )
  }

  return []
}

/**
 * One level below a node. Arguments come first, unsorted, then the type's own
 * children sorted.
 */
export function getNodeChildren(node: TreeNode): TreeNode[] {
  switch (node.type) {
    case 'arguments':
      return createArgumentChildren(node.id, node.graphqlField)
    case 'argument':
      return []
    case 'field':
      return [
        ...createArgumentsNode(node.id, node.graphqlField),
        ...createTypeChildren(node.id, node.graphqlType, node.chain),
      ]
    default:
      return createTypeChildren(node.id, node.graphqlType, node.chain)
  }
}

function createRootNode(
  id: string,
  name: string,
  type: GraphQLObjectType
): TreeNode {
  return {
    id,
    name,
    type: 'root',
    graphqlType: type,
    chain: extendChain(undefined, type.name),
  }
}

/**
 * Parse GraphQL schema into tree data organized by operation type
 */
export function createSchemaTreeData(schema: GraphQLSchema) {
  const queryType = schema.getQueryType()
  const mutationType = schema.getMutationType()
  const subscriptionType = schema.getSubscriptionType()

  return {
    query: queryType ? createRootNode('query', 'Query', queryType) : null,
    mutation: mutationType
      ? createRootNode('mutation', 'Mutation', mutationType)
      : null,
    subscription: subscriptionType
      ? createRootNode('subscription', 'Subscription', subscriptionType)
      : null,
  }
}

/**
 * Depth-first walk of the currently visible tree into the flat array the
 * virtualizer renders, expanded descendants included.
 */
export function flattenTree(
  roots: readonly TreeNode[],
  expanded: ReadonlySet<string>,
  getChildren: (node: TreeNode) => TreeNode[]
): FlatRow[] {
  const rows: FlatRow[] = []
  const stack: { node: TreeNode; depth: number; guides: readonly boolean[] }[] =
    []

  for (let i = roots.length - 1; i >= 0; i--) {
    const node = roots[i]
    if (node) stack.push({ node, depth: 0, guides: NO_GUIDES })
  }

  while (stack.length > 0) {
    const entry = stack.pop()
    if (!entry) break

    const { node, depth, guides } = entry
    const hasChildren = nodeHasChildren(node)
    const isExpanded = hasChildren && expanded.has(node.id)
    rows.push({ node, depth, hasChildren, isExpanded, guides })

    if (!isExpanded || depth + 1 >= MAX_TREE_DEPTH) continue

    const children = getChildren(node)
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i]
      // A child's own column continues past it unless it is the last sibling.
      if (child)
        stack.push({
          node: child,
          depth: depth + 1,
          guides: [...guides, i !== children.length - 1],
        })
    }
  }

  return rows
}
