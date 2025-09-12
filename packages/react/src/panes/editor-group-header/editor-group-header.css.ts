import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const editorGroupHeaderStyles = {
  container: recipe(
    {
      base: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: themeContract.px[40],
        backgroundColor: themeContract.colors.neutral2,
        paddingLeft: themeContract.px[12],
      },
      variants: {
        variant: {
          document: {},
          response: {},
        },
      },
    },
    'editor-group-header-container'
  ),

  left: style(
    {
      paddingRight: themeContract.px[6],
    },
    'editor-group-header-left'
  ),

  title: style({
    fontWeight: 500,
    fontSize: themeContract.px[9],
    letterSpacing: themeContract.px[1],
    paddingTop: themeContract.px[1],
    textTransform: 'uppercase',
  }),

  right: style(
    {
      paddingRight: themeContract.px[8],
    },
    'editor-group-header-right'
  ),
}
