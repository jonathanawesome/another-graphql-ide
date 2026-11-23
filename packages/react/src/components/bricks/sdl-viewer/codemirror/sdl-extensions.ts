import { textStyles, themeContract } from '@another-graphql-ide/style'
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

const sdlTheme = EditorView.theme({
  '.cm-line, .cm-gutterElement': { lineHeight: row },
  // Punctuation is the only text without a token class.
  '.cm-line': { color: themeContract.syntax.punctuation },
  '.cm-sdl-keyword': { color: themeContract.syntax.keyword },
  '.cm-sdl-type': { color: themeContract.syntax.type },
  '.cm-sdl-field, .cm-sdl-argument, .cm-sdl-enumValue': {
    color: themeContract.text.primary,
  },
  '.cm-sdl-directive': { color: themeContract.syntax.function },
  '.cm-sdl-string': { color: themeContract.syntax.string },
  '.cm-sdl-number': { color: themeContract.syntax.number },
  '.cm-sdl-comment': { color: themeContract.syntax.comment },

  // Read-only: text can be selected and copied, but there is no caret.
  '.cm-cursorLayer': { display: 'none' },

  // Rows. The selected row replaces CodeMirror's active line.
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-sdl-hover': { backgroundColor: themeContract.bg.hover },
  '.cm-sdl-selected': { backgroundColor: themeContract.bg.selected },
  '.cm-gutterElement.cm-sdl-selected': { color: themeContract.text.primary },
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
    borderRadius: themeContract.radii.lg,
    overflow: 'hidden',
  },
  '.cm-sdl-card': {
    width: '360px',
    maxWidth: 'calc(100vw - 32px)',
    boxSizing: 'border-box',
    padding: themeContract.px[16],
    ...textStyles.bodyDense,
  },
  '.cm-sdl-card a': {
    color: themeContract.text.link,
    textDecorationColor: themeContract.link.underline,
  },

  // Find bar panel and its matches.
  '.cm-panels': {
    color: themeContract.text.secondary,
    backgroundColor: themeContract.bg.surface,
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: `1px solid ${themeContract.border.subtle}`,
  },
  '.cm-searchMatch': {
    backgroundColor: themeContract.fill.accentSoftHover,
    outline: 'none',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    outline: `1px solid ${themeContract.accent.line}`,
  },

  // Annotation column. Long lines scroll under it, so it needs an edge.
  '.cm-gutters.cm-gutters-after': {
    borderInlineStart: `1px solid ${themeContract.border.subtle}`,
  },
  '.cm-sdl-annotations .cm-gutterElement': {
    paddingInlineStart: themeContract.px[8],
    paddingInlineEnd: themeContract.px[14],
  },
  '.cm-sdl-annotation': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: themeContract.px[12],
    height: row,
  },
  // Sized up front, as the icon renders just after the row is measured.
  '.cm-sdl-tag-icon': {
    flexShrink: 0,
    width: themeContract.px[12],
    height: themeContract.px[12],
  },
  '.cm-sdl-bar': {
    display: 'block',
    width: '90px',
    height: themeContract.px[4],
    borderRadius: themeContract.px[2],
    backgroundColor: themeContract.bg.track,
    overflow: 'hidden',
  },
  '.cm-sdl-bar > span': {
    display: 'block',
    height: '100%',
    borderRadius: themeContract.px[2],
    backgroundColor: themeContract.accent.line,
  },
  '.cm-sdl-error': {
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    fontFamily: themeContract.fonts.sans,
    fontSize: themeContract.px[12],
    color: themeContract.text.secondary,
    whiteSpace: 'nowrap',
  },
  '.cm-sdl-error::before': {
    content: '""',
    width: themeContract.px[6],
    height: themeContract.px[6],
    borderRadius: '50%',
    backgroundColor: themeContract.status.danger,
  },
  '.cm-sdl-value': {
    minWidth: '56px',
    textAlign: 'end',
    ...textStyles.codeSmall,
    color: themeContract.text.primary,
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
