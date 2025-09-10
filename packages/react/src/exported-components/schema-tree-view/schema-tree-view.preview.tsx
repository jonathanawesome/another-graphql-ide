import {
  createPreview,
  enterpriseTestSchema,
  graphiqlTestSchema,
  performanceTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'

import { SchemaTreeView, type SchemaTreeViewProps } from './schema-tree-view'

const preview = createPreview<SchemaTreeViewProps>({
  title: 'SchemaTreeView',
  component: SchemaTreeView,
  category: 'Exported Components',
  demos: [
    {
      name: 'Enterprise Test Schema',
      render: () => <SchemaTreeView schema={enterpriseTestSchema} />,
    },
    {
      name: 'GraphiQL Test Schema',
      render: () => <SchemaTreeView schema={graphiqlTestSchema} />,
    },
    {
      name: 'Veterinary Office Test Schema',
      render: () => <SchemaTreeView schema={veterinaryOfficeSchema} />,
    },
    {
      name: 'Performance Test Schema',
      render: () => <SchemaTreeView schema={performanceTestSchema} />,
    },
  ],
})

export default preview
