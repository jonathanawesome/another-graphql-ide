import type { StateCreator } from 'zustand/vanilla'

import type { AppState } from '../../store/types'

import { computeToggle } from './toggle-field'
import type { DocumentSlice } from './types'

export const createDocumentSlice: StateCreator<
  AppState,
  [],
  [],
  DocumentSlice
> = (set, get) => ({
  query: '',
  variables: '',
  operationName: undefined,
  cursor: 0,
  pendingSelection: undefined,
  setQuery: query => set({ query }),
  setVariables: variables => set({ variables }),
  setOperationName: operationName => set({ operationName }),
  setCursor: cursor => set({ cursor }),
  toggleField: target => {
    const { query, cursor, schema, objectFieldInsertionMode } = get()
    if (!schema) return

    const result = computeToggle({
      query,
      cursor,
      schema,
      target,
      mode: objectFieldInsertionMode,
    })
    if (result.query === query && result.selection === undefined) return

    if (result.selection === undefined) {
      set({ query: result.query })
      return
    }
    const nonce = (get().pendingSelection?.nonce ?? 0) + 1
    set({
      query: result.query,
      pendingSelection: { offset: result.selection, nonce },
    })
  },
})
