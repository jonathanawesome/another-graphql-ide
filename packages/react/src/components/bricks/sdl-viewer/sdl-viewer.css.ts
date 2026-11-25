import { style, textStyles, themeContract } from '@another-graphql-ide/style'

export const sdlViewerStyles = {
  footer: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: themeContract.px[16],
    minHeight: themeContract.px[40],
    paddingInline: themeContract.px[14],
    borderTop: `1px solid ${themeContract.border.subtle}`,
    ...textStyles.bodyDense,
    color: themeContract.text.tertiary,
  }),

  status: style({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}
