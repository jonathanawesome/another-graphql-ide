import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const kbdStyles = {
  root: style(
    {
      display: 'inline-flex',
      alignItems: 'center',
      gap: themeContract.px[2],
    },
    'kbd-root'
  ),

  key: recipe(
    {
      base: {
        display: 'grid',
        placeItems: 'center',
        minWidth: themeContract.px[16],
        height: themeContract.px[16],
        paddingLeft: themeContract.px[4],
        paddingRight: themeContract.px[4],
        borderRadius: themeContract.radii.small,
        // The global reset already gives kbd the mono family; size and leading
        // are set here so a chip keeps its box whatever text sits beside it.
        fontSize: themeContract.px[11],
        lineHeight: 1,
      },

      variants: {
        tone: {
          default: {
            color: themeContract.colors.neutral7,
            backgroundColor: themeContract.colors.neutral3,
            border: `1px solid ${themeContract.colors.neutral5}`,
          },
          // For the tooltip popup, which is neutral1 on neutral8. A default
          // chip would disappear into it.
          inverted: {
            color: themeContract.colors.neutral1,
            backgroundColor: 'transparent',
            border: `1px solid ${themeContract.colors.neutral6}`,
          },
        },
      },
    },
    'kbd-key'
  ),

  // Standard visually-hidden block. Worth hoisting into the style package the
  // moment anything else needs it.
  spoken: style(
    {
      position: 'absolute',
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap',
      border: 0,
    },
    'kbd-spoken'
  ),
}
