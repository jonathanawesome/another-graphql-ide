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
    paddingTop: themeContract.px[6],
    paddingBottom: themeContract.px[6],
    paddingLeft: themeContract.px[8],
    paddingRight: themeContract.px[8],
    fontSize: themeContract.px[12],
    color: themeContract.colors.neutral1,
    backgroundColor: themeContract.colors.neutral8,
    borderRadius: themeContract.radii.medium,
    boxShadow: themeContract.shadows.tight,
    animationDuration: '400ms',
    animationTimingFunction: themeContract.motion.authentic,
    willChange: 'transform, opacity',

    selectors: {
      '&[data-open][data-side="top"]': {
        animationName: slideDownAndFade,
      },
      '&[data-open][data-side="right"]': {
        animationName: slideLeftAndFade,
      },
      '&[data-open][data-side="bottom"]': {
        animationName: slideUpAndFade,
      },
      '&[data-open][data-side="left"]': {
        animationName: slideRightAndFade,
      },
    },
  }),

  arrow: style({
    fill: themeContract.colors.neutral8,
  }),
}
