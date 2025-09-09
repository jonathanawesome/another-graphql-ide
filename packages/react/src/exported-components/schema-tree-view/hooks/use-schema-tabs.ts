import { useMemo } from 'react'

import type { TabGroupItemProps } from '../../../ui-components/tab-group-item/tab-group-item'
import type { TreeNode, TabType } from '../utils/tree-utils'

type SchemaData = {
  query: TreeNode | null
  mutation: TreeNode | null
  subscription: TreeNode | null
}

type FieldCounts = {
  query: number
  mutation: number
  subscription: number
}

/**
 * Hook for creating tab configuration based on schema data and field counts
 */
export function useSchemaTabs(
  schemaData: SchemaData,
  activeTab: TabType,
  fieldCounts: FieldCounts,
  setActiveTab: (tab: TabType) => void
): TabGroupItemProps[] {
  return useMemo(() => {
    const tabsConfig: TabGroupItemProps[] = []

    if (schemaData.query) {
      tabsConfig.push({
        text: 'Query',
        action: () => setActiveTab('query'),
        active: activeTab === 'query',
        pill:
          fieldCounts.query > 0
            ? { text: fieldCounts.query.toString() }
            : undefined,
      })
    }

    if (schemaData.mutation) {
      tabsConfig.push({
        text: 'Mutation',
        action: () => setActiveTab('mutation'),
        active: activeTab === 'mutation',
        pill:
          fieldCounts.mutation > 0
            ? { text: fieldCounts.mutation.toString() }
            : undefined,
      })
    }

    if (schemaData.subscription) {
      tabsConfig.push({
        text: 'Subscription',
        action: () => setActiveTab('subscription'),
        active: activeTab === 'subscription',
        pill:
          fieldCounts.subscription > 0
            ? { text: fieldCounts.subscription.toString() }
            : undefined,
      })
    }

    // Add favorites tab (placeholder for now)
    tabsConfig.push({
      text: 'Favorites',
      action: () => setActiveTab('favorites'),
      active: activeTab === 'favorites',
    })

    return tabsConfig
  }, [schemaData, activeTab, fieldCounts, setActiveTab])
}
