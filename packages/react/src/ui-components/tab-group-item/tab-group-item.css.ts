import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const tabGroupItemStyles = {
  container: recipe({
    base: {
      width: ' 100%',
      height: themeContract.px[40],
      fontSize: themeContract.px[14],
      display: 'flex',
      flex: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeContract.px[4],
      position: 'relative',
      paddingLeft: themeContract.px[8],
      paddingRight: themeContract.px[8],
    },

    variants: {
      active: {
        false: {
          color: themeContract.colors.textLight,

          selectors: {
            '&:hover': {
              color: themeContract.colors.textStrong,
            },
          },
        },
        true: {
          color: themeContract.colors.textStrong,

          '::after': {
            content: '',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: themeContract.px[2],
            backgroundColor: themeContract.colors.brand,
          },
        },
      },
      withActionIcon: {
        false: {},
        true: {
          paddingRight: 0,
        },
      },
    },
  }),

  button: style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeContract.px[2],
  }),
}
