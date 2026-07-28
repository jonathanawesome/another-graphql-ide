import {
  deepTestSchema,
  enterpriseTestSchema,
  graphiqlTestSchema,
  performanceTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'
import type { GraphQLSchema } from 'graphql'
import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '../../../state'

import { SchemaTree } from './schema-tree'

export const nav: NavPath = 'Exported Components/Schema Tree'

// Each preview gets its own provider so switching between them does not leave
// the previous schema in shared state.
const withSchema = (schema: GraphQLSchema) => () => (
  <AGIProvider schema={schema} theme={false}>
    <SchemaTree />
  </AGIProvider>
)

export const EnterpriseTestSchema = createPreview({
  label: 'Enterprise Test Schema',
  render: withSchema(enterpriseTestSchema),
})

export const GraphiqlTestSchema = createPreview({
  label: 'GraphiQL Test Schema',
  render: withSchema(graphiqlTestSchema),
})

export const VeterinaryOfficeTestSchema = createPreview({
  label: 'Veterinary Office Test Schema',
  render: withSchema(veterinaryOfficeSchema),
})

export const PerformanceTestSchema = createPreview({
  label: 'Performance Test Schema',
  render: withSchema(performanceTestSchema),
})

// The depth counterpart to the performance schema: small type set, cyclic, so
// expansion never bottoms out.
export const DeepTestSchema = createPreview({
  label: 'Deep Test Schema',
  render: withSchema(deepTestSchema),
})
