import reactConfig from '@another-graphql-ide/eslint-config/react'

export default [
  ...reactConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.ts'],
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
]
