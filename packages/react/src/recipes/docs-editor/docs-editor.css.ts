import {
  recipe,
  style,
  textStyles,
  themeContract,
} from '@another-graphql-ide/style'

export const docsEditorStyles = {
  container: recipe({
    base: {
      display: 'flex',
      minHeight: 0,
      gap: themeContract.px[8],
      border: `1px solid ${themeContract.border.subtle}`,
      borderRadius: themeContract.radii.md,
      padding: themeContract.px[8],
      backgroundColor: themeContract.bg.surface,
    },
    variants: {
      orientation: {
        vertical: { flexDirection: 'column' },
        horizontal: { flexDirection: 'row' },
      },
    },
    defaultVariants: { orientation: 'vertical' },
  }),

  toolbar: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),

  // A fixed split rather than a Resizer: a docs column has no room for a drag
  // handle and the height is set by the host.
  pane: style({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    gap: themeContract.px[4],
  }),

  paneLabel: style({
    ...textStyles.overline,
    color: themeContract.text.tertiary,
  }),

  editor: style({
    flex: 1,
    minHeight: 0,
  }),
}
