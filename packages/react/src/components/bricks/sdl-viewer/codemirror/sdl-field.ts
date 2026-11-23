import { RangeSetBuilder, StateField } from '@codemirror/state'
import { Decoration, EditorView, type DecorationSet } from '@codemirror/view'

import { indexSdl, type SdlIndex, type SdlToken } from './sdl-index'

type SdlState = { index: SdlIndex; marks: DecorationSet }

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
  return { index, marks: builder.finish() }
}

/**
 * The index of the current document, rebuilt when it changes. Living in state
 * keeps it in step with the text, however the text arrived.
 */
export const sdlField = StateField.define<SdlState>({
  create: state => build(state.doc.toString()),
  update: (value, tr) =>
    tr.docChanged ? build(tr.state.doc.toString()) : value,
  provide: field => EditorView.decorations.from(field, value => value.marks),
})
