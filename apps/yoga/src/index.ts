import { createServer } from 'node:http'
import { type AddressInfo } from 'node:net'

import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { createYoga } from 'graphql-yoga'

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({
  schema: graphiqlTestSchema,
  plugins: [useDeferStream()],
})

// Pass it into a server to hook into request handlers.
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(yoga)

server.listen(4000, () => {
  const address = server.address() as AddressInfo
  const port = address.port
  console.log(
    `🚀 GraphQL Yoga server running on http://localhost:${port}/graphql`
  )
})
