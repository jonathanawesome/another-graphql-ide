import { defineConfig } from 'eslint/config'

import reactConfig from '@another-graphql-ide/eslint-config/react'

export default defineConfig([
  reactConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    // Primitives are prop-driven. Store access belongs to bricks and up.
    files: ['src/components/primitives/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@another-graphql-ide/state', '**/state', '**/state/**'],
              message: 'Primitives must stay store-free. Take it as a prop.',
            },
          ],
        },
      ],
    },
  },
])
