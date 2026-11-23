import { useMemo } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import { Button, DocumentPane, Resizer } from '../components'
import {
  AGIProvider,
  useAppStore,
  useInstanceAttr,
  useOperation,
} from '../state'

import { COUNTRIES_ENDPOINT } from './fixtures'

export const nav: NavPath = 'Layouts/Custom Result View'

type Row = Record<string, unknown>

/** The first array of objects in a result, which is what a table can show. */
const firstList = (value: unknown): Row[] | undefined => {
  if (Array.isArray(value)) {
    return value.every(item => typeof item === 'object' && item !== null)
      ? (value as Row[])
      : undefined
  }
  if (typeof value !== 'object' || value === null) return undefined

  for (const child of Object.values(value)) {
    const found = firstList(child)
    if (found) return found
  }
  return undefined
}

const cell = (value: unknown) =>
  typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value)

const Table = ({ rows }: { rows: Row[] }) => {
  const columns = Object.keys(rows[0] ?? {})

  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column} style={{ textAlign: 'left', padding: 4 }}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map(column => (
              <td key={column} style={{ padding: 4 }}>
                {cell(row[column])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const parse = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** Replaces the response pane: reads the shared response and tabulates it. */
const TableResponse = () => {
  const response = useAppStore.use.response()
  const rows = useMemo(() => firstList(parse(response)), [response])
  const instanceAttr = useInstanceAttr()

  return (
    <div {...instanceAttr} style={{ height: '100%', overflow: 'auto' }}>
      {rows ? (
        <Table rows={rows} />
      ) : (
        <p style={{ fontSize: 12, opacity: 0.6 }}>
          Run a query that returns a list.
        </p>
      )}
    </div>
  )
}

const editorQuery = `query Countries {
  countries {
    code
    name
    emoji
    capital
  }
}
`

export const EditorWithTable = createPreview({
  label: 'Editor with a table instead of JSON',
  render: () => (
    <AGIProvider
      endpoint={COUNTRIES_ENDPOINT}
      autoConnect
      defaultQuery={editorQuery}
      theme={false}
    >
      <div style={{ display: 'flex', height: 560, width: '100%' }}>
        <Resizer
          orientation="horizontal"
          firstPane={<DocumentPane />}
          secondPane={<TableResponse />}
        />
      </div>
    </AGIProvider>
  ),
})

const continentQuery = `query ByContinent($code: String!) {
  countries(filter: { continent: { eq: $code } }) {
    name
    emoji
    capital
  }
}`

const CONTINENTS = ['AF', 'AS', 'EU', 'NA', 'OC', 'SA'] as const

/** No editor at all: the host owns the query and renders the result. */
const ContinentPicker = () => {
  const { run, result, status, error } = useOperation({ query: continentQuery })
  const rows = firstList(result?.data)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {CONTINENTS.map(code => (
          <Button
            key={code}
            label={`Load countries in ${code}`}
            text={code}
            action={() => void run({ variables: { code } })}
          />
        ))}
      </div>
      {status === 'fetching' && <p style={{ fontSize: 12 }}>Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {rows && <Table rows={rows} />}
    </div>
  )
}

export const HostOwnedQuery = createPreview({
  label: 'useOperation into a host table',
  render: () => (
    <AGIProvider endpoint={COUNTRIES_ENDPOINT} autoConnect theme={false}>
      <div style={{ maxWidth: 640 }}>
        <ContinentPicker />
      </div>
    </AGIProvider>
  ),
})
