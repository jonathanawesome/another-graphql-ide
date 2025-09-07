import { createTheme } from '@vanilla-extract/css'

import { themeContract } from './theme-contract.css'

// Shared tokens that don't change between themes
const sharedTokens = {
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
    neutral5: 'color(display-p3 0.1362 0.1362 0.1362)',
    neutral6: 'color(display-p3 0.5313 0.5313 0.5313)',
    neutral7: 'color(display-p3 0.8751 0.8677 0.8677)',
    neutral8: 'color(display-p3 0.9698 0.9698 0.9698)',
  },

  // Use shared tokens
  ...sharedTokens,
})
