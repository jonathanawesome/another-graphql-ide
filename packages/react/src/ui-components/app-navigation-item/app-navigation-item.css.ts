import { globalStyle, recipe, themeContract } from '@another-graphql-ide/style'

export const appNavigationItemClass = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    fontSize: themeContract.px[14],
    cursor: 'pointer',
    transition: `all .15s ${themeContract.motion.authentic}`,

    ':hover': {
      color: themeContract.colors.neutral8,
    },
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
        gap: 4,
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

globalStyle(
  `${appNavigationItemClass.classNames.variants.active.true} svg path`,
  {
    fill: themeContract.colors.neutral8,
  }
)

globalStyle(`${appNavigationItemClass()}:hover svg path`, {
  fill: themeContract.colors.neutral8,
})
