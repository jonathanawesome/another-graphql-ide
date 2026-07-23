import { createRequire } from 'node:module'

import { defineConfig } from 'vitest/config'

// There is only one physical graphql on disk, but Vite otherwise instantiates it
// more than once (an SSR-transformed copy for our ESM sources vs the copy
// graphql-language-service ends up with), and graphql's duplicate-module guard
// then throws "from another module or realm" inside completion/lint. Alias
// graphql to its single resolved file and route the language service + the
// schema-building shared package through Vite's transform so every graphql
// import lands on that one module instance.
const require = createRequire(import.meta.url)
const graphqlEntry = require.resolve('graphql')

// Dedicated config for the stress benchmark (stress.bench.ts), kept separate so
// the test config stays untouched. The bench only exercises pure
// graphql-language-service functions, so it needs neither jsdom nor the
// vanilla-extract plugin.
export default defineConfig({
  resolve: {
    dedupe: ['graphql'],
    alias: { graphql: graphqlEntry },
  },
  test: {
    environment: 'node',
    server: {
      deps: {
        inline: ['graphql-language-service', '@another-graphql-ide/shared'],
      },
    },
  },
})
