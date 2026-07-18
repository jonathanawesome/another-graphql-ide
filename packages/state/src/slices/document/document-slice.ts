import type { StateCreator } from 'zustand/vanilla'

import type { AppState } from '../../store/types'

import type { DocumentSlice } from './types'

export const createDocumentSlice: StateCreator<
  AppState,
  [],
  [],
  DocumentSlice
> = set => ({
  query: '',
  variables: '',
  operationName: undefined,
  setQuery: query => set({ query }),
  setVariables: variables => set({ variables }),
  setOperationName: operationName => set({ operationName }),
})
