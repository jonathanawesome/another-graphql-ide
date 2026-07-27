import { buildSchema, introspectionFromSchema } from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as TransportModule from '../../transport/transport'
import type { ExecutionResult, Transport } from '../../transport/types'

const { executeMock } = vi.hoisted(() => ({
  executeMock: vi.fn<Transport['execute']>(),
}))

vi.mock('../../transport/transport', async importOriginal => {
  const actual = await importOriginal<typeof TransportModule>()

  return {
    ...actual,
    // Real transport for the local sentinel, mocked for HTTP.
    createTransport: (options: { endpoint: string }) =>
      options.endpoint === actual.LOCAL_ENDPOINT
        ? actual.createTransport(options)
        : { execute: executeMock },
  }
})

const { createAGIStore } = await import('../../store/create-agi-store')
const { LOCAL_ENDPOINT } = await import('../../transport/transport')

const iterableOf = (
  ...results: ExecutionResult[]
): AsyncIterable<ExecutionResult> =>
  (async function* () {
    for (const result of results) yield await Promise.resolve(result)
  })()

const testSchema = buildSchema(`
  type Query {
    hello: String
  }
`)

describe('schema slice', () => {
  beforeEach(() => {
    executeMock.mockReset()
  })

  it('has sensible defaults', () => {
    const state = createAGIStore().getState()
    expect(state.schema).toBeUndefined()
    expect(state.schemaStatus).toBe('idle')
    expect(state.schemaError).toBeUndefined()
  })

  it('builds a client schema from an introspection result', async () => {
    executeMock.mockReturnValue(
      iterableOf({ data: introspectionFromSchema(testSchema) })
    )
    const store = createAGIStore()

    await store.getState().connect()

    expect(store.getState().schemaStatus).toBe('connected')
    expect(store.getState().schemaError).toBeUndefined()
    expect(
      store.getState().schema?.getQueryType()?.getFields().hello
    ).toBeDefined()
  })

  it('moves through connecting on the way to connected', async () => {
    executeMock.mockReturnValue(
      iterableOf({ data: introspectionFromSchema(testSchema) })
    )
    const store = createAGIStore()
    const seen: string[] = []
    store.subscribe(state => seen.push(state.schemaStatus))

    await store.getState().connect()

    expect(seen).toEqual(['connecting', 'connected'])
  })

  it('joins GraphQL errors into schemaError', async () => {
    executeMock.mockReturnValue(
      iterableOf({ errors: [{ message: 'nope' }, { message: 'also nope' }] })
    )
    const store = createAGIStore()

    await store.getState().connect()

    expect(store.getState().schemaStatus).toBe('error')
    expect(store.getState().schemaError).toBe('nope; also nope')
    expect(store.getState().schema).toBeUndefined()
  })

  it('errors when the endpoint yields nothing', async () => {
    executeMock.mockReturnValue(iterableOf())
    const store = createAGIStore()

    await store.getState().connect()

    expect(store.getState().schemaStatus).toBe('error')
    expect(store.getState().schemaError).toBe('No response from endpoint.')
  })

  it('errors when the payload has no __schema', async () => {
    executeMock.mockReturnValue(iterableOf({ data: { notASchema: true } }))
    const store = createAGIStore()

    await store.getState().connect()

    expect(store.getState().schemaStatus).toBe('error')
    expect(store.getState().schemaError).toBe(
      'Introspection returned no schema.'
    )
  })

  it('surfaces a transport failure as schemaError', async () => {
    executeMock.mockImplementation(() => {
      throw new Error('Failed to fetch')
    })
    const store = createAGIStore()

    await store.getState().connect()

    expect(store.getState().schemaStatus).toBe('error')
    expect(store.getState().schemaError).toBe('Failed to fetch')
  })

  it('clears a previous schemaError when reconnecting', async () => {
    const store = createAGIStore()
    executeMock.mockReturnValue(iterableOf())
    await store.getState().connect()
    expect(store.getState().schemaError).toBeDefined()

    executeMock.mockReturnValue(
      iterableOf({ data: introspectionFromSchema(testSchema) })
    )
    await store.getState().connect()

    expect(store.getState().schemaError).toBeUndefined()
  })

  // If introspection succeeded here it would replace the executable schema with
  // a resolver-less client copy, silently breaking local execution.
  it('leaves a loaded schema untouched when connecting at LOCAL_ENDPOINT', async () => {
    const store = createAGIStore()
    store.getState().setEndpoint(LOCAL_ENDPOINT)
    store.getState().setSchema(testSchema)

    await store.getState().connect()

    expect(store.getState().schemaStatus).toBe('error')
    expect(store.getState().schemaError).toMatch(/schema/i)
    expect(store.getState().schema).toBe(testSchema)
    expect(executeMock).not.toHaveBeenCalled()
  })
})
