import {
  createPreview,
  enterpriseTestSchema,
  graphiqlTestSchema,
  performanceTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'

import { SchemaTree, type SchemaTreeProps } from './schema-tree'

const preview = createPreview<SchemaTreeProps>({
  title: 'SchemaTree',
  component: SchemaTree,
  category: 'Exported Components',
  demos: [
    {
      name: 'Enterprise Test Schema',
      render: () => <SchemaTree schema={enterpriseTestSchema} />,
    },
    {
      name: 'GraphiQL Test Schema',
      render: () => <SchemaTree schema={graphiqlTestSchema} />,
    },
    {
      name: 'Veterinary Office Test Schema',
      render: () => <SchemaTree schema={veterinaryOfficeSchema} />,
    },
    {
      name: 'Performance Test Schema',
      render: () => <SchemaTree schema={performanceTestSchema} />,
    },
  ],
})

export default preview
