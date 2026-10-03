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
      'topclass/semantic-classes-only': 'error',
      'topclass/no-dynamic-class-names': 'error',
      'topclass/shared-class-constants': 'error',
      'topclass/no-enum': 'error',
      'topclass/one-line-comments': 'error',

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },

  // Demos show real usage, so hard-coded strings are the point.
  {
    files: ['src/**/dummy/**/*.tsx'],
    rules: { 'topclass/no-hardcoded-text': 'off' },
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
