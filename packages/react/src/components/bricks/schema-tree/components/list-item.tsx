import type { ToggleFieldTarget } from '@another-graphql-ide/state'

import { Icon } from '../../../primitives/icon/icon'
import { IconButton } from '../../../primitives/icon-button/icon-button'
import {
  IconButtonGroup,
  type IconButtonGroupProps,
} from '../../../primitives/icon-button-group/icon-button-group'
import { schemaTreeStyles } from '../schema-tree.css'
import { toggleTargetFor } from '../utils/toggle-target'
import type { FlatRow } from '../utils/tree-utils'
import { typeLabelFor } from '../utils/type-label'

type ListItemProps = {
  row: FlatRow
  onToggle: (target: ToggleFieldTarget) => void
  onToggleExpand: (id: string) => void
  /** Adopt this row as the tree's single tab stop. */
  onFocus: (id: string) => void
  /** Tree-wide navigation, handled on the focused row. */
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
  /** Whether this row is that tab stop. */
  isTabStop: boolean
  /** Draw the field's return type, or the argument's input type, after its name. */
  showTypes: boolean
  activePaths: Set<string>
  ref?: React.Ref<HTMLDivElement>
  'data-index'?: number
}

/** Matches the indent the nested lists used before the tree was flattened. */
const INDENT_PX = 20
/** Where a column's rail sits, lining up with the tick on the rows below it. */
const GUIDE_OFFSET_PX = 12

export const ListItem = ({
  row,
  onToggle,
  onToggleExpand,
  onFocus,
  onKeyDown,
  isTabStop,
  showTypes,
  activePaths,
  ref,
  'data-index': dataIndex,
}: ListItemProps) => {
  const { node, depth, hasChildren, isExpanded, guides } = row

  // Special handling for ARGUMENTS node
  const isArgumentsNode = node.type === 'arguments'

  const toggleTarget = toggleTargetFor(node)
  const typeLabel = showTypes ? typeLabelFor(node) : undefined
  const handleToggle = () => {
    if (toggleTarget) onToggle(toggleTarget)
  }

  const canToggle = node.type === 'field' || node.type === 'argument'

  type IconItem = IconButtonGroupProps['icons'][number]

  const baseAction: IconItem = {
    action: () => alert('Implement Quick Docs'),
    label: 'View Documentation',
    name: 'BookOpenText',
    size: 'mini',
    // The row is the tab stop, so Tab does not walk every control in the tree.
    // Quick Docs is mouse-only until it has a key binding of its own.
    tabIndex: -1,
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
    <div
      className={schemaTreeStyles.listItem}
      ref={ref}
      data-index={dataIndex}
      role="treeitem"
      aria-level={depth + 1}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={toggleTarget ? activePaths.has(node.id) : false}
      tabIndex={isTabStop ? 0 : -1}
      onFocus={() => onFocus(node.id)}
      onKeyDown={onKeyDown}
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
            tabIndex={-1}
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
            // into the document. Keyboard users activate the row itself, so it
            // stays out of the tab order.
            <button
              type="button"
              className={`${schemaTreeStyles.listItemNameButton} ${schemaTreeStyles.listItemName(
                { active: activePaths.has(node.id) }
              )}`}
              onClick={handleToggle}
              tabIndex={-1}
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
          {/* Outside the name button on purpose: it is a label, not part of
              what clicking the field toggles into the document. */}
          {typeLabel && (
            <span className={schemaTreeStyles.listItemTypeLabel}>
              {typeLabel}
            </span>
          )}
          {!isArgumentsNode && (
            <div className={schemaTreeStyles.listItemActionsContainer}>
              <IconButtonGroup icons={actions} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
