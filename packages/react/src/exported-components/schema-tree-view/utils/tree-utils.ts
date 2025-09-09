import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLField,
  GraphQLType,
  isObjectType,
  getNamedType,
} from 'graphql'

export type TreeNode = {
  id: string
  name: string
  type: 'root' | 'field' | 'type' | 'argument'
  graphqlType?: GraphQLType
  children?: TreeNode[]
  parent?: TreeNode
}

export type TabType = 'query' | 'mutation' | 'subscription' | 'favorites'

/**
 * Sort nodes with expandable types first, then leaf fields
 */
export function sortTreeNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.sort((a, b) => {
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
): TreeNode[] {
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
 * Create a tree node for a GraphQL field
 */
export function createFieldNode(
  id: string,
  name: string,
  field: GraphQLField<unknown, unknown>
): TreeNode {
  const children = createChildrenFromType(`${id}.${name}`, field.type)
  
  return {
    id,
    name,
    type: 'field',
    graphqlType: field.type,
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
): TreeNode {
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
 * Parse GraphQL schema into tree data organized by operation type
 */
export function createSchemaTreeData(schema: GraphQLSchema) {
  const queryType = schema.getQueryType()
  const mutationType = schema.getMutationType()
  const subscriptionType = schema.getSubscriptionType()

  return {
    query: queryType ? createRootNode('query', 'Query', queryType) : null,
    mutation: mutationType ? createRootNode('mutation', 'Mutation', mutationType) : null,
    subscription: subscriptionType ? createRootNode('subscription', 'Subscription', subscriptionType) : null,
  }
}