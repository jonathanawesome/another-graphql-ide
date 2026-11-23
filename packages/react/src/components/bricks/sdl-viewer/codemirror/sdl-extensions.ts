import { themeContract } from '@another-graphql-ide/style'
import { foldService } from '@codemirror/language'
import { RangeSetBuilder, StateField, type Extension } from '@codemirror/state'
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

/** The token starting at or covering `pos`, by binary search. */
const tokenAt = (tokens: SdlToken[], pos: number) => {
  let low = 0
  let high = tokens.length - 1
  while (low <= high) {
    const middle = (low + high) >> 1
    const token = tokens[middle]
    if (!token) return undefined
    if (pos < token.from) high = middle - 1
    else if (pos >= token.to) low = middle + 1
    else return token
  }
  return undefined
}

/** Offset of the definition named at `pos`, if it names a type or directive. */
export const definitionAt = (view: EditorView, pos: number) => {
  const { index } = view.state.field(sdlField)
  // A click on a word's right edge lands just past its last character.
  const token = tokenAt(index.tokens, pos) ?? tokenAt(index.tokens, pos - 1)
  if (!token || (token.kind !== 'type' && token.kind !== 'directive')) {
    return undefined
  }

  const text = view.state.sliceDoc(token.from, token.to)
  if (text === '@') return undefined
  const key = token.kind === 'directive' ? `@${text}` : text
  const target = index.definitions.get(key)
  return target === undefined
    ? undefined
    : { from: target, length: text.length }
}

/** Selects and scrolls to the definition named at `pos`. */
export const goToDefinition = (view: EditorView, pos: number) => {
  const target = definitionAt(view, pos)
  if (!target) return false
  view.dispatch({
    selection: { anchor: target.from, head: target.from + target.length },
    effects: EditorView.scrollIntoView(target.from, { y: 'center' }),
  })
  return true
}

const definitionClick = EditorView.domEventHandlers({
  mousedown(event, view) {
    if (!(event.metaKey || event.ctrlKey)) return false
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
    if (pos === null || !goToDefinition(view, pos)) return false
    event.preventDefault()
    return true
  },
})

const folds = foldService.of((state, lineStart) => {
  const { index } = state.field(sdlField)
  return index.folds.get(state.doc.lineAt(lineStart).number) ?? null
})

// The theme contract has no syntax tokens yet, so these reuse the palette the
// operation editor highlights with.
const sdlTheme = EditorView.theme({
  '.cm-sdl-keyword, .cm-sdl-directive': { color: themeContract.colors.brand },
  '.cm-sdl-type': { color: themeContract.colors.neutral7, fontWeight: 600 },
  '.cm-sdl-field': { color: themeContract.colors.neutral8 },
  '.cm-sdl-argument, .cm-sdl-enumValue, .cm-sdl-number, .cm-sdl-string': {
    color: themeContract.colors.neutral7,
  },
  '.cm-sdl-comment': {
    color: themeContract.colors.neutral5,
    fontStyle: 'italic',
  },
})

/** Colours, folding and modifier-click go-to-definition, all from one index. */
export const sdlExtensions: Extension = [
  sdlField,
  folds,
  definitionClick,
  sdlTheme,
]
