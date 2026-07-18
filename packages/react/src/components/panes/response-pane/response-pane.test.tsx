import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../exported-components/editor/editor', () => ({
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

const { useAppStore } = await import('../../../state')
const { ResponsePane } = await import('./response-pane')

describe('ResponsePane', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('renders the response in a read-only json5 editor', () => {
    useAppStore.setState({ response: '{"data":{"ok":true}}' })
    render(<ResponsePane />)

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
    useAppStore.setState({ response: 'copy me' })
    render(<ResponsePane />)

    fireEvent.click(screen.getByRole('button', { name: 'Copy response' }))

    expect(writeText).toHaveBeenCalledWith('copy me')
  })
})
