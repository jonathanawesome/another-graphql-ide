import {
  enterpriseTestSchema,
  graphiqlTestSchema,
  performanceTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'
import { createPreview, type NavPath } from 'react-foundry'

import { SchemaTree } from './schema-tree'

export const nav: NavPath = 'Exported Components/Schema Tree'

export const EnterpriseTestSchema = createPreview({
  label: 'Enterprise Test Schema',
  render: () => <SchemaTree schema={enterpriseTestSchema} />,
})

export const GraphiqlTestSchema = createPreview({
  label: 'GraphiQL Test Schema',
  render: () => <SchemaTree schema={graphiqlTestSchema} />,
})

export const VeterinaryOfficeTestSchema = createPreview({
  label: 'Veterinary Office Test Schema',
  render: () => <SchemaTree schema={veterinaryOfficeSchema} />,
})

export const PerformanceTestSchema = createPreview({
  label: 'Performance Test Schema',
  render: () => <SchemaTree schema={performanceTestSchema} />,
})
