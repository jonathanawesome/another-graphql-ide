import { currentCompletions, startCompletion } from '@codemirror/autocomplete'
import { foldable } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { EditorDiagnostic } from '../sdl-shared/diagnostics'

import { MAX_HERE } from './check/sdl-checker'
import { SdlEditor, type SdlEditorProps } from './sdl-editor'

// CodeMirror's DOM has no roles to query by.
const viewOf = (root: HTMLElement) => {
  // eslint-disable-next-line testing-library/no-node-access -- see above
  const dom = root.querySelector<HTMLElement>('.cm-editor')
  const view = dom && EditorView.findFromDOM(dom)
  if (!view) throw new Error('no view')
  return view
}

const settle = () => act(() => vi.advanceTimersByTimeAsync(2000))

const renderEditor = async (props: SdlEditorProps) => {
  const onDiagnostics =
    vi.fn<(found: readonly EditorDiagnostic[], text: string) => void>()
  const utils = render(<SdlEditor {...props} onDiagnostics={onDiagnostics} />)
  await settle()
  return { ...utils, onDiagnostics, view: viewOf(utils.container) }
}

/** Completions at the `|` in the text, as `name detail`. */
const completionsAt = async (
  marked: string,
  props: Partial<SdlEditorProps> = {}
) => {
  const pos = marked.indexOf('|')
  const { view } = await renderEditor({
    ...props,
    defaultValue: marked.replace('|', ''),
  })
  act(() => {
    view.focus()
    view.dispatch({ selection: { anchor: pos } })
    startCompletion(view)
  })
  await settle()
  return currentCompletions(view.state).map(
    ({ label, detail }) => `${label} ${detail}`
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SdlEditor', () => {
  it('reports errors and warnings with their lines, without AGIProvider', async () => {
    const { onDiagnostics } = await renderEditor({
      value: 'type A {\n  a: Nope\n  a: Int\n}',
    })

    expect(onDiagnostics).toHaveBeenCalledOnce()
    const [found, text] = onDiagnostics.mock.lastCall ?? []
    expect(text).toBe('type A {\n  a: Nope\n  a: Int\n}')
    expect(found).toMatchObject([
      { line: 2, severity: 'warning', message: 'Unknown type “Nope”.' },
      { line: 3, severity: 'error' },
    ])
  })

  it('keeps message rows out of the text', async () => {
    const onChange = vi.fn()
    const { view } = await renderEditor({ defaultValue: 'type', onChange })

    // eslint-disable-next-line testing-library/no-node-access -- see above
    expect(view.dom.querySelector('.cm-sdl-message-danger')).not.toBeNull()
    act(() => {
      view.dispatch({ changes: { from: 4, insert: ' A' } })
    })
    expect(onChange).toHaveBeenCalledExactlyOnceWith('type A')
  })

  it('lets the host tell a checked text from a newer one', async () => {
    const Host = () => {
      const [value, setValue] = useState('type A { a: Int }')
      const [report, setReport] = useState<{ ok: boolean; text: string }>()
      const canSave = report?.text === value && report.ok
      return (
        <>
          <SdlEditor
            value={value}
            onChange={setValue}
            onDiagnostics={(found, text) =>
              setReport({
                ok: !found.some(({ severity }) => severity === 'error'),
                text,
              })
            }
          />
          <button disabled={!canSave}>Save</button>
        </>
      )
    }
    const { container } = render(<Host />)
    const save = screen.getByRole<HTMLButtonElement>('button')
    const view = viewOf(container)
    expect(save.disabled).toBe(true)
    await settle()
    expect(save.disabled).toBe(false)

    act(() => {
      view.dispatch({ changes: { from: 0, insert: '}' } })
    })
    expect(save.disabled).toBe(true)
    await settle()
    expect(save.disabled).toBe(true)
  })

  it('checks again when the context changes', async () => {
    const value = 'type A { a: B }'
    const { rerender, onDiagnostics } = await renderEditor({ value })
    expect(onDiagnostics.mock.lastCall?.[0]).toHaveLength(1)

    rerender(
      <SdlEditor
        value={value}
        contextSdl="scalar B"
        onDiagnostics={onDiagnostics}
      />
    )
    await settle()
    expect(onDiagnostics.mock.lastCall?.[0]).toEqual([])
    expect(onDiagnostics).toHaveBeenCalledTimes(2)

    // Other renders do not.
    rerender(
      <SdlEditor
        value={value}
        contextSdl="scalar B"
        contextLabel="x"
        onDiagnostics={onDiagnostics}
      />
    )
    await settle()
    expect(onDiagnostics).toHaveBeenCalledTimes(2)
  })

  it('checks read-only text, and does not let it be edited', async () => {
    const { onDiagnostics, view } = await renderEditor({
      value: 'type',
      readOnly: true,
    })

    expect(onDiagnostics.mock.lastCall?.[0]).toHaveLength(1)
    expect(view.state.readOnly).toBe(true)
    expect(view.contentDOM.getAttribute('contenteditable')).toBe('false')
  })

  it('names the text box', async () => {
    await renderEditor({ value: '', label: 'Base schema' })

    expect(screen.getByRole('textbox', { name: 'Base schema' })).toBeDefined()
  })

  it('colors and folds broken SDL', async () => {
    const { view } = await renderEditor({
      defaultValue: 'scalar\n\nenum Role {\n  ADMIN\n}',
    })
    const line = view.state.doc.line(3)

    // eslint-disable-next-line testing-library/no-node-access -- see above
    expect(view.dom.querySelector('.cm-sdl-type')?.textContent).toBe('Role')
    expect(foldable(view.state, line.from, line.to)).not.toBeNull()
  })

  it('colors and folds a large document through an edit, before reindexing', async () => {
    const body = 'type A {\n  a: Int\n}\n'
    const { view } = await renderEditor({
      defaultValue: body + `# ${'x'.repeat(MAX_HERE)}\n`.repeat(2),
    })
    // Make the index count as slow, whatever this machine's speed.
    const now = vi.spyOn(performance, 'now')
    let time = 0
    now.mockImplementation(() => (time += 20))
    act(() => {
      view.dispatch({ changes: { from: 0, insert: '\n' } })
      view.dispatch({ changes: { from: 0, insert: '\n' } })
    })
    const line = view.state.doc.line(3)

    expect(foldable(view.state, line.from, line.to)).toEqual({
      from: 10,
      to: 20,
    })
    // eslint-disable-next-line testing-library/no-node-access -- see above
    expect(view.dom.querySelector('.cm-sdl-type')?.textContent).toBe('A')
    now.mockRestore()
  })
})

describe('SdlEditor completion', () => {
  const sdl = `scalar DateTime
scalar Money
enum Role { ADMIN }
type User { id: ID }
interface Node { id: ID }
input Filter { a: Int }
directive @auth(role: |) on FIELD_DEFINITION
`
  const contextSdl = `enum OrderStatus { OPEN }
input ProductFilter { a: Int }
type Order { id: ID }
scalar Money
directive @tag on OBJECT`

  it('lists the document, then the context, then built-in types', async () => {
    expect(
      await completionsAt(sdl, { contextSdl, contextLabel: 'published' })
    ).toEqual([
      'DateTime scalar',
      'Money scalar',
      'Role enum',
      'Filter input',
      'OrderStatus published',
      'ProductFilter published',
      'String scalar',
      'Int scalar',
      'Float scalar',
      'Boolean scalar',
      'ID scalar',
    ])
  })

  it('shows what a context name is without a label', async () => {
    expect(await completionsAt(sdl, { contextSdl })).toContain(
      'ProductFilter input'
    )
  })

  it.each([
    ['output types', 'type A { a: | }', ['User type', 'Node interface'], []],
    ['interfaces', 'type A implements |', ['Node interface'], []],
    ['union members', 'union A = |', ['User type'], ['Node interface']],
    ['what was typed', 'type A { a: Us| }', ['User type'], ['Node interface']],
  ])('offers %s', async (_, marked, included, excluded) => {
    const found = await completionsAt(
      `type User { id: ID }\ninterface Node { id: ID }\ninput In { a: Int }\n${marked}`
    )

    expect(found).toEqual(expect.arrayContaining(included))
    for (const name of [...excluded, 'In input']) {
      expect(found).not.toContain(name)
    }
  })

  it('offers directives after @', async () => {
    const found = await completionsAt(
      'directive @auth on OBJECT\ntype A { a: Int @| }',
      { contextSdl, contextLabel: 'published' }
    )

    expect(found.slice(0, 3)).toEqual([
      'auth directive',
      'tag published',
      'deprecated directive',
    ])
    expect(found).not.toContain('include directive')
  })

  it('works while the document is broken', async () => {
    expect(
      await completionsAt('scalar Money\nscalar\ntype A {\n  a: |')
    ).toContain('Money scalar')
  })

  it.each([
    ['a field name', 'scalar B\ntype A {\n  |\n}'],
    ['a comment', 'scalar B\ntype A {\n  a: # |\n}'],
    ['a description', 'scalar B\ntype A {\n  "x: |"\n}'],
    ['a value', 'scalar B\ntype A {\n  a(b: Int = |)\n}'],
    ['a definition name', 'scalar B\ntype |'],
  ])('offers nothing in %s', async (_, marked) => {
    expect(await completionsAt(marked)).toEqual([])
  })

  it('offers nothing when read-only', async () => {
    expect(
      await completionsAt('scalar B\ntype A { a: | }', { readOnly: true })
    ).toEqual([])
  })
})
