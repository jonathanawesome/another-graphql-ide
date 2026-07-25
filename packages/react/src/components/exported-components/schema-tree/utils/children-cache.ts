import { getNodeChildren, type TreeNode } from './tree-utils'

/**
 * Memoizes one level of children per node id, so re-flattening on every expand,
 * collapse, or keystroke does not rebuild subtrees the user already opened.
 *
 * Ids are unique paths, so there are no collisions. Growth is bounded by what
 * the user actually expands, not by the size of the type graph, and the whole
 * cache is thrown away when the schema changes.
 */
export const createChildrenCache = () => {
  const cache = new Map<string, TreeNode[]>()

  return (node: TreeNode): TreeNode[] => {
    const cached = cache.get(node.id)
    if (cached) return cached

    const children = getNodeChildren(node)
    cache.set(node.id, children)
    return children
  }
}
