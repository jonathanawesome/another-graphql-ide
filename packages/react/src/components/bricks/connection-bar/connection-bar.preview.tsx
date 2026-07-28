import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '../../../state'
import { EditorGroup } from '../editor-group/editor-group'

import { ConnectionBar } from './connection-bar'

export const nav: NavPath = 'Bricks/Connection Bar'

// A public, CORS-open endpoint so the connect flow works end to end in the
// gallery (including the static Pages build).
const COUNTRIES_ENDPOINT = 'https://countries.trevorblades.com/'

const starterQuery = `# Press Connect to introspect the endpoint above, then run this.
# Points at the public Countries API by default.
query Countries {
  countries {
    code
    name
    emoji
  }
}
`

// One provider spanning both bricks, which is what makes the handshake work:
// the endpoint it seeds shows up in the bar's input, Connect introspects it, and
// the resulting schema reaches the editor for autocomplete and execution.
export const ConnectAndQuery = createPreview({
  label: 'Connect to an endpoint',
  render: () => (
    <AGIProvider
      endpoint={COUNTRIES_ENDPOINT}
      defaultQuery={starterQuery}
      theme={false}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: 560,
          width: '100%',
        }}
      >
        <ConnectionBar />
        <div style={{ flex: 1, minHeight: 0 }}>
          <EditorGroup />
        </div>
      </div>
    </AGIProvider>
  ),
})
