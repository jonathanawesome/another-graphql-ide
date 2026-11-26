import {
  parseTree,
  printParseErrorCode,
  type Node,
  type ParseError,
} from 'jsonc-parser'

import type { Problem } from '../sdl-shared/diagnostics'

export type ParsedJson = { value: unknown; root: Node } | { problem: Problem }

// By name: jsonc-parser's codes are a const enum, which can't be imported here.
const MESSAGES: Partial<Record<string, string>> = {
  InvalidNumberFormat: 'invalid number.',
  PropertyNameExpected: 'expected a property name in double quotes.',
  ValueExpected: 'expected a value.',
  ColonExpected: 'expected “:”.',
  CommaExpected: 'expected “,”.',
  CloseBraceExpected: 'expected “}”.',
  CloseBracketExpected: 'expected “]”.',
  EndOfFileExpected: 'unexpected text after the value.',
  InvalidCommentToken: 'JSON has no comments.',
  UnexpectedEndOfComment: 'JSON has no comments.',
  UnexpectedEndOfString: 'unterminated string.',
  UnexpectedEndOfNumber: 'invalid number.',
  InvalidUnicode: 'invalid escape in a string.',
  InvalidEscapeCharacter: 'invalid escape in a string.',
  InvalidCharacter: 'control character in a string.',
}

const syntaxProblem = (
  message: string,
  from: number,
  to: number
): ParsedJson => ({
  problem: {
    severity: 'error',
    message: `Syntax error: ${message}`,
    from,
    to,
  },
})

const describe = (text: string, { error, offset, length }: ParseError) => {
  const code = printParseErrorCode(error)
  const before = text.slice(0, offset).trimEnd()
  const next = text.slice(offset).trimStart()[0] ?? ''
  if (before.endsWith(',') && '}]'.includes(next) && next) {
    return syntaxProblem('trailing comma.', before.length - 1, before.length)
  }
  if (code === 'InvalidSymbol') {
    const symbol = text.slice(offset, offset + length)
    const message = symbol.startsWith("'")
      ? 'use double quotes.'
      : `unexpected “${symbol}”.`
    return syntaxProblem(message, offset, offset + length)
  }
  const message = MESSAGES[code] ?? 'not valid JSON.'
  // Something missing at the end underlines what it should follow.
  return length && next
    ? syntaxProblem(message, offset, offset + length)
    : syntaxProblem(message, Math.max(before.length - 1, 0), before.length)
}

/** Strict JSON, as `JSON.parse` has it, with offsets. Never throws. */
export const parseJson = (text: string): ParsedJson => {
  const errors: ParseError[] = []
  const root = parseTree(text, errors, {
    disallowComments: true,
    allowTrailingComma: false,
  })
  // The rest follow from the first.
  const first = errors[0]
  if (first) return describe(text, first)

  try {
    const value: unknown = JSON.parse(text)
    if (root) return { value, root }
  } catch {
    // Falls through: JSON.parse has the last word on what is valid.
  }
  return syntaxProblem('not valid JSON.', 0, text.length)
}
