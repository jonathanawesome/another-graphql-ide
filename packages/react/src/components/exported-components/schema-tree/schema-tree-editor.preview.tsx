import {
  deepTestSchema,
  enterpriseTestSchema,
  graphiqlTestSchema,
  performanceTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'
import { LOCAL_ENDPOINT } from '@another-graphql-ide/state'
import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '../../../state'
import { Resizer } from '../../ui-components/resizer/resizer'
import { EditorGroup } from '../editor-group/editor-group'

import { SchemaTree } from './schema-tree'

export const nav: NavPath = 'Exported Components/Schema Tree + Editor'

// Each schema is paired with the yoga mount that serves it (see apps/yoga), so
// what the tree offers is what the server can actually execute.
const SCHEMAS = {
  graphiql: { schema: graphiqlTestSchema, path: '/graphql' },
  veterinary: { schema: veterinaryOfficeSchema, path: '/vet' },
  enterprise: { schema: enterpriseTestSchema, path: '/enterprise' },
  deep: { schema: deepTestSchema, path: '/deep' },
  performance: { schema: performanceTestSchema, path: '/performance' },
} as const

// Dev hits the real yoga server; the static production build runs in-process
// against whichever schema is selected.
const endpointFor = (path: string) =>
  import.meta.env.PROD ? LOCAL_ENDPOINT : `http://localhost:4000${path}`

// One provider spanning both bricks, which is what lets clicking a field in the
// tree toggle it into the editor's document at the cursor's operation.
//
// Switching schemas does not remount: the provider syncs the schema prop into
// the store and the transport is rebuilt per execution, so the document you have
// been writing survives the switch (and lints against the new schema).
export const ClickToInsert = createPreview({
  label: 'Click a field to insert it',
  controls: {
    schema: {
      type: 'select',
      options: ['graphiql', 'veterinary', 'enterprise', 'deep', 'performance'],
      default: 'deep',
    },
  },
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
