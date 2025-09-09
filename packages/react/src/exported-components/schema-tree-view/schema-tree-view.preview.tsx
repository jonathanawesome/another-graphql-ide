import {
  createPreview,
  enterpriseTestSchema,
  graphiqlTestSchema,
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
      render: () => (
        <div style={{ height: '600px', width: '400px' }}>
          <SchemaTreeView schema={enterpriseTestSchema} />
        </div>
      ),
    },
    {
      name: 'GraphiQL Test Schema',
      render: () => (
        <div style={{ height: '600px', width: '400px' }}>
          <SchemaTreeView schema={graphiqlTestSchema} />
        </div>
      ),
    },
    {
      name: 'Veterinary Office Test Schema',
      render: () => (
        <div style={{ height: '600px', width: '400px' }}>
          <SchemaTreeView schema={veterinaryOfficeSchema} />
        </div>
      ),
    },
  ],
})

export default preview
