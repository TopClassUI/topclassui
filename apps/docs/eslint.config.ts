import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

import topclass from '../../packages/topclassui/eslint-rules/index.ts'

/** The library's rules the site turns on (docs-site rule 2): the same token, RTL and label rules as src/. */
export const SITE_RULES = {
  'topclass/logical-properties-only': 'error',
  'topclass/semantic-classes-only': 'error',
  'topclass/no-dynamic-class-names': 'error',
  'topclass/shared-class-constants': 'error',
  'topclass/style-sets-tokens-only': 'error',
  'topclass/presence-state-attributes': 'error',
  'topclass/no-enum': 'error',
  'topclass/one-line-comments': 'error',
  'topclass/text-comes-from-labels': 'error',
} as const

export default defineConfig(
  { ignores: ['node_modules', '.next', '.generated', 'next-env.d.ts', 'test-results', 'playwright-report', 'postcss.config.mjs'] },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    plugins: { topclass },
    rules: SITE_RULES,
  },

  // Satori draws the Open Graph images and the icon from inline styles alone; no stylesheet reaches them.
  {
    files: ['app/**/opengraph-image.tsx', 'app/icon.tsx', 'app/apple-icon.tsx', 'lib/og.tsx', 'lib/icon-tile.tsx'],
    rules: { 'topclass/style-sets-tokens-only': 'off' },
  },

  {
    files: ['**/*.test.{ts,tsx}', 'e2e/**/*.ts'],
    plugins: { topclass },
    rules: { 'topclass/no-derived-expectations': 'error' },
  },

  // Tooling runs in Node and walks untyped data; the strict rules stay on for what ships.
  {
    files: ['scripts/**/*.ts', '*.config.ts', 'e2e/**/*.ts', '**/*.test.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  // The Arabic diacritics are a range of combining marks on purpose: the slug strips them.
  { files: ['lib/slug.ts'], rules: { 'no-misleading-character-class': 'off' } },
  {
    files: ['lib/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
)
