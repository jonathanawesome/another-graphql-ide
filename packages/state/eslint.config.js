import { defineConfig } from 'eslint/config'

import baseConfig from '@another-graphql-ide/eslint-config'

export default defineConfig([
  baseConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
])
