import { textStyles, themeContract } from '@another-graphql-ide/style'
import { useState } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import type { EditorDiagnostic } from '../sdl-shared/diagnostics'
import { makeSupergraph } from '../sdl-viewer/__fixtures__/sdl'

import { SdlEditor } from './sdl-editor'

export const nav: NavPath = 'Bricks/SDL Editor'

const baseSchema = `directive @auth(role: Role!) on FIELD_DEFINITION
directive @cost(value: Int!) on FIELD_DEFINITION

scalar DateTime
scalar Money

enum Role {
  ADMIN
  CUSTOMER
}`

const published = `enum OrderStatus { OPEN SHIPPED }
input ProductFilter { search: String }
type Order { id: ID! status: OrderStatus! }
${baseSchema}`

// Stands in for the host's Save line: it trusts a report only for this text.
const Host = ({
  initial,
  contextSdl = published,
  readOnly,
  height = 'auto',
}: {
  initial: string
  contextSdl?: string
  readOnly?: boolean
  height?: number | string
}) => {
  const [value, setValue] = useState(initial)
  const [report, setReport] = useState<{
    found: readonly EditorDiagnostic[]
    text: string
  }>()
  const errors = report?.found.filter(d => d.severity === 'error').length ?? 0
  const warnings = (report?.found.length ?? 0) - errors
  const status =
    report?.text !== value
      ? 'Checking…'
      : errors
        ? `Fix ${errors} ${errors === 1 ? 'error' : 'errors'} to save`
        : warnings
          ? `${warnings} ${warnings === 1 ? 'warning' : 'warnings'}. You can still save.`
          : 'No problems'

  return (
    <div style={{ width: 760, maxWidth: '100%', display: 'grid', gap: 12 }}>
      <SdlEditor
        value={value}
        onChange={setValue}
        onDiagnostics={(found, text) => setReport({ found, text })}
        contextSdl={contextSdl}
        contextLabel="published"
        label="Base schema"
        readOnly={readOnly}
        frame="bordered"
        height={height}
        minHeight={320}
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
  render: values => <Host initial={baseSchema} readOnly={values.readOnly} />,
})

export const SyntaxError = createPreview({
  label: 'Syntax error',
  render: () => (
    <Host initial={baseSchema.replace('Money\n', 'Money\nscalar\n')} />
  ),
})

export const UnknownType = createPreview({
  label: 'Unknown type',
  render: () => (
    <Host
      initial={baseSchema
        .replace('Role!', 'Roles!')
        .replace('Money\n', 'Money\nscalar URL\n')}
      contextSdl=""
    />
  ),
})

// Put the caret after `value: ` and type, or press Ctrl+Space.
export const Completion = createPreview({
  label: 'Completion',
  render: () => <Host initial={baseSchema.replace('Int!', '')} />,
})

export const ReadOnly = createPreview({
  label: 'Read-only',
  render: () => (
    <Host initial={baseSchema.replace('Role!', 'Roles!')} readOnly />
  ),
})

const large = makeSupergraph(1000)

export const Large = createPreview({
  label: 'Large document',
  render: () => <Host initial={large} contextSdl={large} height={560} />,
})
