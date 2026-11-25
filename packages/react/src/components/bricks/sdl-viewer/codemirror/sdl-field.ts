import { RangeSetBuilder, StateField } from '@codemirror/state'
import { Decoration, EditorView, type DecorationSet } from '@codemirror/view'

import {
  indexSdl,
  type SdlIndex,
  type SdlToken,
} from '../../sdl-shared/sdl-index'
import { sdlRows, type SdlRows } from '../../sdl-shared/sdl-rows'

type SdlState = { index: SdlIndex; marks: DecorationSet; rows: SdlRows }

const markFor = Object.fromEntries(
  (
    [
      'keyword',
      'type',
      'field',
      'argument',
      'enumValue',
      'directive',
      'string',
      'number',
      'comment',
    ] as const
  ).map(kind => [kind, Decoration.mark({ class: `cm-sdl-${kind}` })])
) as Record<SdlToken['kind'], Decoration>

const build = (doc: string): SdlState => {
  const index = indexSdl(doc)
  const builder = new RangeSetBuilder<Decoration>()
  for (const token of index.tokens) {
    builder.add(token.from, token.to, markFor[token.kind])
  }
  return { index, marks: builder.finish(), rows: rowsOf(index) }
}

/** Tokens that overlap a range, starting from a binary search. */
function* tokensBetween(tokens: SdlToken[], from: number, to: number) {
  let low = 0
  let high = tokens.length
  while (low < high) {
    const middle = (low + high) >> 1
    if ((tokens[middle]?.to ?? 0) <= from) low = middle + 1
    else high = middle
  }
  for (let i = low; i < tokens.length; i++) {
    const token = tokens[i]
    if (!token || token.from >= to) return
    yield token
  }
}

const rowsOf = (index: SdlIndex): SdlRows => ({
  row: line => ({
    side: 'after',
    coordinate: index.coordinateAtLine.get(line),
  }),
  lineOf: (_, coordinate) => index.lineOfCoordinate.get(coordinate),
  tokens: (from, to) => tokensBetween(index.tokens, from, to),
})

/**
 * The index of the current document, rebuilt when it changes. Living in state
 * keeps it in step with the text, however the text arrived.
 */
export const sdlField = StateField.define<SdlState>({
  create: state => build(state.doc.toString()),
  update: (value, tr) =>
    tr.docChanged ? build(tr.state.doc.toString()) : value,
  provide: field => [
    EditorView.decorations.from(field, value => value.marks),
    sdlRows.from(field, value => value.rows),
  ],
})
