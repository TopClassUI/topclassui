// Docs-site rule 2: a rule that silently does not run fails here, because each one must flag its bad snippet.
import { ESLint } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import config, { SITE_RULES } from '../eslint.config.js'
import topclass from '../../../packages/topclassui/eslint-rules/index.ts'

const BAD: Record<keyof typeof SITE_RULES, string> = {
  'topclass/logical-properties-only': 'export const A = () => <div className="ml-4" />',
  'topclass/semantic-classes-only': 'export const A = () => <div className="bg-red-500" />',
  'topclass/no-dynamic-class-names': 'export const A = ({ t }: { t: string }) => <div className={`bg-${t}`} />',
  'topclass/shared-class-constants': 'export const A = () => <div className="rounded-md" />',
  'topclass/style-sets-tokens-only': 'export const A = () => <div style={{ color: "x" }} />',
  'topclass/presence-state-attributes': 'export const A = () => <div data-state="open" />',
  'topclass/no-enum': 'export enum Mode { Light }',
  'topclass/one-line-comments': '// one\n// two\nexport const a = 1',
  'topclass/text-comes-from-labels': 'export const A = () => <p>Hello there</p>',
}

const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ['**/*.tsx'],
      languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { topclass },
      rules: SITE_RULES,
    },
  ],
})

describe('the site turns on the library rules', () => {
  it('applies them to app, components and lib', () => {
    const block = config.find((entry) => entry.rules?.['topclass/semantic-classes-only'] === 'error')
    expect(block?.files).toEqual(['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'])
  })

  for (const [rule, source] of Object.entries(BAD)) {
    it(`${rule} flags its bad snippet`, async () => {
      const [result] = await eslint.lintText(source, { filePath: 'components/probe.tsx' })
      expect(result?.messages.map((message) => message.ruleId)).toContain(rule)
    })
  }
})
