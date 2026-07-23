import {
  graphiqlTestSchema,
  performanceTestSchema,
} from '@another-graphql-ide/shared'
import { createPreview, type NavPath } from 'react-foundry'

import { BenchmarkPanel } from './benchmark/benchmark-panel'
import { makeLargeDocument } from './codemirror/__fixtures__/large-doc'
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

// --- Stress-testing the main-thread graphql-language-service paths ---
// cm6-graphql runs completion/lint on the main thread (no worker, unlike
// monaco-graphql), so these previews let you feel autocomplete, lint, hover,
// and schema-attach latency against a ~11,800-type schema. The automated
// counterpart lives in ./codemirror/stress.bench.ts.

// Near-empty query: put the caret inside the braces and Ctrl-Space to feel the
// completion list build against whichever schema is selected. Valid for both.
const stressSimpleDoc = `# Caret inside the braces, then Ctrl-Space to feel completion build.
query {

}
`

// ~300 operations (~1,800 lines) to stress the document-size path: every doc
// change and caret move re-parses the whole document via getOperationFacts.
const stressLargeDoc = makeLargeDocument(300)

const stressSchemas = {
  baseline: graphiqlTestSchema,
  stress: performanceTestSchema,
} as const

const stressDocs = {
  simple: stressSimpleDoc,
  large: stressLargeDoc,
} as const

export const GraphqlStress = createPreview({
  label: 'GraphQL stress (large schema)',
  controls: {
    // Swapping schema on the live editor exercises the updateSchema attach path.
    schema: {
      type: 'select',
      options: ['baseline', 'stress'],
      default: 'stress',
    },
    document: {
      type: 'select',
      options: ['simple', 'large'],
      default: 'simple',
    },
  },
  // Key on the document only: switching schema keeps the editor mounted so the
  // swap goes through updateSchema (what we want to feel); switching document
  // remounts with fresh defaultValue.
  render: v => (
    <EditorFrame key={`stress-${v.document}`}>
      <Editor
        language="graphql"
        schema={stressSchemas[v.schema]}
        defaultValue={stressDocs[v.document]}
      />
    </EditorFrame>
  ),
})

export const GraphqlLargeDocument = createPreview({
  label: 'GraphQL large document (300 ops)',
  render: () => (
    <EditorFrame key="stress-largedoc">
      <Editor
        language="graphql"
        schema={performanceTestSchema}
        defaultValue={stressLargeDoc}
      />
    </EditorFrame>
  ),
})

export const Benchmark = createPreview({
  label: 'Benchmark (main-thread cost)',
  render: () => <BenchmarkPanel />,
})
