import { describe, expect, it } from 'vitest'

import { parseVariables } from './parse-variables'

describe('parseVariables', () => {
  it('treats empty and whitespace-only input as no variables', () => {
    expect(parseVariables(undefined)).toEqual({ ok: true })
    expect(parseVariables('')).toEqual({ ok: true })
    expect(parseVariables('   \n ')).toEqual({ ok: true })
  })

  it('parses plain JSON', () => {
    expect(parseVariables('{"id":"42","n":1}')).toEqual({
      ok: true,
      value: { id: '42', n: 1 },
    })
  })

  // The variables editor highlights json5, so these have to be accepted or the
  // editor advertises syntax that execution then rejects.
  it('parses json5 comments, unquoted keys and trailing commas', () => {
    const raw = `{
      // the record to fetch
      id: '42',
      tags: ['a', 'b',],
    }`

    expect(parseVariables(raw)).toEqual({
      ok: true,
      value: { id: '42', tags: ['a', 'b'] },
    })
  })

  it('reports malformed input without throwing', () => {
    const result = parseVariables('{ not valid')

    expect(result.ok).toBe(false)
    expect(result).toEqual({
      ok: false,
      message: 'Variables are not valid JSON5',
    })
  })
})
