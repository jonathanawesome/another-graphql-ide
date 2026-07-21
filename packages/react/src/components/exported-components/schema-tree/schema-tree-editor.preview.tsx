import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { createPreview, type NavPath } from 'react-foundry'

import { EditorGroup } from '../editor-group/editor-group'

import { SchemaTree } from './schema-tree'

export const nav: NavPath = 'Exported Components/Schema Tree + Editor'

// Both bricks share the singleton store: EditorGroup bridges the schema into
// state, the SchemaTree reads it back, and clicking a field's insert button
// toggles it into the editor's document at the cursor's operation.
export const ClickToInsert = createPreview({
  label: 'Click a field to insert it',
  render: () => (
    <div style={{ display: 'flex', gap: 12, height: 560, width: '100%' }}>
      <div style={{ display: 'flex', width: 320, minHeight: 0 }}>
        <SchemaTree />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <EditorGroup
          schema={graphiqlTestSchema}
          endpoint="http://localhost:4000/graphql"
        />
      </div>
    </div>
  ),
})
