import { createAGIStore, type AppState } from '@another-graphql-ide/state'
import { useStore } from 'zustand'

import { useAGIStore } from './agi-store-context'

// Enumerated from a throwaway store rather than hardcoded, so a new slice field
// cannot silently end up without a hook. persist:false keeps it off storage, and
// only the key names survive.
const STATE_KEYS = new Set(
  Object.keys(createAGIStore({ persist: false }).getInitialState())
)

const hooks = new Map<string, () => unknown>()

const hookFor = (key: keyof AppState) => {
  const cached = hooks.get(key)
  if (cached) return cached

  // Selector hoisted per key so its identity is stable across renders.
  const selector = (state: AppState) => state[key]
  const useSelected = () => useStore(useAGIStore(), selector)

  hooks.set(key, useSelected)
  return useSelected
}

type StateHooks = { [K in keyof AppState]-?: () => AppState[K] }

/**
 * `useAppStore.use.query()` reads one key off the store the nearest AGIProvider
 * created. A Proxy rather than a precomputed map because there is no longer a
 * module-level store to build hooks from.
 */
export const useAppStore = {
  use: new Proxy({} as StateHooks, {
    // Allow-listed because `then` is a plain string key: returning a function
    // for it would make this object thenable, so awaiting it anywhere would
    // call a hook outside React. Same for toJSON, constructor and friends,
    // which test reporters probe when printing a failed assertion.
    get: (_target, key) =>
      typeof key === 'string' && STATE_KEYS.has(key)
        ? hookFor(key as keyof AppState)
        : undefined,
  }),
}
