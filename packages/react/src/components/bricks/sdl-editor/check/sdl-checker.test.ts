import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CheckReply, CheckRequest } from './check.worker'
import { indexContext, type ContextIndex } from './context-index'
import { diagnoseSdl } from './diagnose-sdl'
import { MAX_HERE, SdlChecker } from './sdl-checker'

/** Answers as check.worker.ts does, a microtask later. */
class FakeWorker {
  static all: FakeWorker[] = []
  static failing = false
  onmessage?: (event: { data: CheckReply }) => void
  onerror?: () => void
  terminate = vi.fn()
  requests: CheckRequest[] = []
  private context: ContextIndex | undefined

  constructor() {
    FakeWorker.all.push(this)
  }

  postMessage(request: CheckRequest) {
    this.requests.push(request)
    queueMicrotask(() => {
      if (FakeWorker.failing) {
        this.onerror?.()
      } else if ('id' in request) {
        const problems = diagnoseSdl(request.text, this.context)
        this.onmessage?.({ data: { id: request.id, problems } })
      } else {
        this.context =
          request.context === undefined
            ? undefined
            : indexContext(request.context)
        this.onmessage?.({ data: { names: this.context?.names ?? [] } })
      }
    })
  }
}

const padding = `# ${'x'.repeat(MAX_HERE)}\n`
const text = 'type Aardvark { a: Badger, c: Cormorant }'

const useWorkers = () => vi.stubGlobal('Worker', FakeWorker)

afterEach(() => {
  vi.unstubAllGlobals()
  FakeWorker.all = []
  FakeWorker.failing = false
})

describe('SdlChecker', () => {
  it('checks small text here', () => {
    useWorkers()
    const checker = new SdlChecker('scalar Badger')

    expect(checker.check(text)).toMatchObject([
      { message: 'Unknown type “Cormorant”.' },
    ])
    expect(FakeWorker.all).toHaveLength(0)
  })

  it.each([
    ['text', padding + text, 'scalar Badger'],
    ['context', text, padding + 'scalar Badger'],
  ])(
    'gives the same answer for large %s in a worker',
    async (_, sdl, context) => {
      useWorkers()
      const inWorker = await new SdlChecker(context).check(sdl)
      expect(FakeWorker.all).toHaveLength(1)

      vi.unstubAllGlobals()
      const here = new SdlChecker(context).check(sdl)
      expect(inWorker).toEqual(here)
    }
  )

  it('sends the context once, and again when it changes', async () => {
    useWorkers()
    const checker = new SdlChecker(padding + 'scalar Badger')
    await checker.check(text)
    await checker.check(text)
    expect(checker.names()).toEqual([{ name: 'Badger', kind: 'scalar' }])

    expect(checker.setContext(padding + 'scalar Cormorant')).toBe(true)
    expect(await checker.check(text)).toMatchObject([
      { message: 'Unknown type “Badger”.' },
    ])
    expect(checker.names()).toEqual([{ name: 'Cormorant', kind: 'scalar' }])
    expect(
      FakeWorker.all[0]?.requests.filter(request => 'context' in request)
    ).toHaveLength(2)
  })

  it('finishes here when the worker fails', async () => {
    useWorkers()
    FakeWorker.failing = true
    const checker = new SdlChecker(padding + 'scalar Badger')

    expect(await checker.check(text)).toMatchObject([
      { message: 'Unknown type “Cormorant”.' },
    ])
    expect(checker.names()).toEqual([{ name: 'Badger', kind: 'scalar' }])
    expect(Array.isArray(checker.check(text))).toBe(true)
    expect(FakeWorker.all).toHaveLength(1)
  })

  it('starts a new worker, with the context, after it is stopped', async () => {
    useWorkers()
    const checker = new SdlChecker(padding + 'scalar Badger')
    await checker.check(text)
    checker.stop()
    expect(FakeWorker.all[0]?.terminate).toHaveBeenCalled()

    expect(await checker.check(text)).toHaveLength(1)
    expect(FakeWorker.all).toHaveLength(2)
  })

  it('knows when the context is the same', () => {
    const checker = new SdlChecker('scalar Badger')

    expect(checker.setContext('scalar Badger')).toBe(false)
    expect(checker.setContext(undefined)).toBe(true)
    expect(checker.names()).toEqual([])
  })
})
