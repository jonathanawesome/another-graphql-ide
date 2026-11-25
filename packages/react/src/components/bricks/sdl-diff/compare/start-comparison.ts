import type { WorkerReply } from './comparison.worker'
import type { DiffDetails } from './diff-details'
import {
  runComparison,
  type ComparisonRequest,
  type ComparisonResult,
} from './run-comparison'

export type ComparisonHandlers = {
  onResult: (result: ComparisonResult) => void
  /** Colors and coordinates, later. Not called if they could not be made. */
  onDetails: (details: DiffDetails) => void
}

/** The same work on the main thread, a step per task. */
const runHere = (
  request: ComparisonRequest,
  { onResult, onDetails }: ComparisonHandlers
) => {
  let timer = setTimeout(() => {
    const { result, details } = runComparison(request)
    timer = setTimeout(() => {
      if (details) onDetails(details())
    })
    onResult(result)
  })
  return () => clearTimeout(timer)
}

const createWorker = () => {
  // No Worker when rendering on a server or in jsdom, and creating one throws
  // when the host serves the script from another origin.
  if (typeof Worker === 'undefined') return undefined
  try {
    return new Worker(new URL('./comparison.worker.ts', import.meta.url), {
      type: 'module',
    })
  } catch {
    return undefined
  }
}

/**
 * Compares two documents in a worker, or on the main thread where a worker
 * can't start. Returns a function that cancels it.
 */
export const startComparison = (
  request: ComparisonRequest,
  handlers: ComparisonHandlers
) => {
  const worker = createWorker()
  if (!worker) return runHere(request, handlers)

  let shown = false
  let cancelFallback: (() => void) | undefined
  const { onResult, onDetails } = handlers

  worker.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
    if ('result' in data) {
      shown = true
      onResult(data.result)
      if (data.result.kind === 'too-large') worker.terminate()
    } else {
      onDetails(data.details)
      worker.terminate()
    }
  }
  worker.onerror = () => {
    worker.terminate()
    // Blocked by the page's CSP, say. A failure after that only costs colors.
    if (!shown) cancelFallback = runHere(request, handlers)
  }
  worker.postMessage(request)

  return () => {
    worker.terminate()
    cancelFallback?.()
  }
}
