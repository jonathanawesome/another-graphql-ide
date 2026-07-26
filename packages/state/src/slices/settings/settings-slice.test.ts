import { describe, expect, it } from 'vitest'
import type { StateStorage } from 'zustand/middleware'

import { createAGIStore } from '../../store/create-agi-store'
import { SETTINGS_STORAGE_KEY } from '../../store/persist-settings'

/**
 * A storage two stores can share, standing in for one origin's localStorage.
 *
 * A class on purpose, not an object literal: localStorage keeps its methods on
 * the prototype, and a literal would hide any code that copies a storage by
 * spreading it (which silently loses the methods and breaks rehydration).
 */
class SharedStorage implements StateStorage {
  readonly values = new Map<string, string>()
  writes = 0

  getItem(name: string) {
    return this.values.get(name) ?? null
  }

  setItem(name: string, value: string) {
    this.writes += 1
    this.values.set(name, value)
  }

  removeItem(name: string) {
    this.values.delete(name)
  }
}

const sharedStorage = () => {
  const storage = new SharedStorage()
  const values = storage.values

  return {
    storage,
    writes: () => storage.writes,
    read: () =>
      JSON.parse(values.get(SETTINGS_STORAGE_KEY) ?? '{}') as {
        state?: Record<string, unknown>
        version?: number
      },
    seed: (state: unknown) => {
      values.set(SETTINGS_STORAGE_KEY, JSON.stringify({ state, version: 1 }))
    },
  }
}

describe('settings slice', () => {
  it('defaults to hiding field types', () => {
    expect(createAGIStore().getState().showFieldTypes).toBe(false)
  })

  it('sets and toggles', () => {
    const store = createAGIStore()

    store.getState().setShowFieldTypes(true)
    expect(store.getState().showFieldTypes).toBe(true)

    store.getState().toggleShowFieldTypes()
    expect(store.getState().showFieldTypes).toBe(false)

    store.getState().toggleShowFieldTypes()
    store.getState().toggleShowFieldTypes()
    expect(store.getState().showFieldTypes).toBe(false)
  })
})

describe('settings persistence', () => {
  it('carries preferences to the next store on the same storage', () => {
    const { storage } = sharedStorage()

    createAGIStore({ storage }).getState().setShowFieldTypes(true)

    expect(createAGIStore({ storage }).getState().showFieldTypes).toBe(true)
  })

  // The allowlist is what keeps a GraphQLSchema instance, and document state
  // that will belong to tabs later, out of storage.
  it('writes preferences and nothing else', () => {
    const { storage, read } = sharedStorage()
    const store = createAGIStore({ storage })

    store.getState().setQuery('{ testField }')
    store.getState().setShowFieldTypes(true)

    expect(Object.keys(read().state ?? {}).sort()).toEqual([
      'objectFieldInsertionMode',
      'showFieldTypes',
    ])
  })

  it('falls back to defaults when a stored value is malformed', () => {
    const { storage, seed } = sharedStorage()
    seed({ showFieldTypes: 'yes please', objectFieldInsertionMode: 'nonsense' })

    const state = createAGIStore({ storage }).getState()

    expect(state.showFieldTypes).toBe(false)
    expect(state.objectFieldInsertionMode).toBe('typename')
  })

  it('keeps a valid neighbour when one stored value is malformed', () => {
    const { storage, seed } = sharedStorage()
    seed({ showFieldTypes: true, objectFieldInsertionMode: 'nonsense' })

    const state = createAGIStore({ storage }).getState()

    expect(state.showFieldTypes).toBe(true)
    expect(state.objectFieldInsertionMode).toBe('typename')
  })

  // persist writes after every state change, so without deduping, typing in the
  // editor would write an identical payload on every keystroke.
  it('does not write when the persisted values did not change', () => {
    const { storage, writes } = sharedStorage()
    const store = createAGIStore({ storage })

    store.getState().setShowFieldTypes(true)
    const afterRealChange = writes()

    for (const char of 'query { hello }') store.getState().setQuery(char)

    expect(writes()).toBe(afterRealChange)
  })

  it('touches no storage when persistence is off', () => {
    const { storage, read } = sharedStorage()

    createAGIStore({ persist: false, storage })
      .getState()
      .setShowFieldTypes(true)

    expect(read().state).toBeUndefined()
  })
})
