import { themeContract, recipe, globalStyle } from '@another-graphql-ide/style'

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

      fontSize: themeContract.px[12],
      fontWeight: 500,
      color: themeContract.colors.neutral6,
      backgroundColor: themeContract.colors.neutral3,

      border: `1px solid ${themeContract.colors.neutral4}`,
      borderRadius: themeContract.radii.small,
      transition: `all .15s ${themeContract.motion.authentic}`,

      ':hover': {
        backgroundColor: themeContract.colors.neutral4,
        border: `1px solid ${themeContract.colors.neutral5}`,
        color: themeContract.colors.neutral8,
      },
    },
  ],

  variants: {
    // Text only, for a quiet action beside other text.
    ghost: {
      true: {
        paddingLeft: 0,
        paddingRight: 0,
        color: themeContract.colors.neutral8,
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
        color: themeContract.colors.neutral5,
        ':hover': {
          color: themeContract.colors.neutral5,
          textDecoration: 'none',
        },
      },
    },
  ],
})

globalStyle(`${buttonClass()}:hover svg path`, {
  fill: themeContract.colors.neutral8,
})
