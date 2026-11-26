import { describe, expect, it } from 'vitest'

import { naming, namingSchema } from './__fixtures__/naming'
import { createJsonCheck, type JsonSchema } from './diagnose-json'

/** Each problem as `message [underlined text]`. */
const check = (text: string, schema?: JsonSchema | boolean) =>
  createJsonCheck(schema)(text).map(({ severity, message, from, to }) => {
    expect(severity).toBe('error')
    return `${message} [${text.slice(from, to)}]`
  })

const STYLE =
  'Not a style. Use camelCase, PascalCase, snake_case or UPPER_CASE.'

describe('createJsonCheck', () => {
  it('only checks syntax without a schema', () => {
    expect(check(naming)).toEqual([])
    expect(check('{"a": 1,}')).toEqual(['Syntax error: trailing comma. [,]'])
  })

  it('accepts the design’s valid rule', () => {
    expect(check(naming, namingSchema)).toEqual([])
  })

  it('shows the design’s error', () => {
    const text = naming.replace('"camelCase"', '"camelcase"')

    expect(check(text, namingSchema)).toEqual([`${STYLE} ["camelcase"]`])
    expect(createJsonCheck(namingSchema)(text)[0]?.from).toBe(
      text.indexOf('"camelcase"')
    )
  })

  it('reports syntax before the schema', () => {
    expect(check('{"types": 1', namingSchema)).toEqual([
      'Syntax error: expected “}”. [1]',
    ])
  })

  it.each([
    ['{"types": {"style": "x"}}', `${STYLE} ["x"]`],
    ['{"types": {"zzz": 1}}', 'Unknown property “zzz”. ["zzz"]'],
    ['{"types": {"forbiddenPrefixes": [1]}}', 'Expected a string. [1]'],
    ['{"types": {"forbiddenPrefixes": "a"}}', 'Expected an array. ["a"]'],
    ['{"types": 5}', `${STYLE} [5]`],
    ['{"nope": 1}', 'Unknown property “nope”. ["nope"]'],
    ['{"allowLeadingUnderscore": "yes"}', 'Expected a boolean. ["yes"]'],
    ['[]', 'Expected an object. [[]'],
    ['{"types": ["a"]}', `${STYLE} [[]`],
  ])('in a naming rule, explains %j', (text, expected) => {
    expect(check(text, namingSchema)).toEqual([expected])
  })

  it('reports every problem, in order', () => {
    expect(
      check(
        '{"nope": 1, "types": "x", "FieldDefinition": {"style": "y"}}',
        namingSchema
      )
    ).toEqual([
      'Unknown property “nope”. ["nope"]',
      `${STYLE} ["x"]`,
      `${STYLE} ["y"]`,
    ])
  })

  it.each<[string, JsonSchema, string]>([
    ['"c"', { enum: ['a', 'b', 1] }, 'Use “a”, “b” or 1. ["c"]'],
    ['"c"', { const: 'a' }, 'Use “a”. ["c"]'],
    ['1', { type: ['string', 'null'] }, 'Expected a string or a null. [1]'],
    ['{\n}', { required: ['a'] }, 'Missing property “a”. [{]'],
    [
      '{"b": {}}',
      { properties: { b: { required: ['a'] } } },
      'Missing property “a”. [{]',
    ],
    [
      '{"b": 1}',
      { properties: { b: false } },
      'This is not allowed here. ["b"]',
    ],
    ['1', { minimum: 2 }, '1 is less than 2. [1]'],
    [
      '"x"',
      { anyOf: [{ const: 'a' }, { const: 'b' }] },
      'This matches no allowed form. ["x"]',
    ],
    [
      '1',
      { oneOf: [{ type: 'number' }, { minimum: 0 }] },
      'This matches more than one allowed form. [1]',
    ],
    ['1', { not: {} }, 'Instance matched “not” schema. [1]'],
    [
      '{"a/b": {"~": 1}}',
      { properties: { 'a/b': { properties: { '~': { type: 'string' } } } } },
      'Expected a string. [1]',
    ],
    [
      '{"a b%": 1}',
      { properties: { 'a b%': { type: 'string' } } },
      'Expected a string. [1]',
    ],
    [
      '{"a": 1, "a": 2}',
      { properties: { a: { type: 'string' } } },
      'Expected a string. [2]',
    ],
    [
      '[[1], ["a"]]',
      { items: { items: { type: 'number' } } },
      'Expected a number. ["a"]',
    ],
  ])('explains %s against %j', (text, schema, expected) => {
    expect(check(text, schema)).toEqual([expected])
  })

  describe('errorMessage', () => {
    it.each<[string, string, JsonSchema, string]>([
      [
        'a keyword',
        '1',
        { type: 'string', errorMessage: 'Words only.' },
        '[1]',
      ],
      [
        'a choice',
        '1',
        {
          oneOf: [{ type: 'string' }, { type: 'null' }],
          errorMessage: 'Words only.',
        },
        '[1]',
      ],
      [
        'a reference',
        '1',
        {
          definitions: { s: { type: 'string' } },
          properties: {},
          allOf: [{ $ref: '#/definitions/s', errorMessage: 'Words only.' }],
        },
        '[1]',
      ],
      [
        'a property not allowed',
        '{"a": 1}',
        { additionalProperties: false, errorMessage: 'Words only.' },
        '["a"]',
      ],
    ])('replaces the message for %s', (_, text, schema, underlined) => {
      expect(check(text, schema)).toEqual([`Words only. ${underlined}`])
    })

    it('does not hide a deeper problem in a choice', () => {
      const schema: JsonSchema = {
        oneOf: [
          { type: 'string' },
          { type: 'object', properties: { a: { type: 'number' } } },
        ],
        errorMessage: 'A string or options.',
      }

      expect(check('{"a": "x"}', schema)).toEqual(['Expected a number. ["x"]'])
    })

    it('ignores one that is not text', () => {
      expect(check('1', { type: 'string', errorMessage: {} })).toEqual([
        'Expected a string. [1]',
      ])
    })
  })

  it.each([
    ['http://json-schema.org/draft-04/schema#', 0],
    ['http://json-schema.org/draft-07/schema#', 0],
    ['https://json-schema.org/draft/2020-12/schema', 1],
    [undefined, 0],
  ])('reads the draft from $schema %s', ($schema, problems) => {
    // Before 2019-09, keywords beside a `$ref` do nothing.
    const schema: JsonSchema = {
      ...($schema && { $schema }),
      definitions: { any: {} },
      $ref: '#/definitions/any',
      type: 'string',
    }

    expect(check('1', schema)).toHaveLength(problems)
  })

  it('takes a boolean schema', () => {
    expect(check('1', true)).toEqual([])
    expect(check('1', false)).toHaveLength(1)
  })
})
