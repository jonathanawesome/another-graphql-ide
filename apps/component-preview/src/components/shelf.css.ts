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
  top: '16px',
  right: '16px',
  background: 'transparent',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '8px',
  color: '#666',
  borderRadius: '4px',
})

export const content = style({
  flex: 1,
  overflow: 'auto',
  padding: '24px',
  paddingTop: '64px', // Account for close button
})
