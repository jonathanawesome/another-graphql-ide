import { describe, expect, it, vi } from 'vitest'

import type { ExecutionResult, Transport } from '../transport/types'

import { runRequest } from './run-request'

const transportOf = (...results: ExecutionResult[]): Transport => ({
  execute: () =>
    (async function* () {
      for (const result of results) yield await Promise.resolve(result)
    })(),
})

const throwingTransport = (error: unknown): Transport => ({
  execute: () => ({
    [Symbol.asyncIterator]: () => ({
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- runRequest must survive non-Error throws
      next: () => Promise.reject(error),
    }),
  }),
})

const request = { query: '{ ok }' }

describe('runRequest', () => {
  it('reports every chunk and completes', async () => {
    const onResult = vi.fn()
    const onError = vi.fn()

    const outcome = await runRequest(
      transportOf({ data: { n: 1 } }, { data: { n: 2 } }),
      request,
      new AbortController().signal,
      { onResult, onError }
    )

    expect(outcome).toBe('completed')
    expect(onResult).toHaveBeenCalledTimes(2)
    expect(onError).not.toHaveBeenCalled()
  })

  it('completes on an empty stream without reporting anything', async () => {
    const onResult = vi.fn()

    const outcome = await runRequest(
      transportOf(),
      request,
      new AbortController().signal,
      { onResult, onError: vi.fn() }
    )

    expect(outcome).toBe('completed')
    expect(onResult).not.toHaveBeenCalled()
  })

  it('stops reporting once the signal aborts mid-stream', async () => {
    const controller = new AbortController()
    const onResult = vi.fn(() => controller.abort())
    const onError = vi.fn()

    const outcome = await runRequest(
      transportOf({ data: { n: 1 } }, { data: { n: 2 } }),
      request,
      controller.signal,
      { onResult, onError }
    )

    expect(outcome).toBe('aborted')
    expect(onResult).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  it('normalizes a thrown Error to a message', async () => {
    const onError = vi.fn()

    const outcome = await runRequest(
      throwingTransport(new Error('boom')),
      request,
      new AbortController().signal,
      { onResult: vi.fn(), onError }
    )

    expect(outcome).toBe('error')
    expect(onError).toHaveBeenCalledWith('boom')
  })

  it('stringifies a non-Error throw', async () => {
    const onError = vi.fn()

    await runRequest(
      throwingTransport('plain string'),
      request,
      new AbortController().signal,
      { onResult: vi.fn(), onError }
    )

    expect(onError).toHaveBeenCalledWith('plain string')
  })

  // A cancelled run tears its transport down, so the resulting throw is
  // expected rather than something to surface to the user.
  it('swallows a throw that follows an abort', async () => {
    const controller = new AbortController()
    controller.abort()
    const onError = vi.fn()

    const outcome = await runRequest(
      throwingTransport(new Error('aborted teardown')),
      request,
      controller.signal,
      { onResult: vi.fn(), onError }
    )

    expect(outcome).toBe('aborted')
    expect(onError).not.toHaveBeenCalled()
  })
})
