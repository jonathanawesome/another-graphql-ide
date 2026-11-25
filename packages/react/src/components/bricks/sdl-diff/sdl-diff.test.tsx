import { EditorView } from '@codemirror/view'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SdlDiff, type SdlDiffProps } from './sdl-diff'

// CodeMirror's DOM has no roles to query by.
const findAll = (root: HTMLElement, selector: string) => [
  // eslint-disable-next-line testing-library/no-node-access -- see above
  ...root.querySelectorAll(selector),
]

const lines = (root: HTMLElement, selector = '') =>
  findAll(root, `.cm-line${selector}`).map(line => line.textContent)

const gutter = (root: HTMLElement) =>
  // The hidden spacer row comes first.
  findAll(root, '.cm-sdl-diff-cell')
    .map(cell => cell.textContent)
    .slice(1)

// jsdom has no Worker, so comparisons run on timers here.
const settle = () => act(() => void vi.runAllTimers())

const before = 'type Query {\n  a: Int\n}'
const after = 'type Query {\n  a: ID\n}'

const fields = (count: number) =>
  Array.from({ length: count }, (_, i) => `  f${i}: Int`)
const long = ['type Query {', ...fields(30), '}'].join('\n')
const longEdited = long.replace('f15: Int', 'f15: ID')

const setup = (props: Partial<SdlDiffProps> = {}) => {
  const view = render(<SdlDiff before={before} after={after} {...props} />)
  settle()
  return view
}

const editorOf = (root: HTMLElement) => {
  const [dom] = findAll(root, '.cm-editor')
  const view = dom instanceof HTMLElement && EditorView.findFromDOM(dom)
  if (!view) throw new Error('no view')
  return view
}

describe('SdlDiff', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows added, removed and unchanged lines, without AGIProvider', () => {
    const { container } = setup()

    expect(lines(container)).toEqual([
      'type Query {',
      '  a: Int',
      '  a: ID',
      '}',
    ])
    expect(lines(container, '.cm-sdl-removed')).toEqual(['  a: Int'])
    expect(lines(container, '.cm-sdl-added')).toEqual(['  a: ID'])
    expect(gutter(container)).toEqual(['1', '2−', '2+', '3'])
  })

  it('colors both sides', () => {
    const { container } = setup()

    expect(
      findAll(container, '.cm-sdl-type').map(type => type.textContent)
    ).toEqual(['Query', 'Int', 'ID'])
  })

  it('shows placeholders until the comparison is done', () => {
    const { container } = render(<SdlDiff before={before} after={after} />)

    expect(screen.getByLabelText('Search this schema')).toHaveProperty(
      'disabled',
      true
    )
    expect(lines(container)).toEqual([])

    settle()
    expect(lines(container)).toHaveLength(4)
  })

  it('waits while loading', () => {
    const onResult = vi.fn()
    const { container, rerender } = setup({ loading: true, onResult })
    expect(lines(container)).toEqual([])
    expect(onResult).not.toHaveBeenCalled()

    rerender(<SdlDiff before={before} after={after} onResult={onResult} />)
    settle()
    expect(lines(container)).toHaveLength(4)
    expect(onResult).toHaveBeenCalledOnce()
  })

  it('reports what it found', () => {
    const onResult = vi.fn()
    const { rerender } = setup({ onResult })
    expect(onResult).toHaveBeenLastCalledWith({
      kind: 'diff',
      added: 1,
      removed: 1,
    })

    rerender(<SdlDiff before={after} after={after} onResult={onResult} />)
    settle()
    expect(onResult).toHaveBeenLastCalledWith({
      kind: 'unchanged',
      added: 0,
      removed: 0,
    })
  })

  it('shows equal documents in full', () => {
    const { container } = setup({ before: long, after: long })

    expect(lines(container)).toHaveLength(32)
    expect(findAll(container, '.cm-sdl-folded')).toEqual([])
  })

  it('follows new documents', () => {
    const { container, rerender } = setup()
    rerender(<SdlDiff before="scalar A" after="scalar B" />)
    settle()

    expect(lines(container)).toEqual(['scalar A', 'scalar B'])
  })

  it('folds unchanged runs, and opens one in place', () => {
    const { container } = setup({ before: long, after: longEdited })
    const runs = () =>
      screen
        .queryAllByRole('button', { name: /unchanged lines/ })
        .map(run => run.textContent)
    // Rows: 13 before the change, 3 of context each side, then the rest.
    expect(runs()).toEqual(['13 unchanged lines', '12 unchanged lines'])
    expect(lines(container)).toHaveLength(8)

    fireEvent.click(screen.getByRole('button', { name: '13 unchanged lines' }))

    expect(runs()).toEqual(['12 unchanged lines'])
    expect(lines(container)[0]).toBe('type Query {')
  })

  it('takes the context from the host', () => {
    const { container } = setup({
      before: long,
      after: longEdited,
      context: 1,
    })

    expect(lines(container)).toHaveLength(4)
  })

  it('opens a run when a search match is inside it', async () => {
    const { container } = setup({ before: long, after: longEdited })
    // The find bar opens in a microtask, once the view is built.
    await act(() => Promise.resolve())
    const input = screen.getByLabelText('Search this schema')

    fireEvent.change(input, { target: { value: 'f2:' } })
    settle()

    expect(lines(container)).toContain('  f2: Int')
    const { from, to } = editorOf(container).state.selection.main
    expect(editorOf(container).state.sliceDoc(from, to)).toBe('f2:')
  })
})
