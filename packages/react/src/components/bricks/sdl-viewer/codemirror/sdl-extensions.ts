import { foldService } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import type { SdlToken } from '../../sdl-shared/sdl-index'
import { sdlTheme } from '../../sdl-shared/sdl-theme'

import { selectLine } from './line-state'
import { sdlField } from './sdl-field'

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

/** Selects and scrolls to the definition named at `pos`, and selects its row. */
export const goToDefinition = (view: EditorView, pos: number) => {
  const target = definitionAt(view, pos)
  if (!target) return false
  view.dispatch({
    selection: { anchor: target.from, head: target.from + target.length },
    effects: [
      EditorView.scrollIntoView(target.from, { y: 'center' }),
      selectLine.of(view.state.doc.lineAt(target.from).number),
    ],
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

/** colors, folding and modifier-click go-to-definition, all from one index. */
export const sdlExtensions: Extension = [
  sdlField,
  folds,
  definitionClick,
  sdlTheme,
]
