import React from 'react'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { schemaTreeViewStyles } from '../schema-tree-view.css'
import { getTypeDisplayName, getTypeIcon } from '../utils/graphql-utils'
import type { FlattenedTreeNode } from '../utils/tree-utils'

type TreeNodeProps = {
  node: FlattenedTreeNode
  expandedNodes: Record<string, boolean>
  onToggleExpanded: (nodeId: string) => void
}

const TreeNodeComponent = ({
  node,
  expandedNodes,
  onToggleExpanded,
}: TreeNodeProps): React.JSX.Element => {
  const isExpanded = expandedNodes[node.id]
  
  // Check if node has children
  const hasChildrenFlag = node.children && node.children.length > 0

  return (
    <div className={schemaTreeViewStyles.treeNode}>
      <div
        className={schemaTreeViewStyles.nodeContent}
        style={{ paddingLeft: `${node.depth * 16}px` }}
      >
        {hasChildrenFlag && (
          <IconButton
            iconName="Caret"
            title={isExpanded ? 'Collapse' : 'Expand'}
            rotate={isExpanded ? '90' : undefined}
            action={() => onToggleExpanded(node.id)}
            size="small"
          />
        )}

        <div className={schemaTreeViewStyles.nodeInfo}>
          {node.type === 'field' && node.graphqlType && (
            <Icon name={getTypeIcon(node.graphqlType)} size="small" />
          )}
          <span className={schemaTreeViewStyles.nodeName}>{node.name}</span>
          {node.type === 'field' && node.graphqlType && (
            <span className={schemaTreeViewStyles.nodeType}>
              : {getTypeDisplayName(node.graphqlType)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
// Only re-render if node ID changes or expansion state for this specific node changes
export const TreeNode = React.memo(TreeNodeComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props changed (trigger re-render)
  const prevExpanded = prevProps.expandedNodes[prevProps.node.id]
  const nextExpanded = nextProps.expandedNodes[nextProps.node.id]
  
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.depth === nextProps.node.depth &&
    prevExpanded === nextExpanded &&
    prevProps.onToggleExpanded === nextProps.onToggleExpanded
  )
})
