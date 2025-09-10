import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useMemo } from 'react'

import { schemaTreeViewStyles } from '../schema-tree-view.css'
import { flattenListItems, type ListItemType } from '../utils/tree-utils'

import { ListItem } from './list-item'

type TreeContainerProps = {
  nodes: ListItemType[]
  expandedNodes: Record<string, boolean>
  onToggleExpanded: (nodeId: string) => void
}

export const TreeContainer = ({
  nodes,
  expandedNodes,
  onToggleExpanded,
}: TreeContainerProps) => {
  // Flatten the tree for virtualization
  const flattenedNodes = useMemo(() => {
    return flattenListItems(nodes, expandedNodes)
  }, [nodes, expandedNodes])

  // Create parent ref for virtualizer
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Create virtualizer
  const virtualizer = useVirtualizer({
    count: flattenedNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Estimate row height in pixels
    overscan: 10, // Render 10 extra items for smoother scrolling
  })

  return (
    <div ref={parentRef} className={schemaTreeViewStyles.treeContainer}>
      <ul
        role="tree"
        aria-label="Schema tree view"
        className={schemaTreeViewStyles.virtualList}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => {
          const node = flattenedNodes[virtualItem.index]
          return (
            <ListItem
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              node={node}
              expandedNodes={expandedNodes}
              onToggleExpanded={onToggleExpanded}
            />
          )
        })}
      </ul>
    </div>
  )
}
