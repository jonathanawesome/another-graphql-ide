import { createPreview, graphiqlTestSchema } from '@another-graphql-ide/shared'

import { EditorGroup, type EditorGroupProps } from './editor-group'

const starterQuery = `# Execute against the yoga dev server (pnpm --filter yoga dev).
query ExampleQuery {
  isTest
  test {
    id
  }
}
`

// EditorGroup fills its parent, so the demo gets a bounded box.
const EditorGroupFrame = ({ children }: React.PropsWithChildren) => (
  <div style={{ height: 520, width: '100%' }}>{children}</div>
)

const preview = createPreview<EditorGroupProps>({
  title: 'EditorGroup',
  component: EditorGroup,
  category: 'Exported Components',
  demos: [
    {
      name: 'Schema-aware + live transport',
      render: () => (
        <EditorGroupFrame>
          <EditorGroup
            schema={graphiqlTestSchema}
            endpoint="http://localhost:4000/graphql"
            defaultQuery={starterQuery}
          />
        </EditorGroupFrame>
      ),
    },
  ],
})

export default preview
