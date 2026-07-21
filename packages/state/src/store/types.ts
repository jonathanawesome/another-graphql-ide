import type { DocumentSlice } from '../slices/document/types'
import type { ExecutionSlice } from '../slices/execution/types'
import type { SchemaSlice } from '../slices/schema/types'
import type { SettingsSlice } from '../slices/settings/types'

export type AppState = DocumentSlice &
  ExecutionSlice &
  SchemaSlice &
  SettingsSlice
