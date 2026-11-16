import { fireEvent, render, screen } from '@testing-library/react'
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
const { useInstanceAttr } = await import('../state')
const { createTestStore } = await import('../test-utils/render-with-provider')
const { SchemaTree } =
  await import('../components/bricks/schema-tree/schema-tree')

/** jsdom is not an Apple platform, so Mod is Control here. */
const toggleKeys = { key: 'l', ctrlKey: true, shiftKey: true }

const renderTwoTrees = () => {
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

  // With no schema each tree renders only its empty state, inside its marker.
  const [firstRoot, secondRoot] = screen.getAllByText('No schema loaded.')
  if (!firstRoot || !secondRoot) throw new Error('expected two trees')

  return { first, second, firstRoot, secondRoot }
}

describe('keyboard shortcuts across providers', () => {
  it('reaches the tree whose instance has focus', () => {
    const { first, second, firstRoot } = renderTwoTrees()

    fireEvent.keyDown(firstRoot, toggleKeys)

    expect(first.getState().showFieldTypes).toBe(true)
    expect(second.getState().showFieldTypes).toBe(false)
  })

  it('remembers the last instance used once focus leaves it', () => {
    const { first, second, firstRoot } = renderTwoTrees()

    fireEvent.pointerDown(firstRoot)
    fireEvent.keyDown(document, toggleKeys)

    expect(first.getState().showFieldTypes).toBe(true)
    expect(second.getState().showFieldTypes).toBe(false)
  })

  it('routes from a custom brick that claims its instance', () => {
    const CustomBrick = () => (
      <button type="button" {...useInstanceAttr()}>
        custom
      </button>
    )
    const first = createTestStore()
    const second = createTestStore()

    render(
      <>
        <AGIProvider store={first} theme={false}>
          <SchemaTree />
          <CustomBrick />
        </AGIProvider>
        <AGIProvider store={second} theme={false}>
          <SchemaTree />
        </AGIProvider>
      </>
    )

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'custom' }),
      toggleKeys
    )

    expect(first.getState().showFieldTypes).toBe(true)
    expect(second.getState().showFieldTypes).toBe(false)
  })

  it('falls back to the newest tree before any interaction', () => {
    const { first, second } = renderTwoTrees()

    fireEvent.keyDown(document, toggleKeys)

    expect(second.getState().showFieldTypes).toBe(true)
    expect(first.getState().showFieldTypes).toBe(false)
  })
})
