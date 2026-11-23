import { recipe, style, themeContract } from '@another-graphql-ide/style'

export const sdlViewerStyles = {
  root: recipe(
    {
      base: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minWidth: 0,
        backgroundColor: themeContract.colors.neutral2,
      },
      variants: {
        frame: {
          none: {},
          bordered: {
            border: `1px solid ${themeContract.colors.neutral4}`,
            borderRadius: themeContract.radii.small,
            overflow: 'hidden',
          },
        },
      },
      defaultVariants: { frame: 'none' },
    },
    'sdl-viewer'
  ),

  body: style({
    position: 'relative',
    flex: 1,
    minHeight: 0,
  }),

  // Contains CodeMirror's z-indexed panels, so the overlays can cover them.
  editor: style({
    height: '100%',
    isolation: 'isolate',
  }),

  // Loading and empty states sit over the editor, which stays mounted.
  overlay: style({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: themeContract.colors.neutral2,
  }),

  empty: style({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeContract.px[24],
    fontFamily: themeContract.fonts.sans,
    fontSize: themeContract.px[13],
    color: themeContract.colors.neutral6,
    textAlign: 'center',
  }),

  footer: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: themeContract.px[16],
    minHeight: themeContract.px[40],
    paddingInline: themeContract.px[16],
    borderTop: `1px solid ${themeContract.colors.neutral4}`,
    fontFamily: themeContract.fonts.sans,
    fontSize: themeContract.px[12],
    color: themeContract.colors.neutral6,
  }),

  status: style({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}

const bar = {
  display: 'block',
  height: themeContract.px[8],
  borderRadius: themeContract.px[4],
  backgroundColor: themeContract.colors.neutral3,
} as const

export const skeletonStyles = {
  lines: style({
    flex: 1,
    overflow: 'hidden',
    paddingBlockStart: themeContract.px[4],
  }),

  row: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[12],
    height: '26px',
    paddingInline: themeContract.px[16],
  }),

  number: style({ ...bar, width: themeContract.px[16], flexShrink: 0 }),

  code: style({ ...bar, flexShrink: 1 }),

  annotation: style({
    display: 'flex',
    alignItems: 'center',
    gap: themeContract.px[12],
    marginInlineStart: 'auto',
    flexShrink: 0,
  }),

  track: style({ ...bar, height: themeContract.px[4], width: '90px' }),

  value: style({ ...bar, width: themeContract.px[32] }),
}
