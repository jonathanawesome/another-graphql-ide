import { textStyles, themeContract } from '@another-graphql-ide/style'
import { Prec, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { SDL_LINE_HEIGHT } from '../../sdl-shared/sdl-theme'

import { FOLD_ROW_HEIGHT } from './diff-folds'

const theme = EditorView.theme({
  // The diff has its own numbers, and folds runs rather than definitions.
  '.cm-lineNumbers, .cm-foldGutter': { display: 'none !important' },

  '.cm-activeLineGutter': { color: 'inherit' },

  '.cm-sdl-added': { backgroundColor: themeContract.diff.addedBg },
  '.cm-sdl-removed': { backgroundColor: themeContract.diff.removedBg },
  // CodeMirror draws the selection under the rows, so a tint would hide it.
  '.cm-line.cm-sdl-added, .cm-line.cm-sdl-removed': {
    '& ::selection, &::selection': {
      backgroundColor: `${themeContract.fill.neutral} !important`,
    },
  },

  '.cm-sdl-diff-cell': {
    display: 'flex',
    justifyContent: 'flex-end',
    height: `${SDL_LINE_HEIGHT}px`,
    paddingInlineStart: themeContract.px[16],
  },
  '.cm-sdl-diff-sign': {
    width: themeContract.px[24],
    textAlign: 'center',
    ...textStyles.code,
    lineHeight: 'inherit',
    color: themeContract.text.primary,
    // Not part of the code, so it stays out of a copy.
    userSelect: 'none',
  },

  '.cm-sdl-folded, .cm-sdl-folded-gutter': {
    height: `${FOLD_ROW_HEIGHT}px`,
    backgroundColor: themeContract.bg.inset,
  },
  '.cm-sdl-folded button': {
    display: 'block',
    width: '100%',
    height: '100%',
    paddingInline: themeContract.px[6],
    border: 'none',
    backgroundColor: 'transparent',
    ...textStyles.bodyDense,
    fontFamily: themeContract.fonts.sans,
    color: themeContract.text.tertiary,
    textAlign: 'start',
    cursor: 'pointer',
  },
  '.cm-sdl-folded button:hover': { color: themeContract.text.primary },
  '.cm-sdl-folded button:focus-visible': {
    outline: `2px solid ${themeContract.focus.ring}`,
    outlineOffset: '-2px',
  },
})

/** Row tints, the number gutter and folded runs. Wins over the shared theme. */
export const diffTheme: Extension = Prec.highest(theme)
