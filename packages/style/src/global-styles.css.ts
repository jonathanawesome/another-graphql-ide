import { globalStyle } from '@vanilla-extract/css'
import { themeContract } from './theme-contract.css'

// CSS Reset
globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
})

globalStyle('html', {
  lineHeight: 1.15,
  WebkitTextSizeAdjust: '100%',
})

globalStyle('body', {
  margin: 0,
  fontFamily: themeContract.fonts.sans,
  fontSize: themeContract.px[14],
  color: themeContract.colors.neutral7,
  backgroundColor: themeContract.colors.neutral3,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})

globalStyle('main', {
  display: 'block',
})

globalStyle('h1, h2, h3, h4, h5, h6', {
  fontFamily: themeContract.fonts.sans,
})

// globalStyle('h1', {
//   fontSize: themeContract.fontSizes['4xl'],
// })

// globalStyle('h2', {
//   fontSize: themeContract.fontSizes['3xl'],
// })

// globalStyle('h3', {
//   fontSize: themeContract.fontSizes['2xl'],
// })

// globalStyle('h4', {
//   fontSize: themeContract.fontSizes.xl,
// })

// globalStyle('h5', {
//   fontSize: themeContract.fontSizes.lg,
// })

// globalStyle('h6', {
//   fontSize: themeContract.fontSizes.md,
// })

// globalStyle('p', {
//   marginBottom: themeContract.space[4],
// })

// globalStyle('a', {
//   color: themeContract.colors.primary[11],
//   textDecoration: 'none',
// })

// globalStyle('a:hover', {
//   color: themeContract.colors.primary[12],
//   textDecoration: 'underline',
// })

globalStyle('button', {
  all: 'unset',
})

globalStyle('button::-moz-focus-inner', {
  borderStyle: 'none',
  padding: 0,
})

globalStyle('button:-moz-focusring', {
  outline: '1px dotted ButtonText',
})

globalStyle('input, textarea, select', {
  fontFamily: 'inherit',
  fontSize: '100%',
  lineHeight: 1.15,
  margin: 0,
})

globalStyle(
  'input[type="text"], input[type="email"], input[type="password"], textarea',
  {
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
  }
)

// Focus styles
globalStyle('*:focus-visible', {
  // outline: `2px solid ${themeContract.colors.borderFocus}`,
  outlineOffset: '2px',
})

globalStyle('*:focus:not(:focus-visible)', {
  outline: 'none',
})

// Smooth scrolling
globalStyle('html', {
  scrollBehavior: 'smooth',
})

// // Selection styles
// globalStyle('::selection', {
//   backgroundColor: themeContract.colors.primary[4],
//   color: themeContract.colors.primary[12],
// })

// Code styles
globalStyle('code, kbd, samp, pre', {
  fontFamily: themeContract.fonts.mono,
  fontSize: '1em',
})

globalStyle('pre', {
  overflow: 'auto',
})

// Remove default list styles
globalStyle('ul, ol', {
  listStyle: 'none',
})

// Image styles
globalStyle('img', {
  maxWidth: '100%',
  height: 'auto',
})

// Table styles
globalStyle('table', {
  borderCollapse: 'collapse',
  borderSpacing: 0,
})

// Disabled state
globalStyle('[disabled]', {
  cursor: 'not-allowed',
  opacity: 0.5,
})
