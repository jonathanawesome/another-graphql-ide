import { style, themeContract } from '@another-graphql-ide/style'

export const pillClass = style({
  display: 'flex',
  alignItems: 'center',
  height: themeContract.px[16],
  paddingLeft: themeContract.px[4],
  paddingRight: themeContract.px[4],
  color: themeContract.colors.textStrong,
  backgroundColor: themeContract.colors.neutral3,
  border: `1px solid ${themeContract.colors.neutral5}`,
  borderRadius: themeContract.radii.small,
  fontSize: themeContract.px[9],
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: themeContract.px[1],
})
