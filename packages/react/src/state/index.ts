import { appStore } from '@another-graphql-ide/state'

import { createSelectors } from './create-selectors'

export const useAppStore = createSelectors(appStore)

export type {
  AppState,
  ExecutionStatus,
} from '@another-graphql-ide/state'
