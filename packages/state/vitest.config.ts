import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Collapse graphql to a single instance. Under pnpm, @graphql-tools/executor
  // resolves graphql through its own peer link, so without deduping the schema a
  // test builds is not `instanceof` the executor's graphql (its duplicate-module
  // guard throws). Vite already dedupes graphql in the app build.
  resolve: { dedupe: ['graphql'] },
  test: {
    // state has no DOM dependencies; transport and slices are pure node
    environment: 'node',
    // Inline the executor so its `graphql` import goes through Vite's resolver
    // (and the dedupe above) instead of Node externalizing it to its own peer
    // copy, which otherwise trips graphql's duplicate-module guard.
    server: { deps: { inline: ['@graphql-tools/executor'] } },
  },
})
