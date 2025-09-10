import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const tabsStyles = {
  root: style({}),
  list: style({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: themeContract.px[8],
    paddingLeft: themeContract.px[8],
  }),
  content: style({}),
  trigger: recipe({
    base: {
      width: ' 100%',
      height: themeContract.px[40],
      fontSize: themeContract.px[14],
      display: 'flex',
      flex: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeContract.px[2],
      position: 'relative',
      paddingLeft: themeContract.px[8],
      paddingRight: themeContract.px[8],

      selectors: {
        '&[data-state="inactive"]': {
          color: themeContract.colors.textLight,
        },
        '&[data-state="inactive"]:hover': {
          color: themeContract.colors.textStrong,
        },
        '&[data-state="active"]': {
          color: themeContract.colors.textStrong,
        },
        '&[data-state="active"]::after': {
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

    variants: {
      withActionIcon: {
        false: {},
        true: {
          paddingRight: 24,
        },
      },
    },
  }),

  triggerContainer: recipe({
    base: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeContract.px[2],
      position: 'relative',
    },

    variants: {
      withActionIcon: {
        false: {},
        true: {
          // paddingRight: 24,
        },
      },
    },
  }),

  triggerAction: style({
    position: 'absolute',
    right: 0,
  }),
}
