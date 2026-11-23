import { createGlobalThemeContract } from '@vanilla-extract/css'

import { arrayToKebabString } from './utils'

export const themeContract = createGlobalThemeContract(
  {
    shadows: {
      tight: null,
      wide: null,
    },

    colors: {
      // neutral scale
      neutral1: null,
      neutral2: null,
      neutral3: null,
      neutral4: null,
      neutral5: null,
      neutral6: null,
      neutral7: null,
      neutral8: null,

      // brand
      brand: null,
    },

    // Console 2026 semantic colors, grouped by role. Each pairs with a
    // `--agi-<group>-<token>` variable.
    bg: {
      canvas: null,
      surface: null,
      raised: null,
      inset: null,
      hover: null,
      track: null,
      trackThumb: null,
      selected: null,
    },

    border: {
      subtle: null,
      default: null,
      strong: null,
      emphasis: null,
      control: null,
    },

    text: {
      primary: null,
      secondary: null,
      tertiary: null,
      disabled: null,
      link: null,
    },

    link: {
      underline: null,
    },

    fill: {
      primary: null,
      primaryHover: null,
      primaryEdge: null,
      accentSoft: null,
      accentSoftHover: null,
      inverse: null,
      neutral: null,
    },

    on: {
      primary: null,
      accentSoft: null,
      inverse: null,
    },

    accent: {
      softEdge: null,
      selectedEdge: null,
      line: null,
      area: null,
      text: null,
    },

    focus: {
      ring: null,
    },

    meadow: {
      borage: null,
      borageText: null,
      borageTint: null,
      bluebell: null,
      bluebellText: null,
      bluebellTint: null,
      heather: null,
      heatherText: null,
      heatherTint: null,
      honey: null,
      honeyText: null,
      honeyTint: null,
      clover: null,
      cloverText: null,
      cloverTint: null,
      propolis: null,
      propolisText: null,
      propolisTint: null,
    },

    status: {
      success: null,
      successBg: null,
      successEdge: null,
      warning: null,
      warningBg: null,
      warningEdge: null,
      danger: null,
      dangerBg: null,
      dangerEdge: null,
      info: null,
      infoBg: null,
      infoEdge: null,
    },

    syntax: {
      keyword: null,
      string: null,
      function: null,
      type: null,
      number: null,
      comment: null,
      punctuation: null,
    },

    // px to rem scaling
    px: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
      9: null,
      10: null,
      11: null,
      12: null,
      13: null,
      14: null,
      15: null,
      16: null,
      17: null,
      18: null,
      19: null,
      20: null,
      24: null,
      32: null,
      40: null,
      60: null,
      64: null,
    },

    radii: {
      small: null,
      medium: null,
      large: null,
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
