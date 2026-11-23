import {
  deepTestSchema,
  enterpriseTestSchema,
  graphiqlTestSchema,
  performanceTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'

import { LOCAL_ENDPOINT } from '../state'

// Each schema is paired with the yoga mount that serves it (see apps/yoga), so
// what the tree offers is what the server can actually execute.
export const SCHEMAS = {
  graphiql: { schema: graphiqlTestSchema, path: '/graphql' },
  veterinary: { schema: veterinaryOfficeSchema, path: '/vet' },
  enterprise: { schema: enterpriseTestSchema, path: '/enterprise' },
  deep: { schema: deepTestSchema, path: '/deep' },
  performance: { schema: performanceTestSchema, path: '/performance' },
} as const

export type SchemaKey = keyof typeof SCHEMAS

export const schemaControl = (fallback: SchemaKey) => ({
  type: 'select' as const,
  options: Object.keys(SCHEMAS) as SchemaKey[],
  default: fallback,
})

// Dev hits the real yoga server; the static production build runs in-process.
export const endpointFor = (path: string) =>
  import.meta.env.PROD ? LOCAL_ENDPOINT : `http://localhost:4000${path}`

/** Public and CORS-open, so connecting works in the static Pages build too. */
export const COUNTRIES_ENDPOINT = 'https://countries.trevorblades.com/'
