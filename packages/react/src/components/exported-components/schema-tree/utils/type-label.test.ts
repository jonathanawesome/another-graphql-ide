import { buildSchema } from 'graphql'
import { describe, expect, it } from 'vitest'

import { createSchemaTreeData, getNodeChildren } from './tree-utils'
import type { TreeNode } from './tree-utils'
import { typeLabelFor } from './type-label'

const schema = buildSchema(`
  type Query {
    root: Node!
    media: Media
    tagged(limit: Int): [Node!]
  }
  type Node { id: ID! }
  type Leaf { value: String }
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

describe('typeLabelFor', () => {
  // The wrappers are the point: `[Node!]` and `Node!` are different fields, and
  // a repeated type name is what makes a cycle visible.
  it('prints a field type with its wrappers', () => {
    expect(typeLabelFor(childNamed(queryRoot(), 'root'))).toBe('Node!')
    expect(typeLabelFor(childNamed(queryRoot(), 'tagged'))).toBe('[Node!]')
  })

  it('prints an argument type too', () => {
    const args = childNamed(childNamed(queryRoot(), 'tagged'), 'ARGUMENTS')

    expect(typeLabelFor(childNamed(args, 'limit'))).toBe('Int')
  })

  it('says nothing where the row already carries its type', () => {
    // `... on Leaf` names the type in the row label.
    expect(
      typeLabelFor(childNamed(childNamed(queryRoot(), 'media'), '... on Leaf'))
    ).toBeUndefined()
    // The ARGUMENTS group and the root have no type of their own.
    expect(
      typeLabelFor(childNamed(childNamed(queryRoot(), 'tagged'), 'ARGUMENTS'))
    ).toBeUndefined()
    expect(typeLabelFor(queryRoot())).toBeUndefined()
  })
})
