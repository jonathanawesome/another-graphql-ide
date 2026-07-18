import { describe, expect, it } from 'vitest'

import { createAppStore } from '../../store/create-app-store'

describe('document slice', () => {
  it('starts with empty document state', () => {
    const store = createAppStore()
    const state = store.getState()
    expect(state.query).toBe('')
    expect(state.variables).toBe('')
    expect(state.operationName).toBeUndefined()
  })

  it('updates query, variables, and operationName', () => {
    const store = createAppStore()
    store.getState().setQuery('{ isTest }')
    store.getState().setVariables('{"id":1}')
    store.getState().setOperationName('Example')

    const state = store.getState()
    expect(state.query).toBe('{ isTest }')
    expect(state.variables).toBe('{"id":1}')
    expect(state.operationName).toBe('Example')
  })
})
