import type { AppState } from '@another-graphql-ide/state'
import { createContext, useContext } from 'react'
import type { StoreApi } from 'zustand/vanilla'

// Its own file: a context exported alongside a component breaks Fast Refresh.
export const AGIStoreContext = createContext<StoreApi<AppState> | null>(null)

/**
 * The store the nearest provider created. Throws rather than falling back to a
 * shared instance, which would silently reintroduce the cross-instance bleed a
 * scoped store exists to remove.
 */
export const useAGIStore = (): StoreApi<AppState> => {
  const store = useContext(AGIStoreContext)

  if (!store) {
    throw new Error('AGI components must be rendered inside an <AGIProvider>.')
  }

  return store
}
