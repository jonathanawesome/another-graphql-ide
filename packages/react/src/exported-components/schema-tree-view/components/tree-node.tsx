import { Icon } from '../../../ui-components/icon/icon'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { schemaTreeViewStyles } from '../schema-tree-view.css'
import { getTypeDisplayName, getTypeIcon } from '../utils/graphql-utils'
import type { TreeNode as TreeNodeType } from '../utils/tree-utils'

type TreeNodeProps = {
  node: TreeNodeType
  depth?: number
  expandedNodes: Record<string, boolean>
  onToggleExpanded: (nodeId: string) => void
}

export const TreeNode = ({
  node,
  depth = 0,
  expandedNodes,
  onToggleExpanded,
}: TreeNodeProps): React.JSX.Element => {
  const isExpanded = expandedNodes[node.id]
  const hasChildren = node.children && node.children.length > 0

  return (
    <div key={node.id} className={schemaTreeViewStyles.treeNode}>
      <div
        className={schemaTreeViewStyles.nodeContent}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {hasChildren && (
          <IconButton
            iconName="Caret"
            title={isExpanded ? 'Collapse' : 'Expand'}
            rotate={isExpanded ? '90' : undefined}
            action={() => onToggleExpanded(node.id)}
            size="small"
          />
        )}

        <div className={schemaTreeViewStyles.nodeInfo}>
          {node.type === 'field' && node.graphqlType && (
            <Icon name={getTypeIcon(node.graphqlType)} size="small" />
          )}
          <span className={schemaTreeViewStyles.nodeName}>{node.name}</span>
          {node.type === 'field' && node.graphqlType && (
            <span className={schemaTreeViewStyles.nodeType}>
              : {getTypeDisplayName(node.graphqlType)}
            </span>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className={schemaTreeViewStyles.nodeChildren}>
          {node.children?.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}
