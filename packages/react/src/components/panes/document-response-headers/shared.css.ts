import { style, textStyles, themeContract } from '@another-graphql-ide/style'

export const sharedStyles = {
  container: style(
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: themeContract.px[40],
      backgroundColor: themeContract.bg.surface,
      borderBottom: `1px solid ${themeContract.border.subtle}`,
      paddingLeft: themeContract.px[12],
    },
    'document-response-headers-container'
  ),

  left: style(
    {
      paddingRight: themeContract.px[6],
    },
    'document-response-headers-left'
  ),

  title: style({
    ...textStyles.overline,
    color: themeContract.text.tertiary,
  }),

  right: style(
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeContract.px[8],
      height: themeContract.px[24],

      paddingRight: themeContract.px[8],
    },
    'document-response-headers-right'
  ),

  separatorContainer: style({
    height: 'calc(100% - 4px)',
  }),
}
