import { useState } from 'react'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { IconButtonGroup } from '../../../ui-components/icon-button-group/icon-button-group'
import { schemaTreeStyles } from '../schema-tree.css'
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
    <li className={schemaTreeStyles.listItem}>
      <div
        className={schemaTreeStyles.listItemInner({
          withIndentLine: depth !== 0,
        })}
      >
        {hasChildren ? (
          <IconButton
            action={() => setIsExpanded(!isExpanded)}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
            ghost={true}
            name="Chevron"
            rotate={isExpanded ? '90' : undefined}
            size="mini"
            title={isExpanded ? 'Collapse' : 'Expand'}
          />
        ) : (
          <div className={schemaTreeStyles.listItemLeafIndicatorContainer}>
            <Icon name={'SeparatorSquare'} size="small" />
          </div>
        )}

        <div
          className={schemaTreeStyles.listItemDetail}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <span
            className={
              isArgumentsNode
                ? schemaTreeStyles.listItemArgumentsLabel
                : schemaTreeStyles.listItemName
            }
          >
            {node.name}
          </span>
          {!isArgumentsNode && (
            <div
              className={schemaTreeStyles.listItemActionsContainer({
                showActions,
              })}
            >
              {depth === 0 ? (
                <IconButtonGroup
                  icons={[
                    {
                      ghost: true,
                      action: () => alert('Implement Quick Docs'),
                      name: 'BookOpenText',
                      size: 'mini',
                      title: 'View Documentation',
                    },
                    {
                      ghost: true,
                      action: () => alert('Implement Insert Code'),
                      name: 'InsertCode',
                      size: 'mini',
                      title: 'Insert Code',
                    },
                  ]}
                />
              ) : (
                <IconButtonGroup
                  icons={[
                    {
                      ghost: true,
                      action: () => alert('Implement Quick Docs'),
                      name: 'BookOpenText',
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
        <ul role="group" className={schemaTreeStyles.nestedList}>
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
