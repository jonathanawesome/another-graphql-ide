import { useVirtualizer } from '@tanstack/react-virtual'
import React from 'react'

import { schemaTreeStyles } from '../schema-tree.css'
import type { ListItemType } from '../utils/tree-utils'

import { ListItem } from './list-item'

type TreeContainerProps = {
  nodes: ListItemType[]
}

export const TreeContainer = ({ nodes }: TreeContainerProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 50,
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
              const node = nodes[virtualItem.index]
              if (!node) return null
              return (
                <ListItem
                  node={node}
                  depth={0}
                  key={virtualItem.key}
                  data-index={virtualItem.index}
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
