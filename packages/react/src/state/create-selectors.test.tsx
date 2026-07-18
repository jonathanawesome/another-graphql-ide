import { createAGIStore } from '@another-graphql-ide/state'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createSelectors } from './create-selectors'

describe('createSelectors', () => {
  it('exposes a hook per state key', () => {
    const store = createSelectors(createAGIStore())
    expect(Object.keys(store.use)).toContain('query')
    expect(Object.keys(store.use)).toContain('execute')
  })

  it('reacts to store updates', () => {
    const store = createSelectors(createAGIStore())
    const { result } = renderHook(() => store.use.query())

    expect(result.current).toBe('')
    act(() => {
      store.getState().setQuery('{ isTest }')
    })
    expect(result.current).toBe('{ isTest }')
  })
})
