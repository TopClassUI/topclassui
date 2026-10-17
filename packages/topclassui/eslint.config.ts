import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

import topclass from './eslint-rules/index.ts'

export default defineConfig(
  { ignores: ['node_modules', 'dist', '.next', 'apps/**/.next', 'coverage'] },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },

  // The library itself. Every rule in docs/RULES.md that a linter can enforce
  // applies here and nowhere else: demos and scripts are deliberately exempt.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { topclass },
    rules: {
      'topclass/logical-properties-only': 'error',
      'topclass/dir-aware-transforms': 'error',
      'topclass/semantic-classes-only': 'error',
      'topclass/no-dynamic-class-names': 'error',
      'topclass/shared-class-constants': 'error',
      'topclass/bare-data-variants': 'error',
      'topclass/no-enum': 'error',
      'topclass/one-line-comments': 'error',
      'topclass/icon-loaders-stay-server': 'error',
      'topclass/no-derived-expectations': 'error',
      'topclass/style-sets-tokens-only': 'error',
      'topclass/presence-state-attributes': 'error',
      'topclass/flat-part-exports': 'error',
      'topclass/root-part-is-named-root': 'error',
      'topclass/text-comes-from-labels': 'error',
      'topclass/no-fetch-in-components': 'error',
      'topclass/tooltip-content-is-text': 'error',
      'topclass/client-shape': 'error',
      'topclass/props-derived-at-the-seam': 'error',
      'topclass/cn-class-name-last': 'error',

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      // A prop named beside ...rest is being kept off the element, which is a use.
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },

  // A test has to write the banned string to prove the rule or the merge works,
  // and a demo exists to show real usage. Neither is published. R-5.11-1 exempts
  // demos by name, and a test needs a real scroll box with a height and an overflow.
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/**/test/**/*.{ts,tsx}', 'src/**/dummy/**/*.tsx'],
    rules: {
      'topclass/semantic-classes-only': 'off',
      'topclass/shared-class-constants': 'off',
      'topclass/logical-properties-only': 'off',
      'topclass/dir-aware-transforms': 'off',
      'topclass/style-sets-tokens-only': 'off',
      'topclass/text-comes-from-labels': 'off',
      'topclass/no-fetch-in-components': 'off',
    },
  },

  // R-8.5-2: a dismissed Banner is remembered across pages, which is UI state rather
  // than data; that file may read and write localStorage and nothing else (DECISIONS).
  {
    files: ['src/components/banner/lib.ts'],
    rules: { 'topclass/no-fetch-in-components': ['error', { allow: ['localStorage'] }] },
  },

  // R-10.5-2 is about every tooltip a page renders, so it also covers the harness pages and fixtures.
  {
    files: ['e2e/**/*.tsx', 'scripts/**/*.tsx'],
    plugins: { topclass },
    rules: { 'topclass/tooltip-content-is-text': 'error' },
  },

  // Tooling runs in Node, never ships, and walks untyped ESLint AST nodes.
  // The strict rules stay on for src/, which is the published surface.
  {
    files: ['scripts/**/*.ts', 'eslint-rules/**/*.ts', '*.config.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
)
