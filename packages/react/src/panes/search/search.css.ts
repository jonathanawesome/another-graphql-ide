import {
  globalStyle,
  recipe,
  style,
  themeContract,
} from '@another-graphql-ide/style'

export const searchStyles = {
  container: style(
    {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: themeContract.px[8],
      height: themeContract.px[40],
      width: '100%',
      backgroundColor: themeContract.colors.neutral1,
    },
    'search-container'
  ),

  input: style(
    {
      border: '1px solid transparent',
      borderTopLeftRadius: themeContract.radii.medium,
      height: '100%',
      width: '100%',
      paddingLeft: 20,
      paddingRight: themeContract.px[32],
      backgroundColor: themeContract.colors.neutral1,
      color: themeContract.colors.textRegular,

      '::placeholder': {
        color: themeContract.colors.textLight,
      },

      ':focus': {
        outline: 'none',
        color: themeContract.colors.textStrong,
      },
    },
    'search-input'
  ),

  iconContainer: recipe(
    {
      base: {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
      },

      variants: {
        location: {
          left: {
            left: 12,
          },
          right: {
            right: 8,
          },
        },
      },
    },
    'search-icon-container'
  ),
}

// below we're styling the search icon when focused within the container
globalStyle(
  `${searchStyles.container}:focus-within [data-location="left"] svg path`,
  {
    fill: themeContract.colors.textStrong,
  }
)

globalStyle(
  `${searchStyles.container}:focus-within [data-location="left"] svg`,
  {
    transform: 'scale(1.3)',
  }
)
