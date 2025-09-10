import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLField,
  GraphQLType,
  GraphQLArgument,
  isObjectType,
  getNamedType,
} from 'graphql'

export type ListItemType = {
  id: string
  name: string
  type: 'root' | 'field' | 'type' | 'argument' | 'arguments'
  graphqlType?: GraphQLType
  graphqlField?: GraphQLField<unknown, unknown>
  graphqlArgument?: GraphQLArgument
  children?: ListItemType[]
  parent?: ListItemType
}

export type TabType = 'query' | 'mutation' | 'subscription' | 'favorites'

/**
 * Sort nodes with expandable types first, then leaf fields
 */
export function sortTreeNodes(nodes: ListItemType[]): ListItemType[] {
  return nodes.sort((a, b) => {
    // Check if nodes have children
    const aHasChildren = a.children && a.children.length > 0
    const bHasChildren = b.children && b.children.length > 0

    // If one has children and the other doesn't, prioritize the one with children
    if (aHasChildren && !bHasChildren) return -1
    if (!aHasChildren && bHasChildren) return 1

    // If both have children or both are leaves, sort alphabetically
    return a.name.localeCompare(b.name)
  })
}

/**
 * Create children tree nodes from a GraphQL type
 */
export function createChildrenFromType(
  parentId: string,
  type: GraphQLType,
  depth = 0
): ListItemType[] {
  // Limit recursion depth to prevent infinite loops with circular references
  if (depth > 5) return []

  const namedType = getNamedType(type)

  // Only create children for object types that have fields
  if (isObjectType(namedType)) {
    const fields = namedType.getFields()
    const nodes = Object.keys(fields).map(fieldName => {
      const childField = fields[fieldName]
      const childId = `${parentId}.${fieldName}`

      return {
        id: childId,
        name: fieldName,
        type: 'field' as const,
        graphqlType: childField.type,
        children: createChildrenFromType(childId, childField.type, depth + 1),
      }
    })

    return sortTreeNodes(nodes)
  }

  return []
}

/**
 * Create argument nodes for a field
 */
export function createArgumentNodes(
  parentId: string,
  field: GraphQLField<unknown, unknown>
): ListItemType[] {
  const args = field.args || []
  
  if (args.length === 0) return []
  
  // Create the ARGUMENTS collapsible node
  const argumentsNode: ListItemType = {
    id: `${parentId}.arguments`,
    name: 'ARGUMENTS',
    type: 'arguments',
    children: args.map(arg => ({
      id: `${parentId}.arguments.${arg.name}`,
      name: arg.name,
      type: 'argument',
      graphqlType: arg.type,
      graphqlArgument: arg,
    })),
  }
  
  return [argumentsNode]
}

/**
 * Create a tree node for a GraphQL field (eager version - creates children immediately)
 */
export function createFieldNode(
  id: string,
  name: string,
  field: GraphQLField<unknown, unknown>
): ListItemType {
  const typeChildren = createChildrenFromType(`${id}.${name}`, field.type)
  const argumentNodes = createArgumentNodes(id, field)
  
  // Combine arguments (if any) with type children
  const children = [...argumentNodes, ...typeChildren]

  return {
    id,
    name,
    type: 'field',
    graphqlType: field.type,
    graphqlField: field,
    children,
  }
}

/**
 * Create a root tree node for a GraphQL object type
 */
export function createRootNode(
  id: string,
  name: string,
  type: GraphQLObjectType
): ListItemType {
  const fields = type.getFields()
  const children = sortTreeNodes(
    Object.keys(fields).map(fieldName =>
      createFieldNode(`${id}.${fieldName}`, fieldName, fields[fieldName])
    )
  )

  return {
    id,
    name,
    type: 'root',
    graphqlType: type,
    children,
  }
}

/**
 * Flattened tree node for virtualization
 */
export type FlattenedListItem = ListItemType & {
  depth: number
  isVisible: boolean
}

/**
 * Flatten tree nodes into a list for virtualization
 */
export function flattenListItems(
  nodes: ListItemType[],
  expandedNodes: Record<string, boolean>,
  depth = 0
): FlattenedListItem[] {
  const flattened: FlattenedListItem[] = []

  for (const node of nodes) {
    // Add the current node
    flattened.push({
      ...node,
      depth,
      isVisible: true,
    })

    // If the node is expanded and has children, add them recursively
    if (expandedNodes[node.id] && node.children && node.children.length > 0) {
      flattened.push(
        ...flattenListItems(node.children, expandedNodes, depth + 1)
      )
    }
  }

  return flattened
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
