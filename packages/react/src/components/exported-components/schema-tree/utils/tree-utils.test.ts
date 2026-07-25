import { buildSchema } from 'graphql'
import { describe, expect, it } from 'vitest'

import {
  createSchemaTreeData,
  flattenTree,
  getNodeChildren,
  nodeHasChildren,
  MAX_TREE_DEPTH,
  type TreeNode,
} from './tree-utils'

const schema = buildSchema(`
  type Query {
    root: Node!
    media: Media
    count: Int
    tagged(tag: String!, limit: Int): Node
  }

  type Node {
    id: ID!
    name(upper: Boolean): String!
    self: Node!
    items: [Leaf!]!
  }

  type Leaf {
    value: String
  }

  union Media = Node | Leaf
`)

const queryRoot = () => {
  const root = createSchemaTreeData(schema).query
  if (!root) throw new Error('fixture has a Query type')
  return root
}

const childNamed = (node: TreeNode, name: string): TreeNode => {
  const child = getNodeChildren(node).find(c => c.name === name)
  if (!child) throw new Error(`no child named ${name} on ${node.id}`)
  return child
}

/** Walk down by field name, e.g. ['root', 'self', 'self']. */
const descend = (names: string[]): TreeNode =>
  names.reduce(childNamed, queryRoot())

describe('createSchemaTreeData', () => {
  it('builds roots without materializing children', () => {
    const data = createSchemaTreeData(schema)

    expect(data.query).toMatchObject({
      id: 'query',
      name: 'Query',
      type: 'root',
    })
    expect(data.mutation).toBeNull()
    expect(data.subscription).toBeNull()
  })

  // `count` is the only Query field with nothing under it (Int, no arguments),
  // so it sorts below the three expandable ones, which go alphabetically.
  it('ids root children as dotted paths, expandable first then alphabetical', () => {
    expect(getNodeChildren(queryRoot()).map(n => n.id)).toEqual([
      'query.media',
      'query.root',
      'query.tagged',
      'query.count',
    ])
  })
})

describe('getNodeChildren', () => {
  it('renders union members as inline fragments', () => {
    const members = getNodeChildren(childNamed(queryRoot(), 'media'))

    expect(members.map(n => [n.id, n.name, n.type])).toEqual([
      ['query.media.Leaf', '... on Leaf', 'type'],
      ['query.media.Node', '... on Node', 'type'],
    ])
  })

  /**
   * Two different orderings in one node. ARGUMENTS is prepended ahead of the
   * sorted fields so a field's inputs read before its shape, and the arguments
   * themselves stay in declaration order (`tag` then `limit`) so they match the
   * signature in the schema rather than being alphabetized.
   */
  it('puts ARGUMENTS before type children, unsorted', () => {
    expect(
      getNodeChildren(childNamed(queryRoot(), 'tagged')).map(n => n.id)
    ).toEqual([
      'query.tagged.arguments',
      'query.tagged.items',
      'query.tagged.name',
      'query.tagged.self',
      'query.tagged.id',
    ])

    const args = getNodeChildren(descend(['tagged', 'ARGUMENTS']))
    expect(args.map(n => [n.id, n.type])).toEqual([
      ['query.tagged.arguments.tag', 'argument'],
      ['query.tagged.arguments.limit', 'argument'],
    ])
  })

  // The old eager builder only attached arguments to root-level fields, so a
  // nested field's arguments were invisible.
  it('attaches ARGUMENTS at any depth', () => {
    const nested = descend(['root', 'self', 'self', 'name'])

    expect(getNodeChildren(nested).map(n => n.id)).toEqual([
      'query.root.self.self.name.arguments',
    ])
    expect(
      getNodeChildren(
        descend(['root', 'self', 'self', 'name', 'ARGUMENTS'])
      ).map(n => n.id)
    ).toEqual(['query.root.self.self.name.arguments.upper'])
  })

  it('walks a cycle as far as asked, flagging repeats', () => {
    const ids: string[] = []
    const recursive: (boolean | undefined)[] = []
    let node = childNamed(queryRoot(), 'root')

    for (let i = 0; i < 5; i++) {
      ids.push(node.id)
      recursive.push(node.isRecursive)
      node = childNamed(node, 'self')
    }

    expect(ids).toEqual([
      'query.root',
      'query.root.self',
      'query.root.self.self',
      'query.root.self.self.self',
      'query.root.self.self.self.self',
    ])
    // `root` is the first Node on the path; every `self` below it repeats one.
    expect(recursive).toEqual([false, true, true, true, true])
  })

  // Scalars repeat on nearly every type, so tracking them the same way would
  // put a recursion badge on half the leaves in the tree.
  it('treats scalar repetition as ordinary, not recursion', () => {
    expect(descend(['root', 'id']).isRecursive).toBeUndefined()
  })
})

describe('nodeHasChildren', () => {
  it('is true for composite types and for fields with arguments', () => {
    expect(nodeHasChildren(childNamed(queryRoot(), 'root'))).toBe(true)
    expect(nodeHasChildren(childNamed(queryRoot(), 'media'))).toBe(true)
    expect(nodeHasChildren(descend(['media', '... on Node']))).toBe(true)
    expect(nodeHasChildren(descend(['root', 'name']))).toBe(true)
    expect(nodeHasChildren(descend(['tagged', 'ARGUMENTS']))).toBe(true)
  })

  it('is false for plain leaves and arguments', () => {
    expect(nodeHasChildren(childNamed(queryRoot(), 'count'))).toBe(false)
    expect(nodeHasChildren(descend(['root', 'id']))).toBe(false)
    expect(nodeHasChildren(descend(['tagged', 'ARGUMENTS', 'tag']))).toBe(false)
  })
})

describe('flattenTree', () => {
  const roots = () => getNodeChildren(queryRoot())

  it('emits only expanded subtrees, depth-first', () => {
    const rows = flattenTree(
      roots(),
      new Set(['query.root', 'query.root.name']),
      getNodeChildren
    )

    expect(rows.map(r => [r.node.id, r.depth])).toEqual([
      ['query.media', 0],
      ['query.root', 0],
      ['query.root.items', 1],
      ['query.root.name', 1],
      ['query.root.name.arguments', 2],
      ['query.root.self', 1],
      ['query.root.id', 1],
      ['query.tagged', 0],
      ['query.count', 0],
    ])
  })

  // One flag per ancestor column: true keeps that column's indent rail running
  // past this row, false ends it at this row's elbow.
  it('flags which ancestor columns continue below each row', () => {
    const rows = flattenTree(
      roots(),
      new Set(['query.root', 'query.root.name']),
      getNodeChildren
    )
    const guidesFor = (id: string) => rows.find(r => r.node.id === id)?.guides

    expect(guidesFor('query.root')).toEqual([])
    // `items` has siblings below it, `id` is the last child of `root`.
    expect(guidesFor('query.root.items')).toEqual([true])
    expect(guidesFor('query.root.id')).toEqual([false])
    // Sole child of `name`, which itself still has siblings below.
    expect(guidesFor('query.root.name.arguments')).toEqual([true, false])
  })

  it('marks rows as expanded only when they can expand', () => {
    const rows = flattenTree(roots(), new Set(['query.count']), getNodeChildren)
    const count = rows.find(r => r.node.id === 'query.count')

    expect(count).toMatchObject({ hasChildren: false, isExpanded: false })
  })

  it('stops an unbounded cycle at MAX_TREE_DEPTH', () => {
    // Expand `root` and 200 levels of `self`, well past the cap.
    const expanded = new Set<string>()
    let id = 'query.root'
    expanded.add(id)
    for (let i = 0; i < 200; i++) {
      id = `${id}.self`
      expanded.add(id)
    }

    const rows = flattenTree(roots(), expanded, getNodeChildren)
    const deepest = Math.max(...rows.map(r => r.depth))

    // Depth is zero-based, so a full path is MAX_TREE_DEPTH rows and the last
    // sits at cap - 1. `self` is a one-type cycle: nothing else stops the walk.
    expect(deepest).toBe(MAX_TREE_DEPTH - 1)
  })
})
