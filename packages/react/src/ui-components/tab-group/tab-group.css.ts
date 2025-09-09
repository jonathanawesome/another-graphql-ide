import { style, themeContract } from '@another-graphql-ide/style'

export const tabGroupClass = style({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  gap: themeContract.px[8],
  paddingLeft: themeContract.px[8],
})
