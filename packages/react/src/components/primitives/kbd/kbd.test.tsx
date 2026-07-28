import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Kbd } from './kbd'

/**
 * jsdom is not an Apple platform, so `Mod` renders and reads as Control here.
 * The Apple branch is covered directly in the format and match tests.
 */
describe('Kbd', () => {
  it('draws one chip per key', () => {
    render(<Kbd keys={['Mod', 'Shift', 'L']} />)

    expect(screen.getByText('Ctrl')).toBeDefined()
    expect(screen.getByText('Shift')).toBeDefined()
    expect(screen.getByText('L')).toBeDefined()
  })

  // The glyphs are hidden from assistive tech, so this spoken form is the only
  // thing a screen reader has to announce.
  it('exposes the combination in words', () => {
    render(<Kbd keys={['Mod', 'Shift', 'L']} />)

    expect(screen.getByText('Control Shift L')).toBeDefined()
  })

  it('reads its keys from the shortcut registry', () => {
    render(<Kbd shortcut="schema-tree.toggle-field-types" />)

    expect(screen.getByText('Control Shift L')).toBeDefined()
  })

  it('shortens named keys but leaves them unabbreviated where they fit', () => {
    render(<Kbd keys={['Escape']} />)

    expect(screen.getByText('Esc')).toBeDefined()
  })
})
