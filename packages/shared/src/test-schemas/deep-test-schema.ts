/* eslint-disable @typescript-eslint/no-non-null-assertion --
   generated fixture: every array index below is modulo-bounded against
   `nodes`, which is fully populated before any field thunk runs, so it is in
   range by construction. noUncheckedIndexedAccess can't see that. */
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
  type GraphQLFieldConfigMap,
} from 'graphql'

import { directivesWithIncrementalDelivery } from './incremental-directives'
import { dateTimeScalar, urlScalar } from './scalar-stubs'

/**
 * A deliberately DEEP and CYCLIC schema, the counterpart to
 * `performanceTestSchema`: that one is wide and flat (thousands of types whose
 * fields are all scalars), this one is small and unbounded downward. Together they
 * separate the two cost axes, so a regression in the schema tree or the editor
 * can be attributed to breadth or to depth rather than to "a big schema".
 *
 * What it exercises:
 *   - cycles at several radii (`self` is a 1-cycle, `child` a 60-cycle), so any
 *     consumer that walks the type graph must be cycle-safe rather than lucky
 *   - an argument on a field at EVERY depth (`name(upper:)`), not just on root
 *     fields, which is where argument handling tends to be missing
 *   - interface-typed and union-typed fields that route back into the mesh
 *   - `HubNode`, one type with 200 fields, for a single very wide expansion
 *   - recursive input types, for completion inside argument values
 *
 * Every field map is built INSIDE the `fields` thunk. `packages/shared` is
 * source-only, so importing anything from it evaluates this module: thunked,
 * that costs 76 type allocations. Hoisting the field maps into the loop body
 * (as `performance-test-schema.ts` does) would move that work to import time.
 */

/** How many `Node{i}` types form the cyclic mesh. */
const NODE_COUNT = 60
/** Scalar and relation field counts on the single wide type. */
const HUB_SCALAR_COUNT = 100
const HUB_RELATION_COUNT = 100
/** Extra `entry{k}` fields on Query, spread around the mesh. */
const QUERY_ENTRY_COUNT = 19

const EPOCH = '1970-01-01T00:00:00.000Z'

const PAYLOAD_NAMES = ['TextPayload', 'LinkPayload', 'GroupPayload'] as const

/** Keep generated list sizes small however the caller asks. */
const clampCount = (first?: number) => Math.min(Math.max(first ?? 3, 0), 10)

/**
 * The mesh. Types are allocated by the loop further down; every field thunk
 * indexes this array freely because no thunk runs until the schema is built.
 */
const nodes: GraphQLObjectType[] = []

/**
 * Resolved shape for every type in this schema. One bag rather than a type per
 * object keeps the resolvers trivial: relation fields hand back a fresh stub per
 * level, and recursion terminates because the query itself is finite.
 */
type Stub = {
  __typename: string
  id: string
  name: string
  kind: string
  createdAt: string
  text: string
  href: string
  label: string
  size: number
}

const stub = (typeName: string, index = 0): Stub => ({
  __typename: typeName,
  id: `${typeName}-${index}`,
  name: `${typeName}-${index}`,
  kind: 'BRANCH',
  createdAt: EPOCH,
  text: `text for ${typeName}-${index}`,
  href: `https://example.com/${typeName}/${index}`,
  label: `label for ${typeName}-${index}`,
  size: index,
})

const SortOrder = new GraphQLEnumType({
  name: 'SortOrder',
  description: 'Direction to sort a list of nodes',
  values: { ASC: { value: 'ASC' }, DESC: { value: 'DESC' } },
})

const NodeKind = new GraphQLEnumType({
  name: 'NodeKind',
  description: 'Where a node sits in the mesh',
  values: { ROOT: { value: 'ROOT' }, BRANCH: { value: 'BRANCH' } },
})

const NestedFilter = new GraphQLInputObjectType({
  name: 'NestedFilter',
  description: 'Inner half of a two-level input filter',
  fields: () => ({
    kind: { type: NodeKind },
    minSize: { type: GraphQLInt },
  }),
})

const NodeFilter = new GraphQLInputObjectType({
  name: 'NodeFilter',
  description: 'Filter for node lookups, nested one level deep',
  fields: () => ({
    name: { type: GraphQLString },
    kind: { type: NodeKind },
    nested: { type: NestedFilter },
  }),
})

const Pagination = new GraphQLInputObjectType({
  name: 'Pagination',
  description: 'Offset pagination',
  fields: () => ({
    offset: { type: GraphQLInt, defaultValue: 0 },
    limit: { type: GraphQLInt, defaultValue: 10 },
  }),
})

// Self-referential input: exercises completion inside argument values, which
// walks input types the same way selection sets walk output types.
const NodeInput: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'NodeInput',
  description: 'Recursive input for creating a node and its children',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    kind: { type: NodeKind },
    children: { type: new GraphQLList(new GraphQLNonNull(NodeInput)) },
  }),
})

const nameField = {
  type: new GraphQLNonNull(GraphQLString),
  description: 'Node name. Carries an argument at every depth, by design.',
  args: { upper: { type: GraphQLBoolean, defaultValue: false } },
  resolve: (source: Stub, args: { upper?: boolean }) =>
    args.upper ? source.name.toUpperCase() : source.name,
}

/**
 * Interface carrying a composite field of its own (`self`), so an
 * interface-typed field is expandable rather than a bag of scalars.
 */
const DeepNode: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'DeepNode',
  description: 'Anything that participates in the node mesh',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: nameField,
    kind: { type: new GraphQLNonNull(NodeKind) },
    self: { type: new GraphQLNonNull(DeepNode) },
  }),
  resolveType: (value: Stub) => value.__typename,
})

const Timestamped = new GraphQLInterfaceType({
  name: 'Timestamped',
  description: 'Anything that records when it was created',
  fields: () => ({
    createdAt: { type: new GraphQLNonNull(dateTimeScalar) },
  }),
  resolveType: (value: Stub) => value.__typename,
})

const TextPayload = new GraphQLObjectType({
  name: 'TextPayload',
  description: 'Payload carrying free text',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    text: { type: new GraphQLNonNull(GraphQLString) },
  }),
})

const LinkPayload = new GraphQLObjectType({
  name: 'LinkPayload',
  description: 'Payload carrying a link',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    href: { type: new GraphQLNonNull(urlScalar) },
    label: { type: GraphQLString },
  }),
})

// `owner` routes the union back into the mesh, so a union member is a way down
// rather than a dead end.
const GroupPayload = new GraphQLObjectType({
  name: 'GroupPayload',
  description: 'Payload carrying a group of nodes',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    size: { type: new GraphQLNonNull(GraphQLInt) },
    owner: {
      type: new GraphQLNonNull(nodes[0]!),
      resolve: () => stub('Node0'),
    },
  }),
})

const NodePayload = new GraphQLUnionType({
  name: 'NodePayload',
  description: 'One of the payload shapes a node can carry',
  types: () => [TextPayload, LinkPayload, GroupPayload],
  resolveType: (value: Stub) => value.__typename,
})

/** A single very wide type: 100 scalars plus 100 relations back into the mesh. */
const HubNode = new GraphQLObjectType({
  name: 'HubNode',
  description: 'One type with 200 fields, for a single very wide expansion',
  fields: () => {
    const fields: GraphQLFieldConfigMap<Stub, unknown> = {}

    for (let j = 0; j < HUB_SCALAR_COUNT; j++) {
      fields[`scalar${j}`] = {
        type: GraphQLString,
        description: `Scalar field ${j}`,
        resolve: () => `hub scalar ${j}`,
      }
    }

    for (let j = 0; j < HUB_RELATION_COUNT; j++) {
      const target = nodes[j % NODE_COUNT]!
      fields[`rel${j}`] = {
        type: new GraphQLNonNull(target),
        description: `Relation ${j} into the node mesh`,
        resolve: () => stub(target.name, j),
      }
    }

    return fields
  },
})

for (let i = 0; i < NODE_COUNT; i++) {
  nodes.push(
    new GraphQLObjectType({
      name: `Node${i}`,
      description: `Node ${i} of the cyclic mesh`,
      interfaces: () => [DeepNode, Timestamped],
      fields: () => {
        const selfType = nodes[i]!
        const parentType = nodes[(i + NODE_COUNT - 1) % NODE_COUNT]!
        const childType = nodes[(i + 1) % NODE_COUNT]!
        const childrenType = nodes[(i * 7 + 3) % NODE_COUNT]!
        const relatedType = nodes[(i * 13 + 5) % NODE_COUNT]!
        const peerType = nodes[(i * 17 + 11) % NODE_COUNT]!

        const fields: GraphQLFieldConfigMap<Stub, unknown> = {
          id: { type: new GraphQLNonNull(GraphQLID) },
          name: nameField,
          kind: { type: new GraphQLNonNull(NodeKind) },
          createdAt: { type: new GraphQLNonNull(dateTimeScalar) },

          // A 1-cycle: expand this forever without leaving the type.
          self: {
            type: new GraphQLNonNull(selfType),
            description: 'This same node, so depth is unbounded from anywhere',
            resolve: () => stub(selfType.name),
          },
          parent: {
            type: parentType,
            description: 'Previous node in the ring',
            resolve: () => stub(parentType.name),
          },
          // A 60-cycle: walking `child` returns here after NODE_COUNT hops.
          child: {
            type: new GraphQLNonNull(childType),
            description: 'Next node in the ring',
            resolve: () => stub(childType.name),
          },
          children: {
            type: new GraphQLNonNull(
              new GraphQLList(new GraphQLNonNull(childrenType))
            ),
            description: 'A list relation carrying input-object and enum args',
            args: {
              first: { type: GraphQLInt, defaultValue: 3 },
              filter: { type: NodeFilter },
              order: { type: SortOrder, defaultValue: 'ASC' },
            },
            resolve: (_source, args: { first?: number }) =>
              Array.from({ length: clampCount(args.first) }, (_, k) =>
                stub(childrenType.name, k)
              ),
          },
          related: {
            type: new GraphQLList(relatedType),
            description: 'Nullable list of nullable nodes',
            resolve: () => [
              stub(relatedType.name, 0),
              stub(relatedType.name, 1),
            ],
          },
          peer: {
            type: new GraphQLNonNull(DeepNode),
            description: 'Interface-typed relation',
            args: { filter: { type: NodeFilter } },
            resolve: () => stub(peerType.name),
          },
          payload: {
            type: NodePayload,
            description: 'Union-typed field, one member of which owns a node',
            resolve: () => stub(PAYLOAD_NAMES[i % PAYLOAD_NAMES.length]!),
          },
        }

        // Only Node0 and Query.hub reach it, so a walker that materializes the
        // graph eagerly cannot multiply the 200 fields across the whole mesh.
        if (i === 0) {
          fields.hub = {
            type: new GraphQLNonNull(HubNode),
            description: 'The wide type',
            resolve: () => stub('HubNode'),
          }
        }

        return fields
      },
    })
  )
}

const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Entry points into the deep mesh',
  fields: () => {
    const fields: GraphQLFieldConfigMap<Stub, unknown> = {
      root: {
        type: new GraphQLNonNull(nodes[0]!),
        description: 'Start here, then expand `self` as far as you like',
        resolve: () => stub('Node0'),
      },
      hub: {
        type: new GraphQLNonNull(HubNode),
        description: 'The 200-field type',
        resolve: () => stub('HubNode'),
      },
      node: {
        type: DeepNode,
        description: 'Interface-typed lookup',
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: () => stub('Node0'),
      },
      nodes: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DeepNode))),
        description: 'Interface-typed list with nested input args',
        args: {
          filter: { type: NodeFilter },
          page: { type: Pagination },
          order: { type: SortOrder, defaultValue: 'ASC' },
        },
        resolve: () => Array.from({ length: 3 }, (_, k) => stub(`Node${k}`, k)),
      },
      payload: {
        type: NodePayload,
        description: 'Union-typed entry point',
        resolve: () => stub('GroupPayload'),
      },
    }

    for (let k = 0; k < QUERY_ENTRY_COUNT; k++) {
      const target = nodes[(k * 3) % NODE_COUNT]!
      fields[`entry${k}`] = {
        type: new GraphQLNonNull(target),
        description: `Entry point ${k} into the mesh`,
        resolve: () => stub(target.name, k),
      }
    }

    return fields
  },
})

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Mutations over the deep mesh',
  fields: () => ({
    createNode: {
      type: new GraphQLNonNull(nodes[0]!),
      args: { input: { type: new GraphQLNonNull(NodeInput) } },
      description: 'Create a node from a recursive input',
      resolve: () => stub('Node0'),
    },
    updateNode: {
      type: new GraphQLNonNull(nodes[0]!),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(NodeInput) },
      },
      resolve: () => stub('Node0'),
    },
    deleteNode: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: () => true,
    },
    attach: {
      type: new GraphQLNonNull(nodes[0]!),
      args: {
        parent: { type: new GraphQLNonNull(GraphQLID) },
        child: { type: new GraphQLNonNull(GraphQLID) },
        order: { type: SortOrder },
      },
      resolve: () => stub('Node0'),
    },
  }),
})

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  description: 'Subscriptions over the deep mesh',
  fields: () => ({
    nodeChanged: {
      type: new GraphQLNonNull(DeepNode),
      args: { filter: { type: NodeFilter } },
      // Yield keyed by field name so the default resolver picks it up, matching
      // the other fixture schemas.
      // eslint-disable-next-line @typescript-eslint/require-await
      subscribe: async function* () {
        for (let k = 0; k < 3; k++) yield { nodeChanged: stub('Node0', k) }
      },
    },
    payloadStream: {
      type: new GraphQLNonNull(NodePayload),
      // eslint-disable-next-line @typescript-eslint/require-await
      subscribe: async function* () {
        for (const name of PAYLOAD_NAMES) yield { payloadStream: stub(name) }
      },
    },
  }),
})

export const deepTestSchema = new GraphQLSchema({
  directives: directivesWithIncrementalDelivery,
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
  description:
    'Deep, cyclic test schema: unbounded expansion depth over a small type set',
  types: [
    ...nodes,
    HubNode,
    TextPayload,
    LinkPayload,
    GroupPayload,
    DeepNode,
    Timestamped,
    NodePayload,
  ],
})
