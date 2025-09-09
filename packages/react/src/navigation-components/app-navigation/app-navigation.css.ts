import { recipe, themeContract } from '@another-graphql-ide/style'

export const appNavigationStyles = {
  container: recipe({
    base: {
      display: 'flex',
      alignItems: 'center',
      fontSize: themeContract.px[14],
    },

    variants: {
      orientation: {
        horizontal: {
          flexDirection: 'row',
          gap: themeContract.px[8],
          height: themeContract.px[32],
        },
        vertical: {
          flexDirection: 'column',
          gap: themeContract.px[4],
          width: themeContract.px[40],
        },
      },
    },
  }),

  list: recipe({
    base: {
      display: 'flex',
    },

    variants: {
      orientation: {
        horizontal: {
          flexDirection: 'row',
          gap: themeContract.px[24],
        },
        vertical: {
          flexDirection: 'column',
          gap: themeContract.px[12],
          marginTop: themeContract.px[12],
        },
      },
    },
  }),
}
