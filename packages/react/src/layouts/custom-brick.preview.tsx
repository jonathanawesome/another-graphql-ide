import { useEffect, useState } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import { Button, EditorGroup, Icon } from '../components'
import {
  AGIProvider,
  useAGIStore,
  useAppStore,
  useInstanceAttr,
} from '../state'

import { SCHEMAS, endpointFor } from './fixtures'

export const nav: NavPath = 'Layouts/Custom Brick'

/** Reads keys off the store. The simplest kind of custom brick. */
const StatusBadge = () => {
  const status = useAppStore.use.status()
  const endpoint = useAppStore.use.endpoint()
  const instanceAttr = useInstanceAttr()

  return (
    <div
      {...instanceAttr}
      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
    >
      <Icon name="CircleFill" />
      <span>{status}</span>
      <span style={{ opacity: 0.6 }}>{endpoint}</span>
    </div>
  )
}

type Entry = { id: number; query: string; failed: boolean; at: string }

/**
 * Subscribes to the raw store for transitions, which a key hook cannot see,
 * and writes back through a store action.
 */
const RunHistory = () => {
  const store = useAGIStore()
  const setQuery = useAppStore.use.setQuery()
  const [entries, setEntries] = useState<Entry[]>([])
  // Claims this element for the instance, so shortcuts pressed here stay here.
  const instanceAttr = useInstanceAttr()

  useEffect(() => {
    let id = 0
    return store.subscribe((state, previous) => {
      const wasRunning =
        previous.status === 'fetching' || previous.status === 'streaming'
      const running =
        state.status === 'fetching' || state.status === 'streaming'
      if (!wasRunning || running) return

      setEntries(list =>
        [
          {
            id: ++id,
            query: state.query,
            failed: state.status === 'error',
            at: new Date().toLocaleTimeString(),
          },
          ...list,
        ].slice(0, 10)
      )
    })
  }, [store])

  if (entries.length === 0) {
    return (
      <p {...instanceAttr} style={{ fontSize: 12, opacity: 0.6 }}>
        Run something.
      </p>
    )
  }

  return (
    <ol
      {...instanceAttr}
      style={{ display: 'grid', gap: 8, listStyle: 'none', padding: 0 }}
    >
      {entries.map(entry => (
        <li
          key={entry.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
          }}
        >
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {entry.at} {entry.failed ? 'failed' : 'done'}
          </span>
          <Button
            label="Restore this document"
            text="Restore"
            action={() => setQuery(entry.query)}
          />
        </li>
      ))}
    </ol>
  )
}

/**
 * Pieces the library does not ship, built from the public hooks and
 * primitives. If one of these needs a deep import, an export is missing.
 */
export const HostBuilt = createPreview({
  label: 'Status badge and run history beside the editor',
  render: () => {
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
            display: 'grid',
            gridTemplateColumns: '1fr 240px',
            gridTemplateRows: 'auto 1fr',
            gap: 12,
            height: 560,
            width: '100%',
          }}
        >
          <div style={{ gridColumn: '1 / -1' }}>
            <StatusBadge />
          </div>
          <div style={{ minHeight: 0, minWidth: 0 }}>
            <EditorGroup />
          </div>
          <aside style={{ overflow: 'auto' }}>
            <RunHistory />
          </aside>
        </div>
      </AGIProvider>
    )
  },
})
