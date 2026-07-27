import {
  createAGIStore,
  type AGIInitialState,
  type AppState,
  type CreateAGIStoreOptions,
} from '@another-graphql-ide/state'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import type { StoreApi } from 'zustand/vanilla'

import { AGIProvider } from '../state/agi-provider'

/**
 * Memory-backed by default: jsdom shares one localStorage per file, so
 * persisted settings would otherwise leak between tests.
 */
export const createTestStore = (
  initialState?: AGIInitialState,
  options?: Omit<CreateAGIStoreOptions, 'initialState'>
): StoreApi<AppState> =>
  createAGIStore({ persist: false, ...options, initialState })

type RenderWithProviderOptions = RenderOptions & {
  store?: StoreApi<AppState>
}

export const renderWithProvider = (
  ui: ReactElement,
  { store = createTestStore(), ...options }: RenderWithProviderOptions = {}
) => ({
  store,
  ...render(ui, {
    wrapper: ({ children }) => (
      <AGIProvider store={store}>{children}</AGIProvider>
    ),
    ...options,
  }),
})
