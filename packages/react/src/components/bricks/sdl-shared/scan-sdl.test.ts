import { describe, expect, it } from 'vitest'

import { makeSupergraph, subgraphSdl } from '../sdl-viewer/__fixtures__/sdl'

import { scanSdl } from './scan-sdl'
import { indexSdl } from './sdl-index'

const everything = `"The root."
schema @link(url: "x", import: ["@key", { name: "a", as: B }]) {
  query: Query
  mutation: Mutation
}

extend schema @link(url: "y")

"""
A node.
"""
interface Node implements Other & Entity @key(fields: "id") {
  "The id."
  id: ID! # trailing
  list(
    "How many."
    first: Int = 10 @deprecated(reason: "x")
    by: [Sort!]! = [{ field: NAME, up: true }, null]
  ): [[Node!]]! @cost(value: 1.5)
  type: String
  input: enum
}

type Empty
type type implements Node & Other { on: Int }
extend type Empty @tag
union Pet @tag(name: "x") = | Cat | Dog
scalar DateTime @specifiedBy(url: "u")
enum Sort @x { "Up." ASC @deprecated  DESC }
input Filter { a: Int = -1, b: Sort = ASC, c: [Filter] }
directive @auth(role: Role! = ADMIN, deep: In) repeatable on | FIELD_DEFINITION | OBJECT
# the end
`

describe('scanSdl', () => {
  it.each([
    ['every construct', everything],
    ['a subgraph', subgraphSdl],
    ['a supergraph', makeSupergraph(20)],
  ])('matches the parser on %s', (_, sdl) => {
    const index = indexSdl(sdl)
    const scan = scanSdl(sdl)
    const text = (token: { from: number; to: number; kind: string }) =>
      `${sdl.slice(token.from, token.to)} ${token.kind}`

    expect(index.parsed).toBe(true)
    expect(scan.tokens.map(text)).toEqual(index.tokens.map(text))
    expect([...scan.folds]).toEqual([...index.folds])
  })

  const kinds = (sdl: string) =>
    scanSdl(sdl).tokens.map(
      ({ from, to, kind }) => `${sdl.slice(from, to)} ${kind}`
    )

  it('keeps colors and folds around a definition missing its name', () => {
    const sdl = 'scalar Money\nscalar\n\nenum Role {\n  ADMIN\n}\n'

    expect(indexSdl(sdl).parsed).toBe(false)
    expect(kinds(sdl)).toEqual([
      'scalar keyword',
      'Money type',
      'scalar keyword',
      'enum keyword',
      'Role type',
      'ADMIN enumValue',
    ])
    expect(scanSdl(sdl).folds.has(4)).toBe(true)
  })

  it('starts over at a definition after an unclosed body', () => {
    expect(kinds('type A {\n  a: Int\n\ntype B {\n  b: Int\n}')).toEqual([
      'type keyword',
      'A type',
      'a field',
      'Int type',
      'type keyword',
      'B type',
      'b field',
      'Int type',
    ])
  })

  it('colors past an unterminated string and a stray character', () => {
    const sdl = 'type A {\n  a: "x\n  b: Int ? c: Int\n}\n\nscalar D\n'

    expect(kinds(sdl)).toContain('b field')
    expect(kinds(sdl)).toContain('c field')
    expect(kinds(sdl).slice(-2)).toEqual(['scalar keyword', 'D type'])
    expect(scanSdl(sdl).folds.has(1)).toBe(true)
  })

  it('does not loop on text it cannot lex', () => {
    expect(() => scanSdl('?'.repeat(5000))).not.toThrow()
    expect(() => scanSdl('"""never closed')).not.toThrow()
  })

  it.each([
    ['', 'keyword'],
    ['type ', 'name'],
    ['type A {\n  a: ', 'output'],
    ['type A {\n  a: [', 'output'],
    ['type A {\n  a(x: ', 'input'],
    ['type A {\n  a(x: [', 'input'],
    ['type A {\n  a(x: Int = ', 'value'],
    ['type A {\n  ', 'name'],
    ['type A {\n  a: Int @', 'directive'],
    ['type A {\n  a: Int @x(y: ', 'value'],
    ['input A {\n  a: ', 'input'],
    ['directive @a(b: ', 'input'],
    ['union A = ', 'object'],
    ['union A = B | ', 'object'],
    ['type A implements ', 'interface'],
    ['type A implements B & ', 'interface'],
  ])('after %j expects %s', (sdl, expected) => {
    expect(scanSdl(sdl).expects).toBe(expected)
  })
})
