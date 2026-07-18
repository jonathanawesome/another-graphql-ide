export type GraphQLRequest = {
  query: string
  variables?: Record<string, unknown>
  operationName?: string
}

export type ExecutionResult = {
  data?: unknown
  errors?: readonly unknown[]
  extensions?: unknown
  hasNext?: boolean
  incremental?: readonly unknown[]
}

export type Transport = {
  execute: (
    request: GraphQLRequest,
    options?: { signal?: AbortSignal }
  ) => AsyncIterable<ExecutionResult>
}
