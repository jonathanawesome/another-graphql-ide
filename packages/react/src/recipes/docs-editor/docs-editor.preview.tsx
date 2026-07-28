import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { LOCAL_ENDPOINT } from '@another-graphql-ide/state'
import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '../../state'

import { DocsEditor } from './docs-editor'

export const nav: NavPath = 'Recipes/Docs Editor'

const starterQuery = `query ExampleQuery {
  isTest
  test {
    id
  }
}
`

// streamable(delay: Int) is the schema's one argument-bearing query field, so
// the variable is actually sent rather than declared and ignored.
const parameterizedQuery = `query Greetings($delay: Int) {
  streamable(delay: $delay) {
    text
  }
}
`

// Runs in-process so the recipe works with no server, which is also how it
// behaves in the static Pages build.
const Embedded = ({
  query,
  variables,
  children,
}: React.PropsWithChildren<{ query: string; variables?: string }>) => (
  <div style={{ maxWidth: 720 }}>
    <AGIProvider
      endpoint={LOCAL_ENDPOINT}
      schema={graphiqlTestSchema}
      defaultQuery={query}
      defaultVariables={variables}
      theme={false}
    >
      {children}
    </AGIProvider>
  </div>
)

export const Stacked = createPreview({
  label: 'Stacked (a docs column)',
  render: () => (
    <Embedded query={starterQuery}>
      <DocsEditor height={420} />
    </Embedded>
  ),
})

export const SideBySide = createPreview({
  label: 'Side by side',
  render: () => (
    <Embedded query={starterQuery}>
      <DocsEditor height={320} orientation="horizontal" />
    </Embedded>
  ),
})

export const WithVariables = createPreview({
  label: 'With variables',
  render: () => (
    <Embedded
      query={parameterizedQuery}
      variables={'{\n  // json5, so this comment is fine\n  delay: 100,\n}'}
    >
      <DocsEditor height={520} showVariables />
    </Embedded>
  ),
})

export const ReadOnly = createPreview({
  label: 'Read only',
  render: () => (
    <Embedded query={starterQuery}>
      <DocsEditor height={320} readOnly />
    </Embedded>
  ),
})
