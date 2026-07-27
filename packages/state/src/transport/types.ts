import type { GraphQLSchema } from 'graphql'

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
  /**
   * Yielded results may be a single accumulator mutated in place, so a caller
   * holding onto one across chunks must copy it.
   */
  execute: (
    request: GraphQLRequest,
    options?: { signal?: AbortSignal }
  ) => AsyncIterable<ExecutionResult>
}

export type CreateTransportOptions = {
  endpoint: string
  schema?: GraphQLSchema
  headers?: Record<string, string>
  /** Swapped into the HTTP executor, for auth wrappers and test doubles. */
  fetch?: typeof globalThis.fetch
}

export type TransportFactory = (options: CreateTransportOptions) => Transport
