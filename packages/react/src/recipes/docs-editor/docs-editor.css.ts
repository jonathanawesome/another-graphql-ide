import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const docsEditorStyles = {
  container: recipe({
    base: {
      display: 'flex',
      minHeight: 0,
      gap: themeContract.px[8],
      border: `1px solid ${themeContract.colors.neutral4}`,
      borderRadius: themeContract.radii.medium,
      padding: themeContract.px[8],
      backgroundColor: themeContract.colors.neutral1,
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
    fontSize: themeContract.px[10],
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: themeContract.px[1],
    color: themeContract.colors.neutral6,
  }),

  editor: style({
    flex: 1,
    minHeight: 0,
  }),
}
