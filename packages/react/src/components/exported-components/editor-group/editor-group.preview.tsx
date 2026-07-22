import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { LOCAL_ENDPOINT } from '@another-graphql-ide/state'
import { createPreview, type NavPath } from 'react-foundry'

import { EditorGroup } from './editor-group'

export const nav: NavPath = 'Exported Components/Editor Group'

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

// EditorGroup fills its parent, so the preview gets a bounded box.
const EditorGroupFrame = ({ children }: React.PropsWithChildren) => (
  <div style={{ height: 520, width: '100%' }}>{children}</div>
)

export const SchemaAwareLiveTransport = createPreview({
  label: 'Schema-aware + live transport',
  render: () => (
    <EditorGroupFrame>
      <EditorGroup
        schema={graphiqlTestSchema}
        endpoint={endpoint}
        defaultQuery={starterQuery}
      />
    </EditorGroupFrame>
  ),
})
