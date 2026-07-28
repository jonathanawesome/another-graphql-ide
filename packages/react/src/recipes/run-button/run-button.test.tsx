import type { Transport } from '@another-graphql-ide/state'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AGIProvider } from '../../state'
import { createTestStore } from '../../test-utils/render-with-provider'

import { RunButton } from './run-button'

const transportOf = (result: unknown = { data: { ok: true } }): Transport => ({
  execute: () =>
    (async function* () {
      yield await Promise.resolve(result as never)
    })(),
})

const setup = (ui: React.ReactNode, transport: Transport = transportOf()) => {
  const store = createTestStore({ query: '{ shared }' }, { transport })
  return {
    store,
    ...render(<AGIProvider store={store}>{ui}</AGIProvider>),
  }
}

const clickRun = (name = 'Execute operation') =>
  fireEvent.click(screen.getByRole('button', { name }))

const settled = () =>
  waitFor(() => expect(screen.queryByText('Running…')).toBeNull())

describe('RunButton', () => {
  it('shows the result in its popover', async () => {
    setup(<RunButton operation="{ provided }" />)

    clickRun()

    expect(await screen.findByText(/"ok": true/)).toBeDefined()
  })

  // The reason this recipe uses useOperation rather than the store's execute.
  it('leaves the shared document and response untouched', async () => {
    const { store } = setup(<RunButton operation="{ provided }" />)

    clickRun()
    await settled()

    expect(store.getState().query).toBe('{ shared }')
    expect(store.getState().response).toBe('')
  })

  it('runs the operation it was given', async () => {
    const execute = vi.fn<Transport['execute']>(() =>
      (async function* () {
        yield await Promise.resolve({ data: {} })
      })()
    )
    setup(<RunButton operation="{ provided }" />, { execute })

    clickRun()
    await settled()

    expect(execute.mock.calls[0]?.[0]).toMatchObject({ query: '{ provided }' })
  })

  it('uses the given button text', () => {
    setup(<RunButton operation="{ a }" text="Try this" />)

    expect(screen.getByText('Try this')).toBeDefined()
  })

  it('reports a failure in the popover', async () => {
    const failing: Transport = {
      execute: () => ({
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.reject(new Error('boom')),
        }),
      }),
    }
    setup(<RunButton operation="{ a }" />, failing)

    clickRun()

    expect((await screen.findByRole('alert')).textContent).toBe('boom')
  })

  it('hands the result to onResult', async () => {
    const onResult = vi.fn()
    setup(<RunButton operation="{ a }" onResult={onResult} />)

    clickRun()
    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({ data: { ok: true } })
    )
  })

  // Two buttons over one provider must not read each other's results.
  it('keeps two buttons independent', () => {
    const store = createTestStore({}, { transport: transportOf() })
    render(
      <AGIProvider store={store}>
        <RunButton operation="{ a }" text="Run A" />
        <RunButton operation="{ b }" text="Run B" />
      </AGIProvider>
    )

    expect(screen.getByText('Run A')).toBeDefined()
    expect(screen.getByText('Run B')).toBeDefined()
    expect(screen.queryByText(/"ok": true/)).toBeNull()
  })
})
