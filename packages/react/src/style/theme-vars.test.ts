import { describe, expect, it } from 'vitest'

import { themeVars } from './theme-vars'

describe('themeVars', () => {
  it('maps tokens to their CSS custom properties', () => {
    expect(
      themeVars({
        colors: { brand: 'red', neutral1: 'black' },
        radii: { small: '0' },
      })
    ).toEqual({
      '--agi-colors-brand': 'red',
      '--agi-colors-neutral1': 'black',
      '--agi-radii-small': '0',
    })
  })

  it('skips tokens left undefined', () => {
    expect(themeVars({ colors: { brand: undefined } })).toEqual({})
  })
})
