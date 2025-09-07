import { createGlobalThemeContract } from '@vanilla-extract/css'
import { arrayToKebabString } from './utils'

export const themeContract = createGlobalThemeContract(
  {
    colors: {
      neutral1: null,
      neutral2: null,
      neutral3: null,
      neutral4: null,
      neutral5: null,
      neutral6: null,
      neutral7: null,
      neutral8: null,
    },

    fonts: {
      sans: null,
      mono: null,
    },

    // motion!
    motion: {
      authentic: null,
    },
  },
  (_value, path) => `agi${arrayToKebabString(path)}`
)
