import React, { useState } from 'react'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { IconButtonGroup } from '../../../ui-components/icon-button-group/icon-button-group'
import { schemaTreeViewStyles } from '../schema-tree-view.css'
import { getTypeIcon } from '../utils/graphql-utils'
import type { FlattenedListItem } from '../utils/tree-utils'

type ListItemProps = {
  expandedNodes: Record<string, boolean>
  node: FlattenedListItem
  onToggleExpanded: (nodeId: string) => void
  style?: React.CSSProperties
}

const ListItemComponent = ({
  expandedNodes,
  node,
  onToggleExpanded,
  style,
}: ListItemProps): React.JSX.Element => {
  const [showActions, setShowActions] = useState<boolean>(false)

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

  // Special handling for ARGUMENTS node
  const isArgumentsNode = node.type === 'arguments'

  return (
    <li
      style={style || undefined}
      className={schemaTreeViewStyles.listItem}
      role="treeitem"
      aria-expanded={hasChildrenFlag ? isExpanded : undefined}
      aria-level={node.depth + 1}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className={schemaTreeViewStyles.listItemInner}
        style={{ paddingLeft: `${node.depth * 16}px` }}
      >
        {hasChildrenFlag ? (
          <IconButton
            iconName="Chevron"
            title={isExpanded ? 'Collapse' : 'Expand'}
            rotate={isExpanded ? '90' : undefined}
            action={() => onToggleExpanded(node.id)}
            size="mini"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
          />
        ) : (
          <>
            {node.type === 'field' ||
              (node.type === 'argument' && node.graphqlType && (
                <Icon name={getTypeIcon(node.graphqlType)} size="small" />
              ))}
          </>
        )}

        <div
          className={schemaTreeViewStyles.listItemDetail}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <span
            className={
              isArgumentsNode
                ? schemaTreeViewStyles.listItemArgumentsLabel
                : schemaTreeViewStyles.listItemName
            }
          >
            {node.name}
          </span>
          {!isArgumentsNode && (
            <div
              className={schemaTreeViewStyles.listItemActionsContainer({
                showActions,
              })}
            >
              {node.depth === 0 ? (
                <IconButtonGroup
                  icons={[
                    {
                      action: () => alert('Implement Quick Docs'),
                      iconName: 'BookOpenText',
                      size: 'mini',
                      title: 'View Documentation',
                    },
                    {
                      action: () => alert('Implement Insert Code'),
                      iconName: 'InsertCode',
                      size: 'mini',
                      title: 'Insert Code',
                    },
                  ]}
                />
              ) : (
                <IconButtonGroup
                  icons={[
                    {
                      action: () => alert('Implement Quick Docs'),
                      iconName: 'BookOpenText',
                      size: 'mini',
                      title: 'View Documentation',
                    },
                  ]}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </li>
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
