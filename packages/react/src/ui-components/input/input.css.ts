import { style, themeContract } from '@another-graphql-ide/style'

export const inputStyles = {
  container: style({
    display: 'flex',
    alignItems: 'center',
    height: themeContract.px[40],
    paddingLeft: themeContract.px[12],
    paddingRight: themeContract.px[12],
    color: themeContract.colors.textStrong,
    backgroundColor: themeContract.colors.neutral1,
    fontSize: themeContract.px[14],
  }),

  input: style({
    all: 'unset',
    boxSizing: 'border-box',
    width: '100%',
    lineHeight: 1,
    color: themeContract.colors.neutral8,

    selectors: {
      '&::placeholder': {
        color: themeContract.colors.neutral6,
      },
      '&:focus&::placeholder': {
        color: themeContract.colors.neutral5,
      },
    },
  }),
}
