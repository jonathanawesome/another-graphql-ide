import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { LOCAL_ENDPOINT } from '@another-graphql-ide/state'
import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '../../state'

import { RunButton } from './run-button'

export const nav: NavPath = 'Recipes/Run Button'

const Host = ({ children }: React.PropsWithChildren) => (
  <AGIProvider
    endpoint={LOCAL_ENDPOINT}
    schema={graphiqlTestSchema}
    theme={false}
  >
    {children}
  </AGIProvider>
)

export const Standalone = createPreview({
  label: 'Standalone',
  render: () => (
    <Host>
      <RunButton operation="{ isTest }" />
    </Host>
  ),
})

export const Labelled = createPreview({
  label: 'Custom text',
  render: () => (
    <Host>
      <RunButton operation="{ test { id } }" text="Try this query" />
    </Host>
  ),
})

export const Several = createPreview({
  label: 'Several on one page',
  render: () => (
    <Host>
      <div style={{ display: 'flex', gap: 12 }}>
        <RunButton operation="{ isTest }" text="Run A" />
        <RunButton operation="{ test { id } }" text="Run B" />
        <RunButton operation="{ nope }" text="Run invalid" />
      </div>
    </Host>
  ),
})
