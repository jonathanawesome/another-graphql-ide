import type { GraphQLSchema } from 'graphql'

export type SchemaSlice = {
  schema?: GraphQLSchema
  setSchema: (schema: GraphQLSchema | undefined) => void
}
