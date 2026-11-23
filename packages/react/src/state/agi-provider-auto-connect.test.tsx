import type * as StateModule from '@another-graphql-ide/state'
import { render } from '@testing-library/react'
import { buildSchema } from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { connect } = vi.hoisted(() => ({
  connect: vi.fn(() => Promise.resolve()),
}))

// Swaps connect on every store the provider creates, so no network is touched.
vi.mock('@another-graphql-ide/state', async importOriginal => {
  const actual = await importOriginal<typeof StateModule>()
  return {
    ...actual,
    createAGIStore: (options: Parameters<typeof actual.createAGIStore>[0]) => {
      const store = actual.createAGIStore(options)
      store.setState({ connect })
      return store
    },
  }
})

const { AGIProvider } = await import('./agi-provider')

const schema = buildSchema(`type Query { a: String }`)

describe('AGIProvider autoConnect', () => {
  beforeEach(() => {
    connect.mockClear()
  })

  it('stays off by default', () => {
    render(<AGIProvider endpoint="https://one.example.com">{null}</AGIProvider>)

    expect(connect).not.toHaveBeenCalled()
  })

  it('introspects on mount', () => {
    render(
      <AGIProvider endpoint="https://one.example.com" autoConnect>
        {null}
      </AGIProvider>
    )

    expect(connect).toHaveBeenCalledOnce()
  })

  it('introspects again when the endpoint changes', () => {
    const view = render(
      <AGIProvider endpoint="https://one.example.com" autoConnect>
        {null}
      </AGIProvider>
    )

    view.rerender(
      <AGIProvider endpoint="https://two.example.com" autoConnect>
        {null}
      </AGIProvider>
    )

    expect(connect).toHaveBeenCalledTimes(2)
  })

  it('skips introspection when a schema is given', () => {
    render(
      <AGIProvider
        endpoint="https://one.example.com"
        schema={schema}
        autoConnect
      >
        {null}
      </AGIProvider>
    )

    expect(connect).not.toHaveBeenCalled()
  })
})
