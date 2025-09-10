import { GraphQLSchema } from 'graphql'
import { useState } from 'react'

import { Icon } from '../../ui-components/icon/icon'
import { IconButton } from '../../ui-components/icon-button/icon-button'
import { Tabs } from '../../ui-components/tabs/tabs'

import { TreeContainer } from './components/tree-container'
import { useSchemaTree } from './hooks/use-schema-tree'
import { schemaTreeViewStyles } from './schema-tree-view.css'

export type SchemaTreeViewProps = {
  schema: GraphQLSchema
}

export const SchemaTreeView = ({ schema }: SchemaTreeViewProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')

  // Get data for all tabs
  const queryData = useSchemaTree(schema, searchTerm, 'query')
  const mutationData = useSchemaTree(schema, searchTerm, 'mutation')
  const subscriptionData = useSchemaTree(schema, searchTerm, 'subscription')
  const favoritesData = useSchemaTree(schema, searchTerm, 'favorites')

  function toggleExpanded(nodeId: string) {
    setExpanded(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

  // Create tab items with content
  const tabItems = []

  if (queryData.schemaData.query) {
    tabItems.push({
      name: 'query',
      content: queryData.currentTabData?.children ? (
        <TreeContainer
          nodes={queryData.currentTabData.children}
          expandedNodes={expanded}
          onToggleExpanded={toggleExpanded}
        />
      ) : null,
      trigger: {
        text: 'Query',
        pill:
          queryData.fieldCounts.query > 0
            ? { text: queryData.fieldCounts.query.toString() }
            : undefined,
      },
    })
  }

  if (mutationData.schemaData.mutation) {
    tabItems.push({
      name: 'mutation',
      content: mutationData.currentTabData?.children ? (
        <TreeContainer
          nodes={mutationData.currentTabData.children}
          expandedNodes={expanded}
          onToggleExpanded={toggleExpanded}
        />
      ) : null,
      trigger: {
        text: 'Mutation',
        pill:
          mutationData.fieldCounts.mutation > 0
            ? { text: mutationData.fieldCounts.mutation.toString() }
            : undefined,
      },
    })
  }

  if (subscriptionData.schemaData.subscription) {
    tabItems.push({
      name: 'subscription',
      content: subscriptionData.currentTabData?.children ? (
        <TreeContainer
          nodes={subscriptionData.currentTabData.children}
          expandedNodes={expanded}
          onToggleExpanded={toggleExpanded}
        />
      ) : null,
      trigger: {
        text: 'Subscription',
        pill:
          subscriptionData.fieldCounts.subscription > 0
            ? { text: subscriptionData.fieldCounts.subscription.toString() }
            : undefined,
      },
    })
  }

  // Add favorites tab
  tabItems.push({
    name: 'favorites',
    content: favoritesData.currentTabData?.children ? (
      <TreeContainer
        nodes={favoritesData.currentTabData.children}
        expandedNodes={expanded}
        onToggleExpanded={toggleExpanded}
      />
    ) : (
      <div className={schemaTreeViewStyles.emptyState}>
        No favorites yet. Click on fields to add them to your favorites.
      </div>
    ),
    trigger: {
      text: 'Favorites',
    },
  })

  return (
    <div className={schemaTreeViewStyles.container}>
      <div className={schemaTreeViewStyles.searchContainer}>
        <Icon name="Search" size="small" />
        <input
          type="text"
          placeholder="Search schema..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={schemaTreeViewStyles.searchInput}
        />
        {searchTerm && (
          <IconButton
            iconName="X"
            title="Clear search"
            action={() => setSearchTerm('')}
            size="small"
          />
        )}
      </div>

      <Tabs items={tabItems} label="Schema types" defaultActiveTab="query" />
    </div>
  )
}
