import type { DocumentSlice } from '../slices/document/types'
import type { ExecutionSlice } from '../slices/execution/types'

export type AppState = DocumentSlice & ExecutionSlice
