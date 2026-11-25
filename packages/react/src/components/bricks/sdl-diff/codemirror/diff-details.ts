import {
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Extension,
} from '@codemirror/state'
import {
  Decoration,
  ViewPlugin,
  type DecorationSet,
  type EditorView,
  type ViewUpdate,
} from '@codemirror/view'

import { sdlRows, type SdlRows } from '../../sdl-shared/sdl-rows'
import { REMOVED, type Rows } from '../compare/compare-sdl'
import { coordinateAt, lineOfCoordinate } from '../compare/coordinate-table'
import type { DiffDetails } from '../compare/diff-details'
import { TOKEN_KINDS, type Tokens } from '../compare/unify-tokens'

/** The colors and coordinates arrived. */
export const setDetails = StateEffect.define<DiffDetails>()

/** Index of the first token ending after `offset`. */
const firstAfter = ({ to }: Tokens, offset: number) => {
  let low = 0
  let high = to.length
  while (low < high) {
    const middle = (low + high) >> 1
    if ((to[middle] ?? 0) <= offset) low = middle + 1
    else high = middle
  }
  return low
}

function* tokensBetween(tokens: Tokens, from: number, to: number) {
  for (let i = firstAfter(tokens, from); i < tokens.from.length; i++) {
    const start = tokens.from[i] ?? to
    const kind = TOKEN_KINDS[tokens.kinds[i] ?? 0]
    if (start >= to) return
    if (kind) yield { from: start, to: tokens.to[i] ?? start, kind }
  }
}

const rowsOf = (rows: Rows, details: DiffDetails | undefined): SdlRows => ({
  row: line => {
    const side = rows.kinds[line - 1] === REMOVED ? 'before' : 'after'
    const number = rows[side][line - 1] ?? 0
    const coordinate =
      details && coordinateAt(details.coordinates[side], number)
    return { side, coordinate }
  },
  lineOf: (side, coordinate) => {
    const number =
      details && lineOfCoordinate(details.coordinates[side], coordinate)
    const row = number === undefined ? -1 : rows[side].indexOf(number)
    return row === -1 ? undefined : row + 1
  },
  tokens: (from, to) =>
    details ? tokensBetween(details.tokens, from, to) : [],
})

const marks = new Map(
  TOKEN_KINDS.map(kind => [kind, Decoration.mark({ class: `cm-sdl-${kind}` })])
)

// For the visible rows only: a mark per token would be a second copy of them.
const buildMarks = (view: EditorView): DecorationSet => {
  const { tokens } = view.state.facet(sdlRows)
  const builder = new RangeSetBuilder<Decoration>()
  for (const range of view.visibleRanges) {
    for (const { from, to, kind } of tokens(range.from, range.to)) {
      const mark = marks.get(kind)
      if (mark) builder.add(from, to, mark)
    }
  }
  return builder.finish()
}

const marksPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildMarks(view)
    }

    update(update: ViewUpdate) {
      const rowsChanged =
        update.state.facet(sdlRows) !== update.startState.facet(sdlRows)
      if (update.viewportChanged || rowsChanged) {
        this.decorations = buildMarks(update.view)
      }
    }
  },
  { decorations: plugin => plugin.decorations }
)

/** Colors, and the coordinate on each row, once `setDetails` brings them. */
export const diffDetailsExtension = (rows: Rows): Extension => [
  StateField.define<SdlRows>({
    create: () => rowsOf(rows, undefined),
    update: (value, tr) => {
      for (const effect of tr.effects) {
        if (effect.is(setDetails)) value = rowsOf(rows, effect.value)
      }
      return value
    },
    provide: field => sdlRows.from(field),
  }),
  marksPlugin,
]
