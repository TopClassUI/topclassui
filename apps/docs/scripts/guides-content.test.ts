// Docs-site pages 8 and 10: a claim on a page is checked against the library, so a row the library does not back is not printed.
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { ESLint } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import topclass from '../../../packages/topclassui/eslint-rules/index.ts'
import { guideFacts } from './lib/guides.js'

const CONTENT = resolve(import.meta.dirname, '..', 'content')
const read = (file: string) => readFileSync(join(CONTENT, file), 'utf8')

/** The class names in a table's first column, written as code or as plain words with an escaped `*`. */
function firstColumn(mdx: string, heading: string): string[][] {
  const section = mdx.split(/^## /m).find((part) => part.startsWith(heading)) ?? ''
  return section.split('\n').filter((line) => line.startsWith('| ') && !/^\|\s*-/.test(line)).slice(1)
    .map((line) => (line.split('|')[1] ?? '').replace(/<[^>]+>/g, ' ').replace(/[`\\]/g, '').split(/\s+/).filter((word) => /^[a-z]+(-[a-z*]+)+$/.test(word)))
}

const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [{
    files: ['**/*.tsx'],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { topclass },
    rules: { 'topclass/logical-properties-only': 'error' },
  }],
})

const lint = async (className: string) => {
  const [result] = await eslint.lintText(`export const A = () => <div className="${className}" />`, { filePath: 'probe.tsx' })
  return result?.messages.map((message) => message.message) ?? []
}

describe('Right to left: the banned classes', () => {
  const banned = firstColumn(read('en/rtl.mdx'), 'Logical classes only').flat()

  it('lists the rows the page claims', () => {
    expect(banned).toEqual(['ml-*', 'mr-*', 'pl-*', 'pr-*', 'left-*', 'right-*', 'start-*', 'end-*', 'text-left', 'text-right', 'border-l', 'border-r', 'rounded-l-*', 'rounded-r-*', 'space-x-*', 'divide-x-*', 'tracking-*'])
    expect(firstColumn(read('ar/rtl.mdx'), 'الأصناف المنطقية فقط').flat()).toEqual(banned)
  })

  for (const cls of ['ml-4', 'mr-4', 'pl-4', 'pr-4', 'left-4', 'right-4', 'start-4', 'end-4', 'text-left', 'text-right', 'border-l', 'border-r', 'rounded-l-md', 'rounded-r-md', 'space-x-4', 'divide-x-2', 'tracking-wide']) {
    it(`${cls} fails the library's lint`, async () => {
      expect((await lint(cls)).length).toBe(1)
    })
  }

  it('prints the message the Wrong sample quotes', async () => {
    expect(await lint('pl-4 text-left')).toEqual(['R-5.3-1: "pl-" is physical. use ps- or pe-.'])
    expect(read('en/rtl.mdx')).toContain('// R-5.3-1: "pl-" is physical. use ps- or pe-.')
  })
})

describe('Icons: the counts the prose states', () => {
  const { icons } = guideFacts()

  it('say 84 and 16 in both languages, as the library has', () => {
    expect([icons.total, icons.directional]).toEqual([84, 16])
    for (const file of ['en/icons.mdx', 'ar/icons.mdx']) {
      expect(read(file)).toContain('84')
      expect(read(file)).toContain('16')
    }
  })

  it('name the groups in docs/icons.md order', () => {
    const rows = read('en/icons.mdx').split(/^## /m).find((part) => part.startsWith('The set')) ?? ''
    const titles = rows.split('\n').filter((line) => line.startsWith('| ') && !/^\|\s*-/.test(line)).slice(1).map((line) => (line.split('|')[1] ?? '').trim())
    expect(titles).toEqual(icons.groups.map((group) => group.title))
  })
})
