import {
  compareSdl,
  foldRuns,
  unifiedText,
  type Rows,
  type SdlDiffKind,
} from './compare-sdl'
import { unifyTokens, type Tokens } from './unify-tokens'

export type ComparisonRequest = {
  before: string
  after: string
  context: number
}

export type Folds = { from: Uint32Array; to: Uint32Array; lines: Uint32Array }

/** The diff to show: its text, rows and folds, without colors. */
export type DiffView = {
  kind: Exclude<SdlDiffKind, 'too-large'>
  text: string
  rows: Rows
  /** Unchanged runs to fold: offsets in the text, and lines in each. */
  folds: Folds
  /** The most lines on either side, for the width of the numbers. */
  lines: number
  removed: number
  added: number
}

export type ComparisonResult = DiffView | { kind: 'too-large' }

// Both documents together, in characters. 210,000 lines a side (26 million)
// peaks near 1.4 GB, so much past that risks the tab.
const TOO_LARGE = 40_000_000

/**
 * A comparison in two steps, so a diff can be shown before it is colored:
 * colors need a parse of both documents, which is most of the time.
 */
export const runComparison = ({
  before,
  after,
  context,
}: ComparisonRequest): {
  result: ComparisonResult
  tokens?: () => Tokens
} => {
  if (before.length + after.length > TOO_LARGE) {
    return { result: { kind: 'too-large' } }
  }
  const comparison = compareSdl(before, after)
  const { kind, rows, removed, added } = comparison
  const { text, starts } = unifiedText(comparison)
  return {
    result: {
      kind,
      text,
      rows,
      folds: foldOffsets(
        kind === 'diff' ? foldRuns(rows.kinds, context) : [],
        starts
      ),
      lines: Math.max(comparison.before.count, comparison.after.count),
      removed,
      added,
    },
    tokens: () => unifyTokens(comparison),
  }
}

// Offsets, since looking up tens of thousands of rows blocks the page.
const foldOffsets = (
  runs: [first: number, last: number][],
  starts: Uint32Array
): Folds => ({
  from: Uint32Array.from(runs, ([first]) => starts[first] ?? 0),
  to: Uint32Array.from(runs, ([, last]) => (starts[last + 1] ?? 1) - 1),
  lines: Uint32Array.from(runs, ([first, last]) => last - first + 1),
})
