import { style, themeContract } from '@another-graphql-ide/style'

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeContract.px[12],
  padding: themeContract.px[16],
  color: themeContract.colors.neutral7,
  fontFamily: themeContract.fonts.sans,
  fontSize: themeContract.px[12],
})

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: themeContract.px[8],
})

export const intro = style({
  maxWidth: '54ch',
  lineHeight: 1.5,
  color: themeContract.colors.neutral6,
})

export const progressTrack = style({
  height: themeContract.px[4],
  width: '100%',
  backgroundColor: themeContract.colors.neutral3,
  borderRadius: themeContract.radii.small,
  overflow: 'hidden',
})

export const progressFill = style({
  height: '100%',
  backgroundColor: themeContract.colors.brand,
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
  color: themeContract.colors.neutral6,
  borderBottom: `1px solid ${themeContract.colors.neutral4}`,
  whiteSpace: 'nowrap',
})

export const td = style({
  padding: `${themeContract.px[3]} ${themeContract.px[8]}`,
  borderBottom: `1px solid ${themeContract.colors.neutral3}`,
  whiteSpace: 'nowrap',
})

export const num = style({
  fontFamily: themeContract.fonts.mono,
  textAlign: 'right',
})

export const groupCell = style({
  fontWeight: 600,
  color: themeContract.colors.neutral7,
})

export const variantCell = style({
  color: themeContract.colors.neutral6,
})

export const budget = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: themeContract.px[4],
  textTransform: 'uppercase',
  fontSize: themeContract.px[10],
  letterSpacing: themeContract.px[1],
  color: themeContract.colors.neutral6,
})

const dotBase = style({
  width: themeContract.px[8],
  height: themeContract.px[8],
  borderRadius: '50%',
  flexShrink: 0,
})

// The design system exposes only neutral + brand tokens, so budget signal colors
// are literal values chosen to read on both light and dark themes.
export const dotOk = style([dotBase, { backgroundColor: '#3fb950' }])
export const dotJank = style([dotBase, { backgroundColor: '#d29922' }])
export const dotBlock = style([dotBase, { backgroundColor: '#f85149' }])
export const dotOnce = style([
  dotBase,
  { backgroundColor: themeContract.colors.neutral5 },
])
