import {
  Kind,
  Lexer,
  Source,
  TokenKind,
  parse,
  type DefinitionNode,
  type DocumentNode,
  type InputValueDefinitionNode,
  type Location,
  type NameNode,
  type Token,
} from 'graphql'

import { scanSdl } from './scan-sdl'

/** A schema coordinate: `User`, `User.name`, `Query.user(id:)`, `@key`. */
export type Coordinate = string

export type SdlTokenKind =
  | 'keyword'
  | 'type'
  | 'field'
  | 'argument'
  | 'enumValue'
  | 'directive'
  | 'string'
  | 'number'
  | 'comment'

export type SdlToken = { from: number; to: number; kind: SdlTokenKind }

export type SdlIndex = {
  /** False when graphql-js rejected the SDL. Tokens and folds are still filled in. */
  parsed: boolean
  /** color classes in document order. */
  tokens: SdlToken[]
  /** Fold range per 1-based line, from after `{` to before `}`. */
  folds: Map<number, { from: number; to: number }>
  /** The coordinate defined on each 1-based line. One per line, first wins. */
  coordinateAtLine: Map<number, Coordinate>
  /** The 1-based line each coordinate is defined on. */
  lineOfCoordinate: Map<Coordinate, number>
}

// Roles from the AST, stored one byte per offset. 0 means none was recorded.
const ROLES: SdlTokenKind[] = [
  'keyword',
  'type',
  'field',
  'argument',
  'enumValue',
  'directive',
  'comment',
  'number',
]
const ROLE = Object.fromEntries(
  ROLES.map((kind, i) => [kind, i + 1])
) as Record<SdlTokenKind, number>

const emptyIndex = (): SdlIndex => ({
  parsed: false,
  tokens: [],
  folds: new Map(),
  coordinateAtLine: new Map(),
  lineOfCoordinate: new Map(),
})

/**
 * One graphql-js parse of an SDL document: token colors, fold ranges and the
 * line to coordinate maps both ways. SDL the parser rejects gets colors and
 * folds by position, and no coordinates. Never throws.
 */
export const indexSdl = (sdl: string): SdlIndex => {
  const index = emptyIndex()

  let ast: DocumentNode
  try {
    ast = parse(sdl)
  } catch {
    const { tokens, folds } = scanSdl(sdl)
    return { ...index, tokens, folds }
  }

  // A typed array beats a Map here: a large supergraph has ~700k names.
  const roles = new Uint8Array(sdl.length)
  index.parsed = true
  classifyNames(ast, roles)
  for (const definition of ast.definitions) indexDefinition(definition, index)
  index.tokens = color(sdl, roles)
  return index
}

// Built once: the hot loops below run per node and per token, and reading
// Kind or TokenKind there costs a getter call each under CommonJS graphql.
const NAME_ROLE: Partial<Record<string, SdlTokenKind>> = {
  [Kind.OBJECT_TYPE_DEFINITION]: 'type',
  [Kind.OBJECT_TYPE_EXTENSION]: 'type',
  [Kind.INTERFACE_TYPE_DEFINITION]: 'type',
  [Kind.INTERFACE_TYPE_EXTENSION]: 'type',
  [Kind.UNION_TYPE_DEFINITION]: 'type',
  [Kind.UNION_TYPE_EXTENSION]: 'type',
  [Kind.ENUM_TYPE_DEFINITION]: 'type',
  [Kind.ENUM_TYPE_EXTENSION]: 'type',
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: 'type',
  [Kind.INPUT_OBJECT_TYPE_EXTENSION]: 'type',
  [Kind.SCALAR_TYPE_DEFINITION]: 'type',
  [Kind.SCALAR_TYPE_EXTENSION]: 'type',
  [Kind.NAMED_TYPE]: 'type',
  [Kind.FIELD_DEFINITION]: 'field',
  [Kind.INPUT_VALUE_DEFINITION]: 'argument',
  [Kind.ARGUMENT]: 'argument',
  [Kind.OBJECT_FIELD]: 'argument',
  [Kind.ENUM_VALUE_DEFINITION]: 'enumValue',
  [Kind.DIRECTIVE_DEFINITION]: 'directive',
  [Kind.DIRECTIVE]: 'directive',
}

// Values colored as a whole rather than through a name.
const VALUE_ROLE: Partial<Record<string, SdlTokenKind>> = {
  [Kind.ENUM]: 'enumValue',
  [Kind.BOOLEAN]: 'number',
  [Kind.NULL]: 'number',
}

const TOKEN_ROLE: Partial<Record<string, SdlTokenKind>> = {
  [TokenKind.AT]: 'directive',
  [TokenKind.STRING]: 'string',
  [TokenKind.BLOCK_STRING]: 'string',
  [TokenKind.INT]: 'number',
  [TokenKind.FLOAT]: 'number',
  [TokenKind.COMMENT]: 'comment',
}
const NAME_TOKEN: string = TokenKind.NAME

type Walkable = {
  kind?: string
  loc?: Location
  name?: NameNode
  description?: { loc?: Location }
}

/**
 * Name offset to role, from the node each name belongs to. A plain walk rather
 * than graphql's visit, which allocates a path per node.
 */
const classifyNames = (ast: DocumentNode, roles: Uint8Array) => {
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item)
      return
    }
    if (typeof value !== 'object' || value === null) return

    const node = value as Walkable & Record<string, unknown>
    const kind = node.kind ?? ''
    const nameRole = NAME_ROLE[kind]
    if (nameRole && node.name?.loc) roles[node.name.loc.start] = ROLE[nameRole]
    const valueRole = VALUE_ROLE[kind]
    if (valueRole && node.loc) roles[node.loc.start] = ROLE[valueRole]
    // Descriptions read as comments, not strings.
    if (node.description?.loc) roles[node.description.loc.start] = ROLE.comment

    for (const key in node) {
      if (key !== 'loc' && key !== 'kind') walk(node[key])
    }
  }

  walk(ast.definitions)
}

const isExtension = (definition: DefinitionNode) =>
  definition.kind.endsWith('Extension')

/** A coordinate belongs to its name's line, below any description. */
const lineOf = (name: NameNode) => name.loc?.startToken.line

const record = (
  index: SdlIndex,
  coordinate: Coordinate,
  name: NameNode,
  preferred = false
) => {
  const line = lineOf(name)
  if (line === undefined) return
  if (!index.coordinateAtLine.has(line)) {
    index.coordinateAtLine.set(line, coordinate)
  }
  if (preferred || !index.lineOfCoordinate.has(coordinate)) {
    index.lineOfCoordinate.set(coordinate, line)
  }
}

const recordArguments = (
  index: SdlIndex,
  owner: Coordinate,
  args: readonly InputValueDefinitionNode[] | undefined
) => {
  for (const arg of args ?? []) {
    record(index, `${owner}(${arg.name.value}:)`, arg.name)
  }
}

/** Fold from after `{` to before `}`, when the body spans more than one line. */
const recordFold = (
  index: SdlIndex,
  loc: Location | undefined,
  firstChild: { loc?: Location } | undefined
) => {
  let open = firstChild?.loc?.startToken.prev
  while (open?.kind === TokenKind.COMMENT) open = open.prev
  const close = loc?.endToken
  if (open?.kind !== TokenKind.BRACE_L || close?.kind !== TokenKind.BRACE_R) {
    return
  }
  if (close.line > open.line) {
    index.folds.set(open.line, { from: open.end, to: close.start })
  }
}

const indexDefinition = (definition: DefinitionNode, index: SdlIndex) => {
  if (definition.kind === Kind.DIRECTIVE_DEFINITION) {
    const coordinate = `@${definition.name.value}`
    record(index, coordinate, definition.name)
    recordArguments(index, coordinate, definition.arguments)
    return
  }

  if (!('name' in definition) || !definition.name) return

  const typeName = definition.name.value
  const extension = isExtension(definition)

  // A definition wins over an extension. An extension stands in only when the
  // document has no definition, e.g. a subgraph that extends a type it lacks.
  record(index, typeName, definition.name, !extension)

  switch (definition.kind) {
    case Kind.OBJECT_TYPE_DEFINITION:
    case Kind.OBJECT_TYPE_EXTENSION:
    case Kind.INTERFACE_TYPE_DEFINITION:
    case Kind.INTERFACE_TYPE_EXTENSION:
      for (const field of definition.fields ?? []) {
        const coordinate = `${typeName}.${field.name.value}`
        record(index, coordinate, field.name)
        recordArguments(index, coordinate, field.arguments)
      }
      recordFold(index, definition.loc, definition.fields?.[0])
      break
    case Kind.INPUT_OBJECT_TYPE_DEFINITION:
    case Kind.INPUT_OBJECT_TYPE_EXTENSION:
      for (const field of definition.fields ?? []) {
        record(index, `${typeName}.${field.name.value}`, field.name)
      }
      recordFold(index, definition.loc, definition.fields?.[0])
      break
    case Kind.ENUM_TYPE_DEFINITION:
    case Kind.ENUM_TYPE_EXTENSION:
      for (const value of definition.values ?? []) {
        record(index, `${typeName}.${value.name.value}`, value.name)
      }
      recordFold(index, definition.loc, definition.values?.[0])
      break
  }
}

/** Colors from the lexer. Walks the token list, as `advance()` skips comments. */
const color = (sdl: string, roles: Uint8Array): SdlToken[] => {
  const lexer = new Lexer(new Source(sdl))
  const first = lexer.token
  while (lexer.advance().kind !== TokenKind.EOF) {
    // Builds the linked list read below.
  }

  const tokens: SdlToken[] = []
  for (let token = first.next; token; token = token.next) {
    const kind = tokenKind(token, roles)
    if (kind) tokens.push({ from: token.start, to: token.end, kind })
  }
  return tokens
}

const tokenKind = (
  token: Token,
  roles: Uint8Array
): SdlTokenKind | undefined => {
  const kind: string = token.kind
  if (kind !== NAME_TOKEN) {
    return roles[token.start] === ROLE.comment ? 'comment' : TOKEN_ROLE[kind]
  }
  return ROLES[(roles[token.start] ?? 1) - 1] ?? 'keyword'
}
