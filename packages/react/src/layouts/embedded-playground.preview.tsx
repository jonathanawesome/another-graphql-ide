import { createPreview, type NavPath } from 'react-foundry'

import { ConnectionBar } from '../components'
import { DocsEditor } from '../recipes'
import { AGIProvider } from '../state'

import { COUNTRIES_ENDPOINT } from './fixtures'

export const nav: NavPath = 'Layouts/Embedded Playground'

const starterQuery = `# The schema loads on mount, so completion and linting work right away.
query Countries {
  countries {
    code
    name
    emoji
  }
}
`

/**
 * A compact embed where the reader owns the endpoint. autoConnect introspects
 * it on mount; Connect does it again after the reader changes the endpoint.
 */
export const Playground = createPreview({
  label: 'Endpoint + docs editor in a card',
  render: () => (
    <AGIProvider
      endpoint={COUNTRIES_ENDPOINT}
      autoConnect
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
