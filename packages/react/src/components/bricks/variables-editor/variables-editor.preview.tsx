import { createPreview, type NavPath } from 'react-foundry'

import { AGIProvider } from '@another-graphql-ide/react/state'

import { VariablesEditor } from './variables-editor'

export const nav: NavPath = 'Bricks/Variables Editor'

// Its own provider so typing here does not disturb the document the other
// previews share, and so the starting value can be seeded.
const Framed = ({
  variables,
  children,
}: React.PropsWithChildren<{ variables: string }>) => (
  <div style={{ width: 420 }}>
    <AGIProvider defaultVariables={variables} theme={false}>
      {children}
    </AGIProvider>
  </div>
)

export const WithLabel = createPreview({
  label: 'Labelled',
  render: () => (
    <Framed variables={'{\n  "id": "abc123"\n}'}>
      <VariablesEditor label="Variables" />
    </Framed>
  ),
})

// json5, so comments, unquoted keys and trailing commas all parse.
export const Json5Syntax = createPreview({
  label: 'json5 syntax',
  render: () => (
    <Framed variables={'{\n  // the record to fetch\n  id: "abc123",\n}'}>
      <VariablesEditor label="Variables" />
    </Framed>
  ),
})

export const Invalid = createPreview({
  label: 'Invalid input',
  render: () => (
    <Framed variables={'{ not valid'}>
      <VariablesEditor label="Variables" />
    </Framed>
  ),
})
