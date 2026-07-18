import { describe, expect, it } from 'vitest'

import { createAGIStore } from '../../store/create-agi-store'

describe('document slice', () => {
  it('starts with empty document state', () => {
    const store = createAGIStore()
    const state = store.getState()
    expect(state.query).toBe('')
    expect(state.variables).toBe('')
    expect(state.operationName).toBeUndefined()
  })

  it('updates query, variables, and operationName', () => {
    const store = createAGIStore()
    store.getState().setQuery('{ isTest }')
    store.getState().setVariables('{"id":1}')
    store.getState().setOperationName('Example')

    const state = store.getState()
    expect(state.query).toBe('{ isTest }')
    expect(state.variables).toBe('{"id":1}')
    expect(state.operationName).toBe('Example')
  })
})
