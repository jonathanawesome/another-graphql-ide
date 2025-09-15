import { themeContract } from '@another-graphql-ide/style'
import { style } from '@vanilla-extract/css'

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'transparent',
  zIndex: 8,
})

export const shelf = style({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '320px',
  maxWidth: '90vw',
  background: themeContract.colors.neutral1,

  borderLeft: `1px solid ${themeContract.colors.neutral4}`,
  zIndex: 9,
  transform: 'translateX(100%)',
  transition: `transform 0.3s ${themeContract.motion.authentic}`,
  display: 'flex',
  flexDirection: 'column',

  selectors: {
    '&[data-open="true"]': {
      transform: 'translateX(0)',
    },
    '&[data-pinned="true"]': {
      transform: 'translateX(0)',
      transition: 'none',
      borderLeft: `1px solid ${themeContract.colors.neutral4}`,
    },
  },
})

export const closeButton = style({
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: themeContract.px[8],
  borderRadius: themeContract.px[4],
  color: themeContract.colors.neutral8,
  selectors: {
    '&:hover': {
      background: themeContract.colors.neutral3,
    },
  },
})

export const content = style({
  flex: 1,
  overflow: 'auto',
  padding: themeContract.px[20],
})
