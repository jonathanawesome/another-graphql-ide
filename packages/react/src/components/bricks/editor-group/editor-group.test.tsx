import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../editor/editor', () => ({
  Editor: ({ language, value }: { language: string; value?: string }) => (
    <div data-testid={`editor-${language}`}>{value}</div>
  ),
}))

const { createTestStore, renderWithProvider } =
  await import('../../../test-utils/render-with-provider')
const { EditorGroup } = await import('./editor-group')

describe('EditorGroup', () => {
  it('renders the document and response panes', () => {
    const store = createTestStore({ query: '{ isTest }' })
    store.setState({ response: '{"ok":true}' })
    renderWithProvider(<EditorGroup />, { store })

    expect(screen.getByTestId('editor-graphql').textContent).toBe('{ isTest }')
    expect(screen.getByTestId('editor-json5').textContent).toBe('{"ok":true}')
  })

  // It used to bridge schema, endpoint and defaultQuery props into the store on
  // mount. "Renders both panes" would pass for two empty divs; a write count of
  // zero is what actually guards the removal.
  it('writes nothing to the store on mount', () => {
    const store = createTestStore({ query: '{ isTest }' })
    const writes: unknown[] = []
    store.subscribe(() => writes.push(1))

    renderWithProvider(<EditorGroup />, { store })

    expect(writes).toHaveLength(0)
  })
})
