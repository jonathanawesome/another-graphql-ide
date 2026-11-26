import { EditorView } from '@codemirror/view'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Editor } from './editor'
import {
  useOperationExtensions,
  type UseOperationExtensionsParams,
} from './hooks/use-operation-extensions'

const twoOperations = 'query A { a }\n\nquery B { b }\n'

const OperationEditor = (
  props: UseOperationExtensionsParams & { value: string }
) => {
  const extensions = useOperationExtensions(props)
  return (
    <Editor language="graphql" value={props.value} extensions={extensions} />
  )
}

// CodeMirror's DOM has no roles to query by.
const find = (root: HTMLElement, selector: string) =>
  // eslint-disable-next-line testing-library/no-node-access -- see above
  root.querySelector(selector)

const content = (root: HTMLElement) => find(root, '.cm-content')

describe('Editor', () => {
  it('renders without AGIProvider', () => {
    const { container } = render(<Editor defaultValue="plain text" />)

    expect(content(container)?.textContent).toBe('plain text')
  })

  it('installs caller extensions', () => {
    const extensions = EditorView.contentAttributes.of({ 'data-probe': 'on' })
    const { container } = render(<Editor extensions={extensions} />)

    expect(content(container)?.getAttribute('data-probe')).toBe('on')
  })

  it('leaves operation behavior out by default', () => {
    const { container } = render(
      <Editor language="graphql" defaultValue={twoOperations} />
    )

    expect(find(container, '.cm-agi-dimmed')).toBeNull()
  })

  it('keeps typed text when the host echoes it back', () => {
    const onChange = vi.fn<(value: string) => void>()
    const { container, rerender } = render(
      <Editor value="a" onChange={onChange} />
    )
    const view = EditorView.findFromDOM(container)
    view?.dispatch({ changes: { from: 1, insert: 'b' } })
    rerender(<Editor value={onChange.mock.lastCall?.[0]} onChange={onChange} />)

    expect(view?.state.doc.toString()).toBe('ab')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('restores typed text the host set away and back', () => {
    const onChange = vi.fn()
    const { container, rerender } = render(
      <Editor value="a" onChange={onChange} />
    )
    const view = EditorView.findFromDOM(container)
    view?.dispatch({ changes: { from: 1, insert: 'b' } })
    rerender(<Editor value="reset" onChange={onChange} />)
    rerender(<Editor value="ab" onChange={onChange} />)

    expect(view?.state.doc.toString()).toBe('ab')
  })
})

describe('useOperationExtensions', () => {
  it('reports the active operation and caret on mount', () => {
    const onActiveOperationChange = vi.fn()
    const onSelectionChange = vi.fn()
    render(
      <OperationEditor
        value={twoOperations}
        onActiveOperationChange={onActiveOperationChange}
        onSelectionChange={onSelectionChange}
      />
    )

    expect(onActiveOperationChange).toHaveBeenCalledWith('A')
    expect(onSelectionChange).toHaveBeenCalledWith(0)
  })

  it('dims the operations the caret is not in', () => {
    const { container } = render(<OperationEditor value={twoOperations} />)

    expect(find(container, '.cm-agi-dimmed')?.textContent).toContain('query B')
  })

  it('applies a pending selection once per nonce', () => {
    const onActiveOperationChange = vi.fn()
    const offset = twoOperations.indexOf('query B')
    const { rerender } = render(
      <OperationEditor
        value={twoOperations}
        onActiveOperationChange={onActiveOperationChange}
      />
    )

    rerender(
      <OperationEditor
        value={twoOperations}
        onActiveOperationChange={onActiveOperationChange}
        pendingSelection={{ anchor: offset, head: offset, nonce: 1 }}
      />
    )

    expect(onActiveOperationChange).toHaveBeenLastCalledWith('B')
  })
})
