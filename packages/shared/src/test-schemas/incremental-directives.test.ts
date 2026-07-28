import { parse, validate } from 'graphql'
import { describe, expect, it } from 'vitest'

import { deepTestSchema } from './deep-test-schema'
import { enterpriseTestSchema } from './enterprise-test-schema'
import { graphiqlTestSchema } from './graphiql-test-schema'
import { performanceTestSchema } from './performance-test-schema'
import { veterinaryOfficeSchema } from './veterinary-office-schema'

const schemas = {
  graphiql: graphiqlTestSchema,
  deep: deepTestSchema,
  enterprise: enterpriseTestSchema,
  performance: performanceTestSchema,
  veterinary: veterinaryOfficeSchema,
}

describe.each(Object.entries(schemas))('%s schema', (_name, schema) => {
  it('declares defer and stream', () => {
    const names = schema.getDirectives().map(directive => directive.name)

    expect(names).toContain('defer')
    expect(names).toContain('stream')
  })

  // Replacing `directives` drops the specified set unless it is carried along,
  // which would leave @include and @skip undefined.
  it('keeps the specified directives', () => {
    const names = schema.getDirectives().map(directive => directive.name)

    expect(names).toContain('include')
    expect(names).toContain('skip')
    expect(names).toContain('deprecated')
  })
})

// The reason the declarations exist: this is the check the editor's language
// service runs, and it flagged @defer as unknown before.
it('validates a deferred query against the graphiql schema', () => {
  const errors = validate(
    graphiqlTestSchema,
    parse('{ isTest ... @defer { test { id } } }')
  )

  expect(errors).toEqual([])
})
