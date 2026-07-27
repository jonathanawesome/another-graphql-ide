import { style, themeContract } from '@another-graphql-ide/style'

export const variablesEditorStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    gap: themeContract.px[4],
    minHeight: 0,
  }),

  label: style({
    fontSize: themeContract.px[10],
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: themeContract.px[1],
    color: themeContract.colors.neutral6,
  }),

  error: style({
    color: themeContract.colors.brand,
    fontSize: themeContract.px[10],
  }),
}
