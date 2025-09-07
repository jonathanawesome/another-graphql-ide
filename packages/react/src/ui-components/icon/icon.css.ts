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
    // size: {
    //   small: {
    //     height: themeContract.space[12],
    //     width: themeContract.space[12],
    //   },
    //   medium: {
    //     height: themeContract.space[16],
    //     width: themeContract.space[16],
    //   },
    //   large: {
    //     height: themeContract.space[20],
    //     width: themeContract.space[20],
    //   },
    // },
  },
})

globalStyle(`${iconClass()} svg path`, {
  // fill: themeContract.color.neutral[11],
  transition: `all .15s ${themeContract.motion.authentic}`,
})
