import type { ToggleFieldTarget } from '@another-graphql-ide/state'

import type { TreeNode } from './tree-utils'

const ROOT_OPERATIONS = ['query', 'mutation', 'subscription'] as const

function isRootOperation(
  value: string | undefined
): value is (typeof ROOT_OPERATIONS)[number] {
  return ROOT_OPERATIONS.includes(value as (typeof ROOT_OPERATIONS)[number])
}

/**
 * What activating a node toggles in the document, or nothing for a node that is
 * not itself selectable (a root, an `ARGUMENTS` group, a union member).
 *
 * The node id is the dotted path from the root operation, e.g.
 * `query.user.posts.title` for a field or `query.user.arguments.id` for an
 * argument. Shared by the click handler and the keyboard handler so both
 * activate a row the same way.
 */
export function toggleTargetFor(node: TreeNode): ToggleFieldTarget | undefined {
  const [root, ...rest] = node.id.split('.')
  if (!isRootOperation(root)) return undefined

  if (node.type === 'field') return { rootOperation: root, path: rest }

  if (node.type === 'argument') {
    const argsIndex = rest.indexOf('arguments')
    const argument = rest[argsIndex + 1]
    if (argsIndex === -1 || argument === undefined) return undefined
    return { rootOperation: root, path: rest.slice(0, argsIndex), argument }
  }

  return undefined
}
