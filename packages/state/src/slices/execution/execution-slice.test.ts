import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ExecutionResult, Transport } from '../../transport/types'

const { executeMock } = vi.hoisted(() => ({
  executeMock: vi.fn<Transport['execute']>(),
}))

vi.mock('../../transport/transport', () => ({
  createTransport: () => ({ execute: executeMock }),
}))

const { createAGIStore } = await import('../../store/create-agi-store')

const iterableOf = (
  ...results: ExecutionResult[]
): AsyncIterable<ExecutionResult> =>
  (async function* () {
    for (const result of results) yield await Promise.resolve(result)
  })()

describe('execution slice', () => {
  beforeEach(() => {
    executeMock.mockReset()
  })

  it('has sensible defaults', () => {
    const store = createAGIStore()
    const state = store.getState()
    expect(state.status).toBe('idle')
    expect(state.endpoint).toBe('http://localhost:4000/graphql')
    expect(state.response).toBe('')
  })

  it('executes and stores the final response', async () => {
    executeMock.mockReturnValue(iterableOf({ data: { isTest: true } }))
    const store = createAGIStore()
    store.getState().setQuery('{ isTest }')

    await store.getState().execute()

    expect(store.getState().status).toBe('idle')
    expect(JSON.parse(store.getState().response)).toEqual({
      data: { isTest: true },
    })
  })

  it('keeps the latest snapshot when multiple results stream', async () => {
    executeMock.mockReturnValue(
      iterableOf({ data: { n: 1 } }, { data: { n: 2 } })
    )
    const store = createAGIStore()
    store.getState().setQuery('subscription { n }')

    await store.getState().execute()

    expect(JSON.parse(store.getState().response)).toEqual({ data: { n: 2 } })
  })

  it('errors on invalid variables JSON without calling transport', async () => {
    const store = createAGIStore()
    store.getState().setQuery('{ isTest }')
    store.getState().setVariables('{ not valid')

    await store.getState().execute()

    expect(store.getState().status).toBe('error')
    expect(store.getState().error).toMatch(/JSON/)
    expect(executeMock).not.toHaveBeenCalled()
  })

  // Terminal status is identical either way, so pin the whole sequence.
  it('moves through fetching and streaming on the way to idle', async () => {
    executeMock.mockReturnValue(
      iterableOf({ data: { n: 1 } }, { data: { n: 2 } })
    )
    const store = createAGIStore()
    store.getState().setQuery('subscription { n }')

    const seen: string[] = []
    store.subscribe(state => seen.push(state.status))

    await store.getState().execute()

    expect(seen).toEqual(['fetching', 'streaming', 'streaming', 'idle'])
  })

  it('cancel aborts the signal and stops further writes', async () => {
    let resumeStream!: () => void
    const gate = new Promise<void>(resolve => {
      resumeStream = resolve
    })

    let firstChunkConsumed!: () => void
    const firstChunk = new Promise<void>(resolve => {
      firstChunkConsumed = resolve
    })

    let signal: AbortSignal | undefined
    executeMock.mockImplementation((_request, options) => {
      signal = options?.signal
      return (async function* () {
        yield { data: { n: 1 } }
        // Resumes only when the consumer pulls again, so chunk one is written.
        firstChunkConsumed()
        await gate
        yield { data: { n: 2 } }
      })()
    })

    const store = createAGIStore()
    store.getState().setQuery('subscription { n }')

    const running = store.getState().execute()
    await firstChunk
    const responseBeforeCancel = store.getState().response

    store.getState().cancel()
    resumeStream()
    await running

    expect(signal?.aborted).toBe(true)
    expect(store.getState().status).toBe('idle')
    expect(store.getState().response).toBe(responseBeforeCancel)
  })

  it('cancel is a no-op when nothing is in flight', () => {
    const store = createAGIStore()

    expect(() => store.getState().cancel()).not.toThrow()
    expect(store.getState().status).toBe('idle')
  })

  it('aborts the previous run when execute is called again', async () => {
    const signals: (AbortSignal | undefined)[] = []
    executeMock.mockImplementation((_request, options) => {
      signals.push(options?.signal)
      return iterableOf({ data: { ok: true } })
    })

    const store = createAGIStore()
    store.getState().setQuery('{ ok }')

    await store.getState().execute()
    await store.getState().execute()

    expect(signals).toHaveLength(2)
    expect(signals[0]?.aborted).toBe(true)
    expect(signals[1]?.aborted).toBe(false)
  })

  it('parses variables and forwards them to the transport', async () => {
    executeMock.mockReturnValue(iterableOf({ data: {} }))
    const store = createAGIStore()
    store.getState().setQuery('query ($id: ID) { a }')
    store.getState().setVariables('{"id":"42"}')
    store.getState().setOperationName('Op')

    await store.getState().execute()

    expect(executeMock).toHaveBeenCalledTimes(1)
    const [request, options] = executeMock.mock.calls[0] ?? []
    expect(request).toEqual({
      query: 'query ($id: ID) { a }',
      variables: { id: '42' },
      operationName: 'Op',
    })
    expect(options?.signal).toBeInstanceOf(AbortSignal)
  })
})
