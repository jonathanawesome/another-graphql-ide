import type { JsonSchema } from '../diagnose-json'

/** A naming rule like the console's: a style, or an object of options. */
export const namingSchema: JsonSchema = {
  definitions: {
    style: {
      enum: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
      errorMessage:
        'Not a style. Use camelCase, PascalCase, snake_case or UPPER_CASE.',
    },
    names: { type: 'array', items: { type: 'string' }, minItems: 1 },
    options: {
      type: 'object',
      properties: {
        style: { $ref: '#/definitions/style' },
        forbiddenPrefixes: { $ref: '#/definitions/names' },
        forbiddenSuffixes: { $ref: '#/definitions/names' },
      },
      additionalProperties: false,
    },
    rule: {
      oneOf: [
        { $ref: '#/definitions/style' },
        { $ref: '#/definitions/options' },
      ],
    },
  },
  type: 'object',
  properties: {
    types: { $ref: '#/definitions/rule' },
    allowLeadingUnderscore: { type: 'boolean' },
  },
  patternProperties: {
    '^(Field|EnumValue)Definition': { $ref: '#/definitions/rule' },
  },
  additionalProperties: false,
}

export const naming = `{
  "types": "PascalCase",
  "FieldDefinition": "camelCase",
  "EnumValueDefinition": "UPPER_CASE",
  "FieldDefinition[parent.name.value=Query]": {
    "forbiddenPrefixes": ["query", "get"],
    "forbiddenSuffixes": ["Query"]
  }
}`
