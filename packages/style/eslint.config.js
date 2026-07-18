import { defineConfig, globalIgnores } from 'eslint/config'

import reactConfig from '@another-graphql-ide/eslint-config/react'

export default defineConfig([
  reactConfig,
  // not yet covered by tsconfig include, so projectService can't type them
  globalIgnores(['*.config.ts']),
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
])
