import { style, themeContract } from '@another-graphql-ide/style'

export const editorGroupTabsStyles = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: themeContract.bg.surface,
  borderBottom: `1px solid ${themeContract.border.subtle}`,

  paddingRight: themeContract.px[12],
  paddingLeft: themeContract.px[8],
})
