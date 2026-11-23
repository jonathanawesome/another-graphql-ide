import { createPreview, type NavPath } from 'react-foundry'

import { EditorGroup, Resizer, SchemaTree } from '../components'
import { AGIProvider } from '../state'

import { SCHEMAS, endpointFor, schemaControl } from './fixtures'

export const nav: NavPath = 'Layouts/Explorer + Editor'

// One provider spanning both bricks, which is what lets clicking a field in the
// tree toggle it into the editor's document at the cursor's operation.
//
// Switching schemas does not remount: the provider syncs the schema prop into
// the store and the transport is rebuilt per execution, so the document you have
// been writing survives the switch (and lints against the new schema).
export const ClickToInsert = createPreview({
  label: 'Click a field to insert it',
  controls: { schema: schemaControl('deep') },
  render: values => {
    const { schema, path } = SCHEMAS[values.schema]

    return (
      <AGIProvider schema={schema} endpoint={endpointFor(path)} theme={false}>
        <div style={{ display: 'flex', gap: 12, height: 560, width: '100%' }}>
          <Resizer
            orientation="horizontal"
            defaultSizePercent={30}
            minSizePercent={20}
            maxSizePercent={60}
            firstPane={<SchemaTree />}
            secondPane={<EditorGroup />}
          />
        </div>
      </AGIProvider>
    )
  },
})
