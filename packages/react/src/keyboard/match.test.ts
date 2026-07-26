import { describe, expect, it } from 'vitest'

import { matchesCombo } from './match'

const combo = ['Mod', 'Shift', 'L'] as const

/** The fields the matcher reads, so a test can state a keypress in one line. */
const press = (overrides: Partial<KeyboardEvent> & { key: string }) => ({
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...overrides,
})

describe('matchesCombo', () => {
  it('reads Mod as Command on Apple and Control elsewhere', () => {
    const command = press({ key: 'l', metaKey: true, shiftKey: true })
    const control = press({ key: 'l', ctrlKey: true, shiftKey: true })

    expect(matchesCombo(command, combo, true)).toBe(true)
    expect(matchesCombo(control, combo, false)).toBe(true)

    // The other platform's modifier is not a near-enough match.
    expect(matchesCombo(control, combo, true)).toBe(false)
    expect(matchesCombo(command, combo, false)).toBe(false)
  })

  it('requires every modifier the combo names', () => {
    expect(matchesCombo(press({ key: 'l', ctrlKey: true }), combo, false)).toBe(
      false
    )
    expect(
      matchesCombo(press({ key: 'l', shiftKey: true }), combo, false)
    ).toBe(false)
  })

  // Mod+Shift+Alt+L is a different gesture a user may have bound elsewhere.
  it('rejects extra modifiers', () => {
    const withAlt = press({
      key: 'l',
      ctrlKey: true,
      shiftKey: true,
      altKey: true,
    })

    expect(matchesCombo(withAlt, combo, false)).toBe(false)
  })

  // Holding Shift makes the browser report an uppercase key.
  it('compares the key case-insensitively', () => {
    const upper = press({ key: 'L', ctrlKey: true, shiftKey: true })

    expect(matchesCombo(upper, combo, false)).toBe(true)
  })

  it('ignores a different key entirely', () => {
    const other = press({ key: 'k', ctrlKey: true, shiftKey: true })

    expect(matchesCombo(other, combo, false)).toBe(false)
  })
})
