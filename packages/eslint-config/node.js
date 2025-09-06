import baseConfig from './index.js'
import globals from 'globals'

export default [
  ...baseConfig,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Node.js specific rules
      'no-console': 'off', // Console is fine in Node.js
      'no-process-env': 'off',

      // Prefer modern Node.js patterns
      'prefer-promise-reject-errors': 'error',
    },
  },
]
