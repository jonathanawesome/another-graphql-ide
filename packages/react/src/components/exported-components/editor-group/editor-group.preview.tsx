import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { createPreview, type NavPath } from 'react-foundry'

import { EditorGroup } from './editor-group'

export const nav: NavPath = 'Exported Components/Editor Group'

const starterQuery = `# Execute against the yoga dev server (pnpm --filter yoga dev).
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
        endpoint="http://localhost:4000/graphql"
        defaultQuery={starterQuery}
      />
    </EditorGroupFrame>
  ),
})
