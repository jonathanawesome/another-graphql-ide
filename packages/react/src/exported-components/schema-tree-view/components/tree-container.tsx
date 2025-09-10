import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useMemo } from 'react'

import { schemaTreeViewStyles } from '../schema-tree-view.css'
import {
  flattenSchemaTreeViewListItems,
  type SchemaTreeViewListItem as SchemaTreeViewListItemType,
} from '../utils/tree-utils'

import { SchemaTreeViewListItem } from './schema-tree-view-list-item'

type TreeContainerProps = {
  nodes: SchemaTreeViewListItemType[]
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
    return flattenSchemaTreeViewListItems(nodes, expandedNodes)
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
    <div
      ref={parentRef}
      className={schemaTreeViewStyles.treeContainer}
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      <ul
        role="tree"
        aria-label="Schema tree view"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => {
          const node = flattenedNodes[virtualItem.index]
          return (
            <li
              key={virtualItem.key}
              role="presentation"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <SchemaTreeViewListItem
                node={node}
                expandedNodes={expandedNodes}
                onToggleExpanded={onToggleExpanded}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
