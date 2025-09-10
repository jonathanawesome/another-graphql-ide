import { useMemo, type ReactNode } from 'react'

import type { TabTriggerProps } from '../../../ui-components/tabs/tab-trigger'
import type { ListItemType, TabType } from '../utils/tree-utils'

type SchemaData = {
  query: ListItemType | null
  mutation: ListItemType | null
  subscription: ListItemType | null
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
  setActiveTab: (tab: TabType) => void,
  renderContent: (tabType: TabType) => ReactNode
): Array<{
  name: string
  content: ReactNode
  trigger: Omit<TabTriggerProps, 'tabName'>
}> {
  return useMemo(() => {
    const tabsConfig: Array<{
      name: string
      content: ReactNode
      trigger: Omit<TabTriggerProps, 'tabName'>
    }> = []

    if (schemaData.query) {
      tabsConfig.push({
        name: 'query',
        content: renderContent('query'),
        trigger: {
          text: 'Query',
          pill:
            fieldCounts.query > 0
              ? { text: fieldCounts.query.toString() }
              : undefined,
        },
      })
    }

    if (schemaData.mutation) {
      tabsConfig.push({
        name: 'mutation',
        content: renderContent('mutation'),
        trigger: {
          text: 'Mutation',
          pill:
            fieldCounts.mutation > 0
              ? { text: fieldCounts.mutation.toString() }
              : undefined,
        },
      })
    }

    if (schemaData.subscription) {
      tabsConfig.push({
        name: 'subscription',
        content: renderContent('subscription'),
        trigger: {
          text: 'Subscription',
          pill:
            fieldCounts.subscription > 0
              ? { text: fieldCounts.subscription.toString() }
              : undefined,
        },
      })
    }

    // Add favorites tab (placeholder for now)
    tabsConfig.push({
      name: 'favorites',
      content: renderContent('favorites'),
      trigger: {
        text: 'Favorites',
      },
    })

    return tabsConfig
  }, [schemaData, fieldCounts, renderContent])
}
