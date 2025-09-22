import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const tabsStyles = {
  root: style(
    {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'auto',
    },
    'root'
  ),
  list: style(
    {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      gap: themeContract.px[8],
      paddingLeft: themeContract.px[8],
      paddingRight: themeContract.px[8],

      borderBottom: `1px solid ${themeContract.colors.neutral4}`,
    },
    'list'
  ),
  content: style(
    {
      overflow: 'auto',
    },
    'content'
  ),
  trigger: recipe(
    {
      base: {
        width: '100%',
        height: themeContract.px[40],
        display: 'flex',
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: themeContract.px[2],
        paddingLeft: themeContract.px[8],
        paddingRight: themeContract.px[8],
        fontSize: themeContract.px[13],
        border: '1px solid transparent',

        position: 'relative',

        ':focus': {
          border: `1px dashed ${themeContract.colors.neutral5}`,
        },

        selectors: {
          '&[data-state="inactive"]': {
            color: themeContract.colors.neutral6,
          },
          '&[data-state="inactive"]:hover': {
            color: themeContract.colors.neutral8,
          },
          '&[data-state="active"]': {
            color: themeContract.colors.neutral8,
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
            paddingRight: 28,
          },
        },
      },
    },
    'trigger'
  ),

  triggerContainer: style(
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeContract.px[2],
      position: 'relative',
    },
    'trigger-container'
  ),

  triggerAction: style(
    {
      position: 'absolute',
      right: 0,
    },
    'trigger-action'
  ),
}
