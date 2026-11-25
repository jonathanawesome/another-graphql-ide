import { describe, expect, it } from 'vitest'

import { makeSupergraph, subgraphSdl } from '../../sdl-viewer/__fixtures__/sdl'
import { editFields, reorderDefinitions } from '../__fixtures__/edits'

import {
  ADDED,
  REMOVED,
  SAME,
  compareSdl,
  foldRuns,
  unifiedText,
} from './compare-sdl'

/** Rows as a patch body, such as `-old` and `+new`. */
const patch = (before: string, after: string) => {
  const comparison = compareSdl(before, after)
  const text = unifiedText(comparison).text.split('\n')
  return [...comparison.rows.kinds].map(
    (kind, row) => `${[' ', '-', '+'][kind] ?? '?'}${text[row] ?? ''}`
  )
}

const supergraph = makeSupergraph(340)
const edited = editFields(supergraph, 50)

describe('compareSdl', () => {
  it('finds nothing in equal documents', () => {
    expect(compareSdl(subgraphSdl, subgraphSdl)).toMatchObject({
      kind: 'unchanged',
      removed: 0,
      added: 0,
    })
    expect(compareSdl('', '').kind).toBe('unchanged')
  })

  it('ignores line endings and a trailing newline', () => {
    expect(compareSdl('type A\n', 'type A').kind).toBe('unchanged')
    expect(compareSdl('type A\r\ntype B\r\n', 'type A\ntype B').kind).toBe(
      'unchanged'
    )
  })

  it('shows a changed field', () => {
    expect(patch('type A {\n  a: Int\n}', 'type A {\n  a: Int!\n}')).toEqual([
      ' type A {',
      '-  a: Int',
      '+  a: Int!',
      ' }',
    ])
  })

  it('shows a whole document as added or removed', () => {
    expect(patch('', 'scalar A\nscalar B\n')).toEqual([
      '+scalar A',
      '+scalar B',
    ])
    expect(patch('scalar A\n', '')).toEqual(['-scalar A'])
  })

  it('shows a moved type as removed and added', () => {
    const rows = patch(
      'type A {\n  a: Int\n}\n\nscalar B\n\nscalar C\n',
      'scalar B\n\nscalar C\n\ntype A {\n  a: Int\n}\n'
    )

    expect(rows).toContain('-type A {')
    expect(rows).toContain('+type A {')
  })

  it('shows a renamed type as one line', () => {
    expect(patch('type A {\n  a: Int\n}', 'type B {\n  a: Int\n}')).toEqual([
      '-type A {',
      '+type B {',
      '   a: Int',
      ' }',
    ])
  })

  it('finds no more changes than were made', () => {
    expect(compareSdl(supergraph, edited.sdl)).toMatchObject({
      kind: 'diff',
      removed: edited.removed,
      added: edited.added,
    })
  })

  it.each([
    ['edits', edited.sdl],
    ['a reorder', reorderDefinitions(edited.sdl)],
    ['SDL that does not parse', `${edited.sdl}type {`],
  ])('shows every line once and in order: %s', (_, to) => {
    const { rows, before, after } = compareSdl(supergraph, to)
    const numbers = (count: number) =>
      Array.from({ length: count }, (_, i) => i + 1)

    expect([...rows.before].filter(Boolean)).toEqual(numbers(before.count))
    expect([...rows.after].filter(Boolean)).toEqual(numbers(after.count))
    for (const [row, kind] of rows.kinds.entries()) {
      expect(Boolean(rows.before[row])).toBe(kind !== ADDED)
      expect(Boolean(rows.after[row])).toBe(kind !== REMOVED)
    }
  })

  it('ends when nothing matches', () => {
    const lines = (name: string) =>
      Array.from({ length: 5000 }, (_, i) => `# ${name} ${i}`).join('\n')

    expect(compareSdl(lines('a'), lines('b'))).toMatchObject({
      removed: 5000,
      added: 5000,
    })
  })
})

describe('foldRuns', () => {
  const folds = (kinds: number[], context: number) =>
    foldRuns(Uint8Array.from(kinds), context)
  const same = (count: number) => Array.from({ length: count }, () => SAME)

  it('keeps context around a change', () => {
    expect(folds([...same(10), ADDED, ...same(10)], 3)).toEqual([
      [0, 6],
      [14, 20],
    ])
    expect(folds([ADDED, ...same(12), REMOVED], 3)).toEqual([[4, 9]])
  })

  it('leaves short runs open', () => {
    expect(folds([ADDED, ...same(9), ADDED], 3)).toEqual([])
  })
})
