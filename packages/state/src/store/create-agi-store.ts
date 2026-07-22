import { createStore } from 'zustand/vanilla'

import { createDocumentSlice } from '../slices/document/document-slice'
import { createExecutionSlice } from '../slices/execution/execution-slice'
import { createSchemaSlice } from '../slices/schema/schema-slice'
import { createSettingsSlice } from '../slices/settings/settings-slice'

import type { AppState } from './types'

export const createAGIStore = () =>
  createStore<AppState>()((...args) => ({
    ...createDocumentSlice(...args),
    ...createExecutionSlice(...args),
    ...createSchemaSlice(...args),
    ...createSettingsSlice(...args),
  }))

// Shared singleton store instance.
export const appStore = createAGIStore()
