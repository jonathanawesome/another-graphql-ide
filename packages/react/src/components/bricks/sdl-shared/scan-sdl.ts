import { GraphQLError, Lexer, Source, TokenKind, type Token } from 'graphql'

import type { SdlToken, SdlTokenKind } from './sdl-index'

/** What a name at a position would be. */
export type SdlExpectation =
  | 'keyword'
  | 'name'
  | 'output'
  | 'input'
  | 'interface'
  | 'object'
  | 'directive'
  | 'value'

export type SdlScan = {
  tokens: SdlToken[]
  /** Fold range per 1-based line, from after `{` to before `}`. */
  folds: Map<number, { from: number; to: number }>
  /** What would come next, at the end of the text. */
  expects: SdlExpectation
}

const DEFINITIONS = new Set([
  'schema',
  'scalar',
  'type',
  'interface',
  'union',
  'enum',
  'input',
  'directive',
  'extend',
])

const VALUE_NUMBERS = new Set(['true', 'false', 'null'])

// Read once: under CommonJS graphql each read is a getter call.
const NAME: string = TokenKind.NAME
const AT: string = TokenKind.AT
const STRING: string = TokenKind.STRING
const BLOCK_STRING: string = TokenKind.BLOCK_STRING
const INT: string = TokenKind.INT
const FLOAT: string = TokenKind.FLOAT
const COMMENT: string = TokenKind.COMMENT
const COLON: string = TokenKind.COLON
const EQUALS: string = TokenKind.EQUALS
const PIPE: string = TokenKind.PIPE
const AMP: string = TokenKind.AMP
const BRACE_L: string = TokenKind.BRACE_L
const BRACE_R: string = TokenKind.BRACE_R
const PAREN_L: string = TokenKind.PAREN_L
const PAREN_R: string = TokenKind.PAREN_R
const BRACKET_L: string = TokenKind.BRACKET_L
const BRACKET_R: string = TokenKind.BRACKET_R

// Lexing restarts from a fresh slice, so text full of errors is cut short.
const MAX_RESTARTS = 50

type Lexed = { token: Token; start: number; end: number; line: number }

/** Lexes past the errors graphql-js stops at, with offsets into the whole text. */
export function* lexTolerant(sdl: string): Generator<Lexed> {
  let base = 0
  let baseLine = 0
  for (let restart = 0; restart <= MAX_RESTARTS; restart++) {
    const lexer = new Lexer(new Source(base ? sdl.slice(base) : sdl))
    let last = lexer.token
    let stopped: GraphQLError | undefined
    let more = true
    while (more) {
      try {
        more = lexer.advance().kind !== TokenKind.EOF
      } catch (error) {
        if (!(error instanceof GraphQLError)) throw error
        stopped = error
        more = false
      }
      // Comments are linked in but never returned, so this reads the links.
      while (last.next && last.next.kind !== TokenKind.EOF) {
        last = last.next
        yield {
          token: last,
          start: base + last.start,
          end: base + last.end,
          line: baseLine + last.line,
        }
      }
    }

    const at = stopped?.positions?.[0]
    const line = stopped?.locations?.[0]?.line
    if (at === undefined || line === undefined) return
    // An unterminated string stops at its newline, anything else at a character.
    base += Math.max(sdl[base + at] === '\n' ? at : at + 1, 1)
    baseLine += line - 1
    if (base >= sdl.length) return
  }
}

type Frame = {
  close: string
  /** What names in this frame are, before any colon. */
  role: 'field' | 'argument' | 'enumValue' | 'keyword' | 'value' | 'type'
  /** What follows a colon. */
  after: 'output' | 'input' | 'value'
  fold?: { line: number; from: number }
}

/**
 * Colors and folds for SDL that graphql-js rejects, from the position of each
 * token alone. Never throws. Agrees with the parser's colors on valid SDL.
 */
export const scanSdl = (sdl: string): SdlScan => {
  const tokens: SdlToken[] = []
  const folds: SdlScan['folds'] = new Map()
  const stack: Frame[] = []
  let definition = ''
  let expects: SdlExpectation = 'keyword'
  let previous = ''
  let previousLine = 0
  const beforeColon = /\s*:/y
  // True straight after a definition's keyword, where its name goes.
  let naming = false
  // True straight after an applied directive's name, where arguments may open.
  let applied = false

  const restart = () => {
    stack.length = 0
    definition = ''
    naming = false
    expects = 'keyword'
  }

  // What a frame expects at the start of each of its entries.
  const entry = (frame: Frame | undefined): SdlExpectation => {
    if (!frame) return 'keyword'
    if (frame.role === 'value') return 'value'
    return frame.role === 'type' ? frame.after : 'name'
  }

  const nameKind = (
    value: string,
    startsLine: boolean,
    newLine: boolean,
    end: number
  ): SdlTokenKind => {
    if (previous === AT) {
      expects = entry(stack.at(-1))
      applied = definition !== 'directive' || stack.length > 0
      return 'directive'
    }

    // A definition keyword at the margin starts over, whatever was left open.
    const restarts =
      DEFINITIONS.has(value) && startsLine && (stack.length > 0 || newLine)
    if (restarts) restart()

    const frame = stack.at(-1)
    if (!frame) {
      if (naming && !restarts && !(newLine && DEFINITIONS.has(value))) {
        naming = false
        expects = 'keyword'
        if (definition === 'extend' && DEFINITIONS.has(value)) {
          definition = value
          naming = value !== 'schema'
          expects = naming ? 'name' : 'keyword'
          return 'keyword'
        }
        return 'type'
      }
      if (expects === 'interface' || expects === 'object') {
        expects = 'keyword'
        return 'type'
      }
      if (DEFINITIONS.has(value)) {
        definition = value
        naming = value !== 'schema' && value !== 'directive'
        expects = naming ? 'name' : 'keyword'
        return 'keyword'
      }
      if (value === 'implements') expects = 'interface'
      return 'keyword'
    }

    if (frame.role === 'type') return 'type'
    // A name before a colon is an entry, even where a type is still missing.
    if (frame.role !== 'value') {
      beforeColon.lastIndex = end
      if (beforeColon.test(sdl)) return frame.role
    }
    if (expects === 'value' || frame.role === 'value') {
      expects = entry(frame)
      return VALUE_NUMBERS.has(value) ? 'number' : 'enumValue'
    }
    if (expects === 'output' || expects === 'input') {
      expects = 'name'
      return 'type'
    }
    return frame.role
  }

  const open = (close: string, line: number, end: number) => {
    const frame = stack.at(-1)
    const inValue = expects === 'value' || frame?.role === 'value'

    if (close === BRACKET_R) {
      const type = expects === 'output' || expects === 'input'
      stack.push({
        close,
        role: type ? 'type' : 'value',
        after: type ? (expects as 'output' | 'input') : 'value',
      })
    } else if (close === PAREN_R) {
      stack.push({
        close,
        role: 'argument',
        after: applied ? 'value' : 'input',
      })
    } else if (inValue) {
      stack.push({ close, role: 'argument', after: 'value' })
    } else {
      stack.push({
        close,
        role:
          definition === 'enum'
            ? 'enumValue'
            : definition === 'schema'
              ? 'keyword'
              : definition === 'input'
                ? 'argument'
                : 'field',
        after: definition === 'input' ? 'input' : 'output',
        fold:
          frame || definition === 'schema' ? undefined : { line, from: end },
      })
    }
    naming = false
    expects = entry(stack.at(-1))
  }

  const close = (kind: string, line: number, start: number) => {
    // Skips frames left open inside this one.
    const depth = stack.findLastIndex(frame => frame.close === kind)
    const frame = stack[depth]
    if (!frame) return
    const { fold } = frame
    stack.length = depth
    if (fold && line > fold.line) {
      folds.set(fold.line, { from: fold.from, to: start })
    }
    if (!stack.length && kind === BRACE_R) restart()
    else expects = entry(stack.at(-1))
  }

  for (const { token, start, end, line } of lexTolerant(sdl)) {
    const kind: string = token.kind
    let color: SdlTokenKind | undefined
    const wasApplied: boolean = applied

    switch (kind) {
      case COMMENT:
        tokens.push({ from: start, to: end, kind: 'comment' })
        continue
      case NAME: {
        applied = false
        const startsLine = start === 0 || sdl[start - 1] === '\n'
        color = nameKind(token.value, startsLine, line > previousLine, end)
        break
      }
      case AT:
        color = 'directive'
        naming = false
        expects = 'directive'
        break
      case STRING:
      case BLOCK_STRING:
        // A string where a name would go is a description.
        color =
          expects === 'value' || stack.at(-1)?.role === 'value'
            ? 'string'
            : 'comment'
        if (expects === 'value') expects = entry(stack.at(-1))
        break
      case INT:
      case FLOAT:
        color = 'number'
        if (expects === 'value') expects = entry(stack.at(-1))
        break
      case COLON:
        expects = stack.at(-1)?.after ?? expects
        break
      case EQUALS:
        // `union A = B` lists types. Anywhere else a value follows.
        expects = stack.length ? 'value' : 'object'
        break
      case PIPE:
        if (!stack.length && definition === 'union') expects = 'object'
        break
      case AMP:
        if (!stack.length) expects = 'interface'
        break
      case BRACE_L:
        open(BRACE_R, line, end)
        break
      case PAREN_L:
        applied = wasApplied
        open(PAREN_R, line, end)
        break
      case BRACKET_L:
        open(BRACKET_R, line, end)
        break
      case BRACE_R:
      case PAREN_R:
      case BRACKET_R:
        close(kind, line, start)
        break
    }

    if (color) tokens.push({ from: start, to: end, kind: color })
    if (kind !== NAME) applied = false
    previous = kind
    previousLine = line
  }

  return { tokens, folds, expects }
}
