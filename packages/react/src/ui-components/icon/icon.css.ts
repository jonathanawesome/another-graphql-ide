import { globalStyle, recipe, themeContract } from '@another-graphql-ide/style'

export const iconClass = recipe({
  base: {
    display: 'flex',
    transform: 'rotate(0deg)',
  },

  variants: {
    rotate: {
      '90': {
        transform: `rotate(90deg)`,
      },
      '180': {
        transform: `rotate(180deg)`,
      },
      '270': {
        transform: `rotate(270deg)`,
      },
    },
    size: {
      small: {
        height: themeContract.px[16],
        width: themeContract.px[16],
      },
      medium: {
        height: themeContract.px[20],
        width: themeContract.px[20],
      },
    },
  },
})

globalStyle(`${iconClass()} svg path`, {
  fill: themeContract.colors.neutral6,
  transition: `all .15s ${themeContract.motion.authentic}`,
})
