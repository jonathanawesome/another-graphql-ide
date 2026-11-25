import type { Problem } from '../../sdl-shared/diagnostics'

import { indexContext, type ContextIndex, type SdlName } from './context-index'
import { diagnoseSdl } from './diagnose-sdl'

export type CheckRequest =
  { context: string | undefined } | { id: number; text: string }

export type CheckReply =
  { names: SdlName[] } | { id: number; problems: Problem[] }

let context: ContextIndex | undefined

const reply = (message: CheckReply) => postMessage(message)

addEventListener('message', ({ data }: MessageEvent<CheckRequest>) => {
  if ('id' in data) {
    reply({ id: data.id, problems: diagnoseSdl(data.text, context) })
  } else {
    context =
      data.context === undefined ? undefined : indexContext(data.context)
    reply({ names: context?.names ?? [] })
  }
})
