import { style, themeContract } from '@another-graphql-ide/style'

export const headersEditorStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    gap: themeContract.px[8],
    minWidth: 320,
  }),

  header: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: themeContract.px[8],
  }),

  title: style({
    fontSize: themeContract.px[12],
    fontWeight: 600,
    color: themeContract.colors.neutral7,
  }),

  rows: style({
    display: 'flex',
    flexDirection: 'column',
    gap: themeContract.px[6],
  }),

  row: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[6],
  }),

  field: style({ flex: 1, minWidth: 0 }),

  rawEditor: style({
    height: 160,
    border: `1px solid ${themeContract.colors.neutral4}`,
    borderRadius: themeContract.radii.small,
    overflow: 'hidden',
  }),

  error: style({
    fontSize: themeContract.px[11],
    // No danger token in the contract yet; literal red.
    color: 'oklch(63% 0.23 25)',
  }),

  addButton: style({ alignSelf: 'flex-start' }),
}
