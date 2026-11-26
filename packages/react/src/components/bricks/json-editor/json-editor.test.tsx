import { EditorView } from '@codemirror/view'
import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { EditorDiagnostic } from '../sdl-shared/diagnostics'

import { naming, namingSchema } from './__fixtures__/naming'
import { JsonEditor, type JsonEditorProps } from './json-editor'

// CodeMirror's DOM has no roles to query by.
const viewOf = (root: HTMLElement) => {
  // eslint-disable-next-line testing-library/no-node-access -- see above
  const dom = root.querySelector<HTMLElement>('.cm-editor')
  const view = dom && EditorView.findFromDOM(dom)
  if (!view) throw new Error('no view')
  return view
}

const settle = () => act(() => vi.advanceTimersByTimeAsync(2000))

const renderEditor = async (props: JsonEditorProps) => {
  const onDiagnostics =
    vi.fn<(found: readonly EditorDiagnostic[], text: string) => void>()
  const utils = render(<JsonEditor {...props} onDiagnostics={onDiagnostics} />)
  await settle()
  return { ...utils, onDiagnostics, view: viewOf(utils.container) }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('JsonEditor', () => {
  it('reports schema problems with their lines, without AGIProvider', async () => {
    const value = naming.replace('"camelCase"', '"camelcase"')
    const { onDiagnostics, view } = await renderEditor({
      value,
      schema: namingSchema,
    })

    expect(onDiagnostics).toHaveBeenCalledOnce()
    const [found, text] = onDiagnostics.mock.lastCall ?? []
    expect(text).toBe(value)
    expect(found).toMatchObject([
      {
        line: 3,
        severity: 'error',
        message:
          'Not a style. Use camelCase, PascalCase, snake_case or UPPER_CASE.',
      },
    ])
    // eslint-disable-next-line testing-library/no-node-access -- see above
    expect(view.dom.querySelector('.cm-sdl-message-danger')).not.toBeNull()
    expect(view.state.doc.toString()).toBe(value)
  })

  it('does not accept JSON5', async () => {
    const { onDiagnostics } = await renderEditor({ value: "{a: 'b',}" })

    expect(onDiagnostics.mock.lastCall?.[0]).toMatchObject([
      { severity: 'error' },
    ])
  })

  it('reports empty text as an error', async () => {
    const { onDiagnostics } = await renderEditor({ value: '' })

    expect(onDiagnostics).toHaveBeenCalledExactlyOnceWith(
      [expect.objectContaining({ line: 1, severity: 'error' })],
      ''
    )
  })

  it('checks again when the schema changes', async () => {
    const { rerender, onDiagnostics } = await renderEditor({ value: '1' })
    expect(onDiagnostics.mock.lastCall?.[0]).toEqual([])

    rerender(
      <JsonEditor
        value="1"
        schema={{ type: 'string' }}
        onDiagnostics={onDiagnostics}
      />
    )
    await settle()
    expect(onDiagnostics.mock.lastCall?.[0]).toMatchObject([
      { message: 'Expected a string.' },
    ])
  })

  it('does not loop with an inline schema and a host that renders on report', async () => {
    const reports = vi.fn()
    const Host = () => {
      const [, setCount] = useState(0)
      return (
        <JsonEditor
          value="1"
          schema={{ type: 'string' }}
          onDiagnostics={() => {
            reports()
            setCount(count => count + 1)
          }}
        />
      )
    }
    render(<Host />)
    await settle()

    expect(reports).toHaveBeenCalledOnce()
  })

  it('checks read-only text, and does not let it be edited', async () => {
    const { onDiagnostics, view } = await renderEditor({
      value: '{',
      readOnly: true,
    })

    expect(onDiagnostics.mock.lastCall?.[0]).toHaveLength(1)
    expect(view.state.readOnly).toBe(true)
  })

  it('names the text box', async () => {
    await renderEditor({ value: '1', label: 'Naming convention' })

    expect(
      screen.getByRole('textbox', { name: 'Naming convention' })
    ).toBeDefined()
  })
})
