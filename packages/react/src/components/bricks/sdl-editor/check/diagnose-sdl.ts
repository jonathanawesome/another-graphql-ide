import {
  GraphQLError,
  Kind,
  KnownArgumentNamesRule,
  KnownDirectivesRule,
  KnownTypeNamesRule,
  LoneSchemaDefinitionRule,
  PossibleTypeExtensionsRule,
  ProvidedRequiredArgumentsRule,
  UniqueArgumentDefinitionNamesRule,
  UniqueArgumentNamesRule,
  UniqueDirectiveNamesRule,
  UniqueDirectivesPerLocationRule,
  UniqueEnumValueNamesRule,
  UniqueFieldDefinitionNamesRule,
  UniqueInputFieldNamesRule,
  UniqueOperationTypesRule,
  UniqueTypeNamesRule,
  isTypeSystemDefinitionNode,
  isTypeSystemExtensionNode,
  parse,
  specifiedScalarTypes,
  visit,
  visitInParallel,
  type ASTNode,
  type ASTVisitor,
  type DefinitionNode,
  type DocumentNode,
  type ValidationContext,
} from 'graphql'

import type { Problem } from '../../sdl-shared/diagnostics'
import { lexTolerant } from '../../sdl-shared/scan-sdl'

import type { ContextIndex } from './context-index'

// Suggestions compare a name with every other, so only so many get one.
const MAX_SUGGESTIONS = 50

// graphql-js keeps `validateSDL` to itself, so these are its SDL rules. It uses
// directive-only versions of the two argument rules, which is what these come
// to with no operations in the document.
const RULES = [
  LoneSchemaDefinitionRule,
  UniqueOperationTypesRule,
  UniqueTypeNamesRule,
  UniqueEnumValueNamesRule,
  UniqueFieldDefinitionNamesRule,
  UniqueArgumentDefinitionNamesRule,
  UniqueDirectiveNamesRule,
  KnownDirectivesRule,
  UniqueDirectivesPerLocationRule,
  KnownArgumentNamesRule,
  UniqueArgumentNamesRule,
  UniqueInputFieldNamesRule,
  ProvidedRequiredArgumentsRule,
] as unknown as ((context: ValidationContext) => ASTVisitor)[]

/** Only commas, whitespace and comments, which graphql-js rejects. */
const isBlank = (sdl: string) => /^(?:[\s,]|#[^\n\r]*)*$/.test(sdl)

/** Names that nothing defines: a service may be about to publish them. */
const isUnresolved = (message: string) =>
  /^Unknown (?:type|directive) |^Cannot extend type .* is not defined\./.test(
    message
  )

const TOKEN_WORDS: Record<string, string> = {
  Name: 'name',
  String: 'string',
  BlockString: 'block string',
  Int: 'number',
  Float: 'number',
}

/** graphql-js's message in the design's words: curly quotes, sentence case. */
const wording = (message: string) => {
  const syntax = message.startsWith('Syntax Error: ')
  const text = syntax ? message.slice('Syntax Error: '.length) : message
  return text
    .split(/("[^"]*")/)
    .map((part, i) => {
      if (i % 2) return `“${part.slice(1, -1)}”`
      if (!syntax) return part
      const words = part
        .replace('<EOF>', 'the end of the text')
        .replace(
          /\b(Name|String|BlockString|Int|Float)\b/g,
          word => TOKEN_WORDS[word] ?? word
        )
      return i === 0
        ? `Syntax error: ${words.charAt(0).toLowerCase()}${words.slice(1)}`
        : words
    })
    .join('')
}

/** From `from`, past any whitespace, to the end of that line. */
const restOfLine = (sdl: string, from: number) => {
  const start = from + (/^\s*/.exec(sdl.slice(from))?.[0].length ?? 0)
  const length = /^.*/.exec(sdl.slice(start))?.[0].trimEnd().length ?? 0
  return { from: start, to: start + Math.max(length, 1) }
}

const syntaxRange = (sdl: string, message: string, at: number) => {
  let last = { from: 0, to: 1 }
  let lexed = 0
  for (const { token, start, end } of lexTolerant(sdl)) {
    if (start > at) break
    lexed = end
    if ((token.kind as string) === 'Comment') continue
    last = { from: start, to: end }
    if (start === at) return last
  }

  // At the end of the text, the last token is underlined.
  if (message.includes('<EOF>')) return last
  if (message.includes('Unterminated string')) return restOfLine(sdl, lexed)
  return { from: at, to: at + 1 }
}

const syntaxProblem = (sdl: string, error: GraphQLError): Problem => ({
  severity: 'error',
  message: wording(error.message),
  ...syntaxRange(sdl, error.message, error.positions?.[0] ?? 0),
})

/** The part of a node to underline: its name, or its first token. */
const rangeOf = (node: ASTNode) => {
  if (!node.loc) return undefined
  const name = 'name' in node ? node.name : undefined
  if (node.kind === Kind.DIRECTIVE && node.name.loc) {
    return { from: node.loc.start, to: node.name.loc.end }
  }
  if (name && 'loc' in name && name.loc) {
    return { from: name.loc.start, to: name.loc.end }
  }
  const { start, end } =
    node.kind === Kind.NAME ? node.loc : node.loc.startToken
  return { from: start, to: end }
}

const problemFor = (error: GraphQLError): Problem | undefined => {
  // Where a name is repeated, the last one is the one to change.
  const range = error.nodes?.map(rangeOf).findLast(found => found !== undefined)
  if (!range) return undefined
  return {
    severity: isUnresolved(error.message) ? 'warning' : 'error',
    message: wording(error.message),
    ...range,
  }
}

/** The same visitor, with a plain message once there are many unknown names. */
const limitSuggestions = (
  visitor: ASTVisitor,
  isKnown: (name: string) => boolean,
  report: (node: ASTNode, name: string) => void
): ASTVisitor => {
  let suggested = 0
  return Object.fromEntries(
    Object.entries(visitor as Record<string, unknown>).map(([key, enter]) => [
      key,
      (node: ASTNode & { name: { value: string } }, ...rest: unknown[]) => {
        if (!isKnown(node.name.value) && ++suggested > MAX_SUGGESTIONS) {
          report(node, node.name.value)
        } else {
          ;(enter as (...args: unknown[]) => void)(node, ...rest)
        }
      },
    ])
  )
}

const isSdl = (node: DefinitionNode) =>
  isTypeSystemDefinitionNode(node) || isTypeSystemExtensionNode(node)

/**
 * Problems in an SDL document, in order. With a context, names it defines count
 * as defined. Never throws.
 */
export const diagnoseSdl = (sdl: string, context?: ContextIndex): Problem[] => {
  if (isBlank(sdl)) return []

  let ast: DocumentNode
  try {
    ast = parse(sdl)
  } catch (error) {
    if (error instanceof GraphQLError) return [syntaxProblem(sdl, error)]
    throw error
  }

  const problems: Problem[] = []
  const add = (problem: Problem | undefined) => {
    if (problem) problems.push(problem)
  }

  const definitions = ast.definitions.filter(node => {
    if (isSdl(node)) return true
    const range = rangeOf({ ...node, name: undefined } as ASTNode)
    add(
      range && {
        severity: 'error',
        message: 'Only type system definitions belong in SDL.',
        ...range,
      }
    )
    return false
  })
  const own: DocumentNode = { ...ast, definitions }
  // The rules read what is defined from here, and only walk `own`. Its own
  // definitions come last, so they win over the context's.
  const all: DocumentNode = {
    ...ast,
    definitions: [...(context?.definitions ?? []), ...definitions],
  }

  const reportError = (error: GraphQLError) => {
    // With a context that did not parse, no telling what is defined.
    if (context?.parsed === false && isUnresolved(error.message)) return
    add(problemFor(error))
  }
  const nothing = () => undefined
  // What the SDL rules use of graphql-js's SDLValidationContext, and what the
  // two argument rules look up for operations.
  const rules = {
    getSchema: nothing,
    getDocument: () => all,
    getArgument: nothing,
    getFieldDef: nothing,
    getParentType: nothing,
    reportError,
  } as unknown as ValidationContext

  const types = new Set(specifiedScalarTypes.map(type => type.name))
  const defined = new Set<string>()
  for (const node of all.definitions) {
    if (
      isTypeSystemDefinitionNode(node) &&
      node.kind !== Kind.SCHEMA_DEFINITION &&
      node.kind !== Kind.DIRECTIVE_DEFINITION
    ) {
      defined.add(node.name.value)
      types.add(node.name.value)
    }
  }

  const visitors = RULES.map(rule => rule(rules))
  visitors.push(
    limitSuggestions(
      KnownTypeNamesRule(rules),
      name => types.has(name),
      (nodes, name) => {
        reportError(new GraphQLError(`Unknown type "${name}".`, { nodes }))
      }
    ),
    limitSuggestions(
      PossibleTypeExtensionsRule(rules as never),
      name => defined.has(name),
      (nodes, name) => {
        reportError(
          new GraphQLError(
            `Cannot extend type "${name}" because it is not defined.`,
            { nodes }
          )
        )
      }
    )
  )
  visit(own, visitInParallel(visitors))

  return problems.sort((a, b) => a.from - b.from)
}
