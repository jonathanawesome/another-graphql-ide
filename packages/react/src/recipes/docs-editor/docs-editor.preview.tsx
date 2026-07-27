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

const parameterizedQuery = `query Deferred($id: ID) {
  test {
    id
  }
  ... @defer {
    isTest
  }
}
`

// Runs in-process so the recipe works with no server, which is also how it
// behaves in the static Pages build.
const Embedded = ({
  query,
  children,
}: React.PropsWithChildren<{ query: string }>) => (
  <div style={{ maxWidth: 720 }}>
    <AGIProvider
      endpoint={LOCAL_ENDPOINT}
      schema={graphiqlTestSchema}
      defaultQuery={query}
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
    <Embedded query={parameterizedQuery}>
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
