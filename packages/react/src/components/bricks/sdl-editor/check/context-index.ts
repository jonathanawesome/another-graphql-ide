import { Kind, parse, type DefinitionNode } from 'graphql'

export type SdlNameKind =
  'scalar' | 'type' | 'interface' | 'union' | 'enum' | 'input' | 'directive'

/** A type or directive name. Directives have no `@`. */
export type SdlName = { name: string; kind: SdlNameKind }

/** What a context SDL defines, with type bodies left out. */
export type ContextIndex = {
  /** False when graphql-js rejected it, so what it defines is unknown. */
  parsed: boolean
  names: SdlName[]
  definitions: DefinitionNode[]
}

type TypeKind = Exclude<SdlNameKind, 'directive'>

const TYPE_KINDS: Partial<Record<string, TypeKind>> = {
  [Kind.SCALAR_TYPE_DEFINITION]: 'scalar',
  [Kind.SCALAR_TYPE_EXTENSION]: 'scalar',
  [Kind.OBJECT_TYPE_DEFINITION]: 'type',
  [Kind.OBJECT_TYPE_EXTENSION]: 'type',
  [Kind.INTERFACE_TYPE_DEFINITION]: 'interface',
  [Kind.INTERFACE_TYPE_EXTENSION]: 'interface',
  [Kind.UNION_TYPE_DEFINITION]: 'union',
  [Kind.UNION_TYPE_EXTENSION]: 'union',
  [Kind.ENUM_TYPE_DEFINITION]: 'enum',
  [Kind.ENUM_TYPE_EXTENSION]: 'enum',
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: 'input',
  [Kind.INPUT_OBJECT_TYPE_EXTENSION]: 'input',
}

const DEFINITION_KIND = {
  scalar: Kind.SCALAR_TYPE_DEFINITION,
  type: Kind.OBJECT_TYPE_DEFINITION,
  interface: Kind.INTERFACE_TYPE_DEFINITION,
  union: Kind.UNION_TYPE_DEFINITION,
  enum: Kind.ENUM_TYPE_DEFINITION,
  input: Kind.INPUT_OBJECT_TYPE_DEFINITION,
} as const

/** Indexes a context SDL. Never throws. */
export const indexContext = (sdl: string): ContextIndex => {
  const index: ContextIndex = { parsed: true, names: [], definitions: [] }
  if (sdl.trim() === '') return index

  let nodes: readonly DefinitionNode[]
  try {
    nodes = parse(sdl, { noLocation: true }).definitions
  } catch {
    return { ...index, parsed: false }
  }

  const seen = new Set<string>()
  for (const node of nodes) {
    if (node.kind === Kind.DIRECTIVE_DEFINITION) {
      if (seen.has(`@${node.name.value}`)) continue
      seen.add(`@${node.name.value}`)
      index.names.push({ name: node.name.value, kind: 'directive' })
      index.definitions.push(node)
      continue
    }
    const kind = TYPE_KINDS[node.kind]
    if (!kind || !('name' in node) || !node.name) continue
    const { name } = node
    if (seen.has(name.value)) continue
    // An extension counts: something defines the type, in another service.
    seen.add(name.value)
    index.names.push({ name: name.value, kind })
    index.definitions.push({ kind: DEFINITION_KIND[kind], name })
  }
  return index
}
