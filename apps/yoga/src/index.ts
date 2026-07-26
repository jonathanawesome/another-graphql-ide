import { createServer } from 'node:http'
import { type AddressInfo } from 'node:net'

import {
  deepTestSchema,
  enterpriseTestSchema,
  graphiqlTestSchema,
  performanceTestSchema,
  veterinaryOfficeSchema,
} from '@another-graphql-ide/shared'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { createYoga } from 'graphql-yoga'

/**
 * One mount per shared test schema, so a preview that displays schema X can
 * execute against a server that actually knows X. `/graphql` must stay the
 * graphiql schema: it is the default endpoint in packages/state.
 */
const mounts = {
  '/graphql': graphiqlTestSchema,
  '/enterprise': enterpriseTestSchema,
  '/vet': veterinaryOfficeSchema,
  '/performance': performanceTestSchema,
  '/deep': deepTestSchema,
} as const

// createYoga returns a request handler, not a server, so all five share one
// process and one port. Each serves its own GraphiQL page at its path.
const handlers = new Map(
  Object.entries(mounts).map(([graphqlEndpoint, schema]) => [
    graphqlEndpoint,
    createYoga({ schema, graphqlEndpoint, plugins: [useDeferStream()] }),
  ])
)

const server = createServer((request, response) => {
  // Node gives a path-only url, so URL needs a base to parse against.
  const { pathname } = new URL(
    request.url ?? '/',
    `http://${request.headers.host ?? 'localhost'}`
  )
  const handler = handlers.get(pathname)

  if (!handler) {
    response.writeHead(404, { 'content-type': 'text/plain' })
    response.end(`No schema mounted at ${pathname}.\n\nMounts:\n${paths()}`)
    return
  }

  void handler(request, response)
})

const paths = () =>
  Object.keys(mounts)
    .map(path => `  http://localhost:4000${path}`)
    .join('\n')

server.listen(4000, () => {
  const { port } = server.address() as AddressInfo
  console.log(`🚀 GraphQL Yoga server running on http://localhost:${port}`)
  console.log(paths())
})
