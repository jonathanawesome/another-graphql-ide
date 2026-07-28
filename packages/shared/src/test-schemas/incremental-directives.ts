import {
  DirectiveLocation,
  GraphQLBoolean,
  GraphQLDirective,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  specifiedDirectives,
} from 'graphql'

/**
 * @defer and @stream, declared by hand because graphql 16 does not export them.
 *
 * The executor honours both without a declaration, but the language service
 * validates against the schema, so an editor pointed at one of these fixtures
 * would otherwise underline a query that runs perfectly well. Over HTTP the
 * yoga dev server injects the same directives via useDeferStream.
 */
export const deferDirective = new GraphQLDirective({
  name: 'defer',
  description:
    'Delivers this fragment asynchronously, after the initial response.',
  locations: [
    DirectiveLocation.FRAGMENT_SPREAD,
    DirectiveLocation.INLINE_FRAGMENT,
  ],
  args: {
    label: { type: GraphQLString },
    if: { type: new GraphQLNonNull(GraphQLBoolean), defaultValue: true },
  },
})

export const streamDirective = new GraphQLDirective({
  name: 'stream',
  description: 'Delivers list items asynchronously, after an initial batch.',
  locations: [DirectiveLocation.FIELD],
  args: {
    label: { type: GraphQLString },
    initialCount: { type: GraphQLInt, defaultValue: 0 },
    if: { type: new GraphQLNonNull(GraphQLBoolean), defaultValue: true },
  },
})

/**
 * Passing `directives` to GraphQLSchema replaces the default set rather than
 * extending it, so the specified ones have to be carried along.
 */
export const directivesWithIncrementalDelivery = [
  ...specifiedDirectives,
  deferDirective,
  streamDirective,
]
