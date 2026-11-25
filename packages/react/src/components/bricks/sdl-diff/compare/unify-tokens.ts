import type { SdlToken, SdlTokenKind } from '../../sdl-shared/sdl-index'

import { REMOVED, type Comparison } from './compare-sdl'
import { lineEnd, lineStart, type Lines } from './lines'

/** Token kinds, by the byte that stands for each. */
export const TOKEN_KINDS: readonly SdlTokenKind[] = [
  'keyword',
  'type',
  'field',
  'argument',
  'enumValue',
  'directive',
  'string',
  'number',
  'comment',
]

const BYTE = Object.fromEntries(
  TOKEN_KINDS.map((kind, i) => [kind, i])
) as Record<SdlTokenKind, number>

/** Tokens of the diff's text, in order. Arrays, so a worker can hand them over. */
export type Tokens = { from: Uint32Array; to: Uint32Array; kinds: Uint8Array }

/** The first token ending after each line's start. */
const firstTokens = (lines: Lines, tokens: SdlToken[]) => {
  const first = new Uint32Array(lines.count)
  let next = 0
  for (let line = 0; line < lines.count; line++) {
    const start = lineStart(lines, line)
    while ((tokens[next]?.to ?? Infinity) <= start) next++
    first[line] = next
  }
  return first
}

/** Both documents' tokens, moved onto the diff's rows. */
export const unifyTokens = (
  { rows, before, after }: Comparison,
  beforeTokens: SdlToken[],
  afterTokens: SdlToken[]
): Tokens => {
  const side = (lines: Lines, tokens: SdlToken[]) => ({
    lines,
    tokens,
    first: firstTokens(lines, tokens),
  })
  const older = side(before, beforeTokens)
  const newer = side(after, afterTokens)

  // A token over several lines, such as a description, is split per row.
  const most =
    older.tokens.length + newer.tokens.length + before.count + after.count
  const from = new Uint32Array(most)
  const to = new Uint32Array(most)
  const kinds = new Uint8Array(most)
  let count = 0
  let offset = 0

  for (let row = 0; row < rows.kinds.length; row++) {
    const removed = rows.kinds[row] === REMOVED
    const { lines, tokens, first } = removed ? older : newer
    const line = ((removed ? rows.before : rows.after)[row] ?? 1) - 1
    const start = lineStart(lines, line)
    const end = lineEnd(lines, line)
    for (let i = first[line] ?? 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (!token || token.from >= end) break
      const tokenFrom = Math.max(token.from, start)
      const tokenTo = Math.min(token.to, end)
      if (tokenTo <= tokenFrom) continue
      from[count] = offset + tokenFrom - start
      to[count] = offset + tokenTo - start
      kinds[count] = BYTE[token.kind]
      count++
    }
    offset += end - start + 1
  }

  return {
    from: from.slice(0, count),
    to: to.slice(0, count),
    kinds: kinds.slice(0, count),
  }
}
