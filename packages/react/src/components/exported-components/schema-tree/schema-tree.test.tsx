import { deepTestSchema } from '@another-graphql-ide/shared'
import { fireEvent, render, screen } from '@testing-library/react'
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
  }),
}))

const { useAppStore } = await import('../../../state')
const { SchemaTree } = await import('./schema-tree')

const expand = (label: string) =>
  fireEvent.click(screen.getByRole('button', { name: `Expand ${label}` }))

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

    // One row per level, plus the `root` row itself.
    expect(screen.getAllByRole('button', { name: 'self' })).toHaveLength(9)
  })

  it('inserts a nested field into the document on click', () => {
    render(<SchemaTree schema={deepTestSchema} />)

    expand('root')
    expand('self')
    // Rows are depth-first, so the nested `id` comes before the root-level one.
    fireEvent.click(screen.getAllByRole('button', { name: 'id' })[0]!)

    expect(useAppStore.getState().query).toMatch(/self\s*{\s*id/)
  })

  // The old eager builder only attached ARGUMENTS to root-level fields.
  it('exposes arguments below the root level', () => {
    render(<SchemaTree schema={deepTestSchema} />)

    expand('root')
    expand('self')
    const nestedName = screen.getAllByRole('button', { name: 'Expand name' })
    fireEvent.click(nestedName[nestedName.length - 1]!)

    expect(screen.getByText('ARGUMENTS')).toBeDefined()

    expand('ARGUMENTS')
    expect(screen.getByRole('button', { name: 'upper' })).toBeDefined()
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
