import { style, themeContract } from '@another-graphql-ide/style'

export const editorTabGroupStyles = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: themeContract.colors.neutral1,
  paddingRight: themeContract.px[12],
  paddingLeft: themeContract.px[8],
})
