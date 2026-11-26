import type {
  Completion,
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from '@codemirror/autocomplete'
import type { EditorState, Text } from '@codemirror/state'
import { specifiedDirectives, specifiedScalarTypes } from 'graphql'

import { scanSdl, type SdlExpectation } from '../../sdl-shared/scan-sdl'
import type { SdlIndex } from '../../sdl-shared/sdl-index'
import type { SdlName, SdlNameKind } from '../check/context-index'

import { editField } from './edit-field'

const KINDS = new Set<string>([
  'scalar',
  'type',
  'interface',
  'union',
  'enum',
  'input',
])

const ALLOWED: Partial<Record<SdlExpectation, readonly SdlNameKind[]>> = {
  output: ['scalar', 'type', 'interface', 'union', 'enum'],
  input: ['scalar', 'enum', 'input'],
  interface: ['interface'],
  object: ['type'],
  directive: ['directive'],
}

const QUERY_ONLY = new Set(['include', 'skip'])

const BUILT_IN: SdlName[] = [
  ...specifiedScalarTypes.map(({ name }): SdlName => ({
    name,
    kind: 'scalar',
  })),
  ...specifiedDirectives
    .filter(({ name }) => !QUERY_ONLY.has(name))
    .map(({ name }): SdlName => ({ name, kind: 'directive' })),
]

const cache = new WeakMap<SdlIndex, SdlName[]>()

/** The names a document defines or extends, broken or not. */
const namesIn = (index: SdlIndex, doc: Text): SdlName[] => {
  const cached = cache.get(index)
  if (cached) return cached

  const names = new Map<string, SdlName>()
  const add = (from: number, to: number, kind: SdlNameKind) => {
    const name = doc.sliceString(from, to)
    const key = kind === 'directive' ? `@${name}` : name
    if (!names.has(key)) names.set(key, { name, kind })
  }
  let keyword = ''
  let previous = ''
  for (const { from, to, kind } of index.tokens) {
    if (kind === 'comment') continue
    if (kind === 'keyword') {
      keyword = doc.sliceString(from, to)
    } else {
      if (kind === 'type' && previous === 'keyword' && KINDS.has(keyword)) {
        add(from, to, keyword as SdlNameKind)
      }
      // `directive`, then `@`, then the name.
      if (kind === 'directive' && keyword === 'directive') {
        if (previous === 'directive') {
          add(from, to, 'directive')
          keyword = ''
        }
      } else {
        keyword = ''
      }
    }
    previous = kind
  }

  const found = [...names.values()]
  cache.set(index, found)
  return found
}

const DEFINITION =
  /^(?:extend|schema|scalar|type|interface|union|enum|input|directive)\b/

/** Text from the definition `pos` is in, so a large document is not rescanned. */
const definitionBefore = (state: EditorState, pos: number) => {
  let line = state.doc.lineAt(pos)
  while (line.number > 1 && !DEFINITION.test(line.text)) {
    line = state.doc.line(line.number - 1)
  }
  return state.sliceDoc(line.from, pos)
}

export type ContextNames = () => {
  names: readonly SdlName[]
  label: string | undefined
}

/** Type and directive names that fit where the caret is. */
export const completeSdl =
  (context: ContextNames): CompletionSource =>
  ({ state, pos }: CompletionContext) =>
    complete(state, pos, context)

const complete = (
  state: EditorState,
  pos: number,
  context: ContextNames
): CompletionResult | null => {
  if (state.readOnly) return null
  const line = state.doc.lineAt(pos)
  const word = /\w*$/.exec(line.text.slice(0, pos - line.from))?.[0] ?? ''
  const from = pos - word.length
  const before = definitionBefore(state, from)
  const scan = scanSdl(before)
  const last = scan.tokens.at(-1)
  if (last?.kind === 'comment' && last.to === before.length) return null

  const allowed = ALLOWED[scan.expects]
  if (!allowed) return null

  const { index, indexed } = state.field(editField)
  const { names, label } = context()
  const seen = new Set<string>()
  const options: Completion[] = []
  const add = (list: readonly SdlName[], boost: number, detail?: string) => {
    for (const { name, kind } of list) {
      if (!allowed.includes(kind) || seen.has(name)) continue
      seen.add(name)
      options.push({
        label: name,
        detail: detail ?? kind,
        boost,
        // Equal matches keep this order rather than the alphabet's.
        sortText: String(options.length).padStart(7, '0'),
      })
    }
  }
  add(namesIn(index, indexed), 2)
  add(names, 1, label)
  add(BUILT_IN, 0)

  return { from, options, validFor: /^\w*$/ }
}
