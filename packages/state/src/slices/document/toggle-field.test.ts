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

const q = (
  rootOperation: ToggleFieldTarget['rootOperation'],
  ...path: string[]
) => ({ rootOperation, path }) satisfies ToggleFieldTarget

const arg = (
  rootOperation: ToggleFieldTarget['rootOperation'],
  path: string[],
  argument: string
) => ({ rootOperation, path, argument }) satisfies ToggleFieldTarget

const toggle = (
  query: string,
  target: ToggleFieldTarget,
  cursor = 0,
  mode: 'typename' | 'bare' = 'typename'
) => computeToggle({ query, cursor, schema, target, mode })

describe('computeToggle', () => {
  it('inserts a leaf into an empty document as a named operation', () => {
    expect(toggle('', q('query', 'isTest')).query).toBe(
      'query NewQuery {\n  isTest\n}'
    )
  })

  it('inserts a nested path, creating intermediate parents', () => {
    const { query } = toggle(
      '{\n  isTest\n}',
      q('query', 'user', 'posts', 'title'),
      5
    )
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
    // Start from an existing operation so no new-operation caret is returned.
    const { query, selection } = toggle(
      '{\n  isTest\n}',
      q('query', 'me'),
      3,
      'typename'
    )
    expect(query).toBe('{\n  isTest\n  me {\n    __typename\n  }\n}')
    expect(selection).toBeUndefined()
  })

  it('object field in bare mode inserts no subselection (stays parseable)', () => {
    // Cursor inside an existing op so no new-operation caret is returned.
    const { query, selection } = toggle(
      '{\n  isTest\n}',
      q('query', 'me'),
      3,
      'bare'
    )
    expect(query).toBe('{\n  isTest\n  me\n}')
    expect(selection).toBeUndefined()
  })

  it('starts a new operation of the clicked field root type', () => {
    const start = 'query NewQuery {\n  isTest\n}'
    const { query } = toggle(start, q('mutation', 'ping'), 3)
    expect(query).toBe(
      'query NewQuery {\n  isTest\n}\n\nmutation NewMutation {\n  ping\n}'
    )
  })

  it('moves the caret into a newly created operation so it becomes active', () => {
    const start = 'query NewQuery {\n  isTest\n}'
    const { query, selection } = toggle(start, q('mutation', 'ping'), 3)
    const at = query.lastIndexOf('NewMutation')
    expect(selection).toEqual({ anchor: at, head: at })
  })

  it('creates a new operation rather than adding to a non-active matching op', () => {
    // Cursor is in the query, so clicking a mutation field must not touch the
    // existing (non-active) mutation M; it starts a fresh mutation instead.
    const start = 'query A {\n  isTest\n}\n\nmutation M {\n  ping\n}'
    const cursorInA = start.indexOf('isTest')
    const { query } = toggle(start, q('mutation', 'ping'), cursorInA)
    expect(query).toBe(
      'query A {\n  isTest\n}\n\nmutation M {\n  ping\n}\n\nmutation NewMutation {\n  ping\n}'
    )
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

  describe('arguments', () => {
    it('adds an argument with a placeholder value, creating the field', () => {
      const { query } = toggle('', arg('query', ['user'], 'id'))
      expect(query).toBe(
        'query NewQuery {\n  user(id: "") {\n    __typename\n  }\n}'
      )
    })

    it('removes an argument that is already present (toggle off)', () => {
      const start = 'query NewQuery {\n  user(id: "") {\n    __typename\n  }\n}'
      const { query } = toggle(start, arg('query', ['user'], 'id'), 3)
      expect(query).toBe('query NewQuery {\n  user {\n    __typename\n  }\n}')
    })

    it('is idempotent when the field already exists', () => {
      const start = 'query NewQuery {\n  user {\n    __typename\n  }\n}'
      const once = toggle(start, arg('query', ['user'], 'id'), 3).query
      const twice = toggle(once, arg('query', ['user'], 'id'), 3).query
      expect(twice).toBe(start)
    })

    it('no-ops for an unknown argument', () => {
      const start = '{\n  isTest\n}'
      expect(toggle(start, arg('query', ['user'], 'nope'), 3).query).toBe(start)
    })
  })
})
