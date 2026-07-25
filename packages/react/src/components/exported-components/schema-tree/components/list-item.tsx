import type { ToggleFieldTarget } from '@another-graphql-ide/state'

import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import {
  IconButtonGroup,
  type IconButtonGroupProps,
} from '../../../ui-components/icon-button-group/icon-button-group'
import { schemaTreeStyles } from '../schema-tree.css'
import type { FlatRow } from '../utils/tree-utils'

type ListItemProps = {
  row: FlatRow
  onToggle: (target: ToggleFieldTarget) => void
  onToggleExpand: (id: string) => void
  activePaths: Set<string>
  ref?: React.Ref<HTMLLIElement>
  'data-index'?: number
}

const ROOT_OPERATIONS = ['query', 'mutation', 'subscription'] as const

/** Matches the indent the nested lists used before the tree was flattened. */
const INDENT_PX = 20
/** Where a column's rail sits, lining up with the tick on the rows below it. */
const GUIDE_OFFSET_PX = 12

export const ListItem = ({
  row,
  onToggle,
  onToggleExpand,
  activePaths,
  ref,
  'data-index': dataIndex,
}: ListItemProps) => {
  const { node, depth, hasChildren, isExpanded, guides } = row

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
    // Flattening dropped the nested `role="group"` markup. Proper tree ARIA
    // (role=tree/treeitem, aria-level) needs roving-focus keyboard navigation to
    // not mislead assistive tech, so it waits for that work.
    <li
      className={schemaTreeStyles.listItem}
      ref={ref}
      data-index={dataIndex}
      style={{ paddingInlineStart: depth * INDENT_PX }}
    >
      {guides.map((continues, column) => {
        // A finished column draws nothing except on the row it ends at, where
        // the stub forms the elbow with that row's horizontal tick.
        const isOwnColumn = column === guides.length - 1
        if (!continues && !isOwnColumn) return null

        return (
          <span
            aria-hidden="true"
            className={schemaTreeStyles.listItemGuide({ continues })}
            key={column}
            style={{ left: GUIDE_OFFSET_PX + column * INDENT_PX }}
          />
        )
      })}
      <div
        className={schemaTreeStyles.listItemInner({
          withIndentLine: depth !== 0,
        })}
      >
        {hasChildren ? (
          <IconButton
            action={() => onToggleExpand(node.id)}
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
          {/* Expanding here loops back to a type already on this path. Marked,
              never blocked: walking a cycle is a legitimate way to build a
              deeply nested selection. */}
          {node.isRecursive && (
            <span
              className={schemaTreeStyles.listItemRecursionBadge}
              title={`${node.name} loops back to a type already on this path`}
              aria-hidden="true"
            >
              ↻
            </span>
          )}
          {!isArgumentsNode && (
            <div className={schemaTreeStyles.listItemActionsContainer}>
              <IconButtonGroup icons={actions} />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

function isRootOperation(
  value: string | undefined
): value is (typeof ROOT_OPERATIONS)[number] {
  return ROOT_OPERATIONS.includes(value as (typeof ROOT_OPERATIONS)[number])
}
