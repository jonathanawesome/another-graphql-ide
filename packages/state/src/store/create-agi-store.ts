import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { createDocumentSlice } from '../slices/document/document-slice'
import { createExecutionSlice } from '../slices/execution/execution-slice'
import { createSchemaSlice } from '../slices/schema/schema-slice'
import { createSettingsSlice } from '../slices/settings/settings-slice'
import { createTransport } from '../transport/transport'
import type { Transport, TransportFactory } from '../transport/types'

import {
  createMemoryStorage,
  settingsPersistOptions,
  type PersistSettingsOptions,
} from './persist-settings'
import type { AppState } from './types'

/**
 * State a host can seed at creation.
 *
 * Excludes anything the app owns rather than the host. `status`, `response` and
 * `error` are outputs. `cursor` and `operationName` look like config but the
 * editor overwrites both on mount, since createEditorView fires its selection
 * and active-operation callbacks while constructing the view.
 */
export type AGIInitialState = Partial<
  Pick<
    AppState,
    | 'endpoint'
    | 'headers'
    | 'query'
    | 'variables'
    | 'schema'
    | 'theme'
    | 'objectFieldInsertionMode'
    | 'showFieldTypes'
  >
>

export type CreateAGIStoreOptions = PersistSettingsOptions & {
  /**
   * Set false to leave the host's storage alone. State still works, it just has
   * nowhere to survive to.
   */
  persist?: boolean
  /**
   * Seeded inside the creator rather than applied afterwards: persist wraps
   * setState, so a later write would hit storage and desync getInitialState.
   * Persisted settings still win, since hydration merges over this.
   */
  initialState?: AGIInitialState
  /**
   * Replaces endpoint-based selection. The static form ignores endpoint,
   * headers and fetch; prefer the factory form, which receives them.
   */
  transport?: Transport | TransportFactory
  /** Swapped into the default HTTP transport. */
  fetch?: typeof globalThis.fetch
}

// JSX hands over `endpoint={undefined}` routinely, and spreading that would
// clobber the slice defaults. Entries are widened to unknown because the
// optional-property types claim a value can never be undefined, which is true
// of the type and not of the object.
const definedOnly = (seed: AGIInitialState): AGIInitialState =>
  Object.fromEntries(
    Object.entries(seed as Record<string, unknown>).filter(
      ([, value]) => value !== undefined
    )
  )

/**
 * The store, with user preferences persisted. Persistence is wired here rather
 * than in a slice so there is one place that decides what leaves memory.
 */
export const createAGIStore = ({
  persist: shouldPersist = true,
  storage,
  storageKey,
  initialState,
  transport,
  fetch,
}: CreateAGIStoreOptions = {}) =>
  createStore<AppState>()(
    persist(
      (set, get, api) => {
        const seed = definedOnly(initialState ?? {})

        return {
          ...createDocumentSlice(set, get, api),
          ...createExecutionSlice(set, get, api),
          ...createSchemaSlice(set, get, api),
          ...createSettingsSlice(set, get, api),

          getTransport: overrides => {
            const { endpoint, headers, schema } = get()
            const options = { endpoint, headers, schema, fetch, ...overrides }

            // Transport is an object with an execute method, so a function is
            // unambiguously the factory form.
            if (typeof transport === 'function') return transport(options)
            return transport ?? createTransport(options)
          },

          ...seed,
          // A seeded schema is loaded by definition, so the connection bar
          // should not read "not connected" beside a working editor.
          ...(seed.schema ? { schemaStatus: 'connected' as const } : {}),
        }
      },
      settingsPersistOptions({
        // Opting out swaps the backing store rather than dropping the
        // middleware, so the store's type and behavior stay identical either
        // way and only the destination changes.
        storage: shouldPersist ? storage : createMemoryStorage(),
        storageKey,
      })
    )
  )
