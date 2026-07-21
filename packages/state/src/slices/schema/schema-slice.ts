import type { StateCreator } from 'zustand/vanilla'

import type { AppState } from '../../store/types'

import type { SchemaSlice } from './types'

export const createSchemaSlice: StateCreator<AppState, [], [], SchemaSlice> =
  set => ({
    schema: undefined,
    setSchema: schema => set({ schema }),
  })
