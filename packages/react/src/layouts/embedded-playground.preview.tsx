import { createPreview, type NavPath } from 'react-foundry'

import { ConnectionBar } from '../components'
import { DocsEditor } from '../recipes'
import { AGIProvider } from '../state'

import { COUNTRIES_ENDPOINT } from './fixtures'

export const nav: NavPath = 'Layouts/Embedded Playground'

const starterQuery = `# Press Connect to introspect the endpoint above, then run this.
query Countries {
  countries {
    code
    name
    emoji
  }
}
`

/**
 * A compact embed where the reader owns the endpoint. Connect introspects it
 * and the schema reaches the editor for completion and execution, because both
 * read the same provider.
 */
export const Playground = createPreview({
  label: 'Endpoint + docs editor in a card',
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
          maxWidth: 720,
          padding: 16,
          border: '1px solid currentColor',
          borderRadius: 8,
        }}
      >
        <ConnectionBar />
        <DocsEditor height={420} />
      </div>
    </AGIProvider>
  ),
})
