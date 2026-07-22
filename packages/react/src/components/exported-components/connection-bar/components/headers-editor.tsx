import JSON5 from 'json5'
import { useRef, useState } from 'react'

import { useAppStore } from '../../../../state'
import { Button } from '../../../ui-components/button/button'
import { IconButton } from '../../../ui-components/icon-button/icon-button'
import { Input } from '../../../ui-components/input/input'
import { Editor } from '../../editor/editor'

import { headersEditorStyles as styles } from './headers-editor.css'

type Row = { id: number; key: string; value: string }
type Mode = 'kv' | 'raw'

const rowsToRecord = (rows: Row[]): Record<string, string> => {
  const record: Record<string, string> = {}
  for (const { key, value } of rows) {
    const name = key.trim()
    if (name) record[name] = value
  }
  return record
}

// Pure: assigns row ids from `startId` upward. Always yields at least one
// (empty) row so the editor never renders with nothing to type into.
const recordToRows = (
  record: Record<string, string>,
  startId: number
): Row[] => {
  const entries = Object.entries(record)
  const source: [string, string][] = entries.length ? entries : [['', '']]
  return source.map(([key, value], index) => ({
    id: startId + index,
    key,
    value,
  }))
}

/**
 * Coerce arbitrary parsed JSON5 into a flat string->string header map. Parsed as
 * JSON5 (a superset of JSON) to match the editor's json5 highlighting, so
 * unquoted keys, trailing commas, and comments are accepted. Throws when the
 * shape is not an object of primitive values.
 */
const parseRawHeaders = (text: string): Record<string, string> => {
  const trimmed = text.trim()
  if (!trimmed) return {}
  const parsed: unknown = JSON5.parse(trimmed)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Headers must be an object.')
  }
  const record: Record<string, string> = {}
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === 'object' && value !== null) {
      throw new Error('Header values must be strings.')
    }
    record[key] = String(value)
  }
  return record
}

/**
 * Edits the connection headers in shared state. The store holds the canonical
 * Record<string, string>; this component owns the editing ergonomics and offers
 * two interchangeable views: key/value rows and a raw JSON textarea.
 */
export const HeadersEditor = () => {
  const headers = useAppStore.use.headers()
  const setHeaders = useAppStore.use.setHeaders()

  const [mode, setMode] = useState<Mode>('kv')
  const [rows, setRows] = useState<Row[]>(() => recordToRows(headers, 0))
  const [rawText, setRawText] = useState(() => JSON.stringify(headers, null, 2))
  const [rawError, setRawError] = useState<string>()

  // Stable, ever-increasing row ids so React keeps input focus across
  // edits/removals. Only ever bumped inside event handlers, never during render.
  const nextId = useRef(rows.length)
  const freshRows = (record: Record<string, string>): Row[] => {
    const rowsForRecord = recordToRows(record, nextId.current)
    nextId.current += rowsForRecord.length
    return rowsForRecord
  }

  const commitRows = (next: Row[]) => {
    setRows(next)
    setHeaders(rowsToRecord(next))
  }

  const updateRow = (id: number, patch: Partial<Row>) =>
    commitRows(rows.map(row => (row.id === id ? { ...row, ...patch } : row)))

  const addRow = () =>
    commitRows([...rows, { id: nextId.current++, key: '', value: '' }])

  const removeRow = (id: number) => {
    const next = rows.filter(row => row.id !== id)
    commitRows(next.length ? next : [{ id: nextId.current++, key: '', value: '' }])
  }

  const onRawChange = (text: string) => {
    setRawText(text)
    try {
      setHeaders(parseRawHeaders(text))
      setRawError(undefined)
    } catch (error) {
      // Keep the last valid headers in the store; just flag the text.
      setRawError(error instanceof Error ? error.message : 'Invalid JSON5.')
    }
  }

  const toggleMode = () => {
    if (mode === 'kv') {
      setRawText(JSON.stringify(rowsToRecord(rows), null, 2))
      setRawError(undefined)
      setMode('raw')
      return
    }
    // Only switch to rows when the raw JSON is valid; otherwise stay put.
    try {
      const record = parseRawHeaders(rawText)
      setHeaders(record)
      setRows(freshRows(record))
      setRawError(undefined)
      setMode('kv')
    } catch (error) {
      setRawError(error instanceof Error ? error.message : 'Invalid JSON5.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Headers</div>
        <IconButton
          ghost
          label={mode === 'kv' ? 'Edit as raw JSON' : 'Edit as key/value pairs'}
          name={mode === 'kv' ? 'Code' : 'List'}
          size="mini"
          action={toggleMode}
        />
      </div>

      {mode === 'kv' ? (
        <div className={styles.rows}>
          {rows.map(row => (
            <div key={row.id} className={styles.row}>
              <div className={styles.field}>
                <Input
                  name={`header-key-${row.id}`}
                  placeholder="Header"
                  value={row.key}
                  handleChange={e => updateRow(row.id, { key: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <Input
                  name={`header-value-${row.id}`}
                  placeholder="Value"
                  value={row.value}
                  handleChange={e =>
                    updateRow(row.id, { value: e.target.value })
                  }
                />
              </div>
              <IconButton
                ghost
                label="Remove header"
                name="X"
                size="mini"
                action={() => removeRow(row.id)}
              />
            </div>
          ))}
          <div className={styles.addButton}>
            <Button
              text="Add header"
              label="Add header"
              withLeftIcon="Plus"
              action={addRow}
            />
          </div>
        </div>
      ) : (
        <>
          <Editor
            language="json5"
            value={rawText}
            onChange={onRawChange}
            frame="bordered"
            height={160}
          />
          {rawError && <div className={styles.error}>{rawError}</div>}
        </>
      )}
    </div>
  )
}
