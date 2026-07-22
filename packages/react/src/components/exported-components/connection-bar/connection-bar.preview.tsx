import { createPreview, type NavPath } from 'react-foundry'

import { EditorGroup } from '../editor-group/editor-group'

import { ConnectionBar } from './connection-bar'

export const nav: NavPath = 'Exported Components/Connection Bar'

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

// ConnectionBar and EditorGroup share the singleton store: seeding the endpoint
// through EditorGroup lands it in the bar's input; Connect introspects it and
// loads the schema back into the editor for autocomplete + execution.
export const ConnectAndQuery = createPreview({
  label: 'Connect to an endpoint',
  render: () => (
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
        <EditorGroup
          endpoint={COUNTRIES_ENDPOINT}
          defaultQuery={starterQuery}
        />
      </div>
    </div>
  ),
})
