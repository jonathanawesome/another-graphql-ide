import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    measureElement: () => undefined,
    scrollToIndex: () => undefined,
  }),
}))

const { AGIProvider } = await import('../state/agi-provider')
const { createTestStore } = await import('../test-utils/render-with-provider')
const { SchemaTree } =
  await import('../components/bricks/schema-tree/schema-tree')

/**
 * Characterization of a known limitation, so the eventual fix has something to
 * flip rather than a silent behavior change.
 *
 * The shortcut bus is page-global while stores are per-provider, so a shortcut
 * reaches only the most recently mounted brick. With one store that was
 * invisible; with two it means the tree you are looking at may not respond.
 */
describe('keyboard shortcuts across providers', () => {
  it('reaches only the most recently mounted tree', () => {
    const first = createTestStore()
    const second = createTestStore()

    render(
      <>
        <AGIProvider store={first} theme={false}>
          <SchemaTree />
        </AGIProvider>
        <AGIProvider store={second} theme={false}>
          <SchemaTree />
        </AGIProvider>
      </>
    )

    // jsdom is not an Apple platform, so Mod is Control here.
    fireEvent.keyDown(document, { key: 'l', ctrlKey: true, shiftKey: true })

    expect(second.getState().showFieldTypes).toBe(true)
    expect(first.getState().showFieldTypes).toBe(false)
  })
})
