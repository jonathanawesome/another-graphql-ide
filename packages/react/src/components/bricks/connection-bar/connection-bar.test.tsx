import { fireEvent, screen } from '@testing-library/react'
import { buildSchema } from 'graphql'
import { describe, expect, it, vi } from 'vitest'

import {
  createTestStore,
  renderWithProvider,
} from '../../../test-utils/render-with-provider'

import { ConnectionBar } from './connection-bar'

describe('ConnectionBar', () => {
  it('shows the current endpoint', () => {
    renderWithProvider(<ConnectionBar />, {
      store: createTestStore({ endpoint: 'https://api.example.com/graphql' }),
    })

    expect(
      screen.getByPlaceholderText('https://example.com/graphql')
    ).toHaveProperty('value', 'https://api.example.com/graphql')
  })

  it('writes edits back to the store', () => {
    const { store } = renderWithProvider(<ConnectionBar />)

    fireEvent.change(
      screen.getByPlaceholderText('https://example.com/graphql'),
      {
        target: { value: 'https://edited.example.com/graphql' },
      }
    )

    expect(store.getState().endpoint).toBe('https://edited.example.com/graphql')
  })

  it('introspects on Connect', () => {
    const connect = vi.fn()
    const store = createTestStore()
    store.setState({ connect })
    renderWithProvider(<ConnectionBar />, { store })

    fireEvent.click(screen.getByRole('button', { name: 'Connect to endpoint' }))

    expect(connect).toHaveBeenCalled()
  })

  it.each([
    ['idle', 'Not connected'],
    ['connecting', 'Connecting…'],
    ['connected', 'Connected'],
    ['error', 'Connection failed'],
  ] as const)('reports %s status', (schemaStatus, label) => {
    const store = createTestStore()
    store.setState({ schemaStatus })
    renderWithProvider(<ConnectionBar />, { store })

    expect(screen.getByText(label)).toBeDefined()
  })

  // Connecting twice would fire a second introspection over the first.
  it('disables Connect while connecting', () => {
    const store = createTestStore()
    store.setState({ schemaStatus: 'connecting' })
    renderWithProvider(<ConnectionBar />, { store })

    expect(
      screen.getByRole('button', { name: 'Connect to endpoint' })
    ).toHaveProperty('disabled', true)
  })

  // A schema handed in by the host is loaded by definition, so the bar should
  // not read "Not connected" beside a working editor.
  it('reads connected when the provider seeded a schema', () => {
    renderWithProvider(<ConnectionBar />, {
      store: createTestStore({
        schema: buildSchema('type Query { a: String }'),
      }),
    })

    expect(screen.getByText('Connected')).toBeDefined()
  })
})
