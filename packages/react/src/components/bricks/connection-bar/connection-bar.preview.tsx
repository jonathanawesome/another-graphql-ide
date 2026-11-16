import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '../../../state'

import { ConnectionBar } from './connection-bar'

export const nav: NavPath = 'Bricks/Connection Bar'

// A public, CORS-open endpoint so Connect works end to end in the gallery
// (including the static Pages build). Layouts/Embedded Playground pairs this
// with an editor.
const COUNTRIES_ENDPOINT = 'https://countries.trevorblades.com/'

export const Connect = createPreview({
  label: 'Connect to an endpoint',
  render: () => (
    <AGIProvider endpoint={COUNTRIES_ENDPOINT} theme={false}>
      <ConnectionBar />
    </AGIProvider>
  ),
})
