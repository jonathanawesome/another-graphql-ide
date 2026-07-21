/** A field to toggle, addressed by root operation plus a field-name path. */
export type ToggleFieldTarget = {
  rootOperation: 'query' | 'mutation' | 'subscription'
  path: string[]
}

/**
 * A one-shot caret request. The `nonce` lets the editor apply the move exactly
 * once without a feedback loop when the same offset is requested twice.
 */
export type PendingSelection = { offset: number; nonce: number }

export type DocumentSlice = {
  query: string
  variables: string
  operationName?: string
  cursor: number
  pendingSelection?: PendingSelection
  setQuery: (query: string) => void
  setVariables: (variables: string) => void
  setOperationName: (operationName?: string) => void
  setCursor: (cursor: number) => void
  toggleField: (target: ToggleFieldTarget) => void
}
