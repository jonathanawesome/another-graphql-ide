import { style, textStyles, themeContract } from '@another-graphql-ide/style'

export const findBarStyles = {
  bar: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    height: '44px',
    paddingInline: themeContract.px[6],
    fontFamily: themeContract.fonts.sans,
    color: themeContract.text.secondary,
  }),

  field: style({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
    height: themeContract.px[32],
    paddingInline: themeContract.px[10],
    borderRadius: themeContract.radii.md,
    backgroundColor: themeContract.bg.inset,
    border: '1px solid transparent',
    selectors: {
      '&:focus-within': { borderColor: themeContract.border.control },
    },
  }),

  input: style({
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    ...textStyles.body,
    color: themeContract.text.primary,
    caretColor: themeContract.text.primary,
    selectors: {
      '&::placeholder': { color: themeContract.text.tertiary },
    },
  }),

  count: style({
    flexShrink: 0,
    ...textStyles.codeSmall,
    color: themeContract.text.tertiary,
  }),

  heading: style({
    flexShrink: 0,
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: themeContract.px[8],
    // Over the annotation column, so out to the bar's edge.
    marginInlineEnd: `calc(-1 * ${themeContract.px[6]})`,
    paddingInlineEnd: themeContract.px[14],
    ...textStyles.overline,
    color: themeContract.text.tertiary,
  }),

  label: style({ marginInlineStart: 'auto' }),

  divider: style({
    width: '1px',
    height: themeContract.px[16],
    backgroundColor: themeContract.border.default,
  }),
}
