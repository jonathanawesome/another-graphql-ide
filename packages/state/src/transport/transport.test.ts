import { beforeEach, describe, expect, it, vi } from 'vitest'

type BuildHTTPExecutorOptions = {
  endpoint: string
  headers?: () => Record<string, string>
  retry?: number
}

const { buildHTTPExecutorMock } = vi.hoisted(() => ({
  buildHTTPExecutorMock: vi.fn<(options: BuildHTTPExecutorOptions) => unknown>(),
}))

vi.mock('@graphql-tools/executor-http', () => ({
  buildHTTPExecutor: buildHTTPExecutorMock,
}))

const { createTransport } = await import('./transport')

const collect = async (iterable: AsyncIterable<unknown>) => {
  const out: unknown[] = []
  for await (const value of iterable) out.push(value)
  return out
}

describe('createTransport', () => {
  beforeEach(() => {
    buildHTTPExecutorMock.mockReset()
  })

  it('normalizes a single result into one yielded value', async () => {
    buildHTTPExecutorMock.mockReturnValue(() =>
      Promise.resolve({ data: { ok: true } })
    )
    const transport = createTransport({ endpoint: 'http://localhost/graphql' })

    const results = await collect(transport.execute({ query: '{ ok }' }))

    expect(results).toEqual([{ data: { ok: true } }])
  })

  it('passes an async iterable through (subscriptions / incremental)', async () => {
    buildHTTPExecutorMock.mockReturnValue(() =>
      Promise.resolve(
        (async function* () {
          yield await Promise.resolve({ data: { n: 1 } })
          yield await Promise.resolve({ data: { n: 2 } })
        })()
      )
    )
    const transport = createTransport({ endpoint: 'http://localhost/graphql' })

    const results = await collect(
      transport.execute({ query: 'subscription { n }' })
    )

    expect(results).toEqual([{ data: { n: 1 } }, { data: { n: 2 } }])
  })

  it('builds the executor with a headers function and no retry', () => {
    buildHTTPExecutorMock.mockReturnValue(() => Promise.resolve({}))
    createTransport({ endpoint: 'http://localhost/graphql', headers: { a: '1' } })

    const options = buildHTTPExecutorMock.mock.calls[0]?.[0]
    expect(options?.endpoint).toBe('http://localhost/graphql')
    expect(typeof options?.headers).toBe('function')
    expect(options?.headers?.()).toEqual({ a: '1' })
    expect(options?.retry).toBeUndefined()
  })
})
