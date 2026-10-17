import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

import topclass from '../../packages/topclassui/eslint-rules/index.ts'

// docs-site rule 2: the library's own rules on the site's code, since the library's config reaches src/** only.
export default defineConfig(
  { ignores: ['node_modules', '.next', '.generated', 'next-env.d.ts', 'test-results', 'playwright-report', '*.mjs'] },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },

  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'labels/**/*.ts'],
    ignores: ['**/*.test.ts'],
    plugins: { topclass },
    rules: {
      'topclass/logical-properties-only': 'error',
      'topclass/semantic-classes-only': 'error',
      'topclass/no-dynamic-class-names': 'error',
      'topclass/shared-class-constants': 'error',
      'topclass/style-sets-tokens-only': 'error',
      'topclass/presence-state-attributes': 'error',
      'topclass/no-enum': 'error',
      'topclass/one-line-comments': 'error',
      'topclass/text-comes-from-labels': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },

  // Satori draws the Open Graph images from inline styles alone; no stylesheet reaches them.
  {
    files: ['app/**/opengraph-image.tsx', 'lib/og-card.tsx'],
    rules: { 'topclass/style-sets-tokens-only': 'off' },
  },

  {
    files: ['**/*.test.ts', 'e2e/**/*.ts'],
    plugins: { topclass },
    rules: {
      'topclass/no-derived-expectations': 'error',
      // A test drops a key with a rest pattern to build the invalid case.
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },

  // Tooling runs in Node and never ships.
  {
    files: ['scripts/**/*.ts', '*.config.ts', 'e2e/**/*.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
)
