import { themeContract } from '@another-graphql-ide/style'
import { style } from '@vanilla-extract/css'

export const toggle = style({
  position: 'fixed',
  bottom: themeContract.px[24],
  right: themeContract.px[24],
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
  zIndex: 997,
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
})
