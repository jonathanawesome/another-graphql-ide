import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { LOCAL_ENDPOINT } from '@another-graphql-ide/state'
import { createPreview, type NavPath } from 'react-foundry'

import { Resizer } from '../../ui-components/resizer/resizer'
import { EditorGroup } from '../editor-group/editor-group'

import { SchemaTree } from './schema-tree'

export const nav: NavPath = 'Exported Components/Schema Tree + Editor'

// Dev hits the real yoga server; the static production build runs in-process.
const endpoint = import.meta.env.PROD
  ? LOCAL_ENDPOINT
  : 'http://localhost:4000/graphql'

// Both bricks share the singleton store: EditorGroup bridges the schema into
// state, the SchemaTree reads it back, and clicking a field's insert button
// toggles it into the editor's document at the cursor's operation.
export const ClickToInsert = createPreview({
  label: 'Click a field to insert it',
  render: () => (
    <div style={{ display: 'flex', gap: 12, height: 560, width: '100%' }}>
      <Resizer
        orientation="horizontal"
        defaultSizePercent={30}
        minSizePercent={20}
        maxSizePercent={60}
        firstPane={<SchemaTree />}
        secondPane={
          <EditorGroup schema={graphiqlTestSchema} endpoint={endpoint} />
        }
      />
    </div>
  ),
})
