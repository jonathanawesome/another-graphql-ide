import { useVirtualizer } from '@tanstack/react-virtual'
import React from 'react'

import { schemaTreeViewStyles } from '../schema-tree-view.css'
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
    <div ref={parentRef} className={schemaTreeViewStyles.treeContainer}>
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
            role="tree"
            aria-label="Schema tree view"
            className={schemaTreeViewStyles.treeList}
          >
            {virtualItems.map(virtualItem => {
              const node = nodes[virtualItem.index]
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                >
                  <ListItem node={node} depth={0} />
                </div>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
