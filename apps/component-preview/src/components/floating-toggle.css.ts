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
    transition: `all 0.15s ${themeContract.motion.authentic}`,

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
      shelf: {
        bottom: themeContract.px[16],
      },
      theme: {
        bottom: themeContract.px[60],
      },
      pin: {
        bottom: 104,
        opacity: 1,
      },
    },
  },

  compoundVariants: [
    // pin
    {
      variants: {
        isShelfOpen: true,
        isShelfPinned: true,
        type: 'pin',
      },
      style: {
        opacity: 0,
        visibility: 'hidden',
      },
    },
    {
      variants: {
        isShelfOpen: false,
        type: 'pin',
      },
      style: {
        opacity: 0,
        visibility: 'hidden',
      },
    },
  ],
})
