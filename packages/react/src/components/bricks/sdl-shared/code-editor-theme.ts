import { textStyles, themeContract } from '@another-graphql-ide/style'
import { Prec, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { rowTheme } from './sdl-theme'

const theme = EditorView.theme({
  '&': { minHeight: 'inherit' },
  '.cm-content': { paddingBlock: themeContract.px[12] },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'transparent' },

  // Completion, after the design's menu.
  '.cm-tooltip.cm-tooltip-autocomplete': {
    boxSizing: 'border-box',
    width: '296px',
    maxWidth: 'calc(100vw - 32px)',
    padding: themeContract.px[8],
    border: `1px solid ${themeContract.border.default}`,
    borderRadius: themeContract.radii.lg,
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul': {
    display: 'grid',
    gap: themeContract.px[2],
    minWidth: 0,
    maxWidth: 'none',
    // Eight rows.
    maxHeight: '270px',
    borderRadius: 0,
    fontFamily: themeContract.fonts.sans,
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[12],
    boxSizing: 'border-box',
    height: themeContract.px[32],
    paddingBlock: themeContract.px[6],
    paddingInline: themeContract.px[10],
    borderRadius: themeContract.radii.md,
    ...textStyles.body,
    color: themeContract.text.primary,
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    color: themeContract.text.primary,
    backgroundColor: themeContract.bg.hover,
    boxShadow: 'none',
  },
  '.cm-completionLabel': {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '.cm-completionMatchedText': { textDecoration: 'none', fontWeight: 500 },
  '.cm-completionDetail': {
    flexShrink: 0,
    marginInlineStart: 0,
    fontSize: themeContract.px[12],
    lineHeight: themeContract.px[16],
    fontStyle: 'normal',
    color: themeContract.text.tertiary,
  },
})

/** Line height, message rows and completion for an editor of any language. */
export const codeEditorTheme: Extension = [rowTheme, Prec.high(theme)]
