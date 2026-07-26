import {
  createJSONStorage,
  type PersistOptions,
  type StateStorage,
} from 'zustand/middleware'

import type { AppState } from './types'

/**
 * Where preferences live. Named for its contents, not for the library, because
 * later concerns get their own keys rather than joining this one: separate keys
 * version and migrate independently, and clearing preferences should not touch
 * documents. Spelled out in full since the origin is shared with the host app.
 */
export const SETTINGS_STORAGE_KEY = 'another-graphql-ide-settings'

/**
 * What survives a reload: user preferences, nothing else.
 *
 * An allowlist rather than a denylist, for two reasons. `schema` holds a
 * GraphQLSchema instance that would come back from JSON as a useless object,
 * and document-scoped state (query, endpoint, headers) belongs to the tab model
 * this library does not have yet, so persisting it flat now would build a
 * migration we would have to unwind later.
 */
type PersistedSettings = Pick<
  AppState,
  'objectFieldInsertionMode' | 'showFieldTypes'
>

const partialize = (state: AppState): PersistedSettings => ({
  objectFieldInsertionMode: state.objectFieldInsertionMode,
  showFieldTypes: state.showFieldTypes,
})

/**
 * Stored values are untrusted input: they can be stale from an older release or
 * hand-edited in devtools. Anything that does not typecheck is dropped so the
 * default wins, rather than landing in state and leaving the UI somewhere it
 * cannot represent (a radio group with nothing selected).
 */
const validSettings = (persisted: unknown): Partial<PersistedSettings> => {
  if (typeof persisted !== 'object' || persisted === null) return {}

  const candidate = persisted as Record<string, unknown>
  const valid: Partial<PersistedSettings> = {}

  if (
    candidate.objectFieldInsertionMode === 'typename' ||
    candidate.objectFieldInsertionMode === 'bare'
  ) {
    valid.objectFieldInsertionMode = candidate.objectFieldInsertionMode
  }

  if (typeof candidate.showFieldTypes === 'boolean') {
    valid.showFieldTypes = candidate.showFieldTypes
  }

  return valid
}

/**
 * persist writes after every state change, not just after a change to what it
 * persists, so typing in the editor would hit storage on every keystroke with a
 * byte-identical payload. Drop writes that would not change anything.
 *
 * The tradeoff is with another tab: if it wrote something different, this tab
 * will not re-assert an identical-to-its-last value. There is no cross-tab sync
 * either way, so both behaviors are last-writer-wins.
 */
const skipUnchangedWrites = (storage: StateStorage): StateStorage => {
  let lastWritten: string | undefined

  // Delegate explicitly rather than spreading: localStorage keeps its methods
  // on the prototype, so a spread copies the stored entries and none of the
  // API, and zustand swallows the resulting hydration failure.
  return {
    getItem: name => storage.getItem(name),
    removeItem: name => storage.removeItem(name),
    setItem: (name, value) => {
      if (value === lastWritten) return
      lastWritten = value
      return storage.setItem(name, value)
    },
  }
}

/**
 * In-memory fallback so a non-browser host (tests, SSR) neither warns nor
 * writes. Built per store, so two stores do not share a backing map unless a
 * caller hands them one.
 */
export const createMemoryStorage = (): StateStorage => {
  const values = new Map<string, string>()

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

export type PersistSettingsOptions = {
  /** Where to read and write. Defaults to localStorage in a browser. */
  storage?: StateStorage
  /** Override when more than one IDE shares an origin. */
  storageKey?: string
}

export const settingsPersistOptions = ({
  storage,
  storageKey = SETTINGS_STORAGE_KEY,
}: PersistSettingsOptions = {}): PersistOptions<
  AppState,
  PersistedSettings
> => ({
  name: storageKey,
  // Bumping this without also supplying `migrate` discards whatever is stored
  // and falls back to defaults, which zustand reports only as a console error.
  version: 1,
  storage: createJSONStorage(() =>
    skipUnchangedWrites(
      storage ??
        (typeof localStorage === 'undefined'
          ? createMemoryStorage()
          : localStorage)
    )
  ),
  partialize,
  merge: (persisted, current) => ({ ...current, ...validSettings(persisted) }),
})
