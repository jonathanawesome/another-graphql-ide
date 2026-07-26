import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { createDocumentSlice } from '../slices/document/document-slice'
import { createExecutionSlice } from '../slices/execution/execution-slice'
import { createSchemaSlice } from '../slices/schema/schema-slice'
import { createSettingsSlice } from '../slices/settings/settings-slice'

import {
  createMemoryStorage,
  settingsPersistOptions,
  type PersistSettingsOptions,
} from './persist-settings'
import type { AppState } from './types'

export type CreateAGIStoreOptions = PersistSettingsOptions & {
  /**
   * Set false to leave the host's storage alone. State still works, it just has
   * nowhere to survive to.
   *
   * Only reaches a consumer building their own store: the React components bind
   * the `appStore` singleton below, which is created at import with defaults.
   * Opting those out means letting a provider supply the store, which this
   * library does not do yet.
   */
  persist?: boolean
}

/**
 * The store, with user preferences persisted. Persistence is wired here rather
 * than in a slice so there is one place that decides what leaves memory.
 */
export const createAGIStore = ({
  persist: shouldPersist = true,
  storage,
  storageKey,
}: CreateAGIStoreOptions = {}) =>
  createStore<AppState>()(
    persist(
      (...args) => ({
        ...createDocumentSlice(...args),
        ...createExecutionSlice(...args),
        ...createSchemaSlice(...args),
        ...createSettingsSlice(...args),
      }),
      settingsPersistOptions({
        // Opting out swaps the backing store rather than dropping the
        // middleware, so the store's type and behavior stay identical either
        // way and only the destination changes.
        storage: shouldPersist ? storage : createMemoryStorage(),
        storageKey,
      })
    )
  )

// Shared singleton store instance.
export const appStore = createAGIStore()
