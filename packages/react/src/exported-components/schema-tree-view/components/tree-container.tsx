import { useVirtualizer } from '@tanstack/react-virtual'
import React from 'react'

import { schemaTreeViewStyles } from '../schema-tree-view.css'
import type { ListItemType } from '../utils/tree-utils'

import { ListItem } from './list-item'

type TreeContainerProps = {
  nodes: ListItemType[]
  expandedNodes: Record<string, boolean>
  onToggleExpanded: (nodeId: string, remeasure?: () => void) => void
}

export const TreeContainer = ({
  nodes,
  expandedNodes,
  onToggleExpanded,
}: TreeContainerProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Only virtualize if we have many root-level nodes (>50)
  // const shouldVirtualize = nodes.length > 50

  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: React.useCallback(() => {
      return 32 // Slightly larger estimate
    }, []),
    overscan: 50,
    // enabled: shouldVirtualize,
  })

  // State to track virtualizer total size for re-renders
  const [totalSize, setTotalSize] = React.useState(() =>
    virtualizer.getTotalSize()
  )

  // Update total size when virtualizer changes
  React.useEffect(() => {
    setTotalSize(virtualizer.getTotalSize())
  }, [virtualizer])

  const remeasure = React.useCallback(() => {
    // if (shouldVirtualize) {
    // Multiple remeasures to ensure height is captured correctly
    requestAnimationFrame(() => {
      virtualizer.measure()
      setTotalSize(virtualizer.getTotalSize())
      // Also remeasure after a short delay for CSS transitions
      setTimeout(() => {
        virtualizer.measure()
        setTotalSize(virtualizer.getTotalSize())
      }, 100)
    })
    // }
  }, [
    virtualizer,
    // shouldVirtualize
  ])

  // Virtualized rendering for large lists
  // if (shouldVirtualize) {
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div ref={parentRef} className={schemaTreeViewStyles.treeContainer}>
      <div style={{ position: 'relative', height: totalSize }}>
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
                  ref={virtualizer.measureElement}
                  data-index={virtualItem.index}
                >
                  <ListItem
                    node={node}
                    expandedNodes={expandedNodes}
                    onToggleExpanded={nodeId =>
                      onToggleExpanded(nodeId, remeasure)
                    }
                    depth={0}
                  />
                </div>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
  // }

  // // Normal rendering for smaller lists
  // return (
  //   <div className={schemaTreeViewStyles.treeContainer}>
  //     <ul
  //       role="tree"
  //       aria-label="Schema tree view"
  //       className={schemaTreeViewStyles.treeList}
  //     >
  //       {nodes.map(node => (
  //         <ListItem
  //           key={node.id}
  //           node={node}
  //           expandedNodes={expandedNodes}
  //           onToggleExpanded={nodeId => onToggleExpanded(nodeId)}
  //           depth={0}
  //         />
  //       ))}
  //     </ul>
  //   </div>
  // )
}
