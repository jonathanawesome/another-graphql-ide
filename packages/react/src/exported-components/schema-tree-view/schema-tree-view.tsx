import { GraphQLSchema } from 'graphql'
import { useState } from 'react'

import { Icon } from '../../ui-components/icon/icon'
import { IconButton } from '../../ui-components/icon-button/icon-button'
import { TabGroup } from '../../ui-components/tab-group/tab-group'

import { TreeNode } from './components/tree-node'
import { useSchemaTabs } from './hooks/use-schema-tabs'
import { useSchemaTree } from './hooks/use-schema-tree'
import { schemaTreeViewStyles } from './schema-tree-view.css'
import type { TabType } from './utils/tree-utils'

export type SchemaTreeViewProps = {
  schema: GraphQLSchema
}

export const SchemaTreeView = ({ schema }: SchemaTreeViewProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('query')

  // Use custom hooks for schema logic
  const { schemaData, fieldCounts, currentTabData } = useSchemaTree(
    schema,
    searchTerm,
    activeTab
  )
  const tabs = useSchemaTabs(schemaData, activeTab, fieldCounts, setActiveTab)

  function toggleExpanded(nodeId: string) {
    setExpanded(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

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

      <div className={schemaTreeViewStyles.tabContainer}>
        <TabGroup tabs={tabs} />
      </div>

      <div className={schemaTreeViewStyles.treeContainer}>
        {currentTabData &&
          currentTabData.children?.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              expandedNodes={expanded}
              onToggleExpanded={toggleExpanded}
            />
          ))}
        {activeTab === 'favorites' && (
          <div className={schemaTreeViewStyles.emptyState}>
            No favorites yet. Click on fields to add them to your favorites.
          </div>
        )}
      </div>
    </div>
  )
}
