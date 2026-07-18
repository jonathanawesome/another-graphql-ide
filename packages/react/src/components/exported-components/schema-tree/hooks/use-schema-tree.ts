import { GraphQLSchema } from 'graphql'
import { useMemo, useCallback } from 'react'

import {
  createSchemaTreeData,
  type ListItemType,
  type TabType,
} from '../utils/tree-utils'

/**
 * Hook for managing schema tree data and search filtering
 */
export function useSchemaTree(
  schema: GraphQLSchema,
  searchTerm: string,
  activeTab: TabType
) {
  // Parse schema into organized data by operation type
  const schemaData = useMemo(() => createSchemaTreeData(schema), [schema])

  // Helper function to count fields matching search term
  const getFilteredFieldCount = useCallback(
    (rootNode: ListItemType | null, searchTerm: string): number => {
      if (!rootNode?.children) return 0
      if (!searchTerm.trim()) return rootNode.children.length

      return rootNode.children.filter(child =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).length
    },
    []
  )

  // Get field counts for tab labels (filtered by search if active)
  const fieldCounts = useMemo(
    () => ({
      query: getFilteredFieldCount(schemaData.query, searchTerm),
      mutation: getFilteredFieldCount(schemaData.mutation, searchTerm),
      subscription: getFilteredFieldCount(schemaData.subscription, searchTerm),
    }),
    [schemaData, searchTerm, getFilteredFieldCount]
  )

  // Get current tab data with filtering
  const tabData = useMemo(() => {
    let rootNode: ListItemType | null

    if (activeTab === 'query') rootNode = schemaData.query
    else if (activeTab === 'mutation') rootNode = schemaData.mutation
    else if (activeTab === 'subscription') rootNode = schemaData.subscription
    else return null // 'favorites' — TODO: implement favorites

    if (!rootNode) return null

    // Apply search filtering
    if (!searchTerm.trim()) return rootNode

    return {
      ...rootNode,
      children:
        rootNode.children?.filter(child =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ?? [],
    }
  }, [schemaData, activeTab, searchTerm])

  return {
    schemaData,
    fieldCounts,
    tabData,
  }
}
