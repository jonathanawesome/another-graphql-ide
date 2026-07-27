import { style, themeContract } from '@another-graphql-ide/style'

export const runButtonStyles = {
  // A pre rather than an Editor: this can be dropped anywhere, including where
  // no ThemeProvider is in scope, and it keeps CodeMirror out of the bundle.
  result: style({
    margin: 0,
    maxHeight: 320,
    maxWidth: 480,
    overflow: 'auto',
    fontSize: themeContract.px[11],
    color: themeContract.colors.neutral7,
  }),

  error: style({
    margin: 0,
    maxWidth: 480,
    color: themeContract.colors.brand,
    fontSize: themeContract.px[11],
  }),
}
