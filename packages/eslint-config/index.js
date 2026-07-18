import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import importX from 'eslint-plugin-import-x'
import tseslint from 'typescript-eslint'

// node_modules is ignored by flat config already
export const ignores = globalIgnores([
  '**/dist/',
  '**/coverage/',
  '**/*.gen.ts',
])

export default defineConfig([
  ignores,
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'import-x': importX },
    languageOptions: {
      parserOptions: {
        // resolves the nearest tsconfig per file, so packages don't each
        // have to declare `project`
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // interpolating a number is safe and idiomatic
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      // `onClick={() => setOpen(true)}` is the normal React idiom
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
      // off deliberately: both forms are legitimate, and autofixing toward
      // `type` breaks module augmentation, which needs interface declaration
      // merging (see the Register block in component-preview's main.tsx)
      '@typescript-eslint/consistent-type-definitions': 'off',

      // off until tsconfig enables noUncheckedIndexedAccess. without it, TS
      // types `arr[i]` as always-defined, so this rule flags correct runtime
      // guards as unnecessary. turn both on together.
      '@typescript-eslint/no-unnecessary-condition': 'off',

      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'off', // TypeScript handles this

      'no-console': 'warn',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'no-console': 'off',
    },
  },
  {
    // the eslint configs themselves are the only .js in the repo
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // must stay last so it can turn off conflicting formatting rules
  prettier,
])
