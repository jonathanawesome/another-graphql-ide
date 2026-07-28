import type {
  ExecutionResult,
  GraphQLRequest,
  Transport,
} from '../transport/types'

export type RunOutcome = 'completed' | 'aborted' | 'error'

export type RunEvents = {
  onResult: (result: ExecutionResult) => void
  onError: (message: string) => void
}

/**
 * Streams one request, leaving the caller to decide where results land. Shared
 * by the store's execute() and the React useOperation hook so abort and error
 * handling exist once.
 */
export const runRequest = async (
  transport: Transport,
  request: GraphQLRequest,
  signal: AbortSignal,
  { onResult, onError }: RunEvents
): Promise<RunOutcome> => {
  try {
    for await (const result of transport.execute(request, { signal })) {
      if (signal.aborted) return 'aborted'
      onResult(result)
    }

    return signal.aborted ? 'aborted' : 'completed'
  } catch (error) {
    if (signal.aborted) return 'aborted'

    onError(error instanceof Error ? error.message : String(error))
    return 'error'
  }
}
