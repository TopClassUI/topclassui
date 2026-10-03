import js from '@eslint/js'
import tseslint from 'typescript-eslint'

import topclass from './eslint-rules/index.ts'

export default tseslint.config(
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

  // Scripts run in Node and are not part of the published surface.
  {
    files: ['scripts/**/*.ts', 'eslint-rules/**/*.ts', '*.config.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
)
