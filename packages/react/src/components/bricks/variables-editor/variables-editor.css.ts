import { style, textStyles, themeContract } from '@another-graphql-ide/style'

export const variablesEditorStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    gap: themeContract.px[4],
    minHeight: 0,
  }),

  label: style({
    ...textStyles.overline,
    color: themeContract.text.tertiary,
  }),

  error: style({
    color: themeContract.status.danger,
    fontSize: themeContract.px[10],
  }),
}
