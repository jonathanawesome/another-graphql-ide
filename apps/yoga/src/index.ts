import { createServer } from 'node:http'

import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { createYoga } from 'graphql-yoga'

import { PORT } from './constants'
import { testSchema } from './test-schema'

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema: testSchema, plugins: [useDeferStream()] })

// Pass it into a server to hook into request handlers.
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(yoga)

// Start the server and you're done!
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`Server is running on http://localhost:${PORT}/graphql`)
})
