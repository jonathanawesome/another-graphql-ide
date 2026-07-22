import { getOperationFacts } from 'graphql-language-service'

/** A single operation's name (undefined when anonymous) and source offsets. */
export type OperationRange = { name?: string; from: number; to: number }

/**
 * Named and anonymous operation ranges for the document, in source order.
 * getOperationFacts parses internally and returns undefined on failure, so a
 * half-typed query yields [] rather than throwing.
 */
export const getOperationRanges = (query: string): OperationRange[] => {
  const facts = getOperationFacts(null, query)
  if (!facts) return []
  return facts.operations.flatMap(op =>
    op.loc ? [{ name: op.name?.value, from: op.loc.start, to: op.loc.end }] : []
  )
}

/**
 * Index of the active operation, GraphiQL-style: the operation whose range
 * contains the cursor; otherwise the last operation starting before the cursor;
 * otherwise the first. Returns -1 when there are no operations.
 */
export const selectActiveOperationIndex = (
  ranges: OperationRange[],
  cursor: number
): number => {
  if (ranges.length === 0) return -1
  const containing = ranges.findIndex(r => cursor >= r.from && cursor <= r.to)
  if (containing !== -1) return containing
  let before = -1
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]
    if (range && range.from <= cursor) before = i
  }
  return before === -1 ? 0 : before
}

/**
 * The active operation's name, or undefined when it is anonymous or the
 * document has no operations. Drives the Run button label and execute().
 */
export const getActiveOperationName = (
  query: string,
  cursor: number
): string | undefined => {
  const ranges = getOperationRanges(query)
  const index = selectActiveOperationIndex(ranges, cursor)
  return index === -1 ? undefined : ranges[index]?.name
}
