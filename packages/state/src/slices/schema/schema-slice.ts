import {
  buildClientSchema,
  getIntrospectionQuery,
  type IntrospectionQuery,
} from 'graphql'

import type { AppSliceCreator } from '../../store/types'
import { createTransport } from '../../transport/transport'

import type { SchemaSlice } from './types'

export const createSchemaSlice: AppSliceCreator<SchemaSlice> = (set, get) => {
  // Bumped per connect, so an older introspection that resolves late cannot
  // overwrite the schema for a newer endpoint.
  let latest = 0

  return {
    schema: undefined,
    schemaStatus: 'idle',
    schemaError: undefined,

    setSchema: schema => set({ schema }),

    connect: async () => {
      const call = ++latest
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

        if (call !== latest) return

        const data = result.data as IntrospectionQuery | undefined
        if (!data?.__schema)
          throw new Error('Introspection returned no schema.')

        set({ schema: buildClientSchema(data), schemaStatus: 'connected' })
      } catch (error) {
        if (call !== latest) return
        // Network and CORS failures surface here.
        set({
          schemaStatus: 'error',
          schemaError: error instanceof Error ? error.message : String(error),
        })
      }
    },
  }
}
