import { textStyles, themeContract } from '@another-graphql-ide/style'
import { useState } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import type { EditorDiagnostic } from '../sdl-shared/diagnostics'

import { naming, namingSchema } from './__fixtures__/naming'
import { JsonEditor } from './json-editor'

export const nav: NavPath = 'Bricks/JSON Editor'

// Stands in for the host's Save line: it trusts a report only for this text.
const Host = ({
  initial,
  readOnly,
}: {
  initial: string
  readOnly?: boolean
}) => {
  const [value, setValue] = useState(initial)
  const [report, setReport] = useState<{
    found: readonly EditorDiagnostic[]
    text: string
  }>()
  const errors = report?.found.length ?? 0
  const status =
    report?.text !== value
      ? 'Checking…'
      : errors
        ? `Fix ${errors} ${errors === 1 ? 'error' : 'errors'} to save`
        : 'No problems'

  return (
    <div style={{ width: 760, maxWidth: '100%', display: 'grid', gap: 12 }}>
      <JsonEditor
        value={value}
        onChange={setValue}
        onDiagnostics={(found, text) => setReport({ found, text })}
        schema={namingSchema}
        label="Naming convention"
        readOnly={readOnly}
        frame="bordered"
        height="auto"
      />
      <span style={{ ...textStyles.body, color: themeContract.text.tertiary }}>
        {status}
      </span>
    </div>
  )
}

export const Valid = createPreview({
  label: 'Valid',
  controls: { readOnly: { type: 'boolean', default: false } },
  render: values => <Host initial={naming} readOnly={values.readOnly} />,
})

export const SchemaError = createPreview({
  label: 'Schema error',
  render: () => <Host initial={naming.replace('"camelCase"', '"camelcase"')} />,
})

export const SyntaxError = createPreview({
  label: 'Syntax error',
  render: () => (
    <Host initial={naming.replace('"UPPER_CASE",', '"UPPER_CASE"')} />
  ),
})

export const ReadOnly = createPreview({
  label: 'Read-only',
  render: () => (
    <Host initial={naming.replace('"camelCase"', '"camelcase"')} readOnly />
  ),
})
