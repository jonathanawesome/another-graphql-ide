import { useState } from 'react'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { IconButtonGroup } from '../../../ui-components/icon-button-group/icon-button-group'
import { schemaTreeViewStyles } from '../schema-tree-view.css'
import type { ListItemType } from '../utils/tree-utils'

type ListItemProps = {
  // expandedNodes: Record<string, boolean>
  node: ListItemType
  // onToggleExpanded: (nodeId: string) => void
  depth?: number
}

export const ListItem = ({
  // expandedNodes,
  node,
  // onToggleExpanded,
  depth = 0,
}: ListItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [showActions, setShowActions] = useState<boolean>(false)

  // const isExpanded = expandedNodes[node.id]

  // Check if node has children
  const hasChildren = node.children && node.children.length > 0

  // Special handling for ARGUMENTS node
  const isArgumentsNode = node.type === 'arguments'

  return (
    <li className={schemaTreeViewStyles.listItem}>
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
            action={() => setIsExpanded(!isExpanded)}
            size="mini"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
          />
        ) : (
          <div className={schemaTreeViewStyles.listItemLeafIndicatorContainer}>
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
              // expandedNodes={expandedNodes}
              // onToggleExpanded={onToggleExpanded}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
