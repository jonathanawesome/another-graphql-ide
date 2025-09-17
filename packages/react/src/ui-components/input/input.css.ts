import {
  globalStyle,
  recipe,
  style,
  themeContract,
} from '@another-graphql-ide/style'

export const inputStyles = {
  container: recipe(
    {
      base: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: themeContract.px[40],
        width: '100%',
        backgroundColor: themeContract.colors.neutral1,
      },

      variants: {
        withClearValue: {
          false: {},
          true: {
            paddingRight: themeContract.px[24],
          },
        },
        withLeftIcon: {
          false: {},
          true: {
            paddingLeft: themeContract.px[16],
          },
        },
      },
    },
    'input-container'
  ),

  input: style(
    {
      border: '1px solid transparent',
      height: '100%',
      width: '100%',
      paddingLeft: themeContract.px[8],
      backgroundColor: themeContract.colors.neutral1,
      color: themeContract.colors.neutral7,

      selectors: {
        '&::placeholder': {
          color: themeContract.colors.neutral6,
        },
        '&:focus': {
          outline: 'none',
          color: themeContract.colors.neutral8,
        },
        '&:focus&::placeholder': {
          color: themeContract.colors.neutral5,
        },
      },
    },
    'input-element'
  ),

  iconContainer: recipe(
    {
      base: {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },

      variants: {
        location: {
          left: {
            left: themeContract.px[8],
          },
          right: {
            right: themeContract.px[8],
          },
        },
      },
    },
    'input-icon-container'
  ),
}

// below we're styling the left icon when focused within the container
globalStyle(
  `${inputStyles.container()}:focus-within [data-location="left"] svg path`,
  {
    fill: themeContract.colors.neutral8,
  }
)

globalStyle(
  `${inputStyles.container()}:focus-within [data-location="left"] svg`,
  {
    transform: 'scale(1.3)',
  }
)
