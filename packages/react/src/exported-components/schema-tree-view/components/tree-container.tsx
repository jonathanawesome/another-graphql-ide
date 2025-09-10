import { schemaTreeViewStyles } from '../schema-tree-view.css'
import type { ListItemType } from '../utils/tree-utils'

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
  return (
    <div className={schemaTreeViewStyles.treeContainer}>
      <ul
        role="tree"
        aria-label="Schema tree view"
        className={schemaTreeViewStyles.treeList}
      >
        {nodes.map(node => (
          <ListItem
            key={node.id}
            node={node}
            expandedNodes={expandedNodes}
            onToggleExpanded={onToggleExpanded}
            depth={0}
          />
        ))}
      </ul>
    </div>
  )
}
