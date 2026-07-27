import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../exported-components/editor/editor', () => ({
  Editor: ({
    language,
    value,
    onChange,
  }: {
    language: string
    value?: string
    onChange?: (value: string) => void
  }) => (
    <div>
      <div data-testid="editor" data-language={language}>
        {value}
      </div>
      <button data-testid="editor-change" onClick={() => onChange?.('typed')}>
        change
      </button>
    </div>
  ),
}))

const { createTestStore, renderWithProvider } =
  await import('../../../test-utils/render-with-provider')
const { DocumentPane } = await import('./document-pane')

describe('DocumentPane', () => {
  it('binds the query to a graphql editor', () => {
    renderWithProvider(<DocumentPane />, {
      store: createTestStore({ query: '{ isTest }' }),
    })

    const editor = screen.getByTestId('editor')
    expect(editor.getAttribute('data-language')).toBe('graphql')
    expect(editor.textContent).toBe('{ isTest }')
  })

  it('updates the store query on edit', () => {
    const { store } = renderWithProvider(<DocumentPane />)

    fireEvent.click(screen.getByTestId('editor-change'))

    expect(store.getState().query).toBe('typed')
  })

  it('runs the operation when Execute is clicked', () => {
    const execute = vi.fn()
    const store = createTestStore()
    // Actions are outside AGIInitialState by design, so this one is swapped in.
    store.setState({ execute })
    renderWithProvider(<DocumentPane />, { store })

    fireEvent.click(screen.getByRole('button', { name: 'Execute operation' }))

    expect(execute).toHaveBeenCalled()
  })
})
