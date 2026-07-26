import { deepTestSchema } from '@another-graphql-ide/shared'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// jsdom gives every element a zero-height rect, so the real virtualizer renders
// an empty window. Swap in one that renders the whole list: what these tests
// care about is which rows the tree produces, not which ones are on screen.
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({
    count,
    getItemKey,
  }: {
    count: number
    getItemKey: (index: number) => string | number
  }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: getItemKey(index),
        start: index * 24,
        size: 24,
      })),
    getTotalSize: () => count * 24,
    measureElement: () => undefined,
    scrollToIndex: () => undefined,
  }),
}))

const { useAppStore } = await import('../../../state')
const { SchemaTree } = await import('./schema-tree')

const expand = (label: string) =>
  fireEvent.click(screen.getByRole('button', { name: `Expand ${label}` }))

const nth = <T,>(items: T[], index: number): T => {
  const item = items[index]
  if (!item) throw new Error(`nothing at index ${index}`)
  return item
}

describe('SchemaTree', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('renders root fields for the schema it is given', () => {
    render(<SchemaTree schema={deepTestSchema} />)

    expect(screen.getByRole('button', { name: 'root' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Expand root' })).toBeDefined()
  })

  it('reveals children only once a node is expanded', () => {
    render(<SchemaTree schema={deepTestSchema} />)

    expect(screen.queryByRole('button', { name: 'kind' })).toBeNull()
    expand('root')
    expect(screen.getByRole('button', { name: 'kind' })).toBeDefined()
  })

  // The cyclic mesh has no bottom, so this used to stop at the depth cap.
  it('follows a cycle as deep as the user drills', () => {
    render(<SchemaTree schema={deepTestSchema} />)

    expand('root')
    for (let i = 0; i < 8; i++) expand('self')

    // Each expansion reveals one more `self`, the deepest still collapsed.
    expect(screen.getAllByRole('button', { name: 'self' })).toHaveLength(9)
  })

  it('inserts a nested field into the document on click', () => {
    render(<SchemaTree schema={deepTestSchema} />)

    expand('root')
    expand('self')
    // Rows are depth-first, so the nested `id` comes before the root-level one.
    fireEvent.click(nth(screen.getAllByRole('button', { name: 'id' }), 0))

    expect(useAppStore.getState().query).toMatch(/self\s*{\s*id/)
  })

  // The old eager builder only attached ARGUMENTS to root-level fields.
  it('exposes arguments below the root level', () => {
    render(<SchemaTree schema={deepTestSchema} />)

    expand('root')
    expand('self')
    const nestedName = screen.getAllByRole('button', { name: 'Expand name' })
    fireEvent.click(nth(nestedName, nestedName.length - 1))

    expect(screen.getByText('ARGUMENTS')).toBeDefined()

    expand('ARGUMENTS')
    expect(screen.getByRole('button', { name: 'upper' })).toBeDefined()
  })

  describe('keyboard navigation', () => {
    const rows = () => screen.getAllByRole('treeitem')
    // Roving tabindex is defined by what holds focus, and testing-library has
    // no query for that (nor is jest-dom's toHaveFocus available here).
    // eslint-disable-next-line testing-library/no-node-access
    const focused = () => document.activeElement as HTMLElement
    const nameOf = (row: HTMLElement) => row.textContent.trim()
    const press = (key: string) => fireEvent.keyDown(focused(), { key })

    // Focusing the first row directly stands in for tabbing into the tree,
    // which jsdom cannot do. That row is the tree's only tab stop, so this is
    // where a real Tab press would land.
    const openTree = () => {
      render(<SchemaTree schema={deepTestSchema} />)
      const first = nth(rows(), 0)
      first.focus()
      return first
    }

    it('exposes the tree as one tab stop', () => {
      render(<SchemaTree schema={deepTestSchema} />)

      const tabbable = rows().filter(row => row.tabIndex === 0)
      expect(tabbable).toHaveLength(1)
      expect(tabbable[0]).toBe(nth(rows(), 0))
      // Controls inside rows stay out of the tab order, so Tab does not walk
      // every chevron in the tree. Header controls are unaffected.
      const inTree = within(screen.getByRole('tree')).getAllByRole('button')
      expect(inTree.length).toBeGreaterThan(0)
      expect(inTree.every(button => button.tabIndex === -1)).toBe(true)
    })

    it('moves between rows with the arrow keys, Home and End', () => {
      openTree()

      press('ArrowDown')
      expect(nameOf(focused())).toBe(nameOf(nth(rows(), 1)))

      press('ArrowUp')
      expect(nameOf(focused())).toBe(nameOf(nth(rows(), 0)))

      press('End')
      expect(nameOf(focused())).toBe(nameOf(nth(rows(), rows().length - 1)))

      press('Home')
      expect(nameOf(focused())).toBe(nameOf(nth(rows(), 0)))
    })

    // ArrowRight and ArrowLeft each do two jobs depending on the row's state,
    // which is the part of the tree pattern most often gotten wrong. Levels are
    // 1-based, so stepping into a child reads as level 2.
    it('opens with ArrowRight, steps in, then closes with ArrowLeft', () => {
      openTree()

      // entry0 is the first row and has children.
      expect(focused().getAttribute('aria-expanded')).toBe('false')
      press('ArrowRight')
      expect(focused().getAttribute('aria-expanded')).toBe('true')

      press('ArrowRight')
      expect(focused().getAttribute('aria-level')).toBe('2')

      // A closed row steps back out to its parent rather than collapsing.
      press('ArrowLeft')
      expect(focused().getAttribute('aria-level')).toBe('1')
      expect(focused().getAttribute('aria-expanded')).toBe('true')

      press('ArrowLeft')
      expect(focused().getAttribute('aria-expanded')).toBe('false')
    })

    it('toggles the focused field into the document with Enter', () => {
      openTree()

      press('Enter')

      expect(useAppStore.getState().query).toContain('entry0')
      // Selection in this tree means "present in the document", not "focused",
      // which is why the tree is marked aria-multiselectable.
      expect(focused().getAttribute('aria-selected')).toBe('true')
    })

    it('jumps to a row by typing its name', () => {
      openTree()

      press('h') // hub
      expect(nameOf(focused())).toContain('hub')
    })
  })

  describe('return types', () => {
    it('are hidden until the setting is on', () => {
      render(<SchemaTree schema={deepTestSchema} />)

      expect(screen.queryByText('HubNode!')).toBeNull()

      // Store writes from outside an event need act, or React has not
      // re-rendered by the time the assertion runs.
      act(() => useAppStore.setState({ showFieldTypes: true }))
      expect(screen.getByText('HubNode!')).toBeDefined()
    })

    // The label sits beside the name button rather than inside it, so the
    // field stays queryable by its own name and the type is not part of the
    // click target that inserts it.
    it('leave the field name intact', () => {
      useAppStore.setState({ showFieldTypes: true })
      render(<SchemaTree schema={deepTestSchema} />)

      expect(screen.getByRole('button', { name: 'hub' })).toBeDefined()
    })

    it('toggle from the keyboard anywhere on the page', () => {
      render(<SchemaTree schema={deepTestSchema} />)

      // jsdom is not an Apple platform, so Mod is Control here.
      fireEvent.keyDown(document, { key: 'l', ctrlKey: true, shiftKey: true })

      expect(useAppStore.getState().showFieldTypes).toBe(true)
      expect(screen.getByText('HubNode!')).toBeDefined()
    })
  })

  it('filters root fields by search term', () => {
    render(<SchemaTree schema={deepTestSchema} />)

    fireEvent.change(screen.getByPlaceholderText('Search schema...'), {
      target: { value: 'hub' },
    })

    expect(screen.getByRole('button', { name: 'hub' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'root' })).toBeNull()
  })
})
