import { defineConfig } from 'eslint/config'
import globals from 'globals'

import baseConfig from './index.js'

export default defineConfig([
  baseConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off', // console is fine in Node
      'prefer-promise-reject-errors': 'error',
    },
  },
])
