import { recipe, themeContract } from '@another-graphql-ide/style'

export const separatorClass = recipe({
  base: {
    display: 'block',
    backgroundColor: themeContract.border.default,
  },

  variants: {
    orientation: {
      horizontal: {
        height: themeContract.px[1],
        width: '100%',
      },
      vertical: {
        width: themeContract.px[1],
        height: '100%',
      },
    },
  },
})
