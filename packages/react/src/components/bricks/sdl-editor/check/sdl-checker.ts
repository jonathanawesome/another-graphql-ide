import type { Problem } from '../../sdl-shared/diagnostics'

import type { CheckReply, CheckRequest } from './check.worker'
import { indexContext, type ContextIndex, type SdlName } from './context-index'
import { diagnoseSdl } from './diagnose-sdl'

/** Up to this much text is quick enough to check on the main thread. */
export const MAX_HERE = 100_000

type Pending = {
  text: string
  resolve: (problems: Problem[]) => void
  reject: (error: unknown) => void
}

const createWorker = () => {
  // No Worker in jsdom, and creating one throws when the host serves the script
  // from another origin.
  if (typeof Worker === 'undefined') return undefined
  try {
    return new Worker(new URL('./check.worker.ts', import.meta.url), {
      type: 'module',
    })
  } catch {
    return undefined
  }
}

/**
 * Checks SDL against a context: here when both are small, otherwise in a worker
 * that keeps the context, or here again where a worker can't start.
 */
export class SdlChecker {
  private context: string | undefined
  private index: ContextIndex | undefined
  private workerNames: SdlName[] = []
  private worker: Worker | undefined
  private workerFailed = false
  private sent: string | undefined
  private nextId = 0
  private readonly pending = new Map<number, Pending>()

  constructor(context: string | undefined) {
    this.context = context
  }

  /** Returns whether the context is a different one. */
  setContext(context: string | undefined) {
    if (context === this.context) return false
    this.context = context
    this.index = undefined
    this.workerNames = []
    return true
  }

  /** Names the context defines. Empty until a worker has read a large one. */
  names(): readonly SdlName[] {
    if (this.context === undefined) return []
    if (this.workerFailed || this.context.length <= MAX_HERE) {
      return this.indexHere()?.names ?? []
    }
    return this.workerNames
  }

  check(text: string): Problem[] | Promise<Problem[]> {
    const size = text.length + (this.context?.length ?? 0)
    const worker = size > MAX_HERE ? this.startWorker() : undefined
    if (!worker) return this.checkHere(text)

    if (this.sent !== this.context) {
      this.sent = this.context
      this.send({ context: this.context })
    }
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { text, resolve, reject })
      this.send({ id, text })
    })
  }

  /** Ends the worker. The next large check starts another. */
  stop() {
    this.worker?.terminate()
    this.worker = undefined
    this.sent = undefined
    this.pending.clear()
  }

  private indexHere() {
    if (this.context === undefined) return undefined
    return (this.index ??= indexContext(this.context))
  }

  private checkHere(text: string) {
    return diagnoseSdl(text, this.indexHere())
  }

  private send(request: CheckRequest) {
    this.worker?.postMessage(request)
  }

  private startWorker() {
    if (this.worker || this.workerFailed) return this.worker
    const worker = createWorker()
    if (!worker) {
      this.workerFailed = true
      return undefined
    }
    worker.onmessage = ({ data }: MessageEvent<CheckReply>) => {
      if ('id' in data) {
        this.pending.get(data.id)?.resolve(data.problems)
        this.pending.delete(data.id)
      } else if (this.sent === this.context) {
        this.workerNames = data.names
      }
    }
    worker.onerror = () => {
      // Blocked by the page's CSP, say. Finish what it was asked here.
      this.workerFailed = true
      const unfinished = [...this.pending.values()]
      this.stop()
      for (const { text, resolve, reject } of unfinished) {
        try {
          resolve(this.checkHere(text))
        } catch (error) {
          reject(error)
        }
      }
    }
    return (this.worker = worker)
  }
}
