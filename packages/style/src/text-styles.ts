import { themeContract } from './theme-contract.css'

const { sans, mono } = themeContract.fonts

const rem = (px: number) => `${px / 16}rem`

const textStyle = (
  fontFamily: string,
  size: number,
  lineHeight: number,
  fontWeight: number
) => ({
  fontFamily,
  fontSize: rem(size),
  lineHeight: rem(lineHeight),
  fontWeight,
})

// Console 2026 text styles, to spread into a style
export const textStyles = {
  display: { ...textStyle(sans, 30, 36, 600), letterSpacing: '-0.02em' },
  title: { ...textStyle(sans, 20, 28, 600), letterSpacing: '-0.01em' },
  heading: textStyle(sans, 15, 22, 600),
  metric: {
    ...textStyle(sans, 26, 32, 600),
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
  },
  body: textStyle(sans, 14, 20, 400),
  bodyDense: textStyle(sans, 13, 18, 400),
  label: textStyle(sans, 12, 16, 500),
  overline: {
    ...textStyle(sans, 11, 16, 500),
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  code: textStyle(mono, 13, 20, 400),
  codeSmall: textStyle(mono, 12, 16, 400),
} as const
