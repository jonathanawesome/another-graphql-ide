import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { createPreview, type NavPath } from 'react-foundry'

import { Editor } from './editor'

export const nav: NavPath = 'Exported Components/Editor'

// The Editor fills its parent, so previews get a bounded box to render into.
const EditorFrame = ({ children }: React.PropsWithChildren) => (
  <div style={{ height: 480, width: '100%' }}>{children}</div>
)

const graphqlDoc = `# Schema-aware: try Ctrl-Space, hover fields, or type an unknown field.
query ExampleQuery {
  allFilms {
    films {
      title
      director
    }
  }
}
`

const json5Doc = `{
  // JSON5 supports comments and trailing commas
  name: 'another-graphql-ide',
  version: 1,
  languages: ['graphql', 'json5', 'typescript', 'javascript'],
}
`

const typescriptDoc = `type Point = { x: number; y: number }

const distance = (a: Point, b: Point): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}
`

const javascriptDoc = `const greet = (name) => {
  return \`Hello, \${name}!\`
}

console.log(greet('world'))
`

export const Graphql = createPreview({
  label: 'GraphQL (schema-aware)',
  render: () => (
    <EditorFrame key="graphql">
      <Editor
        language="graphql"
        schema={graphiqlTestSchema}
        defaultValue={graphqlDoc}
      />
    </EditorFrame>
  ),
})

export const Json5 = createPreview({
  label: 'JSON5',
  render: () => (
    <EditorFrame key="json5">
      <Editor language="json5" defaultValue={json5Doc} />
    </EditorFrame>
  ),
})

export const TypeScript = createPreview(() => (
  <EditorFrame key="typescript">
    <Editor language="typescript" defaultValue={typescriptDoc} />
  </EditorFrame>
))

export const JavaScript = createPreview(() => (
  <EditorFrame key="javascript">
    <Editor language="javascript" defaultValue={javascriptDoc} />
  </EditorFrame>
))

export const ReadOnly = createPreview({
  label: 'Read-only',
  render: () => (
    <EditorFrame key="readonly">
      <Editor language="typescript" defaultValue={typescriptDoc} readOnly />
    </EditorFrame>
  ),
})
