import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

const { useAppStore } = await import('../../../state')
const { DocumentPane } = await import('./document-pane')

describe('DocumentPane', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('binds the query to a graphql editor', () => {
    useAppStore.setState({ query: '{ isTest }' })
    render(<DocumentPane />)

    const editor = screen.getByTestId('editor')
    expect(editor.getAttribute('data-language')).toBe('graphql')
    expect(editor.textContent).toBe('{ isTest }')
  })

  it('updates the store query on edit', () => {
    render(<DocumentPane />)
    fireEvent.click(screen.getByTestId('editor-change'))
    expect(useAppStore.getState().query).toBe('typed')
  })

  it('runs the operation when Execute is clicked', () => {
    const execute = vi.fn()
    useAppStore.setState({ execute })
    render(<DocumentPane />)

    fireEvent.click(screen.getByRole('button', { name: 'Execute operation' }))

    expect(execute).toHaveBeenCalled()
  })
})
