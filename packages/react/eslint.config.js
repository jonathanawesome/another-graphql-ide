import { defineConfig } from 'eslint/config'

import reactConfig from '@another-graphql-ide/eslint-config/react'

export default defineConfig([
  reactConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
])
