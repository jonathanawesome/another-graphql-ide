import { themeContract } from '@another-graphql-ide/style'
import { style } from '@vanilla-extract/css'

export const sidebar = style({
  overflowY: 'auto',
})

export const category = style({
  marginBottom: themeContract.px[24],
})

export const categoryTitle = style({
  fontSize: themeContract.px[10],
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
  marginBottom: themeContract.px[8],
})

export const componentTitle = style({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  fontSize: themeContract.px[14],
  fontWeight: 500,
  color: themeContract.colors.neutral7,
  marginBottom: themeContract.px[6],
  paddingLeft: themeContract.px[2],
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  transition: `color 0.2s ${themeContract.motion.authentic}`,

  ':hover': {
    color: themeContract.colors.neutral8,
  },

  selectors: {
    '&[data-expanded="true"]': {
      color: themeContract.colors.neutral8,
      marginBottom: themeContract.px[8],
    },
  },
})

export const section = style({
  marginBottom: themeContract.px[2],
  marginLeft: themeContract.px[4],
})

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: themeContract.px[20],
  fontSize: themeContract.px[14],
  fontWeight: 500,
  color: themeContract.colors.neutral6,

  ':hover': {
    color: themeContract.colors.neutral8,
    backgroundColor: themeContract.colors.neutral3,
  },

  selectors: {
    '&[data-active="true"]': {
      color: themeContract.colors.neutral8,
    },
  },
})

export const sectionList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  marginLeft: themeContract.px[16],
})

export const itemButton = style({
  display: 'flex',
  alignItems: 'center',
  height: themeContract.px[24],
  textAlign: 'left',
  border: 'none',
  backgroundColor: 'transparent',
  color: themeContract.colors.neutral6,
  cursor: 'pointer',
  fontSize: themeContract.px[14],
  transition: `background-color 0.2s ${themeContract.motion.authentic}`,

  ':hover': {
    color: themeContract.colors.neutral8,
  },

  selectors: {
    '&[data-active="true"]': {
      color: themeContract.colors.neutral8,
      fontWeight: 600,
    },
  },
})
