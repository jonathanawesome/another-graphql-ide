import { transferables, type DiffDetails } from './diff-details'
import {
  runComparison,
  type ComparisonRequest,
  type ComparisonResult,
} from './run-comparison'

export type WorkerReply =
  { result: ComparisonResult } | { details: DiffDetails }

const reply = (message: WorkerReply, transfer: Transferable[] = []) =>
  postMessage(message, { transfer })

addEventListener('message', (event: MessageEvent<ComparisonRequest>) => {
  const { result, details: makeDetails } = runComparison(event.data)
  reply({ result })
  if (!makeDetails) return
  const details = makeDetails()
  // Transferred, as these run to millions of entries.
  reply({ details }, transferables(details))
})
