import { describe, expect, it } from 'vitest'

import { themeVars } from './theme-vars'

describe('themeVars', () => {
  it('maps tokens to their CSS custom properties', () => {
    expect(
      themeVars({
        fill: { primary: 'red', accentSoftHover: 'pink' },
        radii: { sm: '0' },
      })
    ).toEqual({
      '--agi-fill-primary': 'red',
      '--agi-fill-accent-soft-hover': 'pink',
      '--agi-radii-sm': '0',
    })
  })

  it('skips tokens left undefined', () => {
    expect(themeVars({ fill: { primary: undefined } })).toEqual({})
  })
})
