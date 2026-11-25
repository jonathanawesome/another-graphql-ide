import { useEffect, useState } from 'react'

import type {
  ComparisonRequest,
  ComparisonResult,
} from './compare/run-comparison'
import { startComparison } from './compare/start-comparison'
import type { Tokens } from './compare/unify-tokens'

type State = {
  /** Counts comparisons, to tell one result from the next. */
  id: number
  request?: ComparisonRequest
  result?: ComparisonResult
  tokens?: Tokens
}

/** The diff of two documents, and then its colors. Nothing while it runs. */
export const useSdlComparison = (
  { before, after, context }: ComparisonRequest,
  enabled: boolean
) => {
  const [state, setState] = useState<State>({ id: 0 })

  useEffect(() => {
    if (!enabled) return
    const request = { before, after, context }
    return startComparison(request, {
      onResult: result =>
        setState(({ id }) => ({ id: id + 1, request, result })),
      onTokens: tokens => setState(last => ({ ...last, tokens })),
    })
  }, [before, after, context, enabled])

  const { id, request, result, tokens } = state
  const current =
    enabled &&
    request?.before === before &&
    request.after === after &&
    request.context === context
  return current ? { id, result, tokens } : { id, result: undefined }
}
