import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // state has no DOM dependencies; transport and slices are pure node
    environment: 'node',
  },
})
