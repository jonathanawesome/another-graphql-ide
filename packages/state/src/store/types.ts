import type { StateCreator } from 'zustand/vanilla'

import type { DocumentSlice } from '../slices/document/types'
import type { ExecutionSlice } from '../slices/execution/types'
import type { SchemaSlice } from '../slices/schema/types'
import type { SettingsSlice } from '../slices/settings/types'

export type AppState = DocumentSlice &
  ExecutionSlice &
  SchemaSlice &
  SettingsSlice

/**
 * How every slice is typed. The persist mutator has to be declared here so a
 * slice's `set` matches the one the middleware hands it; without it each slice
 * would report a mismatched signature at the composition site.
 */
export type AppSliceCreator<Slice> = StateCreator<
  AppState,
  [['zustand/persist', unknown]],
  [],
  Slice
>
