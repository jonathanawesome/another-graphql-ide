import type { ToggleFieldTarget } from '@another-graphql-ide/state'
import { useState } from 'react'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import {
  IconButtonGroup,
  type IconButtonGroupProps,
} from '../../../ui-components/icon-button-group/icon-button-group'
import { schemaTreeStyles } from '../schema-tree.css'
import type { ListItemType } from '../utils/tree-utils'

type ListItemProps = {
  node: ListItemType
  depth?: number
  onToggle: (target: ToggleFieldTarget) => void
  activePaths: Set<string>
  ref?: React.Ref<HTMLLIElement>
  'data-index'?: number
}

const ROOT_OPERATIONS = ['query', 'mutation', 'subscription'] as const

export const ListItem = ({
  node,
  depth = 0,
  onToggle,
  activePaths,
  ref,
  'data-index': dataIndex,
}: ListItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  // Check if node has children
  const hasChildren = node.children && node.children.length > 0

  // Special handling for ARGUMENTS node
  const isArgumentsNode = node.type === 'arguments'

  // Toggle this field or argument into or out of the document. The node id is
  // the dotted path from the root operation, e.g. `query.user.posts.title` for
  // a field or `query.user.arguments.id` for an argument.
  const handleToggle = () => {
    const [root, ...rest] = node.id.split('.')
    if (!isRootOperation(root)) return
    if (node.type === 'field') {
      onToggle({ rootOperation: root, path: rest })
    } else if (node.type === 'argument') {
      const argsIndex = rest.indexOf('arguments')
      const argument = rest[argsIndex + 1]
      if (argsIndex === -1 || argument === undefined) return
      onToggle({
        rootOperation: root,
        path: rest.slice(0, argsIndex),
        argument,
      })
    }
  }

  const canToggle = node.type === 'field' || node.type === 'argument'

  type IconItem = IconButtonGroupProps['icons'][number]

  const baseAction: IconItem = {
    action: () => alert('Implement Quick Docs'),
    label: 'View Documentation',
    name: 'BookOpenText',
    size: 'mini',
    tooltipOptions: { side: 'bottom' },
  }

  // Toggling now happens by clicking the field name (see below). Keep the
  // dedicated toggle button around, commented out, until we decide whether both
  // affordances should coexist.
  // const toggleAction: IconItem = {
  //   action: handleToggle,
  //   label:
  //     node.type === 'argument'
  //       ? 'Toggle argument in document'
  //       : 'Toggle field in document',
  //   name: 'InsertCode',
  //   size: 'mini',
  //   tooltipOptions: { side: 'bottom' },
  // }

  const actions: IconButtonGroupProps['icons'] = [baseAction]

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

        <div className={schemaTreeStyles.listItemDetail}>
          {isArgumentsNode ? (
            <span className={schemaTreeStyles.listItemArgumentsLabel}>
              {node.name}
            </span>
          ) : canToggle ? (
            // A native button so clicking the name toggles the field/argument
            // into the document with keyboard + a11y support for free.
            <button
              type="button"
              className={`${schemaTreeStyles.listItemNameButton} ${schemaTreeStyles.listItemName(
                { active: activePaths.has(node.id) }
              )}`}
              onClick={handleToggle}
            >
              {node.name}
            </button>
          ) : (
            <span
              className={schemaTreeStyles.listItemName({
                active: activePaths.has(node.id),
              })}
            >
              {node.name}
            </span>
          )}
          {!isArgumentsNode && (
            <div className={schemaTreeStyles.listItemActionsContainer}>
              <IconButtonGroup icons={actions} />
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
              depth={depth + 1}
              onToggle={onToggle}
              activePaths={activePaths}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function isRootOperation(
  value: string | undefined
): value is (typeof ROOT_OPERATIONS)[number] {
  return ROOT_OPERATIONS.includes(value as (typeof ROOT_OPERATIONS)[number])
}
