import { themeContract, style, recipe } from '@another-graphql-ide/style'

export const previewsStyles = {
  demoGrid: recipe({
    base: {
      display: 'grid',
      gap: themeContract.px[12],
      maxWidth: '80%',
      width: '100%',
    },
    variants: {
      gap: {
        12: {
          gap: themeContract.px[12],
        },
        20: {
          gap: themeContract.px[20],
        },
        64: {
          gap: themeContract.px[64],
        },
      },
    },
  }),

  demoGridItem: style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }),
}
