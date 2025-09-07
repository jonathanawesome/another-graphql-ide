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
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
]
