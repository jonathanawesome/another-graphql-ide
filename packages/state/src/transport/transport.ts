import { normalizedExecutor } from '@graphql-tools/executor'
import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import {
  mergeIncrementalResult,
  type ExecutionResult as ToolsExecutionResult,
} from '@graphql-tools/utils'
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
  /** Swapped into the HTTP executor, for auth wrappers and test doubles. */
  fetch?: typeof globalThis.fetch
}

export type TransportFactory = (options: CreateTransportOptions) => Transport

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
  fetch,
}: Omit<CreateTransportOptions, 'schema'>): Transport => {
  // headers as a function reapplies them per attempt; retry left unset so there
  // is no auto-retry (avoids the header-drop bug; never re-fires mutations).
  // Two call sites because buildHTTPExecutor has no overload taking an optional
  // fetch: it is either required or omitted entirely.
  const executor = fetch
    ? buildHTTPExecutor({ endpoint, headers: () => headers, fetch })
    : buildHTTPExecutor({ endpoint, headers: () => headers })

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
  schema?: GraphQLSchema
}): Transport => ({
  async *execute(request, options) {
    // Fail loudly rather than degrade to an HTTP fetch of the 'local' sentinel.
    if (!schema) {
      throw new Error(
        'Local execution requires a loaded schema. Pass a schema, or connect to an endpoint.'
      )
    }
    const outcome = await normalizedExecutor({
      schema,
      document: parse(request.query),
      variableValues: request.variables,
      operationName: request.operationName,
      signal: options?.signal,
    })

    if (!isAsyncIterable<ExecutionResult>(outcome)) {
      yield outcome as ExecutionResult
      return
    }

    // buildHTTPExecutor merges incremental payloads for us; normalizedExecutor
    // yields raw patches, so match it here rather than in every caller.
    // Accumulator is graphql-tools' stricter result type, which the merge
    // helper requires and which widens back to ours on the way out.
    let merged: ToolsExecutionResult | null = null
    let started = false

    for await (const part of outcome) {
      if (!started) {
        started = true
        // Only incremental delivery marks payloads with hasNext. Subscription
        // events are independent and must not be merged (errors would stack).
        if (part.hasNext !== undefined) merged = {}
      }

      if (merged) {
        mergeIncrementalResult({
          incrementalResult: part,
          executionResult: merged,
        })
        yield merged
      } else {
        yield part
      }
    }
  },
})

/**
 * Picks a transport by endpoint. The local sentinel always runs in-process (and
 * errors if no schema is loaded); anything else goes over HTTP. Keying on the
 * sentinel, not on schema-presence, means a real endpoint stays on HTTP even
 * after introspection loads a schema into state.
 */
export const createTransport = ({
  endpoint,
  schema,
  headers,
  fetch,
}: CreateTransportOptions): Transport =>
  endpoint === LOCAL_ENDPOINT
    ? createLocalTransport({ schema })
    : createHTTPTransport({ endpoint, headers, fetch })
