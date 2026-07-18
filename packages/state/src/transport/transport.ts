import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { parse } from 'graphql'

import type { ExecutionResult, Transport } from './types'

export type CreateTransportOptions = {
  endpoint: string
  headers?: Record<string, string>
}

const isAsyncIterable = <T>(value: unknown): value is AsyncIterable<T> =>
  typeof value === 'object' && value !== null && Symbol.asyncIterator in value

/**
 * Wraps a single buildHTTPExecutor. One fetch-based executor handles JSON,
 * multipart incremental delivery (@defer/@stream), and SSE subscriptions,
 * normalized to an async iterable.
 */
export const createTransport = ({
  endpoint,
  headers = {},
}: CreateTransportOptions): Transport => {
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
