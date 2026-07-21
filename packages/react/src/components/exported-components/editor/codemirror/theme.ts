import { themeContract } from '@another-graphql-ide/style'
import { EditorView } from '@codemirror/view'

/**
 * The editor's chrome theme (gutters, selection, caret, active line,
 * autocomplete popup). Colors are pulled from the design-system theme contract,
 * whose leaf values are `var(--agi-*)` CSS variables — so the same theme object
 * tracks light/dark automatically. The `dark` flag only tunes CodeMirror's own
 * built-in defaults (e.g. selection contrast).
 */
export const editorTheme = (dark: boolean) =>
  EditorView.theme(
    {
      '&': {
        height: '100%',
        color: themeContract.colors.neutral8,
        backgroundColor: themeContract.colors.neutral2,
        fontFamily: themeContract.fonts.mono,
      },
      '.cm-content': {
        fontFamily: themeContract.fonts.mono,
        caretColor: themeContract.colors.brand,
      },
      '.cm-scroller': {
        fontFamily: themeContract.fonts.mono,
      },
      '&.cm-focused': {
        outline: 'none',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: themeContract.colors.brand,
      },
      '.cm-gutters': {
        color: themeContract.colors.neutral6,
        backgroundColor: themeContract.colors.neutral2,
        border: 'none',
      },
      '.cm-activeLine': {
        backgroundColor: themeContract.colors.neutral3,
      },
      '.cm-activeLineGutter': {
        color: themeContract.colors.neutral8,
        backgroundColor: themeContract.colors.neutral3,
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: themeContract.colors.neutral4,
        },
      '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
        outline: `1px solid ${themeContract.colors.neutral6}`,
        backgroundColor: 'transparent',
      },
      // Autocomplete / hover tooltip popup
      '.cm-tooltip': {
        color: themeContract.colors.neutral8,
        backgroundColor: themeContract.colors.neutral1,
        border: `1px solid ${themeContract.colors.neutral5}`,
        borderRadius: themeContract.radii.small,
      },
      '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        color: themeContract.colors.neutral1,
        backgroundColor: themeContract.colors.brand,
      },
      '.cm-graphql-hover': {
        padding: themeContract.px[8],
        maxWidth: '24rem',
        whiteSpace: 'pre-wrap',
        fontFamily: themeContract.fonts.mono,
      },
    },
    { dark }
  )
