import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../bricks/editor/editor', () => ({
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
      data-testid="editor"
      data-language={language}
      data-readonly={String(Boolean(readOnly))}
    >
      {value}
    </div>
  ),
}))

const { createTestStore, renderWithProvider } =
  await import('../../../test-utils/render-with-provider')
const { ResponsePane } = await import('./response-pane')

// response is an output, not config, so it is set on the store rather than
// seeded through initialState.
const storeShowing = (response: string) => {
  const store = createTestStore()
  store.setState({ response })
  return store
}

describe('ResponsePane', () => {
  it('renders the response in a read-only json5 editor', () => {
    renderWithProvider(<ResponsePane />, {
      store: storeShowing('{"data":{"ok":true}}'),
    })

    const editor = screen.getByTestId('editor')
    expect(editor.getAttribute('data-language')).toBe('json5')
    expect(editor.getAttribute('data-readonly')).toBe('true')
    expect(editor.textContent).toBe('{"data":{"ok":true}}')
  })

  it('copies the response to the clipboard', () => {
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    renderWithProvider(<ResponsePane />, { store: storeShowing('copy me') })

    fireEvent.click(screen.getByRole('button', { name: 'Copy response' }))

    expect(writeText).toHaveBeenCalledWith('copy me')
  })
})
