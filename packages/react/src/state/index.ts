export { AGIProvider } from './agi-provider'
export type { AGIProviderProps } from './agi-provider'
export { AGIStoreContext, useAGIStore } from './agi-store-context'
export { useAppStore } from './use-app-store'
// Spread onto a custom brick's root so shortcuts route to its instance.
export { useInstanceAttr } from './instance-id'
export { useOperation } from './use-operation'
export type { UseOperationOptions, UseOperationResult } from './use-operation'

// Re-exported so a consumer writing a fetch wrapper or a custom transport never
// has to depend on the state package directly.
export { LOCAL_ENDPOINT } from '@another-graphql-ide/state'
export type {
  AGIInitialState,
  AppState,
  CreateTransportOptions,
  ExecutionResult,
  ExecutionStatus,
  GraphQLRequest,
  SchemaStatus,
  Theme,
  Transport,
  TransportFactory,
} from '@another-graphql-ide/state'
