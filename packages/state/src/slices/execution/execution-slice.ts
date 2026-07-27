import { parseVariables } from '../../execution/parse-variables'
import { runRequest } from '../../execution/run-request'
import type { AppSliceCreator } from '../../store/types'
import { createTransport } from '../../transport/transport'

import type { ExecutionSlice } from './types'

const DEFAULT_ENDPOINT = 'http://localhost:4000/graphql'

export const createExecutionSlice: AppSliceCreator<ExecutionSlice> = (
  set,
  get
) => {
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
      // Abort first, so a run rejected for bad variables still cancels the
      // previous one rather than leaving it streaming over the error.
      controller?.abort()
      controller = new AbortController()
      const { signal } = controller

      set({ status: 'fetching', error: undefined, response: '' })

      const { query, variables, operationName, endpoint, headers, schema } =
        get()

      const parsed = parseVariables(variables)
      if (!parsed.ok) {
        set({ status: 'error', error: parsed.message })
        return
      }

      const outcome = await runRequest(
        createTransport({ endpoint, schema, headers }),
        { query, variables: parsed.value, operationName },
        signal,
        {
          onResult: result =>
            set({
              status: 'streaming',
              response: JSON.stringify(result, null, 2),
            }),
          onError: error => set({ status: 'error', error }),
        }
      )

      if (outcome === 'completed') set({ status: 'idle' })
    },
  }
}
