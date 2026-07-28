import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { LOCAL_ENDPOINT } from '@another-graphql-ide/state'
import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '../../../state'

import { EditorGroup } from './editor-group'

export const nav: NavPath = 'Bricks/Editor Group'

// Dev executes against the real yoga server (pnpm --filter yoga dev). The static
// production build has no server, so it runs in-process against the loaded schema
// via the local transport instead.
const endpoint = import.meta.env.PROD
  ? LOCAL_ENDPOINT
  : 'http://localhost:4000/graphql'

const starterQuery = `# Dev: executes against the yoga dev server (pnpm --filter yoga dev).
# Production build: runs in-process against the loaded schema.
query ExampleQuery {
  isTest
  test {
    id
  }
}
`

// EditorGroup fills its parent, so the preview gets a bounded box. Config now
// arrives through the provider rather than props.
const Framed = ({
  endpoint: url,
  children,
}: React.PropsWithChildren<{ endpoint: string }>) => (
  <div style={{ height: 520, width: '100%' }}>
    <AGIProvider
      endpoint={url}
      schema={graphiqlTestSchema}
      defaultQuery={starterQuery}
      theme={false}
    >
      {children}
    </AGIProvider>
  </div>
)

export const SchemaAwareLiveTransport = createPreview({
  label: 'Schema-aware + live transport',
  render: () => (
    <Framed endpoint={endpoint}>
      <EditorGroup />
    </Framed>
  ),
})

// Always pins the local sentinel + bundled schema, so the in-process executor is
// exercisable in `foundry dev` too (not only in a production build), with no yoga
// server running.
export const LocalExecution = createPreview({
  label: 'In-process execution (no server)',
  render: () => (
    <Framed endpoint={LOCAL_ENDPOINT}>
      <EditorGroup />
    </Framed>
  ),
})
