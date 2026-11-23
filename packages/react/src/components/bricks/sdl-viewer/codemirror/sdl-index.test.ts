import { describe, expect, it } from 'vitest'

import { indexSdl, type SdlTokenKind } from './sdl-index'

const sdl = `"""
A person.
"""
type User @key(fields: "{ id }") {
  # the id
  id: ID!
  "Display name"
  name(format: String = "full"): String
  role: Role
}

enum Role {
  ADMIN
  GUEST
}

input UserFilter {
  role: Role = ADMIN
}

directive @key(fields: String!) repeatable on OBJECT

extend type Query {
  user(id: ID!): User
}
`

const lineOf = (text: string) =>
  sdl.slice(0, sdl.indexOf(text)).split('\n').length

const kindOf = (text: string, nth = 0) => {
  const { tokens } = indexSdl(sdl)
  let from = -1
  for (let i = 0; i <= nth; i++) from = sdl.indexOf(text, from + 1)
  return tokens.find(token => token.from === from)?.kind
}

describe('indexSdl', () => {
  it('maps each definition line to its coordinate and back', () => {
    const index = indexSdl(sdl)
    const expected: [string, string][] = [
      ['type User', 'User'],
      ['id: ID!', 'User.id'],
      ['name(format', 'User.name'],
      ['enum Role', 'Role'],
      ['ADMIN\n', 'Role.ADMIN'],
      ['role: Role = ADMIN', 'UserFilter.role'],
      ['directive @key', '@key'],
      ['user(id: ID!)', 'Query.user'],
    ]

    for (const [text, coordinate] of expected) {
      expect(index.coordinateAtLine.get(lineOf(text))).toBe(coordinate)
      expect(index.lineOfCoordinate.get(coordinate)).toBe(lineOf(text))
    }
  })

  it('puts a coordinate on its name line, below the description', () => {
    expect(indexSdl(sdl).lineOfCoordinate.get('User')).toBe(lineOf('type User'))
  })

  it('records arguments, which share their field line when inline', () => {
    const index = indexSdl(sdl)

    expect(index.lineOfCoordinate.get('Query.user(id:)')).toBe(
      lineOf('user(id: ID!)')
    )
    expect(index.lineOfCoordinate.get('@key(fields:)')).toBe(
      lineOf('directive @key')
    )
  })

  it('gives arguments their own line when printed on one', () => {
    const index = indexSdl('type Query {\n  user(\n    id: ID!\n  ): User\n}\n')

    expect(index.coordinateAtLine.get(3)).toBe('Query.user(id:)')
  })

  it('resolves types and directives to their definitions', () => {
    const { definitions } = indexSdl(sdl)

    expect(definitions.get('User')).toBe(sdl.indexOf('User @key'))
    expect(definitions.get('@key')).toBe(sdl.indexOf('key(fields: String'))
  })

  it('resolves an extension-only type to the extension', () => {
    expect(indexSdl(sdl).definitions.get('Query')).toBe(sdl.indexOf('Query {'))
  })

  it('prefers a definition over an earlier extension', () => {
    const doc = 'extend type User { b: Int }\ntype User { a: Int }\n'
    const index = indexSdl(doc)

    expect(index.definitions.get('User')).toBe(doc.lastIndexOf('User'))
    expect(index.lineOfCoordinate.get('User')).toBe(2)
  })

  it('folds multi-line bodies, ignoring braces inside strings', () => {
    const { folds } = indexSdl(sdl)
    const open = sdl.indexOf('{\n  # the id')

    expect(folds.get(lineOf('type User'))).toEqual({
      from: open + 1,
      to: sdl.indexOf('}\n\nenum'),
    })
    expect(folds.has(lineOf('enum Role'))).toBe(true)
    expect(folds.has(lineOf('input UserFilter'))).toBe(true)
  })

  it('does not fold a body on one line', () => {
    expect(indexSdl('type Mutation { noop: Boolean }').folds.size).toBe(0)
  })

  it('colors names by their role', () => {
    const cases: [string, SdlTokenKind, number?][] = [
      ['type', 'keyword'],
      ['User', 'type'],
      ['key', 'directive'],
      ['@', 'directive'],
      ['"{ id }"', 'string'],
      ['# the id', 'comment'],
      ['id: ID!', 'field'],
      ['format', 'argument'],
      ['"full"', 'string'],
      ['ADMIN', 'enumValue'],
      ['ADMIN', 'enumValue', 1],
      ['repeatable', 'keyword'],
    ]

    for (const [text, kind, nth] of cases) {
      expect([text, kindOf(text, nth)]).toEqual([text, kind])
    }
  })

  it('treats a field named like a keyword as a field', () => {
    const doc = 'type T {\n  type: String\n  input: Int\n}\n'
    const kinds = indexSdl(doc).tokens.map(token => token.kind)

    expect(kinds).toEqual(['keyword', 'type', 'field', 'type', 'field', 'type'])
  })

  it('returns an empty index for unparseable SDL without throwing', () => {
    const index = indexSdl('type User {\n  name: String\n')

    expect(index.parsed).toBe(false)
    expect(index.definitions.size).toBe(0)
    expect(index.folds.size).toBe(0)
    expect(index.coordinateAtLine.size).toBe(0)
  })

  it('still colors unparseable SDL from the lexer', () => {
    const kinds = indexSdl(
      'type User @deprecated {\n  name: "unterminated'
    ).tokens.map(token => token.kind)

    expect(kinds).toEqual(['keyword', 'directive', 'directive'])
  })
})
