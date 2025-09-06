import nodeConfig from '@another-graphql-ide/eslint-config/node'

export default [
  ...nodeConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      // API-specific rules
      'no-console': 'warn', // Maybe allow console in development
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
]
