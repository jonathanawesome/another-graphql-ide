import type { AppState } from '@another-graphql-ide/state'
import { act, render } from '@testing-library/react'
import { buildSchema } from 'graphql'
import { describe, expect, it } from 'vitest'
import type { StateStorage } from 'zustand/middleware'
import type { StoreApi } from 'zustand/vanilla'

import { createTestStore } from '../test-utils/render-with-provider'

import { AGIProvider } from './agi-provider'
import { useAGIStore } from './agi-store-context'

const DEFAULT_ENDPOINT = 'http://localhost:4000/graphql'

const schemaA = buildSchema(`type Query { a: String }`)
const schemaB = buildSchema(`type Query { b: String }`)

/** Captures the store the provider handed down, without subscribing to it. */
const Probe = ({ onStore }: { onStore: (s: StoreApi<AppState>) => void }) => {
  onStore(useAGIStore())
  return null
}

type ProviderProps = React.ComponentProps<typeof AGIProvider>

const renderProvider = (props: ProviderProps) => {
  let captured: StoreApi<AppState> | undefined

  // The Probe is the only child, so JSX children win over whatever the spread
  // carries and every rerender keeps reporting the current store.
  const tree = (next: ProviderProps) => (
    <AGIProvider {...next}>
      <Probe
        onStore={store => {
          captured = store
        }}
      />
    </AGIProvider>
  )

  const view = render(tree(props))

  return {
    ...view,
    mount: (next: ProviderProps) => view.rerender(tree(next)),
    store: () => {
      if (!captured) throw new Error('provider rendered no store')
      return captured
    },
  }
}

describe('AGIProvider', () => {
  it('seeds the store from config props', () => {
    const { store } = renderProvider({
      endpoint: 'https://api.example.com/graphql',
      headers: { authorization: 'Bearer t' },
      schema: schemaA,
      defaultQuery: '{ seeded }',
      defaultVariables: '{ id: 1 }',
      children: null,
    })

    const state = store().getState()
    expect(state.endpoint).toBe('https://api.example.com/graphql')
    expect(state.headers).toEqual({ authorization: 'Bearer t' })
    expect(state.schema).toBe(schemaA)
    expect(state.query).toBe('{ seeded }')
    expect(state.variables).toBe('{ id: 1 }')
  })

  // An effect written without the undefined guard clobbers the slice default at
  // mount and still passes every other test here.
  it('keeps the default endpoint when none is given', () => {
    const { store } = renderProvider({ children: null })

    expect(store().getState().endpoint).toBe(DEFAULT_ENDPOINT)
  })

  it('follows a changed endpoint prop', () => {
    const { store, mount } = renderProvider({
      endpoint: 'https://one.example.com/graphql',
      children: null,
    })

    act(() =>
      mount({ endpoint: 'https://two.example.com/graphql', children: null })
    )

    expect(store().getState().endpoint).toBe('https://two.example.com/graphql')
  })

  // Consumers inline `headers={{...}}`, so the prop's identity changes on every
  // render while its contents do not. The edit in the middle is what makes this
  // bite: comparing against store state rather than the previous prop sees a
  // difference and re-asserts the prop over the user's own headers.
  it('does not re-assert an unchanged headers prop over a user edit', () => {
    const { store, mount } = renderProvider({
      headers: { a: '1' },
      children: null,
    })

    act(() => store().getState().setHeaders({ a: '1', edited: 'yes' }))
    act(() => mount({ headers: { a: '1' }, children: null }))

    expect(store().getState().headers).toEqual({ a: '1', edited: 'yes' })
  })

  it('writes nothing when re-rendered with an equal headers object', () => {
    const { store, mount } = renderProvider({
      headers: { a: '1' },
      children: null,
    })

    const writes: unknown[] = []
    store().subscribe(state => writes.push(state.headers))

    act(() => mount({ headers: { a: '1' }, children: null }))

    expect(writes).toHaveLength(0)
  })

  it('follows a genuinely changed headers object', () => {
    const { store, mount } = renderProvider({
      headers: { a: '1' },
      children: null,
    })

    act(() => mount({ headers: { a: '2' }, children: null }))

    expect(store().getState().headers).toEqual({ a: '2' })
  })

  // The bug the prop removal fixed: rerendering with the same value passes even
  // against the old implementation, so the typed edit has to happen in between.
  it('never clobbers a typed document when defaultQuery changes', () => {
    const { store, mount } = renderProvider({
      defaultQuery: '{ first }',
      children: null,
    })

    act(() => store().getState().setQuery('{ typed }'))
    act(() => mount({ defaultQuery: '{ second }', children: null }))

    expect(store().getState().query).toBe('{ typed }')
  })

  it('leaves a loaded schema alone when the prop goes undefined', () => {
    const { store, mount } = renderProvider({ schema: schemaA, children: null })

    act(() => mount({ schema: undefined, children: null }))

    expect(store().getState().schema).toBe(schemaA)
  })

  it('marks a changed schema prop as connected', () => {
    const { store, mount } = renderProvider({ schema: schemaA, children: null })

    act(() => mount({ schema: schemaB, children: null }))

    expect(store().getState().schema).toBe(schemaB)
    expect(store().getState().schemaStatus).toBe('connected')
  })

  it('uses a provided store instead of creating one', () => {
    const provided = createTestStore({ query: '{ provided }' })
    const { store } = renderProvider({ store: provided, children: null })

    expect(store()).toBe(provided)
  })

  it('keeps settings apart when storage keys differ', () => {
    const values = new Map<string, string>()
    const storage: StateStorage = {
      getItem: name => values.get(name) ?? null,
      setItem: (name, value) => {
        values.set(name, value)
      },
      removeItem: name => {
        values.delete(name)
      },
    }

    const { store } = renderProvider({
      persist: true,
      storage,
      storageKey: 'agi-a',
      children: null,
    })
    renderProvider({
      persist: true,
      storage,
      storageKey: 'agi-b',
      children: null,
    })

    act(() => store().getState().setTheme('dark'))

    expect(values.get('agi-a')).toContain('dark')
    expect(values.get('agi-b')).toBeUndefined()
  })
})
