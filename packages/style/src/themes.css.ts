import { createTheme } from '@vanilla-extract/css'

import { alpha } from './alpha'
import { colors } from './theme-colors'
import { colorValuesContract, themeContract } from './theme-contract.css'

// Shared tokens that don't change between themes
const sharedTokens = {
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
  colors: colors.dark.oklch,

  ...sharedTokens,

  shadows: {
    box: `${alpha.neutral5(0.35)} 0px 10px 38px -10px, ${alpha.neutral5(0.2)} 0px 10px 20px -15px`,
  },
})

export const darkColorValues = createTheme(colorValuesContract, colors.dark.raw)

export const lightTheme = createTheme(themeContract, {
  colors: colors.light.oklch,

  ...sharedTokens,

  shadows: {
    box: `${alpha.neutral7(0.35)} 0px 10px 38px -10px, ${alpha.neutral7(0.2)} 0px 10px 20px -15px`,
  },
})

export const lightColorValues = createTheme(
  colorValuesContract,
  colors.light.raw
)
