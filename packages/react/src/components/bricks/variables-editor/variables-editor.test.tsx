import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../editor/editor', () => ({
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
      <button
        data-testid="editor-change"
        onClick={() => onChange?.('{ id: 2 }')}
      >
        change
      </button>
    </div>
  ),
}))

const { createTestStore, renderWithProvider } =
  await import('../../../test-utils/render-with-provider')
const { VariablesEditor } = await import('./variables-editor')

describe('VariablesEditor', () => {
  it('binds the store variables to a json5 editor', () => {
    renderWithProvider(<VariablesEditor />, {
      store: createTestStore({ variables: '{ "id": 1 }' }),
    })

    const editor = screen.getByTestId('editor')
    expect(editor.getAttribute('data-language')).toBe('json5')
    expect(editor.textContent).toBe('{ "id": 1 }')
  })

  it('writes edits back to the store', () => {
    const { store } = renderWithProvider(<VariablesEditor />)

    fireEvent.click(screen.getByTestId('editor-change'))

    expect(store.getState().variables).toBe('{ id: 2 }')
  })

  it('renders the label only when given one', () => {
    const { unmount } = renderWithProvider(<VariablesEditor />)
    expect(screen.queryByText('Variables')).toBeNull()
    unmount()

    renderWithProvider(<VariablesEditor label="Variables" />)
    expect(screen.getByText('Variables')).toBeDefined()
  })

  it('accepts json5 without complaint', () => {
    renderWithProvider(<VariablesEditor />, {
      store: createTestStore({ variables: '{ id: 1, /* note */ }' }),
    })

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('flags malformed input', () => {
    renderWithProvider(<VariablesEditor />, {
      store: createTestStore({ variables: '{ not valid' }),
    })

    expect(screen.getByRole('alert').textContent).toMatch(/JSON5/)
  })

  it('stays quiet while empty', () => {
    renderWithProvider(<VariablesEditor />)

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
