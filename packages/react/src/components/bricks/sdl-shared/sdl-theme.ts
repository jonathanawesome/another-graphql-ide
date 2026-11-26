import { textStyles, themeContract } from '@another-graphql-ide/style'
import { Prec, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { MESSAGE_ROW_HEIGHT, MESSAGE_WIDTH_VAR } from './message-rows'

/** Fixed row height, so the annotation column lines up with the code. */
export const SDL_LINE_HEIGHT = 26

const row = `${SDL_LINE_HEIGHT}px`

const lines = EditorView.theme({
  '.cm-line, .cm-gutterElement': { lineHeight: row },
})

const colors = EditorView.theme({
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
})

/** Message rows, tinted through the gutters. */
const messages = EditorView.theme({
  '.cm-sdl-message-warning': {
    backgroundColor: themeContract.status.warningBg,
  },
  '.cm-sdl-message-danger': { backgroundColor: themeContract.status.dangerBg },
  '.cm-sdl-message': {
    display: 'flex',
    alignItems: 'baseline',
    gap: themeContract.px[7],
    minHeight: `${MESSAGE_ROW_HEIGHT}px`,
    boxSizing: 'border-box',
    paddingBlock: themeContract.px[6],
    // Lines up with the code.
    paddingInlineStart: themeContract.px[6],
    // Wraps in view, rather than at the end of the longest line.
    paddingInlineEnd: `calc(${themeContract.px[16]} + max(0px, 100% - var(${MESSAGE_WIDTH_VAR}, 100%)))`,
    // Long text must not widen the code.
    contain: 'inline-size',
    whiteSpace: 'normal',
    ...textStyles.bodyDense,
    color: themeContract.text.primary,
  },
  '.cm-sdl-message-dot': {
    flexShrink: 0,
    width: themeContract.px[7],
    height: themeContract.px[7],
    borderRadius: '50%',
    // An empty box's baseline is its bottom edge.
    transform: 'translateY(-1px)',
  },
  '.cm-sdl-message-warning .cm-sdl-message-dot': {
    backgroundColor: themeContract.status.warning,
  },
  '.cm-sdl-message-danger .cm-sdl-message-dot': {
    backgroundColor: themeContract.status.danger,
  },
  '.cm-sdl-message-code': {
    // A name that does not fit moves to the next line whole.
    display: 'inline-block',
    marginInlineStart: themeContract.px[10],
    ...textStyles.codeSmall,
    color: themeContract.text.secondary,
  },
})

/** Rows, the find panel and the annotation column, for read-only views. */
const viewer = EditorView.theme({
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
    // Clips the column while its width slides.
    overflow: 'hidden',
  },
  '.cm-sdl-annotations': { flexShrink: 0 },
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

// The Editor's theme comes first, so without Prec.high it wins ties.

/** Line height and message rows, for any language. */
export const rowTheme: Extension = Prec.high([lines, messages])

/** SDL's colors. */
export const sdlColors: Extension = Prec.high(colors)

/** Everything a read-only SDL view needs. */
export const sdlTheme: Extension = [rowTheme, sdlColors, Prec.high(viewer)]
