import { createStore } from 'zustand/vanilla'

import { createDocumentSlice } from '../slices/document/document-slice'
import { createExecutionSlice } from '../slices/execution/execution-slice'

import type { AppState } from './types'

export const createAppStore = () =>
  createStore<AppState>()((...args) => ({
    ...createDocumentSlice(...args),
    ...createExecutionSlice(...args),
  }))

// Shared singleton store instance.
export const appStore = createAppStore()
