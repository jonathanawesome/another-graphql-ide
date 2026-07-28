import type { Transport } from '@another-graphql-ide/state'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createTestStore } from '../test-utils/render-with-provider'

import { AGIProvider } from './agi-provider'
import { useOperation, type UseOperationOptions } from './use-operation'

const transportOf = (
  execute: Transport['execute'] = () =>
    (async function* () {
      yield await Promise.resolve({ data: { ok: true } })
    })()
): Transport => ({ execute })

const setup = (
  options: UseOperationOptions,
  transport: Transport = transportOf()
) => {
  const store = createTestStore({ query: '{ shared }' }, { transport })
  const { result } = renderHook(() => useOperation(options), {
    wrapper: ({ children }) => (
      <AGIProvider store={store}>{children}</AGIProvider>
    ),
  })

  return { store, result }
}

describe('useOperation', () => {
  it('runs the given operation and reports the result', async () => {
    const { result } = setup({ query: '{ provided }' })

    await act(async () => {
      await result.current.run()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.result).toEqual({ data: { ok: true } })
    expect(JSON.parse(result.current.response)).toEqual({ data: { ok: true } })
  })

  // The whole reason this hook exists: a run button beside an editor must not
  // disturb the editor's document or response.
  it('leaves the shared document and response untouched', async () => {
    const { store, result } = setup({ query: '{ provided }' })

    await act(async () => {
      await result.current.run()
    })

    expect(store.getState().query).toBe('{ shared }')
    expect(store.getState().response).toBe('')
    expect(store.getState().status).toBe('idle')
  })

  it('sends the provided query, not the store one', async () => {
    const execute = vi.fn<Transport['execute']>(() =>
      (async function* () {
        yield await Promise.resolve({ data: {} })
      })()
    )
    const { result } = setup({ query: '{ provided }' }, transportOf(execute))

    await act(async () => {
      await result.current.run()
    })

    expect(execute.mock.calls[0]?.[0]).toMatchObject({ query: '{ provided }' })
  })

  it('parses string variables as JSON5', async () => {
    const execute = vi.fn<Transport['execute']>(() =>
      (async function* () {
        yield await Promise.resolve({ data: {} })
      })()
    )
    const { result } = setup(
      { query: '{ a }', variables: '{ id: 1, /* note */ }' },
      transportOf(execute)
    )

    await act(async () => {
      await result.current.run()
    })

    expect(execute.mock.calls[0]?.[0]).toMatchObject({ variables: { id: 1 } })
  })

  it('reports malformed variables without calling the transport', async () => {
    const execute = vi.fn<Transport['execute']>()
    const { result } = setup(
      { query: '{ a }', variables: '{ not valid' },
      transportOf(execute)
    )

    await act(async () => {
      await result.current.run()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toMatch(/JSON5/)
    expect(execute).not.toHaveBeenCalled()
  })

  it('merges per-call overrides over the hook options', async () => {
    const execute = vi.fn<Transport['execute']>(() =>
      (async function* () {
        yield await Promise.resolve({ data: {} })
      })()
    )
    const { result } = setup({ query: '{ a }' }, transportOf(execute))

    await act(async () => {
      await result.current.run({ query: '{ b }' })
    })

    expect(execute.mock.calls[0]?.[0]).toMatchObject({ query: '{ b }' })
  })

  it('surfaces a transport failure', async () => {
    const failing: Transport = {
      execute: () => ({
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.reject(new Error('boom')),
        }),
      }),
    }
    const { result } = setup({ query: '{ a }' }, failing)

    await act(async () => {
      await result.current.run()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('boom')
  })

  // runRequest reports an abort without an outcome callback, so a cancel that
  // only aborts would leave the button stuck showing a running operation.
  it('returns to idle when cancelled mid-stream', async () => {
    let release!: () => void
    const gate = new Promise<void>(resolve => {
      release = resolve
    })

    const streaming: Transport = {
      execute: () =>
        (async function* () {
          yield await Promise.resolve({ data: { n: 1 } })
          await gate
          yield { data: { n: 2 } }
        })(),
    }

    const { result } = setup({ query: 'subscription { n }' }, streaming)

    act(() => void result.current.run())
    await waitFor(() => expect(result.current.status).toBe('streaming'))

    act(() => result.current.cancel())
    expect(result.current.status).toBe('idle')

    release()
    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(JSON.parse(result.current.response)).toEqual({ data: { n: 1 } })
  })
})
