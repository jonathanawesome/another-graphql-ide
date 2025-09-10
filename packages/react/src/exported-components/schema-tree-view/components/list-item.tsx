import React, { useState } from 'react'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { IconButtonGroup } from '../../../ui-components/icon-button-group/icon-button-group'
import { schemaTreeViewStyles } from '../schema-tree-view.css'
// import { getTypeIcon } from '../utils/graphql-utils'
import type { ListItemType } from '../utils/tree-utils'

type ListItemProps = {
  expandedNodes: Record<string, boolean>
  node: ListItemType
  onToggleExpanded: (nodeId: string) => void
  depth?: number
}

const ListItemComponent = ({
  expandedNodes,
  node,
  onToggleExpanded,
  depth = 0,
}: ListItemProps): React.JSX.Element => {
  const [showActions, setShowActions] = useState<boolean>(false)

  const isExpanded = expandedNodes[node.id]

  // Check if node has children
  const hasChildren = node.children && node.children.length > 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (hasChildren) {
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
      if (hasChildren) {
        onToggleExpanded(node.id)
      }
    }
  }

  // Special handling for ARGUMENTS node
  const isArgumentsNode = node.type === 'arguments'

  return (
    <li
      className={schemaTreeViewStyles.listItem}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={depth + 1}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className={schemaTreeViewStyles.listItemInner({
          withIndentLine: depth !== 0,
        })}
      >
        {hasChildren ? (
          <IconButton
            iconName="Chevron"
            title={isExpanded ? 'Collapse' : 'Expand'}
            rotate={isExpanded ? '90' : undefined}
            action={() => onToggleExpanded(node.id)}
            size="mini"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
          />
        ) : (
          <div className={schemaTreeViewStyles.listItemLeafIndicatorContainer}>
            {/* <Icon name={getTypeIcon(node.graphqlType)} size="small" /> */}
            <Icon name={'SeparatorSquare'} size="small" />
          </div>
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
              {depth === 0 ? (
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
      {isExpanded && hasChildren && (
        <ul role="group" className={schemaTreeViewStyles.nestedList}>
          {node.children?.map(childNode => (
            <ListItem
              key={childNode.id}
              node={childNode}
              expandedNodes={expandedNodes}
              onToggleExpanded={onToggleExpanded}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
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
      prevProps.depth === nextProps.depth &&
      prevExpanded === nextExpanded &&
      prevProps.onToggleExpanded === nextProps.onToggleExpanded
    )
  }
)
