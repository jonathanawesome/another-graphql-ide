import { themeContract } from '@another-graphql-ide/style'
import { foldService } from '@codemirror/language'
import { Prec, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { selectLine } from './line-state'
import { sdlField } from './sdl-field'
import type { SdlToken } from './sdl-index'

/** Fixed row height, so the annotation column lines up with the code. */
export const SDL_LINE_HEIGHT = 26

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

const row = `${SDL_LINE_HEIGHT}px`

// The contract has no error color yet; same literal red as ConnectionBar.
const ERROR_COLOR = 'oklch(63% 0.23 25)'

// The theme contract has no syntax tokens yet, so these reuse the palette the
// operation editor highlights with.
const sdlTheme = EditorView.theme({
  '.cm-line, .cm-gutterElement': { lineHeight: row },
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

  // Read-only: text can be selected and copied, but there is no caret.
  '.cm-cursorLayer': { display: 'none' },

  // Rows. The selected row replaces CodeMirror's active line.
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-sdl-hover': { backgroundColor: themeContract.colors.neutral3 },
  '.cm-sdl-selected': {
    backgroundColor: `color-mix(in oklch, ${themeContract.colors.brand} 12%, transparent)`,
  },
  '.cm-gutterElement.cm-sdl-selected': { color: themeContract.colors.neutral8 },
  '.cm-sdl-dimmed': { opacity: 0.35 },
  // A click places a selection, which would outline brackets in a read-only view.
  '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': { outline: 'none' },

  // Fold markers show on the hovered row, and always once folded.
  '.cm-foldGutter .cm-gutterElement:not(.cm-sdl-hover) span[title="Fold line"]':
    { visibility: 'hidden' },

  // Type links keep the type's color and underline on hover.
  '.cm-sdl-link': { color: 'inherit', textDecoration: 'none' },
  '.cm-sdl-link:hover': { textDecoration: 'underline' },

  // Hover card: the popover's surface around the host's content.
  '.cm-tooltip.cm-tooltip-hover': {
    marginTop: themeContract.px[4],
    color: themeContract.colors.neutral8,
    backgroundColor: themeContract.colors.neutral1,
    border: `1px solid ${themeContract.colors.neutral4}`,
    borderRadius: themeContract.radii.large,
    boxShadow: themeContract.shadows.wide,
    overflow: 'hidden',
  },
  '.cm-sdl-card': {
    width: '360px',
    maxWidth: 'calc(100vw - 32px)',
    boxSizing: 'border-box',
    padding: themeContract.px[16],
    fontFamily: themeContract.fonts.sans,
    fontSize: themeContract.px[13],
    lineHeight: 1.5,
  },

  // Find bar panel and its matches.
  '.cm-panels': {
    color: themeContract.colors.neutral7,
    backgroundColor: themeContract.colors.neutral2,
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: `1px solid ${themeContract.colors.neutral4}`,
  },
  '.cm-searchMatch': {
    backgroundColor: themeContract.colors.neutral4,
    outline: 'none',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: themeContract.colors.neutral5,
  },

  // Annotation column. Long lines scroll under it, so it needs an edge.
  '.cm-gutters.cm-gutters-after': {
    borderInlineStart: `1px solid ${themeContract.colors.neutral4}`,
  },
  '.cm-sdl-annotations .cm-gutterElement': {
    paddingInlineStart: themeContract.px[8],
    paddingInlineEnd: themeContract.px[8],
  },
  '.cm-sdl-annotation': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: themeContract.px[12],
    height: row,
  },
  '.cm-sdl-tag': { lineHeight: 'normal', whiteSpace: 'nowrap' },
  // Sized up front, as the icon renders just after the row is measured.
  '.cm-sdl-tag-icon': {
    flexShrink: 0,
    width: themeContract.px[12],
    height: themeContract.px[12],
    marginInlineEnd: themeContract.px[3],
  },
  '.cm-sdl-bar': {
    display: 'block',
    width: '90px',
    height: themeContract.px[4],
    borderRadius: themeContract.px[2],
    backgroundColor: themeContract.colors.neutral4,
    overflow: 'hidden',
  },
  '.cm-sdl-bar > span': {
    display: 'block',
    height: '100%',
    backgroundColor: themeContract.colors.brand,
  },
  '.cm-sdl-error': {
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    fontFamily: themeContract.fonts.sans,
    fontSize: themeContract.px[12],
    color: themeContract.colors.neutral7,
    whiteSpace: 'nowrap',
  },
  '.cm-sdl-error::before': {
    content: '""',
    width: themeContract.px[6],
    height: themeContract.px[6],
    borderRadius: '50%',
    backgroundColor: ERROR_COLOR,
  },
  '.cm-sdl-value': {
    minWidth: '56px',
    textAlign: 'end',
    fontSize: themeContract.px[12],
    color: themeContract.colors.neutral6,
  },
})

/** colors, folding and modifier-click go-to-definition, all from one index. */
export const sdlExtensions: Extension = [
  sdlField,
  folds,
  definitionClick,
  // The Editor's theme comes first, so without this it wins ties.
  Prec.high(sdlTheme),
]
