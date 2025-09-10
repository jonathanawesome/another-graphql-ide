import { createServer } from 'node:http'

import { graphiqlTestSchema } from '@another-graphql-ide/shared'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { createYoga } from 'graphql-yoga'

import { PORT } from './constants'

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({
  schema: graphiqlTestSchema,
  plugins: [useDeferStream()],
})

// Pass it into a server to hook into request handlers.
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(yoga)

// Start the server and you're done!
server.listen(PORT, () => {
  console.info(`Server is running on http://localhost:${PORT}/graphql`)
})
