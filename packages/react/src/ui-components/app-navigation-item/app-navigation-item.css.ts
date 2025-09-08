import { recipe, themeContract } from '@another-graphql-ide/style'

export const appNavigationItemClass = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    fontSize: themeContract.px[14],
  },

  variants: {
    active: {
      false: {
        color: themeContract.colors.textLight,
        fontWeight: 500,
      },
      true: {
        color: themeContract.colors.textStrong,
        fontWeight: 600,
      },
    },
    orientation: {
      horizontal: {
        height: themeContract.px[32],
        flexDirection: 'row',
      },
      vertical: {
        flexDirection: 'column',
        width: themeContract.px[40],
        height: themeContract.px[40],
        overflow: 'hidden',
      },
    },
  },
})
