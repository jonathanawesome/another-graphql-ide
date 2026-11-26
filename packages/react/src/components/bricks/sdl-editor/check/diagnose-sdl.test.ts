import { describe, expect, it } from 'vitest'

import { makeSupergraph, subgraphSdl } from '../../sdl-viewer/__fixtures__/sdl'

import { indexContext } from './context-index'
import { diagnoseSdl } from './diagnose-sdl'

/** Each problem as `severity: message [underlined text]`. */
const check = (sdl: string, context?: string) =>
  diagnoseSdl(
    sdl,
    context === undefined ? undefined : indexContext(context)
  ).map(
    ({ severity, message, from, to }) =>
      `${severity}: ${message} [${sdl.slice(from, to)}]`
  )

describe('diagnoseSdl', () => {
  it('shows the syntax error as designed', () => {
    const sdl = `directive @auth(role: Role!) on FIELD_DEFINITION
directive @cost(value: Int!) on FIELD_DEFINITION

scalar DateTime
scalar Money
scalar

enum Role {
  ADMIN
  CUSTOMER
}`

    expect(check(sdl)).toEqual([
      'error: Syntax error: unexpected name “Role”. [Role]',
    ])
    expect(diagnoseSdl(sdl)[0]?.from).toBe(sdl.indexOf('enum Role') + 5)
  })

  it('shows the unknown type as designed', () => {
    const sdl = `directive @auth(role: Roles!) on FIELD_DEFINITION
directive @cost(value: Int!) on FIELD_DEFINITION

enum Role {
  ADMIN
  CUSTOMER
}`

    expect(check(sdl)).toEqual([
      'warning: Unknown type “Roles”. Did you mean “Role”? [Roles]',
    ])
  })

  it.each([
    ['valid SDL', subgraphSdl + 'type Query { a: Int }'],
    ['a supergraph', makeSupergraph(5)],
  ])('finds nothing in %s', (_, sdl) => {
    const context = 'directive @join__implements(x: Int) on OBJECT'

    expect(check(sdl, context)).toEqual([])
  })

  it.each([
    ['nothing', ''],
    ['whitespace', ' \n\t\n'],
    ['comments', '# one\n  # two'],
    ['commas', ',,\n'],
    ['a byte order mark', String.fromCharCode(0xfeff)],
  ])('allows %s', (_, sdl) => {
    expect(check(sdl)).toEqual([])
  })

  it.each([
    ['type A {', 'expected name, found the end of the text. [{]'],
    ['type A {\n  # why\n', 'expected name, found the end of the text. [{]'],
    ['type A { a: "x" }', 'expected name, found string “x”. ["x"]'],
    ['type A { a: 1 }', 'expected name, found number “1”. [1]'],
    ['enum A {}', 'expected name, found “}”. [}]'],
    ['type A { a: Int ? }', 'unexpected character: “?”. [?]'],
    ['type A { a: "x', 'unterminated string. ["x]'],
    ['type A { a: "x\n}', 'unterminated string. ["x]'],
    ['# c\n"""open\ntype A { a: Int }', 'unterminated string. ["""open]'],
  ])('reports %j', (sdl, expected) => {
    expect(check(sdl)).toEqual([`error: Syntax error: ${expected}`])
  })

  it.each([
    [
      'type A @key(fields: "id") { a: Int }',
      'Unknown directive “@key”. [@key]',
    ],
    [
      'extend type Nope { a: Int }',
      'Cannot extend type “Nope” because it is not defined. [Nope]',
    ],
    ['type A { a: Nope }', 'Unknown type “Nope”. [Nope]'],
    ['type A implements Nope { a: Int }', 'Unknown type “Nope”. [Nope]'],
    ['union U = Nope', 'Unknown type “Nope”. [Nope]'],
  ])('warns about %j', (sdl, expected) => {
    expect(check(sdl)).toEqual([`warning: ${expected}`])
  })

  it.each([
    [
      'type A { a: Int }\ntype A { b: Int }',
      'There can be only one type named “A”. [A]',
    ],
    ['type A { a: Int a: Int }', 'Field “A.a” can only be defined once. [a]'],
    ['enum E { A A }', 'Enum value “E.A” can only be defined once. [A]'],
    [
      'directive @a on OBJECT\ndirective @a on OBJECT',
      'There can be only one directive named “@a”. [a]',
    ],
    [
      'type A @deprecated { a: Int }',
      'Directive “@deprecated” may not be used on OBJECT. [@deprecated]',
    ],
    [
      'type A { a: Int @deprecated(why: "x") }',
      'Unknown argument “why” on directive “@deprecated”. [why]',
    ],
    [
      'scalar A @specifiedBy',
      'Directive “@specifiedBy” argument “url” of type “String!” is required, but it was not provided. [@specifiedBy]',
    ],
    [
      'scalar A\nextend type A { a: Int }',
      'Cannot extend non-object type “A”. [A]',
    ],
    [
      'schema { query: A query: A }\ntype A { a: Int }',
      'There can be only one query type in schema. [query]',
    ],
    ['{ a }', 'Only type system definitions belong in SDL. [{]'],
    ['query Q { a }', 'Only type system definitions belong in SDL. [query]'],
    [
      'fragment F on A { a }',
      'Only type system definitions belong in SDL. [fragment]',
    ],
  ])('fails %j', (sdl, expected) => {
    expect(check(sdl)).toEqual([`error: ${expected}`])
  })

  it('underlines the second of two, not the first', () => {
    const sdl = 'type A { a: Int }\ntype A { b: Int }'

    expect(diagnoseSdl(sdl)[0]?.from).toBe(sdl.lastIndexOf('A {'))
  })

  it('lists problems in order', () => {
    expect(
      check('type A { b: B }\ntype A { a: Int @x }').map(text => text[0])
    ).toEqual(['w', 'e', 'w'])
  })

  describe('with a context', () => {
    const context = `
      type Query { me: User }
      type User { id: ID! missing: NotHere }
      enum Role { ADMIN }
      directive @tag(name: String!) on FIELD_DEFINITION
      schema { query: Query }
    `

    it.each([
      ['a type', 'type A { user: User }'],
      ['a directive', 'type A { a: Int @tag(name: "x") }'],
      ['an extended type', 'extend type Query { you: User }'],
      ['a name in both', 'enum Role { ADMIN OWNER }'],
      ['a field in both', 'extend type Query { me: User }'],
      ['a schema in both', 'schema { query: Query }'],
    ])('accepts %s', (_, sdl) => {
      expect(check(sdl, context)).toEqual([])
    })

    it('counts a type the context only extends', () => {
      expect(check('type A { b: B }', 'extend type B { b: Int }')).toEqual([])
    })

    it('checks directive arguments against it', () => {
      expect(check('type A { a: Int @tag }', context)).toEqual([
        'error: Directive “@tag” argument “name” of type “String!” is required, but it was not provided. [@tag]',
      ])
    })

    it('prefers the definition in the document', () => {
      const sdl = 'directive @tag on OBJECT\ntype A @tag { a: Int }'

      expect(check(sdl, context)).toEqual([])
    })

    it('suggests names from it', () => {
      expect(check('type A { a: Usr }', context)).toEqual([
        'warning: Unknown type “Usr”. Did you mean “User”? [Usr]',
      ])
    })

    it('does not report its own problems', () => {
      expect(check('type A { a: Int }', context)).toEqual([])
    })

    it('skips unknown names when it does not parse', () => {
      const sdl = 'type A @x { a: B a: B }\nextend type C { a: Int }'

      expect(check(sdl, 'type {')).toEqual([
        'error: Field “A.a” can only be defined once. [a]',
      ])
    })

    it('allows a blank one', () => {
      expect(check('type A { a: B }', ' \n')).toHaveLength(1)
    })
  })

  it('stays quick with many unknown names, dropping suggestions', () => {
    const sdl = Array.from(
      { length: 300 },
      (_, i) => `type A${i} { a: Unknown${i} }`
    ).join('\n')
    const found = check(sdl)

    expect(found).toHaveLength(300)
    expect(found.at(-1)).toBe(
      'warning: Unknown type “Unknown299”. [Unknown299]'
    )
  })
})

describe('indexContext', () => {
  it('lists each name once with its kind', () => {
    const { names } = indexContext(
      'scalar S extend type T { a: Int } type T { b: Int } interface I { a: Int } union U = T enum E { A } input N { a: Int } directive @d on OBJECT'
    )

    expect(names.map(({ name, kind }) => `${kind} ${name}`)).toEqual([
      'scalar S',
      'type T',
      'interface I',
      'union U',
      'enum E',
      'input N',
      'directive d',
    ])
  })
})
