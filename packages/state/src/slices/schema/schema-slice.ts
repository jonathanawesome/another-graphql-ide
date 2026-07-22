import {
  buildClientSchema,
  getIntrospectionQuery,
  type IntrospectionQuery,
} from 'graphql'
import type { StateCreator } from 'zustand/vanilla'

import type { AppState } from '../../store/types'
import { createTransport } from '../../transport/transport'

import type { SchemaSlice } from './types'

export const createSchemaSlice: StateCreator<AppState, [], [], SchemaSlice> = (
  set,
  get
) => ({
  schema: undefined,
  schemaStatus: 'idle',
  schemaError: undefined,

  setSchema: schema => set({ schema }),

  connect: async () => {
    const { endpoint, headers } = get()
    set({ schemaStatus: 'connecting', schemaError: undefined })

    try {
      const transport = createTransport({ endpoint, headers })

      // Introspection returns a single result; drain the iterable and keep the
      // last value so incremental transports would still resolve correctly.
      let result
      for await (const value of transport.execute({
        query: getIntrospectionQuery(),
      })) {
        result = value
      }

      if (!result) throw new Error('No response from endpoint.')
      if (result.errors?.length) {
        throw new Error(
          result.errors
            .map(error =>
              error instanceof Error
                ? error.message
                : ((error as { message?: string }).message ?? String(error))
            )
            .join('; ')
        )
      }

      const data = result.data as IntrospectionQuery | undefined
      if (!data?.__schema) throw new Error('Introspection returned no schema.')

      set({ schema: buildClientSchema(data), schemaStatus: 'connected' })
    } catch (error) {
      // Network and CORS failures surface here.
      set({
        schemaStatus: 'error',
        schemaError: error instanceof Error ? error.message : String(error),
      })
    }
  },
})
