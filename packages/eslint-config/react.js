import { defineConfig } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import testingLibrary from 'eslint-plugin-testing-library'
import globals from 'globals'

import baseConfig from './index.js'

export default defineConfig([
  baseConfig,
  {
    files: ['**/*.tsx'],
    plugins: { react, 'jsx-a11y': jsxA11y },
    languageOptions: {
      globals: { ...globals.browser },
    },
    settings: {
      react: {
        // must be an explicit version, never 'detect'. eslint-plugin-react's
        // version detection calls context.getFilename(), removed in eslint 10,
        // and crashes. see peerDependencyRules in the root package.json.
        version: '19.2',
      },
    },
    rules: {
      ...jsxA11y.flatConfigs.strict.rules,

      // jsx-filename-extension must stay off: it is the only rule that calls
      // the removed context.getFilename() unguarded. it enforces JSX living in
      // .jsx files, which is meaningless in an all-TypeScript repo anyway.
      'react/jsx-filename-extension': 'off',

      'react/react-in-jsx-scope': 'off', // not needed in React 17+
      'react/prop-types': 'off', // using TypeScript
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
    },
  },
  {
    // Hooks live in .ts as often as .tsx here, and the rules that matter most
    // for them (refs, set-state-in-effect, exhaustive-deps) have nothing to do
    // with JSX. Scoping this to .tsx left use-codemirror, use-shortcut and
    // friends unchecked.
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['**/*.test.tsx'],
    extends: [testingLibrary.configs['flat/react']],
  },
])
