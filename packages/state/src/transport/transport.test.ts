import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type BuildHTTPExecutorOptions = {
  endpoint: string
  headers?: () => Record<string, string>
  retry?: number
}

const { buildHTTPExecutorMock } = vi.hoisted(() => ({
  buildHTTPExecutorMock:
    vi.fn<(options: BuildHTTPExecutorOptions) => unknown>(),
}))

vi.mock('@graphql-tools/executor-http', () => ({
  buildHTTPExecutor: buildHTTPExecutorMock,
}))

const { createTransport, LOCAL_ENDPOINT } = await import('./transport')

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
    createTransport({
      endpoint: 'http://localhost/graphql',
      headers: { a: '1' },
    })

    const options = buildHTTPExecutorMock.mock.calls[0]?.[0]
    expect(options?.endpoint).toBe('http://localhost/graphql')
    expect(typeof options?.headers).toBe('function')
    expect(options?.headers?.()).toEqual({ a: '1' })
    expect(options?.retry).toBeUndefined()
  })
})

// A tiny in-memory schema with resolvers, so the local transport runs the real
// normalizedExecutor (not the mocked HTTP executor) end to end.
const localSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: { type: GraphQLString, resolve: () => 'world' },
      add: {
        type: GraphQLInt,
        args: { a: { type: GraphQLInt }, b: { type: GraphQLInt } },
        resolve: (_source, { a, b }: { a: number; b: number }) => a + b,
      },
      boom: {
        type: GraphQLString,
        resolve: () => {
          throw new Error('kaboom')
        },
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: {
      count: {
        type: GraphQLInt,
        subscribe: async function* () {
          await Promise.resolve()
          yield { count: 1 }
          yield { count: 2 }
          yield { count: 3 }
        },
        resolve: (payload: { count: number }) => payload.count,
      },
    },
  }),
})

describe('createTransport (local executor)', () => {
  beforeEach(() => {
    buildHTTPExecutorMock.mockReset()
  })

  it('runs a query in-process against the schema, no HTTP', async () => {
    const transport = createTransport({
      endpoint: LOCAL_ENDPOINT,
      schema: localSchema,
    })

    const results = await collect(transport.execute({ query: '{ hello }' }))

    expect(results).toEqual([{ data: { hello: 'world' } }])
    // The local path must never build the HTTP executor.
    expect(buildHTTPExecutorMock).not.toHaveBeenCalled()
  })

  it('passes variables through to the resolver', async () => {
    const transport = createTransport({
      endpoint: LOCAL_ENDPOINT,
      schema: localSchema,
    })

    const results = await collect(
      transport.execute({
        query: 'query Add($a: Int, $b: Int) { add(a: $a, b: $b) }',
        variables: { a: 2, b: 3 },
      })
    )

    expect(results).toEqual([{ data: { add: 5 } }])
  })

  it('surfaces field errors in the result', async () => {
    const transport = createTransport({
      endpoint: LOCAL_ENDPOINT,
      schema: localSchema,
    })

    const [result] = (await collect(
      transport.execute({ query: '{ boom }' })
    )) as [{ data?: { boom: string | null }; errors?: { message: string }[] }]

    expect(result.data?.boom).toBeNull()
    expect(result.errors?.[0]?.message).toBe('kaboom')
  })

  it('streams a subscription as multiple yielded values', async () => {
    const transport = createTransport({
      endpoint: LOCAL_ENDPOINT,
      schema: localSchema,
    })

    const results = await collect(
      transport.execute({ query: 'subscription { count }' })
    )

    expect(results).toEqual([
      { data: { count: 1 } },
      { data: { count: 2 } },
      { data: { count: 3 } },
    ])
  })

  it('errors clearly when the local sentinel has no schema', async () => {
    const transport = createTransport({ endpoint: LOCAL_ENDPOINT })

    // The local sentinel never degrades to an HTTP fetch of 'local'.
    await expect(collect(transport.execute({ query: '{ hello }' }))).rejects.toThrow(
      /schema/i
    )
    expect(buildHTTPExecutorMock).not.toHaveBeenCalled()
  })
})
