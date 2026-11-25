import {
  runComparison,
  type ComparisonRequest,
  type ComparisonResult,
} from './run-comparison'
import type { Tokens } from './unify-tokens'

export type WorkerReply = { result: ComparisonResult } | { tokens: Tokens }

const reply = (message: WorkerReply) => postMessage(message)

addEventListener('message', (event: MessageEvent<ComparisonRequest>) => {
  const { result, tokens } = runComparison(event.data)
  reply({ result })
  if (!tokens) return
  const { from, to, kinds } = tokens()
  // Transferred, as these run to millions of entries.
  postMessage({ tokens: { from, to, kinds } } satisfies WorkerReply, {
    transfer: [from.buffer, to.buffer, kinds.buffer],
  })
})
