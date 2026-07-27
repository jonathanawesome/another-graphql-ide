import { buildSchema } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import type { StateStorage } from 'zustand/middleware'

import type { CreateTransportOptions, Transport } from '../transport/types'

import { createAGIStore } from './create-agi-store'
import { SETTINGS_STORAGE_KEY } from './persist-settings'

const DEFAULT_ENDPOINT = 'http://localhost:4000/graphql'

const testSchema = buildSchema(`type Query { hello: String }`)

const stubTransport = (): Transport => ({
  execute: () =>
    (async function* () {
      yield await Promise.resolve({ data: {} })
    })(),
})

const storageSeededWith = (state: unknown): StateStorage => {
  const values = new Map<string, string>([
    [SETTINGS_STORAGE_KEY, JSON.stringify({ state, version: 1 })],
  ])

  return {
    getItem: name => values.get(name) ?? null,
    setItem: (name, value) => {
      values.set(name, value)
    },
    removeItem: name => {
      values.delete(name)
    },
  }
}

describe('createAGIStore initialState', () => {
  it('seeds the keys a host owns', () => {
    const state = createAGIStore({
      initialState: {
        endpoint: 'https://api.example.com/graphql',
        headers: { authorization: 'Bearer t' },
        query: '{ seeded }',
        variables: '{ id: 1 }',
        showFieldTypes: true,
        objectFieldInsertionMode: 'bare',
      },
    }).getState()

    expect(state.endpoint).toBe('https://api.example.com/graphql')
    expect(state.headers).toEqual({ authorization: 'Bearer t' })
    expect(state.query).toBe('{ seeded }')
    expect(state.variables).toBe('{ id: 1 }')
    expect(state.showFieldTypes).toBe(true)
    expect(state.objectFieldInsertionMode).toBe('bare')
  })

  it('leaves defaults alone when a key is present but undefined', () => {
    const state = createAGIStore({
      initialState: { endpoint: undefined, query: undefined },
    }).getState()

    expect(state.endpoint).toBe(DEFAULT_ENDPOINT)
    expect(state.query).toBe('')
  })

  it('marks a seeded schema as connected', () => {
    const state = createAGIStore({
      initialState: { schema: testSchema },
    }).getState()

    expect(state.schema).toBe(testSchema)
    expect(state.schemaStatus).toBe('connected')
  })

  it('stays idle when no schema is seeded', () => {
    expect(createAGIStore().getState().schemaStatus).toBe('idle')
  })

  it('keeps actions intact through hydration', () => {
    const state = createAGIStore({
      storage: storageSeededWith({ theme: 'dark' }),
      initialState: { query: '{ seeded }' },
    }).getState()

    expect(typeof state.execute).toBe('function')
    expect(typeof state.getTransport).toBe('function')
    expect(state.query).toBe('{ seeded }')
  })

  // A stored preference is the user's; a seed is only the host's default.
  it('lets a persisted setting win over a seeded one', () => {
    const state = createAGIStore({
      storage: storageSeededWith({ theme: 'dark' }),
      initialState: { theme: 'light' },
    }).getState()

    expect(state.theme).toBe('dark')
  })

  it('uses the seeded setting when storage holds nothing', () => {
    const state = createAGIStore({
      persist: false,
      initialState: { theme: 'light' },
    }).getState()

    expect(state.theme).toBe('light')
  })
})

describe('createAGIStore transport', () => {
  // Memoizing this at construction would pass every other test here and ship a
  // connection bar where editing the endpoint changes nothing.
  it('rebuilds per call so endpoint and header edits take effect', () => {
    const factory =
      vi.fn<(options: CreateTransportOptions) => Transport>(stubTransport)
    const store = createAGIStore({ transport: factory })

    store.getState().getTransport()
    store.getState().setEndpoint('https://b.example.com/graphql')
    store.getState().setHeaders({ a: '1' })
    store.getState().getTransport()

    expect(factory).toHaveBeenCalledTimes(2)
    expect(factory.mock.calls[0]?.[0]).toMatchObject({
      endpoint: DEFAULT_ENDPOINT,
    })
    expect(factory.mock.calls[1]?.[0]).toMatchObject({
      endpoint: 'https://b.example.com/graphql',
      headers: { a: '1' },
    })
  })

  it('hands the factory the seeded schema and fetch', () => {
    const factory =
      vi.fn<(options: CreateTransportOptions) => Transport>(stubTransport)
    const customFetch = vi.fn<typeof globalThis.fetch>()

    createAGIStore({
      transport: factory,
      fetch: customFetch,
      initialState: { schema: testSchema },
    })
      .getState()
      .getTransport()

    expect(factory.mock.calls[0]?.[0]).toMatchObject({
      schema: testSchema,
      fetch: customFetch,
    })
  })

  it('lets per-call overrides beat store state', () => {
    const factory =
      vi.fn<(options: CreateTransportOptions) => Transport>(stubTransport)

    createAGIStore({ transport: factory })
      .getState()
      .getTransport({ endpoint: 'https://one-off.example.com/graphql' })

    expect(factory.mock.calls[0]?.[0]).toMatchObject({
      endpoint: 'https://one-off.example.com/graphql',
    })
  })

  it('returns a static transport as-is', () => {
    const transport = stubTransport()

    expect(createAGIStore({ transport }).getState().getTransport()).toBe(
      transport
    )
  })

  it('execute runs through the injected transport', async () => {
    const execute = vi.fn<Transport['execute']>(() =>
      (async function* () {
        yield await Promise.resolve({ data: { ok: true } })
      })()
    )
    const store = createAGIStore({ transport: { execute } })
    store.getState().setQuery('{ ok }')

    await store.getState().execute()

    expect(execute).toHaveBeenCalledTimes(1)
    expect(JSON.parse(store.getState().response)).toEqual({
      data: { ok: true },
    })
  })
})
