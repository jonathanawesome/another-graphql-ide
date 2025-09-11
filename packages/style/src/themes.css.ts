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

export const darkTheme = createTheme(themeContract, {
  colors: {
    neutral1: 'oklch(14.6% 0 0)',
    neutral2: 'oklch(17.4% 0 0)',
    neutral3: 'oklch(21.6% 0 0)',
    neutral4: 'oklch(23.8% 0 0)',
    neutral5: 'oklch(30.1% 0 0)',
    neutral6: 'oklch(62.5% 0 0)',
    neutral7: 'oklch(90% 0.002575 15.9)',
    neutral8: 'oklch(97.7% 0 0)',

    textLight: 'oklch(62.5% 0 0)', // neutral6
    textRegular: 'oklch(90% 0.002575 15.9)', // neutral7
    textStrong: 'oklch(97.7% 0 0)', // neutral8

    brand: 'oklch(62.1% 0.289482 350.9)',
  },

  // Use shared tokens
  ...sharedTokens,
})

export const lightTheme = createTheme(themeContract, {
  colors: {
    neutral1: 'oklch(98.5% 0 0)',
    neutral2: 'oklch(97% 0 0)',
    neutral3: 'oklch(94.7% 0 0)',
    neutral4: 'oklch(91.6% 0 0)',
    neutral5: 'oklch(86.5% 0 0)',
    neutral6: 'oklch(52.8% 0 0)',
    neutral7: 'oklch(34.1% 0 0)',
    neutral8: 'oklch(11.6% 0 0)',

    textLight: 'oklch(52.8% 0 0)', // neutral6
    textRegular: 'oklch(34.1% 0 0)', // neutral7
    textStrong: 'oklch(11.6% 0 0)', // neutral8

    brand: 'oklch(62.1% 0.289482 350.9)',
  },

  // Use shared tokens
  ...sharedTokens,
})
