import { RangeSetBuilder, StateEffect, StateField } from '@codemirror/state'
import {
  Decoration,
  ViewPlugin,
  type DecorationSet,
  type EditorView,
  type ViewUpdate,
} from '@codemirror/view'

import { TOKEN_KINDS, type Tokens } from '../compare/unify-tokens'

const marks = TOKEN_KINDS.map(kind =>
  Decoration.mark({ class: `cm-sdl-${kind}` })
)

/** The colors arrived. */
export const setTokens = StateEffect.define<Tokens>()

const tokensField = StateField.define<Tokens | undefined>({
  create: () => undefined,
  update: (value, tr) => {
    for (const effect of tr.effects) {
      if (effect.is(setTokens)) value = effect.value
    }
    return value
  },
})

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

// For the visible rows only: a mark per token would be a second copy of them.
const buildMarks = (view: EditorView): DecorationSet => {
  const tokens = view.state.field(tokensField)
  if (!tokens) return Decoration.none
  const builder = new RangeSetBuilder<Decoration>()
  for (const { from, to } of view.visibleRanges) {
    for (let i = firstAfter(tokens, from); i < tokens.from.length; i++) {
      const start = tokens.from[i] ?? to
      if (start >= to) break
      const mark = marks[tokens.kinds[i] ?? 0]
      if (mark) builder.add(start, tokens.to[i] ?? start, mark)
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
      const tokensChanged =
        update.state.field(tokensField) !== update.startState.field(tokensField)
      if (update.viewportChanged || tokensChanged) {
        this.decorations = buildMarks(update.view)
      }
    }
  },
  { decorations: plugin => plugin.decorations }
)

/** Colors for the diff's text, once `setTokens` brings them. */
export const diffTokens = [tokensField, marksPlugin]
