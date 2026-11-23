import {
  globalStyle,
  recipe,
  textStyles,
  themeContract,
} from '@another-graphql-ide/style'

export const buttonClass = recipe({
  base: [
    {
      height: themeContract.px[24],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: themeContract.px[4],
      paddingLeft: themeContract.px[8],
      paddingRight: themeContract.px[8],

      ...textStyles.label,
      color: themeContract.text.secondary,
      backgroundColor: themeContract.bg.surface,

      border: `1px solid ${themeContract.border.default}`,
      borderRadius: themeContract.radii.md,
      transition: `all .15s ${themeContract.motion.authentic}`,

      ':hover': {
        backgroundColor: themeContract.bg.hover,
        border: `1px solid ${themeContract.border.strong}`,
        color: themeContract.text.primary,
      },
    },
  ],

  variants: {
    // Text only, for a quiet action beside other text.
    ghost: {
      true: {
        paddingLeft: 0,
        paddingRight: 0,
        color: themeContract.text.primary,
        backgroundColor: 'transparent',
        border: '1px solid transparent',

        ':hover': {
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          textDecoration: 'underline',
        },
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

  compoundVariants: [
    {
      variants: { ghost: true, state: 'disabled' },
      style: {
        ':hover': { textDecoration: 'none' },
      },
    },
  ],
})

globalStyle(`${buttonClass()}:hover svg path`, {
  fill: themeContract.text.primary,
})
