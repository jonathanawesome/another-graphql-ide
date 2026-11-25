import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ComparisonRequest } from './run-comparison'
import { startComparison } from './start-comparison'

const request: ComparisonRequest = {
  before: 'scalar A',
  after: 'scalar B',
  context: 3,
}

class FakeWorker {
  static all: FakeWorker[] = []
  onmessage?: (event: { data: unknown }) => void
  onerror?: () => void
  postMessage = vi.fn()
  terminate = vi.fn()

  constructor() {
    FakeWorker.all.push(this)
  }
}

const start = () => {
  const onResult = vi.fn()
  const onDetails = vi.fn()
  const cancel = startComparison(request, { onResult, onDetails })
  return { onResult, onDetails, cancel, worker: FakeWorker.all.at(-1) }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  FakeWorker.all = []
})

describe('startComparison', () => {
  it('runs here without workers, showing the result before the colors', () => {
    vi.useFakeTimers()
    const { onResult, onDetails } = start()

    vi.advanceTimersToNextTimer()
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'diff', removed: 1, added: 1 })
    )
    expect(onDetails).not.toHaveBeenCalled()

    vi.advanceTimersToNextTimer()
    expect(onDetails).toHaveBeenCalledOnce()
  })

  it('stops between steps when cancelled', () => {
    vi.useFakeTimers()
    const { onResult, onDetails, cancel } = start()

    vi.advanceTimersToNextTimer()
    cancel()
    vi.runAllTimers()

    expect(onResult).toHaveBeenCalledOnce()
    expect(onDetails).not.toHaveBeenCalled()
  })

  it('relays a worker, and ends it after the colors', () => {
    vi.stubGlobal('Worker', FakeWorker)
    const { onResult, onDetails, worker } = start()

    expect(worker?.postMessage).toHaveBeenCalledWith(request)
    worker?.onmessage?.({ data: { result: { kind: 'diff' } } })
    expect(onResult).toHaveBeenCalledWith({ kind: 'diff' })
    expect(worker?.terminate).not.toHaveBeenCalled()

    worker?.onmessage?.({ data: { details: {} } })
    expect(onDetails).toHaveBeenCalledOnce()
    expect(worker?.terminate).toHaveBeenCalledOnce()
  })

  it('runs here when the worker fails to start', () => {
    vi.useFakeTimers()
    vi.stubGlobal('Worker', FakeWorker)
    const { onResult, worker } = start()

    worker?.onerror?.()
    vi.runAllTimers()

    expect(onResult).toHaveBeenCalledOnce()
  })

  it('ends the worker when cancelled', () => {
    vi.stubGlobal('Worker', FakeWorker)
    const { cancel, worker } = start()

    cancel()

    expect(worker?.terminate).toHaveBeenCalledOnce()
  })

  it('refuses documents too large to compare', () => {
    vi.useFakeTimers()
    const onResult = vi.fn()
    const onDetails = vi.fn()
    startComparison(
      { ...request, before: ' '.repeat(40_000_001) },
      { onResult, onDetails }
    )
    vi.runAllTimers()

    expect(onResult).toHaveBeenCalledWith({ kind: 'too-large' })
    expect(onDetails).not.toHaveBeenCalled()
  })
})
