import { style, themeContract } from '@another-graphql-ide/style'

export const runControlStyles = {
  container: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[8],
  }),

  // Truncated rather than wrapped: this sits in a single-row toolbar, and the
  // full text stays available to screen readers and the title attribute.
  error: style({
    maxWidth: themeContract.px[60],
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: themeContract.colors.brand,
    fontSize: themeContract.px[10],
  }),
}
