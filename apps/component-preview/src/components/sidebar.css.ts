import { themeContract } from '@another-graphql-ide/style'
import { style } from '@vanilla-extract/css'

export const sidebar = style({
  overflowY: 'auto',
})

export const category = style({
  marginBottom: '16px',
})

export const categoryTitle = style({
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: themeContract.colors.neutral7,
  marginBottom: '8px',
  letterSpacing: '0.5px',
})

export const componentList = style({
  listStyle: 'none',
})

export const componentItem = style({
  marginBottom: '12px',
})

export const componentTitle = style({
  fontSize: '14px',
  fontWeight: 600,
  color: themeContract.colors.neutral8,
  marginBottom: '8px',
  paddingLeft: '4px',
})

export const section = style({
  marginBottom: '4px',
})

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginLeft: '8px',
  marginBottom: '4px',
})

export const sectionList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  marginLeft: themeContract.px[32],
})

export const sectionItem = style({
  marginBottom: '2px',
})

export const itemButton = style({
  display: 'block',
  flex: 1,
  padding: '4px 8px',
  textAlign: 'left',
  border: 'none',
  backgroundColor: 'transparent',
  color: themeContract.colors.neutral7,
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '13px',
  transition: 'background-color 0.2s',

  ':hover': {
    color: themeContract.colors.neutral8,
  },

  selectors: {
    '&[data-active="true"]': {
      color: themeContract.colors.neutral8,
      fontWeight: 600,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
  },
})

export const treeItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

export const chevronButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  padding: 0,
  border: 'none',
  backgroundColor: 'transparent',
  color: themeContract.colors.neutral7,
  cursor: 'pointer',
  borderRadius: '2px',
  transition: 'all 0.2s',

  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: themeContract.colors.neutral8,
  },

  ':focus': {
    outline: '1px solid #3b82f6',
    outlineOffset: '1px',
  },
})

export const spacer = style({
  width: '16px',
  height: '16px',
})

export const componentButton = style({
  display: 'block',
  flex: 1,
  padding: '4px 8px',
  textAlign: 'left',
  border: 'none',
  backgroundColor: 'transparent',
  color: themeContract.colors.neutral7,
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'background-color 0.2s',

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

export const variantList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
})

export const variantItem = style({
  marginLeft: '20px',
})

export const variantButton = style({
  display: 'block',
  flex: 1,
  padding: '4px 8px',
  textAlign: 'left',
  border: 'none',
  backgroundColor: 'transparent',
  color: themeContract.colors.neutral7,
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '13px',
  transition: 'background-color 0.2s',

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
