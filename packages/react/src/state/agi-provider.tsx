import {
  createAGIStore,
  type AppState,
  type Theme,
  type Transport,
  type TransportFactory,
} from '@another-graphql-ide/state'
import type { GraphQLSchema } from 'graphql'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { StateStorage } from 'zustand/middleware'
import type { StoreApi } from 'zustand/vanilla'

import { ThemeProvider } from '../style/theme-provider'

import { AGIStoreContext } from './agi-store-context'

type ProviderConfig = {
  endpoint?: string
  headers?: Record<string, string>
  schema?: GraphQLSchema
  /** Introspect the endpoint on mount and when it changes. Skipped when a schema prop is given. */
  autoConnect?: boolean
  /** Seeded once. Later changes are ignored so edits are never clobbered. */
  defaultQuery?: string
  defaultVariables?: string
  defaultTheme?: Theme
  /** Replaces endpoint-based transport selection. */
  transport?: Transport | TransportFactory
  fetch?: typeof globalThis.fetch
  persist?: boolean
  storage?: StateStorage
  /** Override when two IDEs share an origin, or their settings collide. */
  storageKey?: string
}

export type AGIProviderProps = {
  children: ReactNode
  /** Set false when the host owns theming. */
  theme?: boolean
} & (
  | ({ store: StoreApi<AppState> } & { [K in keyof ProviderConfig]?: never })
  | ({ store?: never } & ProviderConfig)
)

const shallowEqual = (
  a: Record<string, string> | undefined,
  b: Record<string, string> | undefined
) => {
  if (a === b) return true
  if (!a || !b) return false

  const keys = Object.keys(a)
  return (
    keys.length === Object.keys(b).length &&
    keys.every(key => a[key] === b[key])
  )
}

/**
 * Creates the store every AGI component reads, and supplies the ThemeProvider
 * they need. Config props seed the store once; endpoint, headers and schema also
 * follow later prop changes.
 */
export const AGIProvider = ({
  children,
  theme = true,
  store: providedStore,
  endpoint,
  headers,
  schema,
  autoConnect,
  defaultQuery,
  defaultVariables,
  defaultTheme,
  transport,
  fetch,
  persist,
  storage,
  storageKey,
}: AGIProviderProps) => {
  // Built unconditionally so the hook order never depends on a prop, then
  // discarded when the caller brought their own. Reading `store` off state
  // instead would freeze the first one passed.
  const [ownStore] = useState(() =>
    createAGIStore({
      persist,
      storage,
      storageKey,
      transport,
      fetch,
      initialState: {
        endpoint,
        headers,
        schema,
        query: defaultQuery,
        variables: defaultVariables,
        theme: defaultTheme,
      },
    })
  )

  const store = providedStore ?? ownStore
  const synced = useRef({ endpoint, headers, schema })

  useEffect(() => {
    // Compared against the previous prop, not against store state: comparing
    // against state would re-assert the prop over a user's own edits.
    const previous = synced.current
    synced.current = { endpoint, headers, schema }

    if (providedStore) return

    if (endpoint !== undefined && endpoint !== previous.endpoint) {
      store.getState().setEndpoint(endpoint)
    }

    if (headers !== undefined && !shallowEqual(headers, previous.headers)) {
      store.getState().setHeaders(headers)
    }

    // Guarded on undefined because setSchema accepts it, so an omitted or
    // still-loading prop would otherwise wipe a schema the user connected to.
    if (schema !== undefined && schema !== previous.schema) {
      store.getState().setSchema(schema)
      store.setState({ schemaStatus: 'connected' })
    }
  }, [store, providedStore, endpoint, headers, schema])

  // Declared after the sync above, so the store already holds a new endpoint.
  // The props type rules out autoConnect alongside a provided store.
  useEffect(() => {
    if (!autoConnect || schema) return
    void store.getState().connect()
  }, [autoConnect, schema, store, endpoint])

  return (
    <AGIStoreContext.Provider value={store}>
      {theme ? <ThemeProvider>{children}</ThemeProvider> : children}
    </AGIStoreContext.Provider>
  )
}
