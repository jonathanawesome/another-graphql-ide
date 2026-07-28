import type { TreeNode } from './tree-utils'

/**
 * The type shown beside a row's name, or nothing for rows that have none worth
 * repeating.
 *
 * `String(type)` prints the wrappers (`[Node3!]!`), which is the point: seeing
 * the same type twice on one path is what makes a cycle legible, and a bare
 * name would hide whether a field is a list.
 *
 * Union members already carry their type in the row label (`... on Node3`), and
 * roots and the ARGUMENTS group have no type of their own.
 */
export const typeLabelFor = (node: TreeNode): string | undefined =>
  (node.type === 'field' || node.type === 'argument') && node.graphqlType
    ? String(node.graphqlType)
    : undefined
