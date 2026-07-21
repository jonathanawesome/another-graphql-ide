import { buildSchema } from 'graphql'
import { describe, expect, it } from 'vitest'

import { computeToggle } from './toggle-field'
import type { ToggleFieldTarget } from './types'

const schema = buildSchema(`
  type Post { id: ID!, title: String! }
  type User { id: ID!, name: String!, posts: [Post!]! }
  type Query {
    isTest: Boolean!
    me: User!
    user(id: ID!): User
  }
  type Mutation { ping: Boolean! }
`)

const q = (rootOperation: ToggleFieldTarget['rootOperation'], ...path: string[]) =>
  ({ rootOperation, path }) satisfies ToggleFieldTarget

const toggle = (
  query: string,
  target: ToggleFieldTarget,
  cursor = 0,
  mode: 'typename' | 'empty-braces' = 'typename'
) => computeToggle({ query, cursor, schema, target, mode })

describe('computeToggle', () => {
  it('inserts a leaf into an empty document, creating an anonymous query', () => {
    expect(toggle('', q('query', 'isTest')).query).toBe('{\n  isTest\n}')
  })

  it('inserts a nested path, creating intermediate parents', () => {
    const { query } = toggle('{\n  isTest\n}', q('query', 'user', 'posts', 'title'), 5)
    expect(query).toBe(
      '{\n  isTest\n  user {\n    posts {\n      title\n    }\n  }\n}'
    )
  })

  it('removes a leaf that is already present (toggle off)', () => {
    const start = '{\n  isTest\n  me {\n    id\n  }\n}'
    const { query } = toggle(start, q('query', 'isTest'), 3)
    expect(query).toBe('{\n  me {\n    id\n  }\n}')
  })

  it('prunes now-empty ancestors on removal', () => {
    const start = '{\n  user {\n    posts {\n      title\n    }\n  }\n}'
    const { query } = toggle(start, q('query', 'user', 'posts', 'title'), 3)
    expect(query).toBe('')
  })

  it('object field in typename mode inserts a __typename subselection', () => {
    const { query, selection } = toggle('', q('query', 'me'), 0, 'typename')
    expect(query).toBe('{\n  me {\n    __typename\n  }\n}')
    expect(selection).toBeUndefined()
  })

  it('object field in empty-braces mode inserts braces with caret inside', () => {
    const { query, selection } = toggle('', q('query', 'me'), 0, 'empty-braces')
    expect(query).toBe('{\n  me {\n    \n  }\n}')
    // Caret sits on the blank indented line, after the four spaces.
    expect(selection).toBe(query.indexOf('me {\n    ') + 'me {\n    '.length)
  })

  it('is idempotent: toggling a field twice returns the normalized original', () => {
    const start = '{\n  isTest\n}'
    const once = toggle(start, q('query', 'me'), 3).query
    const twice = toggle(once, q('query', 'me'), 3).query
    expect(twice).toBe(start)
  })

  it('no-ops on a half-typed query that fails to parse', () => {
    const start = 'query Foo {'
    expect(toggle(start, q('query', 'isTest')).query).toBe(start)
  })

  it('targets the operation the cursor is inside', () => {
    const doc = 'query A {\n  isTest\n}\n\nquery B {\n  isTest\n}'
    const cursorInB = doc.indexOf('query B')
    const { query } = toggle(doc, q('query', 'me'), cursorInB)
    expect(query).toBe(
      'query A {\n  isTest\n}\n\nquery B {\n  isTest\n  me {\n    __typename\n  }\n}'
    )
  })

  it('no-ops when the path does not resolve against the schema', () => {
    const start = '{\n  isTest\n}'
    expect(toggle(start, q('query', 'nope'), 3).query).toBe(start)
  })

  it('no-ops on an empty path', () => {
    const start = '{\n  isTest\n}'
    expect(toggle(start, q('query'), 3).query).toBe(start)
  })
})
