import { style, themeContract } from '@another-graphql-ide/style'

export const findBarStyles = {
  bar: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[4],
    height: '44px',
    paddingInlineStart: themeContract.px[8],
    fontFamily: themeContract.fonts.sans,
    color: themeContract.colors.neutral7,
  }),

  field: style({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    height: themeContract.px[32],
    paddingInline: themeContract.px[8],
    borderRadius: themeContract.radii.medium,
    backgroundColor: themeContract.colors.neutral1,
    border: '1px solid transparent',
    selectors: {
      '&:focus-within': { borderColor: themeContract.colors.neutral5 },
    },
  }),

  input: style({
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: themeContract.colors.neutral8,
    fontSize: themeContract.px[13],
    selectors: {
      '&::placeholder': { color: themeContract.colors.neutral6 },
    },
  }),

  count: style({
    flexShrink: 0,
    fontFamily: themeContract.fonts.mono,
    fontSize: themeContract.px[12],
    color: themeContract.colors.neutral6,
  }),

  heading: style({
    flexShrink: 0,
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: themeContract.px[8],
    paddingInlineEnd: themeContract.px[16],
    fontSize: themeContract.px[11],
    fontWeight: 600,
    letterSpacing: themeContract.px[1],
    textTransform: 'uppercase',
    color: themeContract.colors.neutral6,
  }),

  divider: style({
    marginInlineEnd: 'auto',
    width: '1px',
    height: themeContract.px[16],
    backgroundColor: themeContract.colors.neutral4,
  }),
}
