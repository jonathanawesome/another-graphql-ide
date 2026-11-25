import { splitLines, textOf, type Lines } from './lines'
import { matchLines } from './match-lines'

/** What a row is. Numbers, since every row's is one byte in an array. */
export const SAME = 0
export const REMOVED = 1
export const ADDED = 2

export type SdlDiffKind = 'diff' | 'unchanged' | 'too-large'

/** Every row of the diff, top to bottom. */
export type Rows = {
  kinds: Uint8Array
  /** 1-based line in `before`, or 0 when the row has none. */
  before: Uint32Array
  /** 1-based line in `after`, or 0 when the row has none. */
  after: Uint32Array
}

export type Comparison = {
  kind: Exclude<SdlDiffKind, 'too-large'>
  before: Lines
  after: Lines
  rows: Rows
  removed: number
  added: number
}

/** A number per line, the same for equal lines in either document. */
const internLines = (before: Lines, after: Lines) => {
  const ids = new Map<string, number>()
  const intern = (lines: Lines) => {
    const out = new Int32Array(lines.count)
    for (let line = 0; line < lines.count; line++) {
      const text = textOf(lines, line)
      let id = ids.get(text)
      if (id === undefined) {
        id = ids.size
        ids.set(text, id)
      }
      out[line] = id
    }
    return out
  }
  return [intern(before), intern(after)] as const
}

/**
 * Compares two SDL documents line by line, so a moved type shows as removed
 * and added. Cheap enough for 200,000 lines in a worker.
 */
export const compareSdl = (
  beforeText: string,
  afterText: string
): Comparison => {
  const before = splitLines(beforeText)
  const after = splitLines(afterText)
  const most = before.count + after.count
  const kinds = new Uint8Array(most)
  const beforeLines = new Uint32Array(most)
  const afterLines = new Uint32Array(most)
  let count = 0

  const push = (kind: number, beforeLine: number, afterLine: number) => {
    kinds[count] = kind
    beforeLines[count] = beforeLine
    afterLines[count] = afterLine
    count++
  }

  let nextBefore = 0
  let nextAfter = 0
  const changesTo = (beforeEnd: number, afterEnd: number) => {
    while (nextBefore < beforeEnd) push(REMOVED, ++nextBefore, 0)
    while (nextAfter < afterEnd) push(ADDED, 0, ++nextAfter)
  }

  const pairs = matchLines(...internLines(before, after))
  for (const [beforeLine, afterLine] of pairs) {
    changesTo(beforeLine, afterLine)
    push(SAME, ++nextBefore, ++nextAfter)
  }
  changesTo(before.count, after.count)

  const removed = before.count - pairs.length
  const added = after.count - pairs.length
  return {
    kind: removed + added > 0 ? 'diff' : 'unchanged',
    before,
    after,
    rows: {
      kinds: kinds.slice(0, count),
      before: beforeLines.slice(0, count),
      after: afterLines.slice(0, count),
    },
    removed,
    added,
  }
}

/** The text of the diff, every row's line in order, and where each row starts. */
export const unifiedText = ({ rows, before, after }: Comparison) => {
  const starts = new Uint32Array(rows.kinds.length + 1)
  const parts = Array.from(rows.kinds, (kind, row) => {
    const text =
      kind === REMOVED
        ? textOf(before, (rows.before[row] ?? 1) - 1)
        : textOf(after, (rows.after[row] ?? 1) - 1)
    starts[row + 1] = (starts[row] ?? 0) + text.length + 1
    return text
  })
  return { text: parts.join('\n'), starts }
}

/**
 * Runs of unchanged rows to fold, 0-based and inclusive, keeping `context` rows
 * around each change.
 */
export const foldRuns = (kinds: Uint8Array, context: number) => {
  // Folding fewer than this saves nothing over the row that replaces them.
  const shortest = 4
  const runs: [first: number, last: number][] = []
  let start = 0
  for (let row = 0; row <= kinds.length; row++) {
    if (row < kinds.length && kinds[row] === SAME) continue
    const from = start === 0 ? 0 : start + context
    const to = row === kinds.length ? row - 1 : row - 1 - context
    if (to - from + 1 >= shortest) runs.push([from, to])
    start = row + 1
  }
  return runs
}
