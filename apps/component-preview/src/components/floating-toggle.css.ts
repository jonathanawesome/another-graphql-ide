import { recipe, themeContract } from '@another-graphql-ide/style'

export const floatingToggleClass = recipe({
  base: {
    position: 'fixed',
    right: themeContract.px[16],
    width: themeContract.px[32],
    height: themeContract.px[32],
    borderRadius: '50%',
    background: themeContract.colors.neutral1,
    border: `1px solid ${themeContract.colors.neutral5}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: `all 0.2s ${themeContract.motion.authentic}`,

    ':hover': {
      background: themeContract.colors.neutral3,
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
      transform: 'translateY(-2px)',
    },

    ':active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },
  },

  variants: {
    isShelfOpen: {
      false: {},
      true: {},
    },
    isShelfPinned: {
      false: {},
      true: {},
    },
    type: {
      shelf: {},
      theme: {},
      pin: {},
    },
  },

  compoundVariants: [
    //shelf
    {
      variants: {
        isShelfOpen: true,
        type: 'shelf',
      },
      style: {
        top: themeContract.px[16],
        right: themeContract.px[16],
      },
    },
    {
      variants: {
        isShelfOpen: false,
        type: 'shelf',
      },
      style: {
        bottom: themeContract.px[16],
      },
    },
    //theme
    {
      variants: {
        isShelfOpen: true,
        type: 'theme',
      },
      style: {
        top: themeContract.px[16],
        right: themeContract.px[60],
      },
    },
    {
      variants: {
        isShelfOpen: false,
        type: 'theme',
      },
      style: {
        bottom: themeContract.px[60],
      },
    },

    // pin
    {
      variants: {
        isShelfOpen: true,
        type: 'pin',
      },
      style: {
        top: themeContract.px[16],
        right: 104,
      },
    },
    {
      variants: {
        isShelfOpen: true,
        isShelfPinned: true,
        type: 'pin',
      },
      style: {
        display: 'none',
      },
    },
    {
      variants: {
        isShelfOpen: false,
        type: 'pin',
      },
      style: {
        display: 'none',
      },
    },
  ],
})
