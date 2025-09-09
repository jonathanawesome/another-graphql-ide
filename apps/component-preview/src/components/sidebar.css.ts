import { themeContract } from '@another-graphql-ide/style'
import { style } from '@vanilla-extract/css'

export const sidebar = style({
  overflowY: 'auto',
})

export const category = style({
  marginBottom: themeContract.px[16],
})

export const categoryTitle = style({
  fontSize: themeContract.px[11],
  fontWeight: 600,
  textTransform: 'uppercase',
  color: themeContract.colors.neutral6,
  marginBottom: themeContract.px[12],
  letterSpacing: themeContract.px[1],
})

export const componentList = style({
  listStyle: 'none',
})

export const componentItem = style({
  marginBottom: themeContract.px[12],
})

export const componentTitle = style({
  fontSize: themeContract.px[14],
  fontWeight: 600,
  color: themeContract.colors.neutral7,
  marginBottom: themeContract.px[4],
  paddingLeft: themeContract.px[2],
})

export const section = style({
  marginBottom: themeContract.px[2],
})

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
})

export const sectionList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  marginLeft: themeContract.px[24],
})

export const itemButton = style({
  display: 'block',
  flex: 1,
  padding: `${themeContract.px[4]} ${themeContract.px[8]}`,
  textAlign: 'left',
  border: 'none',
  backgroundColor: 'transparent',
  color: themeContract.colors.neutral7,
  cursor: 'pointer',
  fontSize: themeContract.px[14],
  transition: `background-color 0.2s ${themeContract.motion.authentic}`,
  textDecoration: 'none',

  ':hover': {
    color: themeContract.colors.neutral8,
    textDecoration: 'none',
  },

  selectors: {
    '&[data-active="true"]': {
      color: themeContract.colors.neutral8,
      fontWeight: 600,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
  },
})
