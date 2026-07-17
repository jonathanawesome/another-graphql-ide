import { keyframes, style, themeContract } from '@another-graphql-ide/style'

const slideUpAndFade = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(2px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
})

const slideRightAndFade = keyframes({
  from: {
    opacity: 0,
    transform: 'translateX(-2px)',
  },
  to: {
    opacity: 1,
    transform: 'translateX(0)',
  },
})

const slideDownAndFade = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(-2px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
})

const slideLeftAndFade = keyframes({
  from: {
    opacity: 0,
    transform: 'translateX(2px)',
  },
  to: {
    opacity: 1,
    transform: 'translateX(0)',
  },
})

export const popoverStyles = {
  content: style({
    position: 'relative',
    zIndex: 2,
    width: 260,
    padding: themeContract.px[20],
    backgroundColor: themeContract.colors.neutral1,
    border: `1px solid ${themeContract.colors.neutral4}`,
    borderRadius: themeContract.radii.large,
    boxShadow: themeContract.shadows.wide,
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',

    selectors: {
      '&:focus': {
        // boxShadow: themeContract.shadows.boxFocus,
      },

      '&[data-state="open"][data-side="top"]': {
        animationName: slideDownAndFade,
      },

      '&[data-state="open"][data-side="right"]': {
        animationName: slideLeftAndFade,
      },

      '&[data-state="open"][data-side="bottom"]': {
        animationName: slideUpAndFade,
      },

      '&[data-state="open"][data-side="left"]': {
        animationName: slideRightAndFade,
      },
    },
  }),

  arrow: style({
    fill: themeContract.colors.neutral1,
  }),

  close: style({
    position: 'absolute',
    top: themeContract.px[8],
    right: themeContract.px[8],
  }),
}
