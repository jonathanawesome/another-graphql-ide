import { themeContract, recipe, globalStyle } from '@another-graphql-ide/style'

import { iconClass } from '../icon/icon.css'

export const iconButtonClass = recipe({
  base: [
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      borderRadius: themeContract.radii.small,
      border: `1px solid transparent`,
      transform: 'rotate(0deg)',
      transition: `all .15s ${themeContract.motion.authentic}`,

      ':focus': {
        border: `1px dashed ${themeContract.colors.neutral5}`,
      },
    },
  ],

  variants: {
    ghost: {
      false: {
        border: `1px solid ${themeContract.colors.neutral4}`,
        backgroundColor: themeContract.colors.neutral1,

        ':hover': {
          border: `1px solid ${themeContract.colors.neutral5}`,
          backgroundColor: themeContract.colors.neutral4,
        },
      },
      true: {
        ':hover': {
          backgroundColor: themeContract.colors.neutral3,
        },
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
      },
      large: {
        height: themeContract.px[40],
        width: themeContract.px[40],
        borderRadius: themeContract.radii.medium,
      },
    },
    state: {
      active: {},
      highlight: {},
      disabled: {
        ':hover': { backgroundColor: 'transparent' },
      },
    },
  },
})

globalStyle(`${iconButtonClass()}:hover svg path`, {
  fill: themeContract.colors.neutral8,
})

// hover over icon-button scales the underlying icon
// transition is in iconClass.css.ts
globalStyle(`${iconButtonClass()}:hover ${iconClass()}`, {
  transform: `scale(1.1)`,
})

globalStyle(
  `${iconButtonClass.classNames.variants.state.disabled}:hover ${iconClass()}`,
  {
    transform: `none`,
  }
)

globalStyle(`${iconButtonClass.classNames.variants.state.highlight} svg path`, {
  fill: themeContract.colors.brand,
})

globalStyle(`${iconButtonClass.classNames.variants.state.active} svg path`, {
  fill: themeContract.colors.neutral8,
})

globalStyle(`${iconButtonClass.classNames.variants.state.disabled} svg path`, {
  fill: themeContract.colors.neutral6,
})

globalStyle(
  `${iconButtonClass.classNames.variants.state.disabled}:hover svg path`,
  {
    fill: themeContract.colors.neutral6,
  }
)
