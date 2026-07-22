import type { GraphQLSchema } from 'graphql'

export type SchemaStatus = 'idle' | 'connecting' | 'connected' | 'error'

export type SchemaSlice = {
  schema?: GraphQLSchema
  schemaStatus: SchemaStatus
  schemaError?: string
  setSchema: (schema: GraphQLSchema | undefined) => void
  /**
   * Introspect the current endpoint (with the current headers) and load the
   * resulting schema. Lets a user point the IDE at their own GraphQL endpoint.
   */
  connect: () => Promise<void>
}
