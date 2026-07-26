import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Collapse graphql to a single instance, matching packages/state: the fixtures
  // build schemas that graphql's own duplicate-module guard checks with
  // `instanceof`.
  resolve: { dedupe: ['graphql'] },
  test: {
    // The fixtures are pure graphql-js, no DOM involved
    environment: 'node',
  },
})
