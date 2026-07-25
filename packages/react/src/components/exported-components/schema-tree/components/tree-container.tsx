import type { ToggleFieldTarget } from '@another-graphql-ide/state'
import { useVirtualizer } from '@tanstack/react-virtual'
import React from 'react'

import { schemaTreeStyles } from '../schema-tree.css'
import { toggleTargetFor } from '../utils/toggle-target'
import type { FlatRow } from '../utils/tree-utils'

import { ListItem } from './list-item'

type TreeContainerProps = {
  rows: FlatRow[]
  onToggle: (target: ToggleFieldTarget) => void
  onToggleExpand: (id: string) => void
  activePaths: Set<string>
}

/** How long consecutive keystrokes keep building one typeahead search. */
const TYPEAHEAD_RESET_MS = 500

export const TreeContainer = ({
  rows,
  onToggle,
  onToggleExpand,
  activePaths,
}: TreeContainerProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Roving tabindex: the tree is one tab stop, and arrow keys move within it.
  // Held by id rather than index so it survives expanding a node above it.
  const [tabStopId, setTabStopId] = React.useState<string | null>(null)
  const pendingFocus = React.useRef(false)
  const typeahead = React.useRef({ text: '', at: 0 })

  const tabStopIndex = rows.findIndex(row => row.node.id === tabStopId)
  // Before the user has moved, the first row carries the tab stop.
  const focusIndex = tabStopIndex === -1 ? 0 : tabStopIndex

  // The whole visible tree is one flat list, so expanded descendants are
  // windowed too rather than rendered in full as nested markup.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 10,
    // Keyed by path, not index: expanding a node shifts every index below it,
    // and without this the measured heights would follow the old positions.
    getItemKey: index => rows[index]?.node.id ?? index,
  })

  const virtualItems = virtualizer.getVirtualItems()

  // Keyboard focus has to survive virtualization: the target row may not be
  // rendered yet, so scroll it into range and focus once it is. Runs every
  // render, but does nothing unless a key moved the tab stop.
  React.useEffect(() => {
    if (!pendingFocus.current) return
    if (focusIndex < 0 || focusIndex >= rows.length) {
      pendingFocus.current = false
      return
    }

    virtualizer.scrollToIndex(focusIndex)
    const row = parentRef.current?.querySelector<HTMLElement>(
      `[data-index="${focusIndex}"]`
    )
    if (row) {
      row.focus()
      pendingFocus.current = false
    }
  })

  const moveTo = (index: number) => {
    const row = rows[index]
    if (!row) return
    setTabStopId(row.node.id)
    pendingFocus.current = true
  }

  /** The row this one hangs off, for stepping back out of a subtree. */
  const parentIndexOf = (index: number) => {
    const depth = rows[index]?.depth ?? 0
    for (let i = index - 1; i >= 0; i--) {
      if ((rows[i]?.depth ?? 0) < depth) return i
    }
    return -1
  }

  const searchFrom = (index: number, text: string) => {
    for (let offset = 1; offset <= rows.length; offset++) {
      const candidate = (index + offset) % rows.length
      const name = rows[candidate]?.node.name.toLowerCase()
      if (name?.startsWith(text)) return candidate
    }
    return -1
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Only when the row itself has focus. A click leaves focus on an inner
    // control, and those keep their own Enter/Space behavior.
    if (event.target !== event.currentTarget) return

    const row = rows[focusIndex]
    if (!row) return

    switch (event.key) {
      case 'ArrowDown':
        moveTo(Math.min(focusIndex + 1, rows.length - 1))
        break
      case 'ArrowUp':
        moveTo(Math.max(focusIndex - 1, 0))
        break
      case 'Home':
        moveTo(0)
        break
      case 'End':
        moveTo(rows.length - 1)
        break
      case 'ArrowRight':
        // Open a closed node, then step into it.
        if (row.hasChildren && !row.isExpanded) onToggleExpand(row.node.id)
        else if (row.hasChildren) moveTo(focusIndex + 1)
        break
      case 'ArrowLeft':
        // Close an open node, else step out to its parent.
        if (row.hasChildren && row.isExpanded) onToggleExpand(row.node.id)
        else moveTo(parentIndexOf(focusIndex))
        break
      case 'Enter':
      case ' ': {
        const target = toggleTargetFor(row.node)
        if (target) onToggle(target)
        else if (row.hasChildren) onToggleExpand(row.node.id)
        break
      }
      default: {
        // Typeahead: letters jump to the next row starting with what you typed.
        if (event.key.length !== 1 || event.metaKey || event.ctrlKey) return
        const now = event.timeStamp
        const previous = typeahead.current
        const text =
          now - previous.at > TYPEAHEAD_RESET_MS
            ? event.key.toLowerCase()
            : previous.text + event.key.toLowerCase()
        typeahead.current = { text, at: now }

        const match = searchFrom(focusIndex, text)
        if (match !== -1) moveTo(match)
        break
      }
    }

    // Arrows, Home, End, and Space scroll the pane by default. Keys the switch
    // does not act on returned before this.
    event.preventDefault()
  }

  return (
    <div ref={parentRef} className={schemaTreeStyles.treeContainer}>
      <div style={{ position: 'relative', height: virtualizer.getTotalSize() }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
          }}
        >
          <div
            aria-label="Schema tree view"
            aria-multiselectable="true"
            className={schemaTreeStyles.treeList}
            role="tree"
          >
            {virtualItems.map(virtualItem => {
              const row = rows[virtualItem.index]
              if (!row) return null
              return (
                <ListItem
                  row={row}
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  onToggle={onToggle}
                  onToggleExpand={onToggleExpand}
                  onFocus={setTabStopId}
                  onKeyDown={handleKeyDown}
                  isTabStop={virtualItem.index === focusIndex}
                  activePaths={activePaths}
                  ref={virtualizer.measureElement}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
