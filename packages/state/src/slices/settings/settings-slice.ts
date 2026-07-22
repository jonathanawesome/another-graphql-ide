import type { StateCreator } from 'zustand/vanilla'

import type { AppState } from '../../store/types'

import type { SettingsSlice } from './types'

export const createSettingsSlice: StateCreator<
  AppState,
  [],
  [],
  SettingsSlice
> = set => ({
  objectFieldInsertionMode: 'typename',
  setObjectFieldInsertionMode: objectFieldInsertionMode =>
    set({ objectFieldInsertionMode }),
})
