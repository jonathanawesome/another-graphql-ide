export type ExecutionStatus = 'idle' | 'fetching' | 'streaming' | 'error'

export type ExecutionSlice = {
  endpoint: string
  headers: Record<string, string>
  status: ExecutionStatus
  response: string
  error?: string
  setEndpoint: (endpoint: string) => void
  setHeaders: (headers: Record<string, string>) => void
  execute: () => Promise<void>
  cancel: () => void
}
