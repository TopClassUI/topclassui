import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import topclass from './index.ts'

const linter = new Linter()

const config = [
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { topclass },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    rules: {
      'topclass/logical-properties-only': 'error',
      'topclass/semantic-classes-only': 'error',
      'topclass/no-dynamic-class-names': 'error',
      'topclass/shared-class-constants': 'error',
      'topclass/no-enum': 'error',
      'topclass/one-line-comments': 'error',
    },
  },
] as unknown as Linter.Config[]

function lint(code: string, filename = 'fixture.tsx') {
  return linter.verify(code, config, filename)
}

function ids(code: string) {
  return lint(code).map((m) => m.ruleId)
}

describe('classes that must fail', () => {
  const banned: [string, string, string][] = [
    ['pl-4', '<div className="pl-4" />', 'topclass/logical-properties-only'],
    ['ml-2', '<div className="ml-2" />', 'topclass/logical-properties-only'],
    ['left-0', '<div className="absolute left-0" />', 'topclass/logical-properties-only'],
    ['start-4', '<div className="start-4" />', 'topclass/logical-properties-only'],
    ['text-left', '<div className="text-left" />', 'topclass/logical-properties-only'],
    ['border-l', '<div className="border-l" />', 'topclass/logical-properties-only'],
    ['space-x-2', '<div className="space-x-2" />', 'topclass/logical-properties-only'],
    ['tracking-wide', '<div className="tracking-wide" />', 'topclass/logical-properties-only'],
    ['bg-red-500', '<div className="bg-red-500" />', 'topclass/semantic-classes-only'],
    ['text-violet-600', '<div className="text-violet-600" />', 'topclass/semantic-classes-only'],
    ['bg-[#fff]', '<div className="bg-[#fff]" />', 'topclass/semantic-classes-only'],
    ['dark:bg-black', '<div className="dark:bg-black" />', 'topclass/semantic-classes-only'],
    ['rounded-md', '<div className="rounded-md" />', 'topclass/shared-class-constants'],
    ['h-10', '<div className="h-10" />', 'topclass/shared-class-constants'],
    ['outline-2', '<div className="outline-2" />', 'topclass/shared-class-constants'],
    ['duration-200', '<div className="duration-200" />', 'topclass/shared-class-constants'],
    ['hover: by hand', '<div className="hover:bg-primary-soft" />', 'topclass/shared-class-constants'],
  ]

  for (const [name, code, rule] of banned) {
    it(`${name} fails`, () => {
      expect(ids(code)).toContain(rule)
    })
  }

  it('a dynamic class name fails', () => {
    expect(ids('const c = cn(`bg-${tone}`)')).toContain('topclass/no-dynamic-class-names')
  })

  it('an enum fails', () => {
    expect(ids('enum Size { sm, md }')).toContain('topclass/no-enum')
  })

  it('a two-line comment fails', () => {
    const code = ['// the first line of prose', '// and the second line', 'const a = 1'].join('\n')
    expect(ids(code)).toContain('topclass/one-line-comments')
  })

  it('commented-out code fails', () => {
    expect(ids('// const dead = 1;\nconst a = 1')).toContain('topclass/one-line-comments')
  })
})

describe('classes that must pass', () => {
  const allowed: [string, string][] = [
    ['ps-4', '<div className="ps-4" />'],
    ['pe-4 me-2', '<div className="pe-4 me-2" />'],
    ['inset-s-4', '<div className="absolute inset-s-4" />'],
    ['text-start', '<div className="text-start" />'],
    ['border-s', '<div className="border-s" />'],
    ['rounded-s-control', '<div className="rounded-s-control" />'],
    ['bg-primary-solid', '<div className="bg-primary-solid text-primary-on-solid" />'],
    ['text-body', '<div className="text-body" />'],
    ['border-line', '<div className="border-line" />'],
    ['bg-page', '<div className="bg-page" />'],
    ['rounded-control', '<div className="rounded-control" />'],
    ['h-control-md', '<div className="h-control-md" />'],
    ['gap-2', '<div className="flex gap-2" />'],
    ['data variants', '<div className="data-open:bg-surface group-data-panel-open:hidden" />'],
  ]

  for (const [name, code] of allowed) {
    it(`${name} passes`, () => {
      expect(lint(code)).toEqual([])
    })
  }

  it('FOCUS_RING is allowed to be written out in classes.ts', () => {
    const code = 'export const FOCUS_RING = "outline-none focus-visible:outline-ring"'
    expect(lint(code, 'src/shared/classes.ts')).toEqual([])
  })

  it('but the same string fails in a component', () => {
    const code = '<div className="focus-visible:outline-ring" />'
    expect(lint(code).map((m) => m.ruleId)).toContain('topclass/shared-class-constants')
  })

  it('joining whole constants in a template passes', () => {
    expect(ids('const c = cn(`${BORDER} ${FOCUS_RING}`)')).not.toContain('topclass/no-dynamic-class-names')
  })

  it('a one-line comment passes', () => {
    expect(lint('// why this cannot be derived\nconst a = 1')).toEqual([])
  })

  it('a palette name outside a class context passes', () => {
    expect(lint('const note = "the bg-red-500 class is banned"')).toEqual([])
  })
})
