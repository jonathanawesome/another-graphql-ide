import { createTheme } from '@vanilla-extract/css'

import { themeContract } from './theme-contract.css'

// Shared tokens that don't change between themes
const sharedTokens = {
  shadows: {
    box: `0px 0px 0px 1px ${themeContract.colors.neutral4}, 0px 0px 32px 2px ${themeContract.colors.neutral4}`,
  },

  px: {
    1: '0.0625rem',
    2: '0.125rem',
    3: '0.1875rem',
    4: '0.25rem',
    5: '0.3125rem',
    6: '0.375rem',
    7: '0.4375rem',
    8: '0.5rem',
    9: '0.5625rem',
    10: '0.625rem',
    11: '0.6875rem',
    12: '0.75rem',
    13: '0.8125rem',
    14: '0.875rem',
    15: '0.9375rem',
    16: '1rem',
    17: '1.0625rem',
    18: '1.125rem',
    19: '1.1875rem',
    20: '1.25rem',
    24: '1.5rem',
    32: '2rem',
    40: '2.5rem',
    60: '3.75rem',
    64: '4rem',
  },

  radii: {
    small: '0.125rem',
    medium: '0.25rem',
    large: '0.375rem',
  },

  fonts: {
    sans: '"InstrumentSans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "JetBrains Mono", Consolas, monospace',
  },

  motion: {
    authentic: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// Light theme
export const lightTheme = createTheme(themeContract, {
  colors: {
    neutral1: 'color(display-p3 0.9803 0.9803 0.9803)',
    neutral2: 'color(display-p3 0.9606 0.9606 0.9606)',
    neutral3: 'color(display-p3 0.9306 0.9306 0.9306)',
    neutral4: 'color(display-p3 0.8904 0.8904 0.8904)',
    neutral5: 'color(display-p3 0.8251 0.8251 0.8251)',
    neutral6: 'color(display-p3 0.4198 0.4198 0.4198)',
    neutral7: 'color(display-p3 0.2199 0.2199 0.2199)',
    neutral8: 'color(display-p3 0.0202 0.0202 0.0202)',

    textLight: 'color(display-p3 0.4198 0.4198 0.4198)', // neutral6
    textRegular: 'color(display-p3 0.2199 0.2199 0.2199)', // neutral7
    textStrong: 'color(display-p3 0.0202 0.0202 0.0202)', // neutral8

    brand: 'color(display-p3 0.8823 0.0003 0.5961)',
  },

  // Use shared tokens
  ...sharedTokens,
})

// Dark theme
export const darkTheme = createTheme(themeContract, {
  colors: {
    neutral1: 'color(display-p3 0.0402 0.0402 0.0402)',
    neutral2: 'color(display-p3 0.0636 0.0636 0.0636)',
    neutral3: 'color(display-p3 0.08 0.08 0.08)',
    neutral4: 'color(display-p3 0.1103 0.1103 0.1103)',
    neutral5: 'color(display-p3 0.1802 0.1802 0.1802)',
    neutral6: 'color(display-p3 0.5313 0.5313 0.5313)',
    neutral7: 'color(display-p3 0.8751 0.8677 0.8677)',
    neutral8: 'color(display-p3 0.9698 0.9698 0.9698)',

    textLight: 'color(display-p3 0.5313 0.5313 0.5313)', // neutral6
    textRegular: 'color(display-p3 0.8751 0.8677 0.8677)', // neutral7
    textStrong: 'color(display-p3 0.9698 0.9698 0.9698)', // neutral8

    brand: 'color(display-p3 0.8823 0.0003 0.5961)',
  },

  // Use shared tokens
  ...sharedTokens,
})
