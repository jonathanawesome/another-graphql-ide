import { textStyles, themeContract } from '@another-graphql-ide/style'
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
        ...textStyles.code,
        color: themeContract.text.primary,
        backgroundColor: themeContract.bg.surface,
      },
      '.cm-content': {
        fontFamily: themeContract.fonts.mono,
        caretColor: themeContract.accent.line,
      },
      '.cm-scroller': {
        fontFamily: themeContract.fonts.mono,
        lineHeight: textStyles.code.lineHeight,
      },
      '&.cm-focused': {
        outline: 'none',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: themeContract.accent.line,
      },
      '.cm-gutters': {
        fontSize: textStyles.codeSmall.fontSize,
        color: themeContract.text.tertiary,
        backgroundColor: themeContract.bg.surface,
        border: 'none',
      },
      '.cm-activeLine': {
        backgroundColor: themeContract.bg.hover,
      },
      '.cm-activeLineGutter': {
        color: themeContract.text.primary,
        backgroundColor: themeContract.bg.hover,
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: themeContract.fill.neutral,
        },
      '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
        outline: `1px solid ${themeContract.border.emphasis}`,
        backgroundColor: 'transparent',
      },
      // Autocomplete / hover tooltip popup
      '.cm-tooltip': {
        color: themeContract.text.primary,
        backgroundColor: themeContract.bg.raised,
        border: 'none',
        borderRadius: themeContract.radii.md,
        boxShadow: themeContract.shadows.popover,
      },
      '.cm-tooltip-autocomplete > ul': {
        borderRadius: themeContract.radii.md,
      },
      '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        color: themeContract.text.primary,
        backgroundColor: themeContract.bg.selected,
        boxShadow: `inset 0 0 0 1px ${themeContract.accent.selectedEdge}`,
      },
      '.cm-graphql-hover': {
        padding: themeContract.px[8],
        maxWidth: '24rem',
        whiteSpace: 'pre-wrap',
        fontFamily: themeContract.fonts.mono,
      },
      // De-emphasize operations the cursor is not inside.
      '.cm-agi-dimmed': {
        opacity: 0.4,
      },
    },
    { dark }
  )
