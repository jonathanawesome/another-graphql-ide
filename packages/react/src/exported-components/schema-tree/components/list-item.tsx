import { useState } from 'react'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { IconButtonGroup } from '../../../ui-components/icon-button-group/icon-button-group'
import { schemaTreeStyles } from '../schema-tree.css'
import type { ListItemType } from '../utils/tree-utils'

type ListItemProps = {
  node: ListItemType
  depth?: number
  ref?: React.Ref<HTMLLIElement>
  'data-index'?: number
}

export const ListItem = ({
  node,
  depth = 0,
  ref,
  'data-index': dataIndex,
}: ListItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [showActions, setShowActions] = useState<boolean>(false)

  // Check if node has children
  const hasChildren = node.children && node.children.length > 0

  // Special handling for ARGUMENTS node
  const isArgumentsNode = node.type === 'arguments'

  return (
    <li className={schemaTreeStyles.listItem} ref={ref} data-index={dataIndex}>
      <div
        className={schemaTreeStyles.listItemInner({
          withIndentLine: depth !== 0,
        })}
      >
        {hasChildren ? (
          <IconButton
            action={() => setIsExpanded(!isExpanded)}
            label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
            ghost={true}
            name="Chevron"
            rotate={isExpanded ? '90' : undefined}
            size="mini"
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
                      action: () => alert('Implement Quick Docs'),
                      label: 'View Documentation',
                      name: 'BookOpenText',
                      size: 'mini',
                      tooltipOptions: { side: 'bottom' },
                    },
                    {
                      action: () => alert('Implement Insert Code'),
                      label: 'Insert Code',
                      name: 'InsertCode',
                      size: 'mini',
                      tooltipOptions: { side: 'bottom' },
                    },
                  ]}
                />
              ) : (
                <IconButtonGroup
                  icons={[
                    {
                      action: () => alert('Implement Quick Docs'),
                      label: 'View Documentation',
                      name: 'BookOpenText',
                      size: 'mini',
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
            <ListItem key={childNode.id} node={childNode} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
