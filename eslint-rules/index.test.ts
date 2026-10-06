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
      'topclass/icon-loaders-stay-server': 'error',
      'topclass/no-derived-expectations': 'error',
      'topclass/style-sets-tokens-only': 'error',
      'topclass/presence-state-attributes': 'error',
      'topclass/flat-part-exports': 'error',
      'topclass/root-part-is-named-root': 'error',
      'topclass/text-comes-from-labels': 'error',
    },
  },
] as unknown as Linter.Config[]

function lint(code: string, filename = 'fixture.tsx') {
  return linter.verify(code, config, filename)
}

function ids(code: string, filename?: string) {
  return lint(code, filename).map((m) => m.ruleId)
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

describe('icon-loaders-stay-server', () => {
  const MAP = "import { LOADERS } from '../../icons/loaders.generated.js'"

  it('allows the map inside components/icon, which is the only place that may load it', () => {
    expect(lint(MAP, 'src/components/icon/lib.ts')).toEqual([])
    expect(lint(MAP, 'src/components/icon/index.tsx')).toEqual([])
  })

  it('refuses it anywhere else, because the map would reach the browser', () => {
    for (const file of [
      'src/shared/cn.ts',
      'src/components/button/client.tsx',
      'src/components/icon-registry/index.tsx',
      'src/connectors/adaptive-menu/index.tsx',
    ]) {
      const messages = lint(MAP, file)
      expect(messages, file).toHaveLength(1)
      expect(messages[0]?.message, file).toMatch(/R-7-1/)
    }
  })

  it('leaves a per-icon import alone, which is the supported way', () => {
    const code = "import { spinner } from '../../icons/data/spinner.js'"
    expect(lint(code, 'src/components/button/client.tsx')).toEqual([])
  })

  it('leaves the client-safe icons entry alone', () => {
    const code = "import { DIRECTIONAL } from '../../icons/index.js'"
    expect(lint(code, 'src/components/button/client.tsx')).toEqual([])
  })
})

describe('icon-loaders-stay-server covers every import form', () => {
  const MAP = '../../icons/loaders.generated.js'
  const forms: [string, string][] = [
    ['static import', `import { LOADERS } from '${MAP}'`],
    ['bare import', `import '${MAP}'`],
    ['namespace import', `import * as m from '${MAP}'`],
    ['re-export named', `export { LOADERS } from '${MAP}'`],
    ['re-export all', `export * from '${MAP}'`],
    ['dynamic import', `export const m = () => import('${MAP}')`],
    ['require', `const m = require('${MAP}')`],
    ['type import', `type M = import('${MAP}').Loaders`],
  ]

  for (const [label, code] of forms) {
    it(`catches a ${label} outside components/icon`, () => {
      const messages = lint(code, 'src/shared/probe.ts')
      expect(messages.filter((m) => /R-7-1/.test(m.message)), label).toHaveLength(1)
    })

    it(`allows a ${label} inside components/icon`, () => {
      const messages = lint(code, 'src/components/icon/lib.ts')
      expect(messages.filter((m) => /R-7-1/.test(m.message)), label).toEqual([])
    })
  }

  it('leaves an unrelated dynamic import alone', () => {
    const code = "export const m = () => import('../../icons/data/spinner.js')"
    expect(lint(code, 'src/shared/probe.ts').filter((m) => /R-7-1/.test(m.message))).toEqual([])
  })
})

describe('gaps the general review found', () => {
  const fails = (cls: string, rule: string) => {
    const got = ids(`<div className="${cls}" />`)
    expect(got, cls).toContain(rule)
  }
  const passes = (cls: string) => {
    expect(ids(`<div className="${cls}" />`), cls).toEqual([])
  }

  it('catches a negative physical margin or offset', () => {
    fails('-ml-2', 'topclass/logical-properties-only')
    fails('-mr-4', 'topclass/logical-properties-only')
    fails('absolute -left-1', 'topclass/logical-properties-only')
  })

  it('catches float and clear, which are physical with no logical alias in use', () => {
    fails('float-left', 'topclass/logical-properties-only')
    fails('clear-right', 'topclass/logical-properties-only')
  })

  it('catches the fixed colours that break theming', () => {
    fails('bg-white', 'topclass/semantic-classes-only')
    fails('text-black', 'topclass/semantic-classes-only')
    fails('border-white', 'topclass/semantic-classes-only')
  })

  it('leaves the mode-agnostic keywords alone, which are not palette colours', () => {
    passes('bg-transparent')
    passes('fill-current')
    passes('text-inherit')
  })

  it('catches a palette colour behind a variant prefix', () => {
    fails('md:bg-red-500', 'topclass/semantic-classes-only')
    fails('group-hover:text-violet-600', 'topclass/semantic-classes-only')
  })

  it('catches the dark variant behind another variant, not only at the start', () => {
    fails('md:dark:bg-surface', 'topclass/semantic-classes-only')
    fails('group-hover:dark:text-body', 'topclass/semantic-classes-only')
  })

  it('catches a hand-written state behind a variant prefix', () => {
    fails('md:hover:bg-primary-soft', 'topclass/shared-class-constants')
    fails('sm:focus-visible:outline-ring', 'topclass/shared-class-constants')
  })

  it('catches border-2, which R-5.2-4 names explicitly', () => {
    fails('border-2', 'topclass/shared-class-constants')
    fails('border-4', 'topclass/shared-class-constants')
  })

  it('catches the Tailwind v4 radius names the list had missed', () => {
    fails('rounded-xs', 'topclass/shared-class-constants')
    fails('rounded-4xl', 'topclass/shared-class-constants')
  })

  it('still accepts the semantic and logical forms', () => {
    passes('ps-4 me-2 text-start border-s rounded-s-control')
    passes('bg-primary-solid text-body border-line')
    passes('h-control-md rounded-box')
  })
})

describe('a test expectation is named, never derived from what it tests', () => {
  const RULE = 'topclass/no-derived-expectations'
  const test = (code: string) => ids(`import { CONSTANT } from './x.js'\n${code}`, 'a.test.ts')

  const derived: [string, string][] = [
    ['splitting the constant under test', "expect(list).toEqual(CONSTANT.split(' '))"],
    ['splitting a member of it', "expect(list).toEqual(CONSTANT.md.split(' '))"],
    ['Object.keys of it', 'expect(keys).toEqual(Object.keys(CONSTANT))'],
    ['Object.values of it', 'expect(v).toEqual(Object.values(CONSTANT))'],
    ['a length taken from it', "expect(list).toHaveLength(CONSTANT.split(' ').length)"],
    ['a directory listing', "expect(files).toEqual(readdirSync(DIR))"],
    ['toContain on a derived list', "expect(list).toContain(CONSTANT.split(' ')[0])"],
  ]

  for (const [label, code] of derived) {
    it(`rejects ${label}`, () => {
      expect(test(code), code).toContain(RULE)
    })
  }

  const named: [string, string][] = [
    ['a literal array', "expect(list).toEqual(['h-control-md', 'px-pad-x-md'])"],
    ['a literal string', "expect(cls).toBe('h-control-md')"],
    ['a local fixture built in the file', "const WANTED = ['a', 'b']\nexpect(list).toEqual(WANTED)"],
    ['splitting the value under test, which is the actual side', "expect(CONSTANT.split(' ')).toContain('x')"],
  ]

  for (const [label, code] of named) {
    it(`allows ${label}`, () => {
      expect(test(code), code).not.toContain(RULE)
    })
  }

  it('leaves files that are not tests alone', () => {
    expect(ids("import { CONSTANT } from './x.js'\nexpect(a).toEqual(CONSTANT.split(' '))", 'lib.ts'))
      .not.toContain(RULE)
  })
})

describe('a class string is caught wherever it sits', () => {
  const cases: [string, string][] = [
    ['a lowercase local const', 'const base = "pl-4 flex"'],
    ['a camelCase object value', 'const styles = { root: "ml-2 flex" }'],
    ['a string returned from a helper', 'function pick() { return "text-left flex" }'],
    ['an arrow body', 'const pick = () => "tracking-wide flex"'],
    ['an array member', 'const parts = ["bg-red-500 flex", "x"]'],
    ['a default parameter', 'function f(cls = "rounded-md flex") { return cls }'],
    ['a plain class attribute', '<div class="pl-4 flex" />'],
  ]

  for (const [label, code] of cases) {
    it(`catches ${label}`, () => {
      const found = ids(code)
      expect(found.filter((r) => r?.startsWith('topclass/')), label).not.toEqual([])
    })
  }

  it('leaves prose, URLs and paths alone', () => {
    for (const code of [
      'const msg = "Close the dialog"',
      'const url = "https://example.com/a-b-c"',
      'const file = "./lib/use-thing.js"',
      'const id = "data-testid"',
      'const q = "(width < 48rem)"',
    ]) {
      expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
    }
  })
})

describe('R-5.2-5: style only sets a --tc-* variable', () => {
  const bad: [string, string][] = [
    ['a CSS property', '<div style={{ marginLeft: 8 }} />'],
    ['a colour', '<div style={{ color: "red" }} />'],
    ['a quoted property', '<div style={{ "font-size": 12 }} />'],
    ['a spread, which hides what it sets', '<div style={{ ...extra }} />'],
    ['a call, which the rule cannot read', '<div style={makeStyle()} />'],
  ]
  for (const [label, code] of bad) {
    it(`fails on ${label}`, () => {
      expect(ids(code), code).toContain('topclass/style-sets-tokens-only')
    })
  }

  it('allows a --tc-* knob, which is the one real use', () => {
    const code = '<div style={{ "--tc-list-rows": 5 }} />'
    expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
  })

  it('allows passing the consumer style straight through', () => {
    expect(ids('<div style={style} />').filter((r) => r?.startsWith('topclass/'))).toEqual([])
  })
})

describe('R-5.7-6: states are presence attributes', () => {
  const bad: [string, string][] = [
    ['data-state on an element', '<div data-state="open" />'],
    ['data-state in a props object', 'const p = { "data-state": "open" }'],
    ['a state given a value', '<div data-open="true" />'],
    ['a loading state given a value', 'const p = { "data-loading": "yes" }'],
  ]
  for (const [label, code] of bad) {
    it(`fails on ${label}`, () => {
      expect(ids(code), code).toContain('topclass/presence-state-attributes')
    })
  }

  const good = [
    '<div data-open />',
    'const p = { "data-open": "" }',
    '<div data-variant="soft" data-size="md" data-tone="primary" />',
    'const p = { "data-loading": loading ? "" : undefined }',
  ]
  for (const code of good) {
    it(`allows ${code}`, () => {
      expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
    })
  }
})

describe('R-9.2-3: parts are exported flat', () => {
  it('fails on an object of components', () => {
    const code = 'const Dialog = { Root: DialogRoot, Header: DialogHeader }'
    expect(ids(code), code).toContain('topclass/flat-part-exports')
  })

  it('allows a lookup of class strings, which is not a namespace', () => {
    const code = 'const TONE = { primary: "tone-primary", danger: "tone-danger" }'
    expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
  })

  it('allows a single-key object, which no one dots into as a namespace', () => {
    const code = 'const Wrapper = { Root: Thing }'
    expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
  })
})

describe('R-9.2-4: the root part is named Root', () => {
  it('fails when the root carries the bare name', () => {
    const code = 'export function Card() { return null }\nexport function CardHeader() { return null }'
    expect(ids(code), code).toContain('topclass/root-part-is-named-root')
  })

  it('allows a component with no parts, which needs no suffix', () => {
    const code = 'export function Button() { return null }'
    expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
  })

  it('allows the suffixed form', () => {
    const code = 'export function CardRoot() { return null }\nexport function CardHeader() { return null }'
    expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
  })

  it('catches the arrow form too, not only a function declaration', () => {
    const code = 'export const Card = () => null\nexport const CardBody = () => null'
    expect(ids(code), code).toContain('topclass/root-part-is-named-root')
  })
})

describe('R-5.11-1: built-in text comes from labels', () => {
  const bad: [string, string][] = [
    ['visible text', '<button>Close</button>'],
    ['an aria-label', '<button aria-label="Close dialog" />'],
    ['alt text', '<img alt="A chart" />'],
    ['a placeholder', '<input placeholder="Search" />'],
  ]
  for (const [label, code] of bad) {
    it(`fails on ${label}`, () => {
      expect(ids(code), code).toContain('topclass/text-comes-from-labels')
    })
  }

  const good = [
    '<button>{labels.close}</button>',
    '<button aria-label={labels.close} />',
    '<span>{count}</span>',
    '<span>&times;</span>',
    '<img alt={labels.chartAlt} />',
  ]
  for (const code of good) {
    it(`allows ${code}`, () => {
      expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
    })
  }
})

// Each of these is legitimate code a component will contain, and each was a false
// positive the first time the five rules above were written.
describe('the new rules leave real component code alone', () => {
  const allowed: [string, string][] = [
    ['merging the consumer style with a knob', '<div style={{ ...style, "--tc-list-rows": rows }} />'],
    ['merging from a member expression', '<div style={{ ...props.style, "--tc-rows": 4 }} />'],
    ['passing the consumer style straight through', '<div style={props.style} />'],
    ['a knob whose value is a member expression', '<div style={{ "--tc-rows": props.rows }} />'],
    ['a skeleton beside its component', 'export function Card() { return null }\nexport function CardSkeleton() { return null }'],
    ['an empty state beside its component', 'export function List() { return null }\nexport function ListEmptyState() { return null }'],
    ['an error state beside its component', 'export function List() { return null }\nexport function ListErrorState() { return null }'],
    ['a client half beside its server half', 'export function Tabs() { return null }\nexport function TabsClient() { return null }'],
    ['a class lookup that happens to use PascalCase keys', 'const Tone = { Primary: "tone-primary", Danger: "tone-danger" }'],
    ['a numeric data attribute that is not a state', '<div data-index="2" />'],
    ['an entity rather than prose', '<span>&times;</span>'],
  ]
  for (const [label, code] of allowed) {
    it(`allows ${label}`, () => {
      expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
    })
  }

  it('still catches the real root, so the exemptions did not disarm it', () => {
    const code = 'export function Card() { return null }\nexport function CardSkeleton() { return null }\nexport function CardHeader() { return null }'
    expect(ids(code)).toContain('topclass/root-part-is-named-root')
  })

  it('still catches a namespace of component references', () => {
    expect(ids('const Dialog = { Root: DialogRoot, Header: DialogHeader }'))
      .toContain('topclass/flat-part-exports')
  })

  it('still catches a spread that is not the consumer style', () => {
    expect(ids('<div style={{ ...theme }} />')).toContain('topclass/style-sets-tokens-only')
  })
})
