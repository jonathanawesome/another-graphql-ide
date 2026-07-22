import { normalizedExecutor } from '@graphql-tools/executor'
import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { parse, type GraphQLSchema } from 'graphql'

import type { ExecutionResult, Transport } from './types'

/**
 * Sentinel endpoint that runs operations in-process against the loaded schema
 * instead of over HTTP. Used where there is no server to reach (e.g. the static
 * GitHub Pages build), so the play button still works offline.
 */
export const LOCAL_ENDPOINT = 'local'

export type CreateTransportOptions = {
  endpoint: string
  schema?: GraphQLSchema
  headers?: Record<string, string>
}

const isAsyncIterable = <T>(value: unknown): value is AsyncIterable<T> =>
  typeof value === 'object' && value !== null && Symbol.asyncIterator in value

/**
 * Wraps a single buildHTTPExecutor. One fetch-based executor handles JSON,
 * multipart incremental delivery (@defer/@stream), and SSE subscriptions,
 * normalized to an async iterable.
 */
const createHTTPTransport = ({
  endpoint,
  headers = {},
}: Omit<CreateTransportOptions, 'schema'>): Transport => {
  // headers as a function reapplies them per attempt; retry left unset so there
  // is no auto-retry (avoids the header-drop bug; never re-fires mutations).
  const executor = buildHTTPExecutor({ endpoint, headers: () => headers })

  return {
    async *execute(request, options) {
      const outcome = await executor({
        document: parse(request.query),
        variables: request.variables,
        operationName: request.operationName,
        signal: options?.signal,
      })

      if (isAsyncIterable<ExecutionResult>(outcome)) {
        yield* outcome
      } else {
        yield outcome as ExecutionResult
      }
    },
  }
}

/**
 * Runs operations in-process against an in-memory schema. normalizedExecutor is
 * the same primitive graphql-yoga uses, so query/mutation/subscription and
 * @defer/@stream incremental delivery all normalize to the same async iterable
 * the HTTP transport yields, minus the network hop.
 */
const createLocalTransport = ({
  schema,
}: {
  schema: GraphQLSchema
}): Transport => ({
  async *execute(request, options) {
    const outcome = await normalizedExecutor({
      schema,
      document: parse(request.query),
      variableValues: request.variables,
      operationName: request.operationName,
      signal: options?.signal,
    })

    if (isAsyncIterable<ExecutionResult>(outcome)) {
      yield* outcome
    } else {
      yield outcome as ExecutionResult
    }
  },
})

/**
 * Picks a transport by endpoint. The local sentinel (with a loaded schema) runs
 * in-process; anything else goes over HTTP.
 */
export const createTransport = ({
  endpoint,
  schema,
  headers,
}: CreateTransportOptions): Transport =>
  endpoint === LOCAL_ENDPOINT && schema
    ? createLocalTransport({ schema })
    : createHTTPTransport({ endpoint, headers })
