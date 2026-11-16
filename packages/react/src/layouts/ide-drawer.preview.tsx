import { useState, type ReactNode } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import { Button, EditorGroup, Resizer, SchemaTree } from '../components'
import { AGIProvider } from '../state'

import { SCHEMAS, endpointFor } from './fixtures'

export const nav: NavPath = 'Layouts/IDE in a Drawer'

const { schema, path } = SCHEMAS.graphiql

const Ide = () => (
  <Resizer
    orientation="horizontal"
    defaultSizePercent={35}
    firstPane={<SchemaTree />}
    secondPane={<EditorGroup />}
  />
)

/** Host chrome: a page with a button that mounts and unmounts a drawer. */
const DrawerPage = ({ drawer }: { drawer: ReactNode }) => {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', height: 600, width: '100%' }}>
      <Button
        label={open ? 'Close the IDE drawer' : 'Open the IDE drawer'}
        text={open ? 'Close IDE' : 'Open IDE'}
        action={() => setOpen(!open)}
      />
      {open && (
        <div
          style={{
            position: 'absolute',
            inset: '48px 0 0 0',
            display: 'flex',
          }}
        >
          {drawer}
        </div>
      )}
    </div>
  )
}

/**
 * Provider above the drawer: closing unmounts the bricks but not the store,
 * so the document and response are there on reopen.
 */
export const ProviderOutside = createPreview({
  label: 'Provider outside (state survives)',
  render: () => (
    <AGIProvider schema={schema} endpoint={endpointFor(path)} theme={false}>
      <DrawerPage drawer={<Ide />} />
    </AGIProvider>
  ),
})

/**
 * Provider inside the drawer: each open builds a fresh store. Only settings
 * persist, so return types and insertion mode carry over but the document
 * does not.
 */
export const ProviderInside = createPreview({
  label: 'Provider inside (fresh each open)',
  render: () => (
    <DrawerPage
      drawer={
        <AGIProvider schema={schema} endpoint={endpointFor(path)} theme={false}>
          <Ide />
        </AGIProvider>
      }
    />
  ),
})
