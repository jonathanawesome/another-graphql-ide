import { style, themeContract } from '@another-graphql-ide/style'

const bar = {
  display: 'block',
  height: themeContract.px[8],
  borderRadius: themeContract.px[4],
  backgroundColor: themeContract.bg.track,
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
