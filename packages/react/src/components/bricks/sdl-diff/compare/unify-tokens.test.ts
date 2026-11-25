import { describe, expect, it } from 'vitest'

import { compareSdl, unifiedText } from './compare-sdl'
import { TOKEN_KINDS, unifyTokens } from './unify-tokens'

const colored = (before: string, after: string) => {
  const comparison = compareSdl(before, after)
  const { text } = unifiedText(comparison)
  const { from, to, kinds } = unifyTokens(comparison)
  return Array.from(
    kinds,
    (kind, i) => `${TOKEN_KINDS[kind] ?? '?'}:${text.slice(from[i], to[i])}`
  )
}

describe('unifyTokens', () => {
  it('colors rows from both sides', () => {
    expect(colored('type A {\n  a: Int\n}', 'type A {\n  a: ID\n}')).toEqual([
      'keyword:type',
      'type:A',
      'field:a',
      'type:Int',
      'field:a',
      'type:ID',
    ])
  })

  it('splits a token over several lines, per row', () => {
    expect(
      colored('"""\nOld\n"""\nscalar A', '"""\nNew\n"""\nscalar A')
    ).toEqual([
      'comment:"""',
      'comment:Old',
      'comment:New',
      'comment:"""',
      'keyword:scalar',
      'type:A',
    ])
  })

  it('keeps offsets right with carriage returns', () => {
    expect(colored('scalar A\r\nscalar B', 'scalar A\r\nscalar C')).toEqual([
      'keyword:scalar',
      'type:A',
      'keyword:scalar',
      'type:B',
      'keyword:scalar',
      'type:C',
    ])
  })
})
