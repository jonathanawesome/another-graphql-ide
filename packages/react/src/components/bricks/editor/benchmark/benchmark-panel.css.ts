import { style, textStyles, themeContract } from '@another-graphql-ide/style'

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeContract.px[12],
  padding: themeContract.px[16],
  color: themeContract.text.secondary,
  ...textStyles.label,
  fontWeight: 400,
})

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: themeContract.px[8],
})

export const intro = style({
  maxWidth: '54ch',
  lineHeight: 1.5,
  color: themeContract.text.tertiary,
})

export const progressTrack = style({
  height: themeContract.px[4],
  width: '100%',
  backgroundColor: themeContract.bg.track,
  borderRadius: themeContract.radii.full,
  overflow: 'hidden',
})

export const progressFill = style({
  height: '100%',
  backgroundColor: themeContract.accent.line,
  transition: `width .15s ${themeContract.motion.authentic}`,
})

export const tableWrap = style({
  overflowX: 'auto',
})

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontVariantNumeric: 'tabular-nums',
})

export const th = style({
  padding: `${themeContract.px[4]} ${themeContract.px[8]}`,
  textAlign: 'left',
  fontWeight: 600,
  color: themeContract.text.tertiary,
  borderBottom: `1px solid ${themeContract.border.default}`,
  whiteSpace: 'nowrap',
})

export const td = style({
  padding: `${themeContract.px[3]} ${themeContract.px[8]}`,
  borderBottom: `1px solid ${themeContract.border.subtle}`,
  whiteSpace: 'nowrap',
})

export const num = style({
  fontFamily: themeContract.fonts.mono,
  textAlign: 'right',
})

export const groupCell = style({
  fontWeight: 600,
  color: themeContract.text.secondary,
})

export const variantCell = style({
  color: themeContract.text.tertiary,
})

export const budget = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: themeContract.px[4],
  textTransform: 'uppercase',
  fontSize: themeContract.px[10],
  letterSpacing: themeContract.px[1],
  color: themeContract.text.tertiary,
})

const dotBase = style({
  width: themeContract.px[8],
  height: themeContract.px[8],
  borderRadius: '50%',
  flexShrink: 0,
})

export const dotOk = style([
  dotBase,
  { backgroundColor: themeContract.status.success },
])
export const dotJank = style([
  dotBase,
  { backgroundColor: themeContract.status.warning },
])
export const dotBlock = style([
  dotBase,
  { backgroundColor: themeContract.status.danger },
])
export const dotOnce = style([
  dotBase,
  { backgroundColor: themeContract.border.strong },
])
