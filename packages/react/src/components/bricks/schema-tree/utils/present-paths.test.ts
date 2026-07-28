import { describe, expect, it } from 'vitest'

import { activeOperationType, computePresentPaths } from './present-paths'

describe('computePresentPaths', () => {
  it('returns an empty set for a blank or unparsable document', () => {
    expect(computePresentPaths('', 0).size).toBe(0)
    expect(computePresentPaths('query Foo {', 0).size).toBe(0)
  })

  it('collects field paths keyed by root operation and node id', () => {
    const paths = computePresentPaths('query { user { posts { title } } }', 3)
    expect([...paths].sort()).toEqual([
      'query.user',
      'query.user.posts',
      'query.user.posts.title',
    ])
  })

  it('collects argument paths matching the tree node id', () => {
    const paths = computePresentPaths('query { user(id: "1") { name } }', 3)
    expect(paths.has('query.user')).toBe(true)
    expect(paths.has('query.user.arguments.id')).toBe(true)
    expect(paths.has('query.user.name')).toBe(true)
  })

  it('marks only the active operation the cursor is inside', () => {
    const doc = 'query A {\n  me\n}\n\nmutation B {\n  ping\n}'
    const inA = doc.indexOf('me')
    const inB = doc.indexOf('ping')

    const aPaths = computePresentPaths(doc, inA)
    expect(aPaths.has('query.me')).toBe(true)
    expect(aPaths.has('mutation.ping')).toBe(false)

    const bPaths = computePresentPaths(doc, inB)
    expect(bPaths.has('mutation.ping')).toBe(true)
    expect(bPaths.has('query.me')).toBe(false)
  })
})

describe('activeOperationType', () => {
  it('returns undefined for a blank or unparsable document', () => {
    expect(activeOperationType('', 0)).toBeUndefined()
    expect(activeOperationType('query Foo {', 0)).toBeUndefined()
  })

  it('returns the root type of the operation the cursor is inside', () => {
    const doc = 'query A {\n  me\n}\n\nmutation B {\n  ping\n}'
    expect(activeOperationType(doc, doc.indexOf('me'))).toBe('query')
    expect(activeOperationType(doc, doc.indexOf('ping'))).toBe('mutation')
  })
})
