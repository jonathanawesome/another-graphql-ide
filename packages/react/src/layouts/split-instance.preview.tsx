import { createPreview, type NavPath } from 'react-foundry'

import { ConnectionBar, EditorGroup, SchemaTree } from '../components'
import { RunButton } from '../recipes'
import { AGIProvider } from '../state'

import { SCHEMAS, endpointFor } from './fixtures'

export const nav: NavPath = 'Layouts/Split Instance'

const prose = { fontSize: 14, lineHeight: 1.6, margin: '12px 0' }

/**
 * One provider, pieces scattered through a host page with the host's own
 * content between them. The provider renders no DOM, so the pieces need no
 * shared parent. Shortcuts follow whichever piece was last used.
 */
export const HostPage = createPreview({
  label: 'Header, sidebar and main from one instance',
  render: () => {
    const { schema, path } = SCHEMAS.graphiql

    return (
      <AGIProvider schema={schema} endpoint={endpointFor(path)} theme={false}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gridTemplateRows: 'auto 1fr',
            gap: 16,
            height: 680,
            width: '100%',
          }}
        >
          <header
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <strong style={{ whiteSpace: 'nowrap' }}>Acme API</strong>
            <div style={{ flex: 1 }}>
              <ConnectionBar />
            </div>
          </header>

          <aside style={{ minHeight: 0 }}>
            <SchemaTree />
          </aside>

          <main
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <p style={prose}>
              Host content sits between the pieces. Pick fields in the sidebar
              and they land in the editor below, or try a canned query first.{' '}
              <RunButton operation="{ isTest }" text="Try it" />
            </p>
            <div style={{ flex: 1, minHeight: 0 }}>
              <EditorGroup />
            </div>
          </main>
        </div>
      </AGIProvider>
    )
  },
})
