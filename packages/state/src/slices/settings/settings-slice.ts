import type { AppSliceCreator } from '../../store/types'

import type { SettingsSlice } from './types'

export const createSettingsSlice: AppSliceCreator<SettingsSlice> = set => ({
  objectFieldInsertionMode: 'typename',
  setObjectFieldInsertionMode: objectFieldInsertionMode =>
    set({ objectFieldInsertionMode }),

  showFieldTypes: false,
  setShowFieldTypes: showFieldTypes => set({ showFieldTypes }),
  toggleShowFieldTypes: () =>
    set(state => ({ showFieldTypes: !state.showFieldTypes })),

  theme: 'system',
  setTheme: theme => set({ theme }),
})
