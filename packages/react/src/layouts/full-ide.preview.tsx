import { createPreview, type NavPath } from 'react-foundry'

import {
  ConnectionBar,
  DocumentPane,
  ResponsePane,
  Resizer,
  SchemaTree,
  VariablesEditor,
} from '../components'
import { AGIProvider } from '../state'

import { SCHEMAS, endpointFor, schemaControl } from './fixtures'

export const nav: NavPath = 'Layouts/Full IDE'

const starterQuery = `query Start {
  __typename
}
`

/**
 * The whole IDE from public pieces. EditorGroup has no slot for variables, so
 * this builds the split from the panes instead, with variables under the
 * document.
 */
export const FullIde = createPreview({
  label: 'Connection, schema, document, variables, response',
  controls: { schema: schemaControl('graphiql') },
  render: values => {
    const { schema, path } = SCHEMAS[values.schema]

    return (
      <AGIProvider
        schema={schema}
        endpoint={endpointFor(path)}
        defaultQuery={starterQuery}
        theme={false}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            height: 640,
            width: '100%',
          }}
        >
          <ConnectionBar />
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <Resizer
              orientation="horizontal"
              defaultSizePercent={25}
              minSizePercent={15}
              maxSizePercent={45}
              firstPane={<SchemaTree />}
              secondPane={
                <Resizer
                  orientation="horizontal"
                  firstPane={
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        height: '100%',
                      }}
                    >
                      <div style={{ flex: 1, minHeight: 0 }}>
                        <DocumentPane />
                      </div>
                      <VariablesEditor label="Variables" height={120} />
                    </div>
                  }
                  secondPane={<ResponsePane />}
                />
              }
            />
          </div>
        </div>
      </AGIProvider>
    )
  },
})
