import { describe, expect, it } from 'vitest'

import { parseJson } from './parse-json'

const VALID = [
  '{}',
  '[]',
  '0',
  '-0',
  '1.5e+3',
  '"a"',
  'true',
  'null',
  ' {"a": [1, {"b": null}]}\n',
  '"\\u00e9\\n\\/"',
  '{"a":1,"a":2}',
  '{"":0}',
]

const INVALID = [
  '',
  ' \n',
  '{"a":1,}',
  '[1,]',
  "{'a':1}",
  '{"a":01}',
  '{a:1}',
  '// c\n{}',
  '{} // c',
  '{"a":/*c*/1}',
  '{"a":"\\x"}',
  '{"a" 1}',
  '{"a":1 "b":2}',
  '{"a":',
  '{} x',
  '{"a":"b',
  '"\t"',
  '"a\nb"',
  '[1 2]',
  'NaN',
  'Infinity',
  '+1',
  '.5',
  '1.',
  '1e',
  '-',
  '[,]',
  '{,}',
  'nul',
  'True',
  'undefined',
  '{"a":1}}',
  '"\\u12"',
  '{"a":1',
  '[',
  '0x10',
  '1_000',
  '`a`',
  String.fromCharCode(0xfeff) + '{}',
]

const problemIn = (text: string) => {
  const parsed = parseJson(text)
  if (!('problem' in parsed)) return undefined
  const { message, from, to } = parsed.problem
  return `${message} [${text.slice(from, to)}]`
}

describe('parseJson', () => {
  it.each(VALID)('accepts %j, with its value', text => {
    expect(parseJson(text)).toMatchObject({
      value: JSON.parse(text) as unknown,
    })
  })

  it.each(INVALID)('rejects %j, as JSON.parse does', text => {
    expect(() => JSON.parse(text) as unknown).toThrow()
    const parsed = parseJson(text)

    expect(parsed).toMatchObject({ problem: { severity: 'error' } })
    if (!('problem' in parsed)) return
    const { from, to } = parsed.problem
    expect(from).toBeGreaterThanOrEqual(0)
    expect(to).toBeGreaterThanOrEqual(from)
    expect(to).toBeLessThanOrEqual(text.length)
  })

  it.each([
    ['{"a":1,}', 'trailing comma. [,]'],
    ['[1,\n]', 'trailing comma. [,]'],
    ["{'a': 1}", "use double quotes. ['a']"],
    ['// why\n{}', 'JSON has no comments. [// why]'],
    ['{"a": undefined}', 'unexpected “undefined”. [undefined]'],
    ['{a: 1}', 'unexpected “a”. [a]'],
    ['{"a" 1}', 'expected “:”. [1]'],
    ['{"a": 1 "b": 2}', 'expected “,”. ["b"]'],
    ['{"a":\n', 'expected a value. [:]'],
    ['{"a": 1\n', 'expected “}”. [1]'],
    ['{} {}', 'unexpected text after the value. [{]'],
    ['{"a": "b', 'unterminated string. ["b]'],
    ['["\\x"]', 'invalid escape in a string. ["\\x"]'],
    ['', 'expected a value. []'],
  ])('explains %j', (text, expected) => {
    expect(problemIn(text)).toBe(`Syntax error: ${expected}`)
  })
})
