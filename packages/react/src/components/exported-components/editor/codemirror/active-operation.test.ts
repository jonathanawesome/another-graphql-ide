import { describe, expect, it } from 'vitest'

import type { OperationRange } from './active-operation'
import {
  getActiveOperationName,
  getOperationRanges,
  selectActiveOperationIndex,
} from './active-operation'

const TWO_OPS = 'query A { a }\n\nquery B { b }'
// Offsets: A spans 0-12, the blank line is 13-14, B starts at 15.

/** Indexed access under noUncheckedIndexedAccess, narrowed for assertions. */
const at = (ranges: OperationRange[], i: number): OperationRange => {
  const range = ranges[i]
  if (!range) throw new Error(`no operation range at index ${i}`)
  return range
}

describe('getOperationRanges', () => {
  it('returns each operation name and source range in order', () => {
    const ranges = getOperationRanges(TWO_OPS)
    expect(ranges.map(r => r.name)).toEqual(['A', 'B'])
    expect(at(ranges, 0).from).toBe(0)
    expect(at(ranges, 1).from).toBeGreaterThan(at(ranges, 0).to)
  })

  it('reports anonymous operations with no name', () => {
    expect(at(getOperationRanges('{ isTest }'), 0).name).toBeUndefined()
  })

  it('ignores fragments, keeping only operations', () => {
    const ranges = getOperationRanges(
      'fragment F on Query { a }\nquery Named { ...F }'
    )
    expect(ranges.map(r => r.name)).toEqual(['Named'])
  })

  it('returns [] for an incomplete query instead of throwing', () => {
    expect(getOperationRanges('query Foo {')).toEqual([])
  })

  it('returns [] for an empty document', () => {
    expect(getOperationRanges('')).toEqual([])
  })
})

describe('selectActiveOperationIndex', () => {
  const ranges = getOperationRanges(TWO_OPS)

  it('returns -1 when there are no operations', () => {
    expect(selectActiveOperationIndex([], 0)).toBe(-1)
  })

  it('picks the operation containing the cursor', () => {
    expect(selectActiveOperationIndex(ranges, 3)).toBe(0)
    expect(selectActiveOperationIndex(ranges, at(ranges, 1).from + 1)).toBe(1)
  })

  it('includes the range boundaries', () => {
    expect(selectActiveOperationIndex(ranges, at(ranges, 1).from)).toBe(1)
    expect(selectActiveOperationIndex(ranges, at(ranges, 0).to)).toBe(0)
  })

  it('falls back to the last operation starting before the cursor', () => {
    // Cursor in the blank line between the two operations.
    expect(selectActiveOperationIndex(ranges, at(ranges, 0).to + 1)).toBe(0)
  })

  it('falls back to the first operation when the cursor precedes all', () => {
    const later = getOperationRanges('   query A { a }')
    expect(selectActiveOperationIndex(later, 0)).toBe(0)
  })
})

describe('getActiveOperationName', () => {
  it('returns the name of the operation under the cursor', () => {
    expect(getActiveOperationName(TWO_OPS, 3)).toBe('A')
    expect(getActiveOperationName(TWO_OPS, TWO_OPS.length - 2)).toBe('B')
  })

  it('returns the sole operation name regardless of cursor', () => {
    expect(getActiveOperationName('query Only { a }', 0)).toBe('Only')
  })

  it('returns undefined for an anonymous active operation', () => {
    expect(getActiveOperationName('{ isTest }', 2)).toBeUndefined()
  })

  it('returns undefined when there are no operations', () => {
    expect(getActiveOperationName('', 0)).toBeUndefined()
    expect(getActiveOperationName('query Foo {', 0)).toBeUndefined()
  })
})
