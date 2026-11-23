import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { createPreview, type NavPath } from 'react-foundry'

import { DocsEditor } from '../recipes'
import { AGIProvider, LOCAL_ENDPOINT } from '../state'

export const nav: NavPath = 'Layouts/Tutorial Steps'

const prose = { fontSize: 14, lineHeight: 1.6, margin: '12px 0' }

const STEPS = [
  { title: 'Ask a scalar', query: 'query StepOne {\n  isTest\n}\n' },
  {
    title: 'Select an object',
    query: 'query StepTwo {\n  test {\n    id\n  }\n}\n',
  },
  { title: 'Check the type', query: 'query StepThree {\n  __typename\n}\n' },
]

/** One provider per step, so each step keeps its own document and response. */
export const ProviderPerStep = createPreview({
  label: 'A provider per step',
  render: () => (
    <article style={{ maxWidth: 680 }}>
      {STEPS.map((step, index) => (
        <section key={step.title}>
          <h2 style={{ fontSize: 17 }}>
            {index + 1}. {step.title}
          </h2>
          <p style={prose}>Run it, then change it.</p>
          <AGIProvider
            endpoint={LOCAL_ENDPOINT}
            schema={graphiqlTestSchema}
            defaultQuery={step.query}
            theme={false}
          >
            <DocsEditor height={240} />
          </AGIProvider>
        </section>
      ))}
    </article>
  ),
})

/**
 * The same steps under one provider. A store holds one document, so every
 * editor shows and edits the same text. Here on purpose, to show why steps
 * want a provider each.
 */
export const SharedProvider = createPreview({
  label: 'One shared provider (one document)',
  render: () => (
    <AGIProvider
      endpoint={LOCAL_ENDPOINT}
      schema={graphiqlTestSchema}
      defaultQuery={STEPS[0]?.query}
      theme={false}
    >
      <article style={{ maxWidth: 680 }}>
        {STEPS.map((step, index) => (
          <section key={step.title}>
            <h2 style={{ fontSize: 17 }}>
              {index + 1}. {step.title}
            </h2>
            <DocsEditor height={200} />
          </section>
        ))}
      </article>
    </AGIProvider>
  ),
})
