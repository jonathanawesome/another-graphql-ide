import { style, textStyles, themeContract } from '@another-graphql-ide/style'

export const sdlDiffStyles = {
  notice: style({
    flex: 1,
    padding: themeContract.px[16],
    ...textStyles.bodyDense,
    color: themeContract.text.secondary,
  }),
}
