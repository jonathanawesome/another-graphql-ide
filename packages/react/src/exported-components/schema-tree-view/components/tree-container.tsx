import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useMemo } from 'react'

import { schemaTreeViewStyles } from '../schema-tree-view.css'
import { flattenTreeNodes, type TreeNode as TreeNodeType } from '../utils/tree-utils'

import { TreeNode } from './tree-node'

type TreeContainerProps = {
  nodes: TreeNodeType[]
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
    return flattenTreeNodes(nodes, expandedNodes)
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
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => {
          const node = flattenedNodes[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TreeNode
                node={node}
                expandedNodes={expandedNodes}
                onToggleExpanded={onToggleExpanded}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
