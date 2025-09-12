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

export const tooltipStyles = {
  content: style({
    userSelect: 'none',
    padding: themeContract.px[4],
    fontSize: themeContract.px[12],
    color: themeContract.colors.neutral8,
    backgroundColor: themeContract.colors.neutral1,
    borderRadius: themeContract.radii.small,
    boxShadow: themeContract.shadows.box,
    animationDuration: '400ms',
    animationTimingFunction: themeContract.motion.authentic,
    willChange: 'transform, opacity',

    selectors: {
      '&[data-state="delayed-open"][data-side="top"]': {
        animationName: slideDownAndFade,
      },
      '&[data-state="delayed-open"][data-side="right"]': {
        animationName: slideLeftAndFade,
      },
      '&[data-state="delayed-open"][data-side="bottom"]': {
        animationName: slideUpAndFade,
      },
      '&[data-state="delayed-open"][data-side="left"]': {
        animationName: slideRightAndFade,
      },
    },
  }),

  arrow: style({
    fill: themeContract.colors.neutral1,
  }),
}
