import React from 'react'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { schemaTreeViewStyles } from '../schema-tree-view.css'
import { getTypeDisplayName, getTypeIcon } from '../utils/graphql-utils'
import type { FlattenedListItem } from '../utils/tree-utils'

type ListItemProps = {
  node: FlattenedListItem
  expandedNodes: Record<string, boolean>
  onToggleExpanded: (nodeId: string) => void
}

const ListItemComponent = ({
  node,
  expandedNodes,
  onToggleExpanded,
}: ListItemProps): React.JSX.Element => {
  const isExpanded = expandedNodes[node.id]

  // Check if node has children
  const hasChildrenFlag = node.children && node.children.length > 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (hasChildrenFlag) {
      if (e.key === 'ArrowRight' && !isExpanded) {
        e.preventDefault()
        onToggleExpanded(node.id)
      } else if (e.key === 'ArrowLeft' && isExpanded) {
        e.preventDefault()
        onToggleExpanded(node.id)
      }
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (hasChildrenFlag) {
        onToggleExpanded(node.id)
      }
    }
  }

  return (
    <div
      className={schemaTreeViewStyles.listItem}
      role="treeitem"
      aria-expanded={hasChildrenFlag ? isExpanded : undefined}
      aria-level={node.depth + 1}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
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
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
          />
        )}

        <div className={schemaTreeViewStyles.nodeInfo}>
          {node.type === 'field' && node.graphqlType && (
            <Icon
              name={getTypeIcon(node.graphqlType)}
              size="small"
              aria-hidden="true"
            />
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
export const ListItem = React.memo(
  ListItemComponent,
  (prevProps, nextProps) => {
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
  }
)
