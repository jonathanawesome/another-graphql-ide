import { themeContract, style } from '@another-graphql-ide/style'

export const previewsStyles = {
  demoGrid: style({
    display: 'grid',
    gap: themeContract.px[12],
  }),
  demoGridItem: style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeContract.px[12],
  }),
}
