import {
  graphiqlTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'
import { LOCAL_ENDPOINT } from '@another-graphql-ide/state'
import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '../state'

import { DocsEditor } from './docs-editor/docs-editor'

export const nav: NavPath = 'Recipes/Multiple Instances'

/**
 * Two providers, two different schemas. Different schemas rather than the same
 * one twice, because two stores are independent by construction: what can
 * actually break is whether each component reaches its own store, and divergent
 * completion makes that visible.
 *
 * No SchemaTree here on purpose. The keyboard shortcut bus is page-global and
 * only the most recently mounted tree responds, which would read as broken
 * isolation while being the bus doing what it documents.
 */
export const SideBySide = createPreview({
  label: 'Two independent editors',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, marginBottom: 8 }}>
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, marginBottom: 8 }}>
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
