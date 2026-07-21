/**
 * A field (or one of its arguments) to toggle, addressed by root operation plus
 * a field-name path. When `argument` is set, the field at `path` gets that
 * argument toggled on or off instead of the field itself.
 */
export type ToggleFieldTarget = {
  rootOperation: 'query' | 'mutation' | 'subscription'
  path: string[]
  argument?: string
}

/**
 * A one-shot selection request. `anchor`/`head` are equal for a plain caret or
 * span a range to select (e.g. a placeholder to type over). The `nonce` lets
 * the editor apply the move exactly once without a feedback loop.
 */
export type PendingSelection = { anchor: number; head: number; nonce: number }

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
