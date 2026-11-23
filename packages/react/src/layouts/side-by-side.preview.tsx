import {
  graphiqlTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'
import { createPreview, type NavPath } from 'react-foundry'

import { EditorGroup, Resizer, SchemaTree } from '../components'
import { DocsEditor } from '../recipes'
import { AGIProvider, LOCAL_ENDPOINT } from '../state'

import { SCHEMAS, endpointFor } from './fixtures'

export const nav: NavPath = 'Layouts/Side by Side'

const caption = { fontSize: 12, marginBottom: 8 }
const column = { flex: 1, minWidth: 0 }

/**
 * Two providers, two different schemas. Different schemas rather than the same
 * one twice, because two stores are independent by construction: what can
 * actually break is whether each component reaches its own store, and divergent
 * completion makes that visible.
 */
export const Editors = createPreview({
  label: 'Two independent editors',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
      <div style={column}>
        <p style={caption}>
          GraphiQL schema. Type <code>{'{'}</code> for completion.
        </p>
        <AGIProvider
          endpoint={LOCAL_ENDPOINT}
          schema={graphiqlTestSchema}
          defaultQuery={'query Left {\n  isTest\n}\n'}
          storageKey="agi-preview-left"
          theme={false}
        >
          <DocsEditor height={400} />
        </AGIProvider>
      </div>

      <div style={column}>
        <p style={caption}>
          Veterinary schema. Completion here offers different fields.
        </p>
        <AGIProvider
          endpoint={LOCAL_ENDPOINT}
          schema={veterinaryOfficeSchema}
          defaultQuery={'query Right {\n  __typename\n}\n'}
          storageKey="agi-preview-right"
          theme={false}
        >
          <DocsEditor height={400} />
        </AGIProvider>
      </div>
    </div>
  ),
})

const Ide = ({ name }: { name: 'graphiql' | 'veterinary' }) => {
  const { schema, path } = SCHEMAS[name]

  return (
    <AGIProvider
      schema={schema}
      endpoint={endpointFor(path)}
      storageKey={`agi-preview-${name}`}
      theme={false}
    >
      <div style={{ display: 'flex', height: 520 }}>
        <Resizer
          orientation="horizontal"
          defaultSizePercent={40}
          firstPane={<SchemaTree />}
          secondPane={<EditorGroup />}
        />
      </div>
    </AGIProvider>
  )
}

/**
 * Each tree's shortcuts stay in its own instance: Mod+Shift+L toggles return
 * types in whichever side you last clicked or focused, never both.
 */
export const FullInstances = createPreview({
  label: 'Two IDEs with schema trees',
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={column}>
        <p style={caption}>GraphiQL schema.</p>
        <Ide name="graphiql" />
      </div>
      <div style={column}>
        <p style={caption}>Veterinary schema.</p>
        <Ide name="veterinary" />
      </div>
    </div>
  ),
})
