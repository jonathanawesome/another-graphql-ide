import { createPreview, type NavPath } from 'react-foundry'

import { SchemaTree } from '../components'
import { AGIProvider } from '../state'

import { SCHEMAS, schemaControl } from './fixtures'

export const nav: NavPath = 'Layouts/Schema Reference'

const prose = { fontSize: 14, lineHeight: 1.6, margin: '12px 0' }

/**
 * The tree as a browsable reference in a docs sidebar, with no editor.
 * readOnly turns off insertion, since there is no document to insert into.
 */
export const Sidebar = createPreview({
  label: 'Schema tree as a docs sidebar',
  controls: { schema: schemaControl('veterinary') },
  render: values => (
    <AGIProvider schema={SCHEMAS[values.schema].schema} theme={false}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 24,
          height: 560,
          width: '100%',
        }}
      >
        <aside style={{ minHeight: 0 }}>
          <SchemaTree readOnly />
        </aside>
        <article style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: 22 }}>API reference</h1>
          <p style={prose}>
            Browse every type the API exposes. Search, switch between query,
            mutation and subscription roots, and expand fields to see their
            arguments and return types.
          </p>
        </article>
      </div>
    </AGIProvider>
  ),
})
