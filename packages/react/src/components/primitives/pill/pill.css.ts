import { style, themeContract } from '@another-graphql-ide/style'

export const pillClass = style({
  display: 'flex',
  alignItems: 'center',
  gap: themeContract.px[4],
  height: '22px',
  paddingInline: themeContract.px[8],
  color: themeContract.text.secondary,
  backgroundColor: themeContract.fill.neutral,
  borderRadius: themeContract.radii.sm,
  fontFamily: themeContract.fonts.sans,
  fontSize: themeContract.px[12],
  lineHeight: themeContract.px[16],
  whiteSpace: 'nowrap',
})
