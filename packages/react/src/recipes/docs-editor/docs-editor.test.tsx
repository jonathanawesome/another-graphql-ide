import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../components/bricks/editor/editor', () => ({
  Editor: ({
    language,
    value,
    readOnly,
  }: {
    language: string
    value?: string
    readOnly?: boolean
  }) => (
    <div
      data-testid={`editor-${language}`}
      data-readonly={String(Boolean(readOnly))}
    >
      {value}
    </div>
  ),
}))

const { createTestStore, renderWithProvider } =
  await import('../../test-utils/render-with-provider')
const { DocsEditor } = await import('./docs-editor')

describe('DocsEditor', () => {
  it('renders the document and the response', () => {
    const store = createTestStore({ query: '{ isTest }' })
    store.setState({ response: '{"data":{"ok":true}}' })
    renderWithProvider(<DocsEditor />, { store })

    expect(screen.getByTestId('editor-graphql').textContent).toBe('{ isTest }')
    expect(screen.getByTestId('editor-json5').textContent).toBe(
      '{"data":{"ok":true}}'
    )
  })

  it('keeps the response read-only', () => {
    renderWithProvider(<DocsEditor />)

    expect(
      screen.getByTestId('editor-json5').getAttribute('data-readonly')
    ).toBe('true')
  })

  it('runs the shared document', () => {
    const execute = vi.fn()
    const store = createTestStore()
    store.setState({ execute })
    renderWithProvider(<DocsEditor />, { store })

    fireEvent.click(screen.getByRole('button', { name: 'Execute operation' }))

    expect(execute).toHaveBeenCalled()
  })

  it('offers stop while running', () => {
    const cancel = vi.fn()
    const store = createTestStore()
    store.setState({ status: 'streaming', cancel })
    renderWithProvider(<DocsEditor />, { store })

    fireEvent.click(screen.getByRole('button', { name: 'Stop operation' }))

    expect(cancel).toHaveBeenCalled()
  })

  // The variables brick is opt-in, so a docs embed with no use for one does not
  // carry it.
  it('hides variables unless asked for', () => {
    const { unmount } = renderWithProvider(<DocsEditor />)
    expect(screen.queryByText('Variables')).toBeNull()
    unmount()

    renderWithProvider(<DocsEditor showVariables />)
    expect(screen.getByText('Variables')).toBeDefined()
  })

  it('renders no connection bar or schema tree', () => {
    renderWithProvider(<DocsEditor />)

    expect(screen.queryByRole('tree')).toBeNull()
    expect(screen.queryByPlaceholderText('Search schema...')).toBeNull()
  })
})
