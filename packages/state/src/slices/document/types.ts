export type DocumentSlice = {
  query: string
  variables: string
  operationName?: string
  setQuery: (query: string) => void
  setVariables: (variables: string) => void
  setOperationName: (operationName?: string) => void
}
