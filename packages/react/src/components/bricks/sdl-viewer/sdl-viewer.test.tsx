import { EditorView } from '@codemirror/view'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { selectLine } from './codemirror/line-state'
import { goToDefinition } from './codemirror/sdl-extensions'
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

  it('colors SDL from the index', () => {
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

  describe('rows and annotations', () => {
    const sdl =
      'type Query { user(id: ID!): User } type User { id: ID! name: String }'
    // Printed: 1 type Query {, 2 user(...), 3 }, 5 type User {, 6 id, 7 name

    const viewOf = (root: HTMLElement) => {
      const dom = find(root, '.cm-editor')
      if (!(dom instanceof HTMLElement)) throw new Error('no editor')
      const view = EditorView.findFromDOM(dom)
      if (!view) throw new Error('no view')
      return view
    }

    // The column's hidden spacer row carries a marker too.
    const shown = (root: HTMLElement, selector: string) =>
      [...findAll(root, selector)].filter(
        element =>
          // eslint-disable-next-line testing-library/no-node-access -- see above
          !element.closest<HTMLElement>('.cm-gutterElement')?.style.visibility
      )

    const rowText = (root: HTMLElement, selector: string) =>
      [...findAll(root, `.cm-line${selector}`)].map(line => line.textContent)

    it('shows annotations and tags, formatting on its own', () => {
      const { container } = render(
        <SdlViewer
          sdl={sdl}
          annotations={
            new Map([
              ['User.id', { value: '486.0K', ratio: 0.5 }],
              ['User.name', { value: 'unused', ratio: 0 }],
            ])
          }
          tags={new Map([['User.id', { label: 'shared' }]])}
        />
      )

      expect(findAll(container, '.cm-line')).toHaveLength(8)
      const values = shown(container, '.cm-sdl-value')
      expect(values.map(value => value.textContent)).toEqual([
        '486.0K',
        'unused',
      ])
      expect(shown(container, '.cm-sdl-tag')[0]?.textContent).toBe('shared')
      const [fill] = shown(container, '.cm-sdl-bar > span')
      expect(fill instanceof HTMLElement && fill.style.width).toBe('50%')
    })

    it('has no annotation column without annotations or tags', () => {
      const { container } = render(<SdlViewer sdl={sdl} />)

      expect(find(container, '.cm-sdl-annotations')).toBeNull()
    })

    it('follows new annotations', () => {
      const { container, rerender } = render(
        <SdlViewer sdl={sdl} annotations={new Map()} />
      )
      rerender(
        <SdlViewer
          sdl={sdl}
          annotations={new Map([['Query.user', { value: '12' }]])}
        />
      )

      expect(shown(container, '.cm-sdl-value')[0]?.textContent).toBe('12')
    })

    it('dims rows by coordinate', () => {
      const { container, rerender } = render(
        <SdlViewer sdl={sdl} format dimmed={new Set(['User.id'])} />
      )
      expect(rowText(container, '.cm-sdl-dimmed')).toEqual(['  id: ID!'])

      rerender(<SdlViewer sdl={sdl} format dimmed={new Set(['User'])} />)
      expect(rowText(container, '.cm-sdl-dimmed')).toEqual(['type User {'])
    })

    it('selects the row for the selected prop', () => {
      const onSelect = vi.fn()
      const { container, rerender } = render(
        <SdlViewer sdl={sdl} format selected="User.name" onSelect={onSelect} />
      )
      expect(rowText(container, '.cm-sdl-selected')).toEqual(['  name: String'])

      rerender(
        <SdlViewer sdl={sdl} format selected="Query" onSelect={onSelect} />
      )
      expect(rowText(container, '.cm-sdl-selected')).toEqual(['type Query {'])
      // The host's own choice is not echoed back.
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('reports rows the user selects', () => {
      const onSelect = vi.fn()
      const { container } = render(
        <SdlViewer sdl={sdl} format onSelect={onSelect} />
      )
      const view = viewOf(container)

      act(() => view.dispatch({ effects: selectLine.of(2) }))
      expect(onSelect).toHaveBeenLastCalledWith('Query.user')

      act(() => view.dispatch({ effects: selectLine.of(4) }))
      expect(onSelect).toHaveBeenLastCalledWith(undefined)
    })

    it('selects the definition row on go-to-definition', () => {
      const onSelect = vi.fn()
      const { container } = render(
        <SdlViewer sdl={sdl} format onSelect={onSelect} />
      )
      const view = viewOf(container)
      const pos = view.state.doc.line(2).to - 1

      act(() => {
        goToDefinition(view, pos)
      })
      expect(onSelect).toHaveBeenLastCalledWith('User')
      expect(rowText(container, '.cm-sdl-selected')).toEqual(['type User {'])
    })

    it('keeps the selection on its coordinate when the SDL changes', () => {
      const { container, rerender } = render(
        <SdlViewer sdl={sdl} format selected="User.name" />
      )
      rerender(
        <SdlViewer
          sdl={`type Extra { a: Int } ${sdl}`}
          format
          selected="User.name"
        />
      )

      expect(rowText(container, '.cm-sdl-selected')).toEqual(['  name: String'])
    })
  })

  describe('find bar', () => {
    const sdl =
      'type A { legacyId: ID legacyName: String } type B { legacy: Int }'

    const field = () =>
      screen.findByRole('textbox', { name: 'Search this schema' })
    const count = () => screen.getByText(/ of \d+$/).textContent
    const type = async (text: string) =>
      fireEvent.change(await field(), { target: { value: text } })

    it('shows the field and the column heading', async () => {
      render(
        <SdlViewer
          sdl={sdl}
          annotations={new Map()}
          annotationLabel="Requests"
        />
      )

      expect(((await field()) as HTMLInputElement).value).toBe('')
      screen.getByText('Requests')
      expect(screen.queryByRole('button', { name: 'Next match' })).toBeNull()
    })

    it('counts matches and moves to the first', async () => {
      const { container } = render(<SdlViewer sdl={sdl} format />)
      await type('legacy')

      await screen.findByText('1 of 3')
      expect(findAll(container, '.cm-searchMatch').length).toBe(3)
    })

    it('steps through matches with the buttons and Enter', async () => {
      render(<SdlViewer sdl={sdl} format />)
      await type('legacy')
      await screen.findByText('1 of 3')

      fireEvent.click(screen.getByRole('button', { name: 'Next match' }))
      expect(count()).toBe('2 of 3')

      fireEvent.keyDown(await field(), { key: 'Enter' })
      expect(count()).toBe('3 of 3')

      fireEvent.keyDown(await field(), { key: 'Enter', shiftKey: true })
      expect(count()).toBe('2 of 3')

      fireEvent.click(screen.getByRole('button', { name: 'Previous match' }))
      expect(count()).toBe('1 of 3')
    })

    it('leaves the typed text unselected, so typing carries on', async () => {
      render(<SdlViewer sdl={sdl} format />)
      const input = (await field()) as HTMLInputElement
      input.focus()
      await type('legacy')
      await screen.findByText('1 of 3')
      expect(input.selectionStart).toBe(6)

      fireEvent.keyDown(input, { key: 'Enter' })
      expect(input.selectionStart).toBe(6)
    })

    it('says so when nothing matches and disables the arrows', async () => {
      render(<SdlViewer sdl={sdl} format />)
      await type('legasy')

      await screen.findByText('No matches')
      expect(screen.getByRole('button', { name: 'Next match' })).toHaveProperty(
        'disabled',
        true
      )
      expect(
        screen.getByRole('button', { name: 'Previous match' })
      ).toHaveProperty('disabled', true)
    })

    it('clears with Escape and the clear button', async () => {
      render(<SdlViewer sdl={sdl} format />)
      await type('legacy')
      fireEvent.keyDown(await field(), { key: 'Escape' })
      expect(((await field()) as HTMLInputElement).value).toBe('')

      await type('legacy')
      fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
      expect(((await field()) as HTMLInputElement).value).toBe('')
      expect(screen.queryByText(/of 3/)).toBeNull()
    })
  })

  describe('shell and navigation', () => {
    const sdl = 'type Query { user: User } type User { id: ID! }'

    it('shows placeholder lines while loading', () => {
      const { container } = render(<SdlViewer sdl="" loading status="ready" />)

      screen.getByText('Loading schema…')
      expect(
        screen.getByRole('textbox', { name: 'Search this schema' })
      ).toHaveProperty('disabled', true)
      expect(find(container, '[aria-busy="true"]')).not.toBeNull()
      expect(screen.getByRole('button', { name: 'Copy SDL' })).toHaveProperty(
        'disabled',
        true
      )
      expect(screen.queryByText('No composed schema yet')).toBeNull()
    })

    it('shows the empty state for blank SDL', () => {
      const { rerender } = render(<SdlViewer sdl="  " />)
      screen.getByText('No composed schema yet')

      rerender(<SdlViewer sdl="" empty="Nothing published" />)
      screen.getByText('Nothing published')

      rerender(<SdlViewer sdl={sdl} empty="Nothing published" />)
      expect(screen.queryByText('Nothing published')).toBeNull()
    })

    it('shows the footer only with a status', () => {
      const { rerender } = render(<SdlViewer sdl={sdl} />)
      expect(screen.queryByRole('button', { name: 'Copy SDL' })).toBeNull()

      rerender(<SdlViewer sdl={sdl} status="2 types" />)
      screen.getByText('2 types')
    })

    it('copies the SDL as shown', async () => {
      const writeText = vi.fn(() => Promise.resolve())
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      })
      render(<SdlViewer sdl="type Query{a:Int}" format status="" />)

      fireEvent.click(screen.getByRole('button', { name: 'Copy SDL' }))
      await screen.findByText('Copied')
      expect(writeText).toHaveBeenCalledWith('type Query {\n  a: Int\n}')
    })

    it('links type names without following them on a plain click', () => {
      const { rerender } = render(
        <SdlViewer sdl={sdl} typeHref={name => `/types/${name}`} />
      )
      const [link] = screen.getAllByRole('link', { name: 'User' })
      if (!link) throw new Error('no link')
      expect(link.getAttribute('href')).toBe('/types/User')

      // fireEvent returns false when the default was prevented.
      expect(fireEvent.click(link)).toBe(false)
      expect(fireEvent.click(link, { metaKey: true })).toBe(false)
      expect(fireEvent.click(link, { metaKey: true, shiftKey: true })).toBe(
        true
      )

      rerender(<SdlViewer sdl={sdl} />)
      expect(screen.queryByRole('link')).toBeNull()
    })

    it('reveals a coordinate once per nonce', () => {
      const scroll = vi.spyOn(EditorView, 'scrollIntoView')
      const { rerender } = render(
        <SdlViewer sdl={sdl} format reveal={{ coordinate: 'User', nonce: 1 }} />
      )
      // Printed: line 5 is "type User {", at offset 29.
      expect(scroll).toHaveBeenCalledTimes(1)
      expect(scroll.mock.calls[0]?.[0]).toBe(29)

      rerender(
        <SdlViewer sdl={sdl} format reveal={{ coordinate: 'User', nonce: 1 }} />
      )
      expect(scroll).toHaveBeenCalledTimes(1)

      rerender(
        <SdlViewer sdl={sdl} format reveal={{ coordinate: 'User', nonce: 2 }} />
      )
      expect(scroll).toHaveBeenCalledTimes(2)
      scroll.mockRestore()
    })
  })
})
