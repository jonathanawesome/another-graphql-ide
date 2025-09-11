const baseColorDefinitions = {
  dark: {
    neutral1: '14.6% 0 0',
    neutral2: '17.4% 0 0',
    neutral3: '21.6% 0 0',
    neutral4: '23.8% 0 0',
    neutral5: '30.1% 0 0',
    neutral6: '62.5% 0 0',
    neutral7: '90% 0.002575 15.9',
    neutral8: '97.7% 0 0',
    brand: '62.1% 0.289482 350.9',
  },
  light: {
    neutral1: '98.5% 0 0',
    neutral2: '97% 0 0',
    neutral3: '94.7% 0 0',
    neutral4: '91.6% 0 0',
    neutral5: '86.5% 0 0',
    neutral6: '52.8% 0 0',
    neutral7: '34.1% 0 0',
    neutral8: '11.6% 0 0',
    brand: '62.1% 0.289482 350.9',
  },
} as const

function addTextAliases<T extends Record<string, string>>(colors: T) {
  return {
    ...colors,
    textLight: colors.neutral6,
    textRegular: colors.neutral7,
    textStrong: colors.neutral8,
  }
}

export const colorDefinitions = {
  dark: addTextAliases(baseColorDefinitions.dark),
  light: addTextAliases(baseColorDefinitions.light),
} as const

// Helper functions to generate theme objects
function wrapWithOklch<T extends Record<string, string>>(colorValues: T) {
  return Object.fromEntries(
    Object.entries(colorValues).map(([key, value]) => [key, `oklch(${value})`])
  ) as Record<keyof T, string>
}

function createColorThemes(definitions: typeof colorDefinitions) {
  return {
    dark: {
      oklch: wrapWithOklch(definitions.dark),
      raw: definitions.dark,
    },
    light: {
      oklch: wrapWithOklch(definitions.light),
      raw: definitions.light,
    },
  }
}

export const colors = createColorThemes(colorDefinitions)
