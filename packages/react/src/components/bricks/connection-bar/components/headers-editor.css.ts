import { style, textStyles, themeContract } from '@another-graphql-ide/style'

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
    ...textStyles.label,
    color: themeContract.text.secondary,
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

  error: style({
    fontSize: themeContract.px[11],
    color: themeContract.status.danger,
  }),

  addButton: style({ alignSelf: 'flex-start' }),
}
