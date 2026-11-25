import { StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { selectLine } from './line-state'
import type { SdlToken } from './sdl-index'
import { rowAtLine, sdlRows } from './sdl-rows'

/** Go-to-definition is about to scroll to this line. */
export const definitionLine = StateEffect.define<number>()

/** The definition named at `pos`, if it names a type or directive. */
export const definitionAt = (view: EditorView, pos: number) => {
  const { state } = view
  const rows = state.facet(sdlRows)
  let token: SdlToken | undefined
  // A click on a word's right edge lands just past its last character.
  for (const next of rows.tokens(pos - 1, pos + 1)) {
    if (next.from <= pos) token = next
  }
  if (token?.kind !== 'type' && token?.kind !== 'directive') return undefined

  const text = state.sliceDoc(token.from, token.to)
  if (text === '@') return undefined
  const { side } = rowAtLine(state, state.doc.lineAt(pos).number)
  const number = rows.lineOf(
    side,
    token.kind === 'directive' ? `@${text}` : text
  )
  if (number === undefined) return undefined

  const line = state.doc.line(number)
  for (const name of rows.tokens(line.from, line.to)) {
    const found = state.sliceDoc(name.from, name.to)
    if (name.kind === token.kind && found === text) return name
  }
  return undefined
}

/** Selects and scrolls to the definition named at `pos`, and selects its row. */
export const goToDefinition = (view: EditorView, pos: number) => {
  const target = definitionAt(view, pos)
  if (!target) return false
  const line = view.state.doc.lineAt(target.from).number
  view.dispatch({
    selection: { anchor: target.from, head: target.to },
    effects: [
      definitionLine.of(line),
      EditorView.scrollIntoView(target.from, { y: 'center' }),
      selectLine.of(line),
    ],
  })
  return true
}

/** Modifier-click goes to the definition. */
export const definitionClick = EditorView.domEventHandlers({
  mousedown(event, view) {
    if (!(event.metaKey || event.ctrlKey)) return false
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
    if (pos === null || !goToDefinition(view, pos)) return false
    event.preventDefault()
    return true
  },
})
