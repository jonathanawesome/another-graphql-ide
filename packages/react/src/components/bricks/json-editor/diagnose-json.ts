import {
  Validator,
  type OutputUnit,
  type SchemaDraft,
} from '@cfworker/json-schema'
import type { Node } from 'jsonc-parser'

import type { Problem } from '../sdl-shared/diagnostics'

import { parseJson } from './parse-json'

/** A JSON schema. A string `errorMessage` beside a keyword replaces its message. */
export type JsonSchema = Readonly<Record<string, unknown>>

const DRAFTS: [RegExp, SchemaDraft][] = [
  [/draft-04/, '4'],
  [/2019-09/, '2019-09'],
  [/2020-12/, '2020-12'],
]

const draftOf = (schema: JsonSchema | boolean): SchemaDraft => {
  const name = typeof schema === 'object' ? schema.$schema : undefined
  return (
    DRAFTS.find(
      ([pattern]) => typeof name === 'string' && pattern.test(name)
    )?.[1] ?? '7'
  )
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const decode = (pointer: string) =>
  pointer
    .split('/')
    .slice(1)
    .map(part => decodeURI(part).replaceAll('~1', '/').replaceAll('~0', '~'))

const parentOf = (pointer: string) =>
  pointer.slice(0, Math.max(pointer.lastIndexOf('/'), 0))

const isWithin = (pointer: string, ancestor: string) =>
  pointer === ancestor || pointer.startsWith(`${ancestor}/`)

const follow = (from: unknown, parts: string[]) =>
  parts.reduce<unknown>(
    (value, part) => (isObject(value) ? value[part] : undefined),
    from
  )

/** The schema at a path of keywords, through local `$ref`s. */
const schemaAt = (root: unknown, pointer: string) =>
  decode(pointer).reduce<unknown>((schema, part) => {
    if (!isObject(schema)) return undefined
    const next = schema[part]
    if (part !== '$ref') return next
    return typeof next === 'string' && next.startsWith('#')
      ? follow(root, decode(next))
      : undefined
  }, root)

const article = (word: string) => (/^[aeio]/.test(word) ? 'an' : 'a')

const show = (value: unknown) =>
  typeof value === 'string' ? `“${value}”` : JSON.stringify(value)

const list = (items: string[]) =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`

const curly = (text: string) => text.replace(/"([^"]*)"/g, '“$1”')

/** One failure, with the failures inside it. */
type Failure = OutputUnit & { inner: Failure[] }

/**
 * Nests the validator's flat list, where a failure comes before those inside it
 * and its keyword path starts theirs.
 */
const nest = (units: readonly OutputUnit[]): Failure[] => {
  const top: Failure[] = []
  const open: Failure[] = []
  for (const unit of units) {
    const failure: Failure = { ...unit, inner: [] }
    if (unit.keyword === 'false') {
      // Its path is the instance's. It belongs to the failure before it.
      const parent = open.at(-1)
      failure.keywordLocation = `${parent?.keywordLocation ?? '#'}/false`
    }
    while (open.length) {
      const last = open.at(-1)
      if (
        last &&
        failure.keywordLocation.startsWith(`${last.keywordLocation}/`) &&
        isWithin(failure.instanceLocation, last.instanceLocation)
      ) {
        break
      }
      open.pop()
    }
    ;(open.at(-1)?.inner ?? top).push(failure)
    open.push(failure)
  }
  return top
}

type Found = { at: string; message: string; underline: 'key' | 'value' }

class Describer {
  private readonly schema: JsonSchema | boolean

  constructor(schema: JsonSchema | boolean) {
    this.schema = schema
  }

  describe(failure: Failure): Found[] {
    const { keyword, instanceLocation: at, inner } = failure
    if (keyword === 'anyOf' || keyword === 'oneOf') {
      return this.describeChoice(failure)
    }
    const found = inner.flatMap(each => this.describe(each))
    const custom = this.customMessage(failure)
    if (!inner.length) {
      return [this.leaf(failure, custom)]
    }
    // A message on a wrapper stands for what it wraps, not for deeper values.
    return custom !== undefined &&
      keyword === '$ref' &&
      found.every(each => each.at === at)
      ? [{ at, message: custom, underline: 'value' }]
      : found
  }

  private describeChoice(failure: Failure): Found[] {
    const { keywordLocation, instanceLocation: at, inner, keyword } = failure
    const custom = this.customMessage(failure)
    const whole = (message: string): Found[] => [
      { at, message: custom ?? message, underline: 'value' },
    ]
    if (!inner.length) {
      return whole(
        keyword === 'oneOf'
          ? 'This matches more than one allowed form.'
          : 'This matches no allowed form.'
      )
    }

    const branches = new Map<string, Failure[]>()
    for (const each of inner) {
      const [branch = ''] = each.keywordLocation
        .slice(keywordLocation.length + 1)
        .split('/')
      branches.set(branch, [...(branches.get(branch) ?? []), each])
    }
    const scored = [...branches.values()]
      .map(failures => ({
        failures,
        score: Math.max(...failures.map(each => this.distance(each, at))),
      }))
      .sort((a, b) => a.score - b.score)
    const [best, second] = scored
    if (!best) return whole('This matches no allowed form.')

    const found = best.failures.flatMap(each => this.describe(each))
    if (custom !== undefined && found.every(each => each.at === at)) {
      return whole(custom)
    }
    return best.score > 1 && best.score === second?.score
      ? whole('This matches no allowed form.')
      : found
  }

  /** How far a value is from a form: its details, its content, or its type. */
  private distance(failure: Failure, at: string): number {
    if (failure.inner.length) {
      return Math.max(...failure.inner.map(each => this.distance(each, at)))
    }
    if (failure.instanceLocation !== at) return 0
    if (failure.keyword === 'type') return 3
    return failure.keyword === 'enum' || failure.keyword === 'const' ? 2 : 1
  }

  private customMessage({ keyword, keywordLocation }: Failure) {
    const owner = parentOf(
      keyword === 'false' ? parentOf(keywordLocation) : keywordLocation
    )
    const schema = schemaAt(this.schema, owner)
    const message = isObject(schema) ? schema.errorMessage : undefined
    return typeof message === 'string' ? message : undefined
  }

  private leaf(failure: Failure, custom: string | undefined): Found {
    const { keyword, instanceLocation: at, keywordLocation, error } = failure
    const value = schemaAt(this.schema, keywordLocation)
    const found = (
      message: string,
      underline: Found['underline'] = 'value'
    ) => ({
      at,
      message: custom ?? message,
      underline,
    })

    switch (keyword) {
      case 'type': {
        const types = (Array.isArray(value) ? value : [value]).filter(
          each => typeof each === 'string'
        )
        return found(
          types.length
            ? `Expected ${list(types.map(type => `${article(type)} ${type}`))}.`
            : curly(error)
        )
      }
      case 'enum':
        return found(
          Array.isArray(value) ? `Use ${list(value.map(show))}.` : curly(error)
        )
      case 'const':
        return found(`Use ${show(value)}.`)
      case 'required': {
        const name = /"(.*)"/.exec(error)?.[1]
        return found(
          name === undefined ? curly(error) : `Missing property “${name}”.`
        )
      }
      case 'false': {
        const name = decode(at).at(-1)
        return /additionalProperties|unevaluatedProperties/.test(
          parentOf(keywordLocation)
        )
          ? found(`Unknown property “${name}”.`, 'key')
          : found('This is not allowed here.', 'key')
      }
      default:
        return found(curly(error))
    }
  }
}

const childOf = (node: Node | undefined, part: string): Node | undefined => {
  if (node?.type === 'array') return node.children?.[Number(part)]
  // JSON.parse keeps the last of two properties with one name.
  return node?.children?.findLast(
    property => property.children?.[0]?.value === part
  )?.children?.[1]
}

const rangeOf = (root: Node, { at, underline }: Found) => {
  const node = decode(at).reduce<Node | undefined>(childOf, root) ?? root
  const key =
    node.parent?.type === 'property' ? node.parent.children?.[0] : undefined
  const shown = underline === 'key' && key ? key : node
  // Only the bracket of something with a body.
  const length =
    shown.type === 'object' || shown.type === 'array' ? 1 : shown.length
  return { from: shown.offset, to: shown.offset + length }
}

/** Checks JSON against one schema, or only as JSON without one. */
export const createJsonCheck = (schema?: JsonSchema | boolean) => {
  const validator =
    schema === undefined
      ? undefined
      : new Validator(schema, draftOf(schema), false)

  return (text: string): Problem[] => {
    const parsed = parseJson(text)
    if ('problem' in parsed) return [parsed.problem]
    if (!validator || schema === undefined) return []

    const { value, root } = parsed
    const { valid, errors } = validator.validate(value)
    if (valid) return []

    const describer = new Describer(schema)
    const problems = new Map<string, Problem>()
    for (const found of nest(errors).flatMap(each =>
      describer.describe(each)
    )) {
      const problem: Problem = {
        severity: 'error',
        message: found.message,
        ...rangeOf(root, found),
      }
      problems.set(`${problem.from} ${problem.message}`, problem)
    }
    return [...problems.values()].sort((a, b) => a.from - b.from)
  }
}
