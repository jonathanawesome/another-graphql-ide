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
  {
    // Layouts are built only from what the package exports, so a missing
    // export shows up here instead of being papered over with a deep import.
    files: ['src/layouts/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*/*', '@another-graphql-ide/state'],
              message:
                'Layouts import only from ../components, ../recipes or ../state.',
            },
          ],
        },
      ],
    },
  },
])
