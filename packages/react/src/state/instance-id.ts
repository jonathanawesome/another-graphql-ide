import type { AppState } from '@another-graphql-ide/state'
import type { StoreApi } from 'zustand/vanilla'

import { useAGIStore } from './agi-store-context'

/** Marks a brick's root so the shortcut bus can tell which instance an element belongs to. */
export const INSTANCE_ATTR = 'data-agi-instance'

// Keyed by store, not provider: two providers sharing a store are one instance.
const ids = new WeakMap<StoreApi<AppState>, string>()
let next = 0

const instanceIdFor = (store: StoreApi<AppState>) => {
  let id = ids.get(store)
  if (!id) {
    id = `agi-${++next}`
    ids.set(store, id)
  }
  return id
}

export const useInstanceId = () => instanceIdFor(useAGIStore())

/** Spread onto a brick's root element. */
export const useInstanceAttr = () => ({ [INSTANCE_ATTR]: useInstanceId() })
