import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { createPreview, type NavPath } from 'react-foundry'

import { DocsEditor, RunButton } from '../recipes'
import { AGIProvider, LOCAL_ENDPOINT } from '../state'

export const nav: NavPath = 'Layouts/Docs Page'

const starterQuery = `query ExampleQuery {
  isTest
  test {
    id
  }
}
`

const prose = { fontSize: 14, lineHeight: 1.6, margin: '12px 0' }

/**
 * The shape this library exists for: an editor embedded mid-page, with run
 * buttons scattered through the prose around it.
 *
 * Clicking either button shows its own result and leaves the editor's document
 * and response alone. That separation is the whole point of useOperation.
 *
 * It does not demonstrate embeddability. foundry is a full-page app that has
 * already applied the global reset, so this cannot show what the library does
 * to a host page's own styles.
 */
export const Page = createPreview({
  label: 'Editor and run buttons in prose',
  render: () => (
    <AGIProvider
      endpoint={LOCAL_ENDPOINT}
      schema={graphiqlTestSchema}
      defaultQuery={starterQuery}
      theme={false}
    >
      <article style={{ maxWidth: 680 }}>
        <h1 style={{ fontSize: 22 }}>Querying the API</h1>

        <p style={prose}>
          Every request is a single operation. The smallest useful one asks
          whether this is a test deployment.{' '}
          <RunButton operation="{ isTest }" text="Try it" />
        </p>

        <h2 style={{ fontSize: 17 }}>Selecting fields</h2>

        <p style={prose}>
          Objects need a selection set. Editing below does not affect the
          buttons, and the buttons do not affect the editor.
        </p>

        <DocsEditor height={360} />

        <p style={prose}>
          Errors are reported the same way, so a failing operation is still safe
          to offer inline. <RunButton operation="{ nope }" text="Run invalid" />
        </p>
      </article>
    </AGIProvider>
  ),
})
