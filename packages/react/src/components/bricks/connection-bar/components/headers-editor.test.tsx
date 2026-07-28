import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../editor/editor', () => ({
  Editor: ({
    value,
    onChange,
  }: {
    value?: string
    onChange?: (value: string) => void
  }) => (
    <textarea
      data-testid="raw-editor"
      value={value}
      onChange={event => onChange?.(event.target.value)}
    />
  ),
}))

const { createTestStore, renderWithProvider } =
  await import('../../../../test-utils/render-with-provider')
const { HeadersEditor } = await import('./headers-editor')

const toRaw = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Edit as raw JSON' }))

describe('HeadersEditor', () => {
  it('shows existing headers as rows', () => {
    renderWithProvider(<HeadersEditor />, {
      store: createTestStore({ headers: { authorization: 'Bearer t' } }),
    })

    expect(screen.getByPlaceholderText('Header')).toHaveProperty(
      'value',
      'authorization'
    )
    expect(screen.getByPlaceholderText('Value')).toHaveProperty(
      'value',
      'Bearer t'
    )
  })

  it('writes row edits into the store as a flat record', () => {
    const { store } = renderWithProvider(<HeadersEditor />)

    fireEvent.change(screen.getByPlaceholderText('Header'), {
      target: { value: 'x-api-key' },
    })
    fireEvent.change(screen.getByPlaceholderText('Value'), {
      target: { value: 'abc123' },
    })

    expect(store.getState().headers).toEqual({ 'x-api-key': 'abc123' })
  })

  it('accepts json5 in raw mode', () => {
    const { store } = renderWithProvider(<HeadersEditor />)
    toRaw()

    fireEvent.change(screen.getByTestId('raw-editor'), {
      target: { value: '{ authorization: "Bearer t", /* note */ }' },
    })

    expect(store.getState().headers).toEqual({ authorization: 'Bearer t' })
  })

  it('keeps the last valid headers when raw text is malformed', () => {
    const { store } = renderWithProvider(<HeadersEditor />, {
      store: createTestStore({ headers: { a: '1' } }),
    })
    toRaw()

    fireEvent.change(screen.getByTestId('raw-editor'), {
      target: { value: '{ not valid' },
    })

    expect(store.getState().headers).toEqual({ a: '1' })
  })

  /**
   * Characterization, not endorsement. Local rows are seeded from the store once
   * at mount, so a later store write leaves this component showing stale values.
   * Pre-existing, and now reachable through AGIProvider's headers prop.
   */
  it('does not follow a store change made after mount', () => {
    const { store } = renderWithProvider(<HeadersEditor />, {
      store: createTestStore({ headers: { a: '1' } }),
    })

    store.setState({ headers: { b: '2' } })

    expect(screen.getByPlaceholderText('Header')).toHaveProperty('value', 'a')
  })
})
