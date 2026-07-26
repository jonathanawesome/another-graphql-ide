import { graphql, validateSchema } from 'graphql'
import { describe, expect, it } from 'vitest'

import { deepTestSchema } from './deep-test-schema'

/** `root { self { self { ... name } } }`, nested `depth` levels down. */
const selfChain = (depth: number) => {
  let body = 'name(upper: true)'
  for (let i = 0; i < depth; i++) body = `self { ${body} }`
  return `{ root { ${body} } }`
}

describe('deepTestSchema', () => {
  it('is a valid schema', () => {
    expect(validateSchema(deepTestSchema)).toEqual([])
  })

  it('executes a 20-deep self chain', async () => {
    const result = await graphql({
      schema: deepTestSchema,
      source: selfChain(20),
    })

    expect(result.errors).toBeUndefined()

    // Validation alone would pass on a schema whose resolvers bottom out, so
    // walk the response back down and read the deepest level.
    let value: unknown = result.data?.root
    for (let i = 0; i < 20; i++) {
      value = (value as { self: unknown }).self
    }
    // Stub names are `<TypeName>-<index>`, uppercased by `upper: true`, which
    // also proves the argument is honored twenty levels down.
    expect((value as { name: string }).name).toBe('NODE0-0')
  })

  /**
   * Abstract types are the easy thing to get wrong in a fixture: without a
   * `resolveType` that reads the stub, an interface or union field returns
   * nothing usable and the tree has an expandable node that cannot execute.
   */
  it('resolves interface and union fields back into the mesh', async () => {
    const result = await graphql({
      schema: deepTestSchema,
      source: `{
        node(id: "1") { __typename id self { id } }
        payload { ... on GroupPayload { size owner { child { id } } } }
      }`,
    })

    expect(result.errors).toBeUndefined()
    // `Node1-0` is the point: the union member's `owner` leads back into the
    // mesh (Node0's `child` is Node1) rather than dead-ending at the payload.
    expect(result.data).toMatchObject({
      node: { __typename: 'Node0' },
      payload: { owner: { child: { id: 'Node1-0' } } },
    })
  })

  // The schema is executed in-process by the local transport, so a list
  // relation must not hand back whatever `first` asks for.
  it('clamps list relations however many are requested', async () => {
    const result = await graphql({
      schema: deepTestSchema,
      source: '{ root { children(first: 500) { id } } }',
    })

    expect(result.errors).toBeUndefined()
    const { children } = result.data?.root as { children: unknown[] }
    expect(children).toHaveLength(10)
  })
})
