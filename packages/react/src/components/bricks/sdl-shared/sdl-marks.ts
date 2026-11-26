import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, type DecorationSet } from '@codemirror/view'

import type { SdlToken } from './sdl-index'

const markFor = Object.fromEntries(
  (
    [
      'keyword',
      'type',
      'field',
      'argument',
      'enumValue',
      'directive',
      'string',
      'number',
      'comment',
    ] as const
  ).map(kind => [kind, Decoration.mark({ class: `cm-sdl-${kind}` })])
) as Record<SdlToken['kind'], Decoration>

/** A color class for each token. */
export const sdlMarks = (tokens: readonly SdlToken[]): DecorationSet => {
  const builder = new RangeSetBuilder<Decoration>()
  for (const token of tokens) {
    builder.add(token.from, token.to, markFor[token.kind])
  }
  return builder.finish()
}
