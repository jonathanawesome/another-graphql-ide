import type { StateCreator } from 'zustand/vanilla'

import type { DocumentSlice } from '../slices/document/types'
import type { ExecutionSlice } from '../slices/execution/types'
import type { SchemaSlice } from '../slices/schema/types'
import type { SettingsSlice } from '../slices/settings/types'
import type { CreateTransportOptions, Transport } from '../transport/types'

export type TransportAccess = {
  /**
   * Transport for the current connection, rebuilt per call so endpoint and
   * header edits apply without recreating the store. Overrides let a single
   * operation target a different connection than the rest of the store.
   */
  getTransport: (overrides?: Partial<CreateTransportOptions>) => Transport
}

export type AppState = DocumentSlice &
  ExecutionSlice &
  SchemaSlice &
  SettingsSlice &
  TransportAccess

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
