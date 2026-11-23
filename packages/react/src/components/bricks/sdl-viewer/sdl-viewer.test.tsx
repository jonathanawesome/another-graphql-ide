import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SdlViewer } from './sdl-viewer'

// CodeMirror's DOM has no roles to query by.
const find = (root: HTMLElement, selector: string) =>
  // eslint-disable-next-line testing-library/no-node-access -- see above
  root.querySelector(selector)

const findAll = (root: HTMLElement, selector: string) =>
  // eslint-disable-next-line testing-library/no-node-access -- see above
  root.querySelectorAll(selector)

const text = (root: HTMLElement) => find(root, '.cm-content')?.textContent

describe('SdlViewer', () => {
  it('shows SDL read-only, without AGIProvider', () => {
    const { container } = render(<SdlViewer sdl="type Query { a: Int }" />)

    expect(text(container)).toBe('type Query { a: Int }')
    expect(
      find(container, '.cm-content')?.getAttribute('contenteditable')
    ).toBe('false')
  })

  it('colours SDL from the index', () => {
    const { container } = render(<SdlViewer sdl="type Query { a: Int }" />)

    expect(find(container, '.cm-sdl-keyword')?.textContent).toBe('type')
    expect(find(container, '.cm-sdl-field')?.textContent).toBe('a')
  })

  it('pretty-prints when asked', () => {
    const { container } = render(<SdlViewer sdl="type Query{a:Int}" format />)

    // One line element per printed line.
    expect(findAll(container, '.cm-line')).toHaveLength(3)
  })

  it('shows SDL that does not parse as is', () => {
    const { container } = render(<SdlViewer sdl="type Query {" format />)

    expect(text(container)).toBe('type Query {')
  })

  it('follows a new sdl prop', () => {
    const { container, rerender } = render(
      <SdlViewer sdl="type A { a: Int }" />
    )
    rerender(<SdlViewer sdl="scalar Date" />)

    expect(text(container)).toBe('scalar Date')
    expect(find(container, '.cm-sdl-type')?.textContent).toBe('Date')
  })
})
