import type { StateCreator } from 'zustand/vanilla'

import type { AppState } from '../../store/types'
import { createTransport } from '../../transport/transport'

import type { ExecutionSlice } from './types'

const DEFAULT_ENDPOINT = 'http://localhost:4000/graphql'

export const createExecutionSlice: StateCreator<
  AppState,
  [],
  [],
  ExecutionSlice
> = (set, get) => {
  let controller: AbortController | null = null

  return {
    endpoint: DEFAULT_ENDPOINT,
    headers: {},
    status: 'idle',
    response: '',
    error: undefined,

    setEndpoint: endpoint => set({ endpoint }),
    setHeaders: headers => set({ headers }),

    cancel: () => {
      controller?.abort()
      controller = null
      set({ status: 'idle' })
    },

    execute: async () => {
      const { query, variables, operationName, endpoint, headers, schema } =
        get()

      let parsedVariables: Record<string, unknown> | undefined
      if (variables.trim()) {
        try {
          parsedVariables = JSON.parse(variables) as Record<string, unknown>
        } catch {
          set({ status: 'error', error: 'Variables are not valid JSON' })
          return
        }
      }

      controller?.abort()
      controller = new AbortController()
      const { signal } = controller

      set({ status: 'fetching', error: undefined, response: '' })

      const transport = createTransport({ endpoint, schema, headers })
      try {
        for await (const result of transport.execute(
          { query, variables: parsedVariables, operationName },
          { signal }
        )) {
          if (signal.aborted) return
          set({
            status: 'streaming',
            response: JSON.stringify(result, null, 2),
          })
        }
        if (!signal.aborted) set({ status: 'idle' })
      } catch (error) {
        if (signal.aborted) return
        set({
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    },
  }
}
