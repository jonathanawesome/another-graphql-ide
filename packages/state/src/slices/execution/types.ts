export type ExecutionStatus = 'idle' | 'fetching' | 'streaming' | 'error'

export type ExecutionSlice = {
  endpoint: string
  status: ExecutionStatus
  response: string
  error?: string
  setEndpoint: (endpoint: string) => void
  execute: () => Promise<void>
  cancel: () => void
}
