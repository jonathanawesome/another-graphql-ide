import type { ToggleFieldTarget } from '@another-graphql-ide/state'
import { useVirtualizer } from '@tanstack/react-virtual'
import React from 'react'

import { schemaTreeStyles } from '../schema-tree.css'
import type { FlatRow } from '../utils/tree-utils'

import { ListItem } from './list-item'

type TreeContainerProps = {
  rows: FlatRow[]
  onToggle: (target: ToggleFieldTarget) => void
  onToggleExpand: (id: string) => void
  activePaths: Set<string>
}

export const TreeContainer = ({
  rows,
  onToggle,
  onToggleExpand,
  activePaths,
}: TreeContainerProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  // The whole visible tree is one flat list, expanded descendants included, so
  // opening a 200-field type costs the same as scrolling past one.
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
          <ul
            aria-label="Schema tree view"
            className={schemaTreeStyles.treeList}
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
                  activePaths={activePaths}
                  ref={virtualizer.measureElement}
                />
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
