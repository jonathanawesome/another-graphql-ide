import { themeContract } from '@another-graphql-ide/style'
import { style } from '@vanilla-extract/css'

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'transparent',
  zIndex: 998,
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
  zIndex: 999,
  transform: 'translateX(100%)',
  transition: `transform 0.3s ${themeContract.motion.authentic}`,
  display: 'flex',
  flexDirection: 'column',

  selectors: {
    '&[data-open="true"]': {
      transform: 'translateX(0)',
    },
  },
})

export const closeButton = style({
  position: 'absolute',
  top: themeContract.px[16],
  right: themeContract.px[16],
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: themeContract.px[8],
  borderRadius: themeContract.px[4],
})

export const content = style({
  flex: 1,
  overflow: 'auto',
  padding: themeContract.px[20],
  paddingTop: themeContract.px[64], // Account for close button
})
