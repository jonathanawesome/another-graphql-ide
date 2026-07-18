import { useStore } from 'zustand'
import type { StoreApi } from 'zustand/vanilla'

type WithSelectors<T> = { use: { [K in keyof T]-?: () => T[K] } }

/**
 * Attaches a `use.<field>()` React hook per state key, backed by useStore over
 * the vanilla store. The React binding for the agnostic state core.
 */
export const createSelectors = <T extends object>(
  store: StoreApi<T>
): StoreApi<T> & WithSelectors<T> => {
  const use: Record<string, () => unknown> = {}
  for (const key of Object.keys(store.getState())) {
    use[key] = () => useStore(store, state => state[key as keyof T])
  }
  return Object.assign(store, { use }) as StoreApi<T> & WithSelectors<T>
}
