import type { LineData, SdlAnnotation, SdlTag } from '../codemirror/line-state'
import { indexSdl, type Coordinate } from '../codemirror/sdl-index'

/** A small federation subgraph: extensions, @key, arguments, enums, inputs. */
export const subgraphSdl = `"""
A customer account.
"""
type User @key(fields: "id") {
  id: ID!
  "Display name, formatted for the current locale."
  name(format: NameFormat = FULL): String!
  email: String @deprecated(reason: "Use contact.email")
  role: Role!
  orders(first: Int = 10, after: String): [Order!]!
}

type Order @key(fields: "id") {
  id: ID!
  total: Float!
  placedBy: User!
}

enum Role {
  ADMIN
  MEMBER
  GUEST
}

enum NameFormat {
  FULL
  SHORT
}

input UserFilter {
  role: Role = MEMBER
  search: String
}

extend type Query {
  user(id: ID!): User
  users(filter: UserFilter): [User!]!
}

directive @key(fields: String!) repeatable on OBJECT | INTERFACE
`

const SUBGRAPHS = ['ACCOUNTS', 'INVENTORY', 'REVIEWS', 'SHIPPING']

/**
 * A supergraph-shaped document with `types` object types of `fields` fields
 * each. Every field carries @join__field, so lines run long like a real one.
 */
export const makeSupergraph = (types: number, fields = 8) => {
  const parts = [
    'schema @link(url: "https://specs.apollo.dev/join/v0.3", for: EXECUTION) {\n  query: Query\n}',
    'directive @join__type(graph: join__Graph!, key: String, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE',
    'directive @join__field(graph: join__Graph, requires: String, provides: String, external: Boolean) repeatable on FIELD_DEFINITION',
    'directive @link(url: String, for: String) repeatable on SCHEMA',
    `enum join__Graph {\n${SUBGRAPHS.map(g => `  ${g} @join__graph(name: "${g.toLowerCase()}")`).join('\n')}\n}`,
    'directive @join__graph(name: String!) on ENUM_VALUE',
  ]

  const query = Array.from(
    { length: Math.min(types, 200) },
    (_, i) => `  type${i}(id: ID!): Type${i} @join__field(graph: ACCOUNTS)`
  )
  parts.push(
    `type Query @join__type(graph: ACCOUNTS) {\n${query.join('\n')}\n}`
  )

  for (let i = 0; i < types; i++) {
    const graph = SUBGRAPHS[i % SUBGRAPHS.length] ?? 'ACCOUNTS'
    const body = Array.from({ length: fields }, (_, f) => {
      const type = f === 0 ? 'ID!' : `Type${(i + f) % types}`
      return `  field${f}: ${type} @join__field(graph: ${graph}) @join__field(graph: REVIEWS, external: true)`
    })
    parts.push(
      `"""\nGenerated type ${i}.\n"""\ntype Type${i} @join__type(graph: ${graph}, key: "id") @join__type(graph: REVIEWS, key: "id") {\n${body.join('\n')}\n}`
    )
  }

  return `${parts.join('\n\n')}\n`
}

/**
 * Host data for every coordinate in `sdl`: every thirteenth is tagged as not
 * in the API; the rest get an annotation, with every eleventh tagged as shared
 * and every third dimmed. Deterministic, like a real map.
 */
export const makeLineData = (sdl: string): Required<LineData> => {
  const annotations = new Map<Coordinate, SdlAnnotation>()
  const tags = new Map<Coordinate, SdlTag>()
  const dimmed = new Set<Coordinate>()
  let i = 0
  for (const coordinate of indexSdl(sdl).lineOfCoordinate.keys()) {
    const ratio = ((i * 37) % 100) / 100
    // Not in the API, so it has no usage to show.
    if (i % 13 === 5) {
      tags.set(coordinate, { label: 'not in API', icon: 'EyeOff' })
      i++
      continue
    }
    annotations.set(coordinate, {
      value: ratio === 0 ? 'unused' : `${(ratio * 500).toFixed(1)}K`,
      ratio,
      error: i % 7 === 4 ? `${((i % 5) + 0.4).toFixed(1)}% errors` : undefined,
    })
    if (i % 11 === 0) tags.set(coordinate, { label: 'shared' })
    if (i % 3 === 0) dimmed.add(coordinate)
    i++
  }
  return { annotations, tags, dimmed }
}
