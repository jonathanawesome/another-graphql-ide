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

    // Walk back down the response to prove every level resolved.
    let value: unknown = result.data?.root
    for (let i = 0; i < 20; i++) {
      value = (value as { self: unknown }).self
    }
    expect((value as { name: string }).name).toBe('NODE0-0')
  })

  it('resolves interface and union fields back into the mesh', async () => {
    const result = await graphql({
      schema: deepTestSchema,
      source: `{
        node(id: "1") { __typename id self { id } }
        payload { ... on GroupPayload { size owner { child { id } } } }
      }`,
    })

    expect(result.errors).toBeUndefined()
    expect(result.data).toMatchObject({
      node: { __typename: 'Node0' },
      payload: { owner: { child: { id: 'Node1-0' } } },
    })
  })

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
