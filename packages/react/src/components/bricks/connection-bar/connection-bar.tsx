import type { SchemaStatus } from '@another-graphql-ide/state'

import { useAppStore } from '../../../state'
import { useInstanceAttr } from '../../../state/instance-id'
import { Button } from '../../primitives/button/button'
import { IconButton } from '../../primitives/icon-button/icon-button'
import { Input } from '../../primitives/input/input'
import { Popover } from '../../primitives/popover/popover'
import { Tooltip } from '../../primitives/tooltip/tooltip'

import { HeadersEditor } from './components/headers-editor'
import { connectionBarStyles as styles } from './connection-bar.css'

const STATUS_LABEL: Record<SchemaStatus, string> = {
  idle: 'Not connected',
  connecting: 'Connecting…',
  connected: 'Connected',
  error: 'Connection failed',
}

/**
 * Lets a user point the IDE at a GraphQL endpoint: type a URL, optionally set
 * headers, and connect. Connecting introspects the endpoint and loads its schema
 * into shared state, which the editor and schema tree read back.
 */
export const ConnectionBar = () => {
  const endpoint = useAppStore.use.endpoint()
  const setEndpoint = useAppStore.use.setEndpoint()
  const connect = useAppStore.use.connect()
  const schemaStatus = useAppStore.use.schemaStatus()
  const schemaError = useAppStore.use.schemaError()

  const status = (
    <span className={styles.status}>
      <span className={styles.statusDot({ tone: schemaStatus })} />
      {STATUS_LABEL[schemaStatus]}
    </span>
  )

  const instanceAttr = useInstanceAttr()

  return (
    <div {...instanceAttr} className={styles.container}>
      <div className={styles.endpoint}>
        <Input
          name="graphql-endpoint"
          placeholder="https://example.com/graphql"
          leftIcon="GraphQL"
          value={endpoint}
          handleChange={e => setEndpoint(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <Popover
          content={<HeadersEditor />}
          trigger={<IconButton ghost label="Edit headers" name="Settings2" />}
        />

        <Button
          text="Connect"
          label="Connect to endpoint"
          withLeftIcon="Play"
          action={() => void connect()}
          state={schemaStatus === 'connecting' ? 'disabled' : undefined}
        />

        {schemaStatus === 'error' && schemaError ? (
          <Tooltip content={schemaError} side="bottom" trigger={status} />
        ) : (
          status
        )}
      </div>
    </div>
  )
}
