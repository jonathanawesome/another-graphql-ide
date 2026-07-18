import { defineConfig } from 'eslint/config'

import nodeConfig from '@another-graphql-ide/eslint-config/node'

export default defineConfig([
  nodeConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
])
