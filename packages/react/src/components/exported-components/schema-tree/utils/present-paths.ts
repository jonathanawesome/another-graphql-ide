import type {
  OperationDefinitionNode,
  OperationTypeNode,
  SelectionSetNode,
} from 'graphql'
import { Kind, parse } from 'graphql'

/**
 * The set of field and argument paths present in the ACTIVE operation (the one
 * the cursor is inside), keyed to match tree node ids (e.g. `query.user.posts`
 * and `query.user.arguments.id`). Only the active operation's items are marked,
 * so the tree reflects what you are currently editing. Parse failures yield an
 * empty set. Fragments, aliases, and inline fragments are ignored for now.
 */
export function computePresentPaths(query: string, cursor: number): Set<string> {
  const paths = new Set<string>()
  const active = findActiveOperation(query, cursor)
  if (active) collect(active.selectionSet, active.operation, paths)
  return paths
}

/** The root type of the active operation, for following it with the tree tabs. */
export function activeOperationType(
  query: string,
  cursor: number
): OperationTypeNode | undefined {
  return findActiveOperation(query, cursor)?.operation
}

function findActiveOperation(
  query: string,
  cursor: number
): OperationDefinitionNode | undefined {
  if (!query.trim()) return undefined

  let document
  try {
    document = parse(query)
  } catch {
    return undefined
  }

  const operations = document.definitions.filter(
    (d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION
  )
  if (operations.length === 0) return undefined
  return operations[activeOperationIndex(operations, cursor)]
}

/** The operation containing the cursor, else the last starting before it, else the first. */
function activeOperationIndex(
  operations: readonly OperationDefinitionNode[],
  cursor: number
): number {
  const containing = operations.findIndex(
    o => o.loc && cursor >= o.loc.start && cursor <= o.loc.end
  )
  if (containing !== -1) return containing
  let before = -1
  for (let i = 0; i < operations.length; i++) {
    const loc = operations[i]?.loc
    if (loc && loc.start <= cursor) before = i
  }
  return before === -1 ? 0 : before
}

function collect(
  selectionSet: SelectionSetNode,
  prefix: string,
  paths: Set<string>
) {
  for (const selection of selectionSet.selections) {
    if (selection.kind !== Kind.FIELD) continue
    const id = `${prefix}.${selection.name.value}`
    paths.add(id)
    for (const arg of selection.arguments ?? []) {
      paths.add(`${id}.arguments.${arg.name.value}`)
    }
    if (selection.selectionSet) collect(selection.selectionSet, id, paths)
  }
}
