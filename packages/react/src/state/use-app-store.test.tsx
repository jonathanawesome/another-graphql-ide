import { createAGIStore } from '@another-graphql-ide/state'
import { act, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createTestStore } from '../test-utils/render-with-provider'

import { AGIProvider } from './agi-provider'
import { useAppStore } from './use-app-store'

const wrapper =
  (store = createTestStore()) =>
  ({ children }: { children: React.ReactNode }) => (
    <AGIProvider store={store}>{children}</AGIProvider>
  )

describe('useAppStore', () => {
  it('reads the store the nearest provider created', () => {
    const store = createTestStore({ query: '{ seeded }' })
    const { result } = renderHook(() => useAppStore.use.query(), {
      wrapper: wrapper(store),
    })

    expect(result.current).toBe('{ seeded }')
  })

  it('re-renders on store updates', () => {
    const store = createTestStore()
    const { result } = renderHook(() => useAppStore.use.query(), {
      wrapper: wrapper(store),
    })

    act(() => store.getState().setQuery('{ isTest }'))

    expect(result.current).toBe('{ isTest }')
  })

  it('exposes a hook for every state key', () => {
    const keys = Object.keys(
      createAGIStore({ persist: false }).getInitialState()
    )

    for (const key of keys) {
      expect(typeof useAppStore.use[key as 'query']).toBe('function')
    }
  })

  // `then` is a plain string key, so a permissive trap would make this object
  // thenable and awaiting it would call a hook outside React.
  it('returns nothing for keys that are not state', () => {
    const use = useAppStore.use as unknown as Record<string, unknown>

    expect(use.then).toBeUndefined()
    expect(use.constructor).toBeUndefined()
    expect(use.toJSON).toBeUndefined()
    expect(use.notAField).toBeUndefined()
  })

  it('throws with a usable message outside a provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => renderHook(() => useAppStore.use.query())).toThrow(
      /inside an <AGIProvider>/
    )

    error.mockRestore()
  })
})

/**
 * The regression guard for the whole scoped-store change. Two vanilla stores are
 * independent by construction, so asserting that alone would pass even if the
 * React binding routed every component to one of them.
 */
describe('two providers on one page', () => {
  const renders = { a: 0, b: 0 }

  const Probe = ({ id }: { id: 'a' | 'b' }) => {
    renders[id] += 1
    return <span data-testid={id}>{useAppStore.use.query()}</span>
  }

  const texts = () => [
    screen.getByTestId('a').textContent,
    screen.getByTestId('b').textContent,
  ]

  it('keeps state, updates and render counts separate', () => {
    renders.a = 0
    renders.b = 0
    const a = createTestStore({ query: 'A' })
    const b = createTestStore({ query: 'B' })

    render(
      <>
        <AGIProvider store={a}>
          <Probe id="a" />
        </AGIProvider>
        <AGIProvider store={b}>
          <Probe id="b" />
        </AGIProvider>
      </>
    )

    // A captured store would show the same text twice.
    expect(texts()).toEqual(['A', 'B'])

    const rendersABefore = renders.a
    act(() => b.getState().setQuery('B2'))
    expect(texts()).toEqual(['A', 'B2'])
    // Writing to b must not re-render a, which a shared subscription would.
    expect(renders.a).toBe(rendersABefore)

    // Both directions, because the hook cache is module-level and populated by
    // whichever provider rendered first.
    act(() => a.getState().setQuery('A2'))
    expect(texts()).toEqual(['A2', 'B2'])
  })

  it('does not share settings when given separate storage keys', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (name: string) => values.get(name) ?? null,
      setItem: (name: string, value: string) => {
        values.set(name, value)
      },
      removeItem: (name: string) => {
        values.delete(name)
      },
    }

    const a = createTestStore(
      {},
      { persist: true, storage, storageKey: 'agi-a' }
    )
    createTestStore({}, { persist: true, storage, storageKey: 'agi-b' })

    act(() => a.getState().setTheme('dark'))

    expect(values.get('agi-b')).toBeUndefined()
  })
})
