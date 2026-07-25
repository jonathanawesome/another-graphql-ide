import { createRequire } from 'node:module'

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vitest/config'

// Same single-graphql-instance setup as vitest.bench.config.ts: Vite otherwise
// instantiates graphql more than once (an SSR-transformed copy for our sources
// vs the copy graphql-language-service ends up with) and graphql's
// duplicate-module guard throws "from another module or realm" inside
// completion/lint.
const require = createRequire(import.meta.url)
const graphqlEntry = require.resolve('graphql')

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  resolve: {
    dedupe: ['graphql'],
    alias: { graphql: graphqlEntry },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    server: {
      deps: {
        inline: ['graphql-language-service', '@another-graphql-ide/shared'],
      },
    },
  },
})
