import { themeContract, recipe, globalStyle } from '@another-graphql-ide/style'

export const iconButtonClass = recipe({
  base: [
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      borderRadius: themeContract.px[4],
      transform: 'rotate(0deg)',
      transition: `all .15s ${themeContract.motion.authentic}`,
    },
  ],

  variants: {
    isDisabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.65,
      },
    },
    rotate: {
      '90': {
        transform: 'rotate(90deg)',
      },
      '180': {
        transform: 'rotate(180deg)',
      },
      '270': {
        transform: 'rotate(270deg)',
      },
    },
    size: {
      mini: {
        height: themeContract.px[24],
        width: themeContract.px[24],
      },
      small: {
        height: themeContract.px[32],
        width: themeContract.px[32],
      },
      medium: {
        height: themeContract.px[40],
        width: themeContract.px[40],
        borderRadius: themeContract.radii.medium,
        border: `1px solid ${themeContract.colors.neutral4}`,
        backgroundColor: themeContract.colors.neutral1,

        ':hover': {
          border: `1px solid ${themeContract.colors.neutral5}`,
          backgroundColor: themeContract.colors.neutral4,
        },
      },
      large: {
        height: themeContract.px[40],
        width: themeContract.px[40],
      },
    },
    state: {
      active: {},
      highlight: {},
    },
  },
})

globalStyle(`${iconButtonClass()}:hover svg path`, {
  fill: themeContract.colors.neutral8,
})

export const highlightIconStyles = globalStyle(
  `${iconButtonClass.classNames.variants.state.highlight} svg path`,
  {
    fill: themeContract.colors.brand,
  }
)

export const activeIconStyles = globalStyle(
  `${iconButtonClass.classNames.variants.state.active} svg path`,
  {
    fill: themeContract.colors.neutral8,
  }
)
