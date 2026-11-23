import { createPreview, type NavPath } from 'react-foundry'

import {
  ConnectionBar,
  DocumentPane,
  ResponsePane,
  Resizer,
  VariablesEditor,
} from '../components'
import { AGIProvider } from '../state'

import { SCHEMAS, endpointFor } from './fixtures'

export const nav: NavPath = 'Layouts/Narrow'

const WIDTHS = { phone: 375, column: 480 } as const

/**
 * Everything stacked in one column: document over response on a vertical
 * split. For phones and narrow docs columns, where side by side cannot fit.
 */
export const Stacked = createPreview({
  label: 'Stacked in a narrow column',
  controls: {
    width: {
      type: 'select',
      options: ['phone', 'column'],
      default: 'phone',
    },
  },
  render: values => {
    const { schema, path } = SCHEMAS.graphiql

    return (
      <AGIProvider
        schema={schema}
        endpoint={endpointFor(path)}
        defaultQuery={'query Start {\n  isTest\n}\n'}
        theme={false}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            height: 720,
            width: WIDTHS[values.width],
            outline: '1px dashed currentColor',
          }}
        >
          <ConnectionBar />
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <Resizer
              orientation="vertical"
              defaultSizePercent={55}
              firstPane={<DocumentPane />}
              secondPane={<ResponsePane />}
            />
          </div>
          <VariablesEditor label="Variables" height={96} />
        </div>
      </AGIProvider>
    )
  },
})
