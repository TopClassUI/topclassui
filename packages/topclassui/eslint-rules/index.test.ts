import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

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
      'topclass/no-physical-placement': 'error',
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
    ['bg-[red]', '<div className="bg-[red]" />', 'topclass/semantic-classes-only'],
    ['bg-[CanvasText] with no variant', '<div className="bg-[CanvasText]" />', 'topclass/semantic-classes-only'],
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

describe('R-5.2-1: a colour in an arbitrary value', () => {
  const RULE = 'topclass/semantic-classes-only'
  /** The message ids this rule reports for one class: none, `arbitrary` or `system`. */
  const found = (cls: string) =>
    lint(`<div className="${cls}" />`).filter((m) => m.ruleId === RULE).map((m) => m.messageId)

  const NAMED = [
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond',
    'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue',
    'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey',
    'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon',
    'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
    'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
    'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink',
    'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
    'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
    'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
    'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
    'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
    'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace',
    'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise',
    'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple',
    'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
    'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal',
    'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
  ]

  const SYSTEM = [
    'Canvas', 'CanvasText', 'LinkText', 'VisitedText', 'ActiveText', 'ButtonFace', 'ButtonText', 'ButtonBorder',
    'Field', 'FieldText', 'Highlight', 'HighlightText', 'SelectedItem', 'SelectedItemText', 'Mark', 'MarkText',
    'GrayText', 'AccentColor', 'AccentColorText',
  ]

  it('refuses every one of the 148 CSS named colours', () => {
    expect(NAMED).toHaveLength(148)
    for (const name of NAMED) expect(found(`bg-[${name}]`), name).toEqual(['arbitrary'])
  })

  const fixed: [string, string][] = [
    ['a named colour on text', 'text-[rebeccapurple]'],
    ['a named colour on a border', 'border-[tomato]'],
    ['a named colour in capitals, since a CSS keyword has no case', 'bg-[RED]'],
    ['a named colour with an opacity', 'bg-[red]/50'],
    ['a named colour with an arbitrary opacity', 'bg-[red]/[0.5]'],
    ['a named colour behind a variant', 'md:bg-[red]'],
    ['a named colour marked important', '!bg-[red]'],
    ['a named colour marked important at the end', 'bg-[red]!'],
    ['a short hex', 'bg-[#fff]'],
    ['a hex with alpha', 'bg-[#ffffff80]'],
    ['rgb()', 'bg-[rgb(0,0,0)]'],
    ['rgba()', 'bg-[rgba(0,0,0,0.5)]'],
    ['hsl()', 'bg-[hsl(0_0%_0%)]'],
    ['hwb()', 'bg-[hwb(0_0%_0%)]'],
    ['lab()', 'bg-[lab(50_0_0)]'],
    ['lch()', 'bg-[lch(50_0_0)]'],
    ['oklab()', 'bg-[oklab(0.5_0_0)]'],
    ['oklch()', 'bg-[oklch(0.5_0_0)]'],
    ['color()', 'bg-[color(display-p3_1_0_0)]'],
    ['color-mix()', 'bg-[color-mix(in_oklab,var(--tc-primary),transparent)]'],
    ['light-dark()', 'bg-[light-dark(var(--tc-page),var(--tc-body))]'],
    ['a gradient stop, which the first list of prefixes had missed', 'from-[#fff]'],
    ['an inset ring', 'inset-ring-[red]'],
    ['a logical border side', 'border-s-[red]'],
    ['a decoration', 'decoration-[red]'],
    ['a value declared a colour', 'bg-[color:red]'],
    ['a value declared a colour that reads a variable', 'bg-[color:var(--tc-primary)]'],
    ['an arbitrary property', '[color:red]'],
    ['an arbitrary property with a hex', '[background-color:#fff]'],
    ['a knob set to a named colour', '[--tc-ring:red]'],
    ['a named colour behind forced-colors, which exempts system colours only', 'forced-colors:bg-[red]'],
    ['a hex behind forced-colors', 'forced-colors:bg-[#fff]'],
    ['a knob set to a named colour behind forced-colors', 'forced-colors:[--tc-ring:red]'],
  ]
  for (const [label, cls] of fixed) {
    it(`refuses ${label}`, () => {
      expect(found(cls), cls).toEqual(['arbitrary'])
    })
  }

  for (const name of SYSTEM) {
    it(`accepts ${name} behind forced-colors and refuses it anywhere else`, () => {
      expect(found(`forced-colors:bg-[${name}]`), name).toEqual([])
      expect(found(`bg-[${name}]`), name).toEqual(['system'])
    })
  }

  const unforced: [string, string][] = [
    ['behind another variant', 'md:bg-[CanvasText]'],
    ['behind the opposite variant', 'not-forced-colors:bg-[CanvasText]'],
    ['on a border', 'border-[Highlight]'],
    ['in lower case', 'bg-[canvastext]'],
    ['with an opacity', 'bg-[CanvasText]/50'],
    ['declared a colour', 'bg-[color:Highlight]'],
    ['in a knob', '[--tc-ring:Highlight]'],
    ['in an arbitrary property', '[outline-color:Highlight]'],
  ]
  for (const [label, cls] of unforced) {
    it(`refuses a system colour ${label} without forced-colors`, () => {
      expect(found(cls), cls).toEqual(['system'])
    })
  }

  it('says that a system colour needs the forced-colors variant', () => {
    const messages = lint('<div className="md:bg-[CanvasText]" />').filter((m) => m.ruleId === RULE)
    expect(messages.map((m) => m.message)).toEqual([
      'R-5.2-1: "md:bg-[CanvasText]" is a CSS system colour, which is allowed only behind the forced-colors: variant.',
    ])
  })

  it('names the whole class when the colour is fixed', () => {
    const messages = lint('<div className="flex md:bg-[red]/50" />').filter((m) => m.ruleId === RULE)
    expect(messages.map((m) => m.message)).toEqual([
      'R-5.2-1: "md:bg-[red]/50" is an arbitrary colour. Use a semantic token.',
    ])
  })

  const forced: [string, string][] = [
    ['the Timeline dot', 'forced-colors:border-[CanvasText] forced-colors:bg-[CanvasText]'],
    ['the variant first', 'forced-colors:data-highlighted:bg-[Highlight]'],
    ['the variant last', 'data-highlighted:forced-colors:bg-[Highlight]'],
    ['the variant between two others', 'md:forced-colors:aria-invalid:border-[Highlight]'],
    ['the variant beside an arbitrary one', 'forced-colors:data-[side=top]:bg-[Highlight]'],
    ['a knob', 'forced-colors:[--tc-ring:Highlight]'],
    ['an arbitrary property', 'forced-colors:[outline-color:Highlight]'],
    ['lower case', 'forced-colors:bg-[canvastext]'],
    ['a value declared a colour', 'forced-colors:bg-[color:Highlight]'],
  ]
  for (const [label, cls] of forced) {
    it(`accepts a system colour behind forced-colors: ${label}`, () => {
      expect(lint(`<div className="${cls}" />`), cls).toEqual([])
    })
  }

  const untouched: [string, string][] = [
    ['a variable', 'bg-[var(--tc-primary)]'],
    ['a variable with a fallback', 'min-h-[var(--tc-target-min,24px)]'],
    ['a length', 'h-[1em]'],
    ['a calculation', 'my-[calc((1lh-1em)/2)]'],
    ['a font size', 'pointer-coarse:text-[max(1rem,16px)]'],
    ['a width', 'w-[min(100%,var(--tc-input-width))]'],
    ['a ring width', 'aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]'],
    ['the typed variable form', 'border-(length:--tc-line-width)'],
    ['the typed variable form behind forced-colors', 'forced-colors:outline-(length:--tc-line-width)'],
    ['a value declared a length', 'text-[length:var(--tc-font-size)]'],
    ['an arbitrary property that is not a colour', 'data-ltr:placeholder:[unicode-bidi:plaintext]'],
    ['a knob set to a variable', '[--tc-ring:var(--tc-line-strong)]'],
    ['a list of property names', 'transition-[color,background-color,border-color,outline-color,opacity,translate]'],
    ['an arbitrary variant that names a colour', 'data-[tone=red]:bg-surface'],
    ['an arbitrary variant with a colon inside', 'supports-[color:red]:bg-surface'],
    ['transparent, which is mode-agnostic in a bracket as outside one', 'bg-[transparent]'],
    ['currentColor', 'text-[currentColor]'],
    ['inherit', 'text-[inherit]'],
  ]
  for (const [label, cls] of untouched) {
    it(`leaves ${label} alone`, () => {
      expect(found(cls), cls).toEqual([])
    })
  }

  it('catches a colour wherever the class string sits', () => {
    expect(ids('const FORCED = "bg-[CanvasText] flex"')).toContain(RULE)
    expect(ids('const DOT = { done: "block bg-[red]" }')).toContain(RULE)
    expect(ids('const dot = "block bg-[red]"')).toContain(RULE)
    expect(ids('const FORCED = "forced-colors:bg-[CanvasText] flex"')).toEqual([])
  })

  it('still catches a hex spliced into a template', () => {
    expect(ids('const c = cn(`bg-[#${hex}]`)')).toContain(RULE)
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

describe('R-5.2-6: data and aria variants are bare', () => {
  const bad: [string, string, string][] = [
    ['data-[open]:', '<div className="data-[open]:opacity-100" />', '"data-open:"'],
    ['aria-[busy]:', '<div className="aria-[busy]:cursor-progress" />', '"aria-busy:"'],
    ['group-data-[panel-open]:', '<div className="group-data-[panel-open]:block" />', '"group-data-panel-open:"'],
    ['peer-aria-[invalid]:', 'const c = cn("peer-aria-[invalid]:text-danger")', '"peer-aria-invalid:"'],
    ['a named group', '<div className="group-data-[open]/item:block" />', '"group-data-open/item:"'],
    ['a stacked variant', 'const BOX_CLASSES = "p-2 rtl:data-[disabled]:opacity-50"', '"data-disabled:"'],
    ['a class list outside a class context', 'const x = { root: "flex data-[highlighted]:bg-hover" }', '"data-highlighted:"'],
    ['an arbitrary selector', '<div className="[&[data-open]]:block" />', '"data-open:"'],
    ['an arbitrary :has()', '<div className="[&:has([data-open])]:block" />', '"has-data-open:"'],
    ['an arbitrary :not()', '<div className="[&:not([data-disabled])]:block" />', '"not-data-disabled:"'],
    ['has-[[data-x]]', '<div className="has-[[data-open]]:block" />', '"has-data-open:"'],
    ['not-[[data-x]] under a group', '<div className="group-not-[[data-open]]:block" />', '"group-not-data-open:"'],
    ['an arbitrary selector outside a class context', 'const x = "flex [&[data-open]]:block"', '"data-open:"'],
    ['a trailing underscore', '<div className="data-[open_]:block" />', '"data-open:"'],
  ]
  for (const [label, code, hint] of bad) {
    it(`fails on ${label} and names the bare form`, () => {
      const messages = lint(code).filter((m) => m.ruleId === 'topclass/bare-data-variants')
      expect(messages, code).toHaveLength(1)
      expect(messages[0]?.message, code).toContain(hint)
    })
  }

  const good = [
    '<div className="data-open:opacity-100 aria-busy:cursor-progress group-data-panel-open:block" />',
    '<div className="data-[state=open]:block" />',
    '<div className="data-[size=custom]:h-auto aria-[current=page]:font-medium" />',
    '<div className="group-data-[side=top]/item:block" />',
    '<div className="data-open:[--tc-x:1]" />',
    '<div className="[&:is(button,a)]:block [&_[data-open]]:block has-[input:disabled]:opacity-50" />',
    '<div className="[&[data-side=top]]:block aria-[sort=ascending]:font-medium" />',
    '<div className="data-[_]:block" />',
  ]
  for (const code of good) {
    it(`allows ${code}`, () => {
      expect(ids(code).filter((r) => r === 'topclass/bare-data-variants'), code).toEqual([])
    })
  }
})

describe('R-5.2-6: what the bare form means', () => {
  const only = (code: string) => lint(code).filter((m) => m.ruleId === 'topclass/bare-data-variants')

  const ariaCases: [string, string][] = [
    ['<div className="aria-[busy]:cursor-progress" />', '"aria-busy:"'],
    ['<div className="aria-[busy=true]:cursor-progress" />', '"aria-busy:"'],
    ['<div className="aria-[busy=\'true\']:cursor-progress" />', '"aria-busy:"'],
    ['const c = cn(\'aria-[busy="true"]:cursor-progress\')', '"aria-busy:"'],
    ['<div className="[&[aria-busy]]:cursor-progress" />', '"aria-busy:"'],
    ['<div className="[&[aria-busy=true]]:cursor-progress" />', '"aria-busy:"'],
  ]
  for (const [code, hint] of ariaCases) {
    it(`says the bare aria form matches only "true": ${code}`, () => {
      const messages = only(code)
      expect(messages, code).toHaveLength(1)
      expect(messages[0]?.message, code).toContain(hint)
      expect(messages[0]?.message, code).toContain('which matches aria-busy="true"; set the attribute only as "true" or absent')
    })
  }

  it('warns that in- drops the specificity of [[data-x]_&]', () => {
    const messages = only('<div className="[[data-open]_&]:block" />')
    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain('"in-data-open:"')
    expect(messages[0]?.message).toContain('loses its 0,1,0 specificity')
  })

  it('does not call a data- rewrite anything but equivalent', () => {
    const messages = only('<div className="data-[open]:block" />')
    expect(messages[0]?.message).toBe('R-5.2-6: "data-[open]:" brackets a bare name. Write "data-open:"; brackets only hold name=value.')
  })

  it('reports every bracketed name in a string, not only the first', () => {
    const messages = only('<div className="data-[open]:block aria-[busy]:opacity-50 group-data-[active]:flex" />')
    expect(messages.map((m) => m.message.split('"')[3])).toEqual(['data-open:', 'aria-busy:', 'group-data-active:'])
  })

  it('leaves aria-[x=false] and data-[x=true], whose bare forms mean something else', () => {
    expect(only('<div className="aria-[busy=false]:block data-[open=true]:block [&[data-open=true]]:block" />')).toEqual([])
  })
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

describe('R-10.5-2: a tooltip is plain text', () => {
  const tooltip = (code: string) => ids(code).filter((r) => r === 'topclass/tooltip-content-is-text')

  const bad: [string, string][] = [
    ['a link', '<TooltipPopup>Read the <a href="/docs">docs</a></TooltipPopup>'],
    ['a control', '<TooltipPopup><button>Undo</button></TooltipPopup>'],
    ['a component', '<TooltipPopup><Kbd>K</Kbd></TooltipPopup>'],
    ['a fragment', '<TooltipPopup><>Copy</></TooltipPopup>'],
    ['an element behind a condition', '<TooltipPopup>{ok && <strong>Saved</strong>}</TooltipPopup>'],
    ['elements from a map', '<TooltipPopup>{rows.map((r) => <p key={r}>{r}</p>)}</TooltipPopup>'],
    ['an element passed as the children prop', '<TooltipPopup children={<a href="/">Home</a>} />'],
    ['an element spread in as children', '<TooltipPopup {...{ children: <a href="/">Home</a> }} />'],
    ['an import renamed on the way in', 'import { TooltipPopup as Tip } from "x"\nconst t = <Tip><a href="/">Home</a></Tip>'],
  ]
  for (const [label, code] of bad) {
    it(`fails on ${label}`, () => {
      expect(tooltip(code), code).toEqual(['topclass/tooltip-content-is-text'])
    })
  }

  it('names the element and the way out in the message', () => {
    const [message] = lint('<TooltipPopup><a href="/">Home</a></TooltipPopup>')
      .filter((m) => m.ruleId === 'topclass/tooltip-content-is-text')
    expect(message?.message).toBe(
      'R-10.5-2: <a> inside TooltipPopup makes it more than text. A link, a control or rich content belongs in a Popover.')
  })

  const good = [
    '<TooltipPopup>Copy link</TooltipPopup>',
    '<TooltipPopup>Delete {count} rows</TooltipPopup>',
    '<TooltipPopup placement="bottom-start">{FILE}</TooltipPopup>',
    '<TooltipPopup>{labels.copy}</TooltipPopup>',
    '<TooltipTrigger render={<Button>Save</Button>} />',
    '<PopoverPopup><a href="/docs">Docs</a></PopoverPopup>',
  ]
  for (const code of good) {
    it(`allows ${code}`, () => {
      expect(tooltip(code), code).toEqual([])
    })
  }
})

describe('R-5.7-5: public types are derived from Base UI at the seam', () => {
  const RULE = 'topclass/props-derived-at-the-seam'
  const IMPORT = "import type { Dialog as Base } from '@base-ui/react/dialog'\n"
  const own = (code: string, filename = 'src/components/x/types.ts') =>
    lint(code, filename).filter((m) => m.ruleId === RULE).map((m) => m.messageId)

  const bad: [string, string, string][] = [
    ['a type re-exported from Base UI', "export type { DialogRootProps } from '@base-ui/react/dialog'", 'reexport'],
    ['a namespace re-exported from Base UI', "export * from '@base-ui/react/dialog'", 'reexport'],
    ['an imported Base UI name exported again', `${IMPORT}export type { Base }`, 'reexport'],
    ['the props aliased whole', `${IMPORT}export type DialogRootProps = Base.Root.Props`, 'bare'],
    ['the props in an intersection', `${IMPORT}export type DialogRootProps = Base.Root.Props & { size?: string }`, 'bare'],
    ['an interface that extends the props', `${IMPORT}export interface DialogRootProps extends Base.Root.Props {}`, 'bare'],
    ['an Omit that keeps className', `${IMPORT}export type DialogRootProps = Omit<Base.Root.Props, 'handle'>`, 'omit'],
    ['an Omit whose alias of keys keeps className', `${IMPORT}type Owned = 'handle' | 'children'\nexport type P = Omit<Base.Root.Props, Owned>`, 'omit'],
    ['a pinned alias omitted without className', `${IMPORT}type BaseRoot = Base.Root.Props<string>\nexport type P = Omit<BaseRoot, 'children'>`, 'omit'],
    ['a pinned alias that is exported', `${IMPORT}export type BaseRoot = Base.Root.Props<string>`, 'bare'],
    ['a Pick that takes className', `${IMPORT}export type P = Pick<Base.Root.Props, 'open' | 'className'>`, 'pick'],
    ['a namespace with Props directly on it', "import type { RadioGroup } from '@base-ui/react/radio-group'\nexport type P = RadioGroup.Props & {}", 'bare'],
  ]
  for (const [label, code, messageId] of bad) {
    it(`fails on ${label}`, () => {
      expect(own(code), code).toEqual([messageId])
    })
  }

  const good: [string, string][] = [
    ['the alias the rule names', `${IMPORT}export type DialogRootProps = Omit<Base.Root.Props, 'className'> & { size?: string }`],
    ['className among other omitted keys', `${IMPORT}export type P = Omit<Base.Trigger.Props, 'className' | 'handle' | 'payload'>`],
    ['className through a local alias of keys', `${IMPORT}type Removed = 'handle'\ntype Owned = 'className' | Removed\nexport type P = Omit<Base.Root.Props, Owned>`],
    ['a key alias declared after its use', `${IMPORT}export type P = Omit<Base.Root.Props, Owned>\ntype Owned = 'className' | 'ref'`],
    ['a private alias that pins the generics', `${IMPORT}type BaseRoot = Base.Root.Props<string>\nexport type P = Omit<BaseRoot, 'className'>`],
    ['a Pick of named props', `${IMPORT}export type P = Pick<Base.Portal.Props, 'container' | 'keepMounted'>`],
    ['one prop read by index', `${IMPORT}export type DialogModal = NonNullable<Base.Root.Props['modal']>`],
    ['the keys of the props', `${IMPORT}type Owned = keyof Base.Root.Props`],
    ['an interface that extends the Omit', `${IMPORT}export interface P extends Omit<Base.Root.Props, 'className'> {}`],
    ['an alias of a Base UI type that is not props', `${IMPORT}export type DialogChangeDetails = Base.Root.ChangeEventDetails`],
    ['a Props name from anywhere but Base UI', "import type { Thing } from './thing.js'\nexport type P = Thing.Props"],
  ]
  for (const [label, code] of good) {
    it(`allows ${label}`, () => {
      expect(own(code), code).toEqual([])
    })
  }

  it('reads only types.ts for the derivation, where R-8.3-4 puts every prop type', () => {
    const code = `${IMPORT}export type P = Base.Root.Props`
    expect(own(code, 'src/shared/overlay.ts')).toEqual([])
  })

  it('refuses a Base UI re-export in any file, not only types.ts', () => {
    const code = "export type { DialogRootProps } from '@base-ui/react/dialog'"
    expect(own(code, 'src/components/dialog/index.tsx')).toEqual(['reexport'])
  })
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

describe('R-5.3-2: directional motion follows --tc-dir', () => {
  const RULE = 'topclass/dir-aware-transforms'
  const fails: [string, string][] = [
    ['translate-x-full', '<div className="translate-x-full" />'],
    ['a negative translate-x', '<div className="-translate-x-1/2" />'],
    ['translate-x behind a variant', '<div className="data-open:translate-x-4" />'],
    ['translate on both axes', '<div className="translate-1/2" />'],
    ['an arbitrary translate-x', '<div className="translate-x-[12px]" />'],
    ['a translate-x variable', '<div className="translate-x-(--offset)" />'],
    ['an arbitrary pair with a physical x', '<div className="translate-[10px_0]" />'],
    ['translateX in an arbitrary transform', '<div className="transform-[translateX(100%)]" />'],
    ['translate() in an arbitrary transform', '<div className="transform-[translate(100%,0)]" />'],
    ['translate3d in a property', '<div className="[transform:translate3d(4px,0,0)]" />'],
    ['the translate property', '<div className="[translate:4px_0]" />'],
    ['origin-left', '<div className="origin-left" />'],
    ['origin-right', '<div className="origin-right" />'],
    ['origin-top-left', '<div className="origin-top-left" />'],
    ['an arbitrary origin on a side', '<div className="origin-[left_top]" />'],
    ['a transform-origin property on a side', '<div className="[transform-origin:right]" />'],
    ['bg-linear-to-r', '<div className="bg-linear-to-r" />'],
    ['bg-linear-to-l', '<div className="bg-linear-to-l" />'],
    ['bg-linear-to-tr', '<div className="bg-linear-to-tr" />'],
    ['bg-gradient-to-r', '<div className="bg-gradient-to-r" />'],
    ['bg-gradient-to-l', '<div className="bg-gradient-to-l" />'],
    ['an inline-axis angle', '<div className="bg-linear-90" />'],
    ['a negative angle', '<div className="-bg-linear-45" />'],
    ['an arbitrary angle', '<div className="bg-linear-[45deg,var(--a),var(--b)]" />'],
    ['a linear-gradient to a side', '<div className="bg-[linear-gradient(to_right,var(--a),var(--b))]" />'],
    ['rtl: on a margin', '<div className="rtl:ms-2" />'],
    ['rtl: on a translate', '<div className="rtl:-translate-x-full" />'],
    ['ltr: on anything', '<div className="ltr:rotate-180" />'],
    ['an arbitrary dir variant', '<div className="[[dir=rtl]_&]:ms-2" />'],
    ['a :dir() variant', '<div className="[&:dir(rtl)]:scale-x-[-1]" />'],
    ['a mirror on rtl:', '<div className="rtl:-scale-x-50" />'],
    ['the icon mirror on rtl: rather than --tc-dir', '<svg className="inline-block shrink-0 rtl:-scale-x-100" />'],
    ['object-left with no rtl mirror', '<img className="object-left" />'],
    ['bg-right with no rtl mirror', '<div className="bg-right" />'],
    ['a class list in a const', 'const SLIDE = "transition-transform translate-x-full"'],
  ]
  for (const [label, code] of fails) {
    it(`fails on ${label}`, () => {
      expect(ids(code), code).toContain(RULE)
    })
  }

  const passes: [string, string][] = [
    ['a translate-x times --tc-dir', '<div className="translate-x-[calc(100%*var(--tc-dir))]" />'],
    ['the switch thumb', '<span className="group-data-checked/toggle:translate-x-[calc((100cqw-100%)*var(--tc-dir))]" />'],
    ['the drawer sheet', '<div className="data-starting-style:transform-[translateX(calc(100%*var(--tc-dir)))]" />'],
    ['a block-axis translate', '<div className="-translate-y-1/2 translate-y-full" />'],
    ['a block-axis translate function', '<div className="transform-[translateY(100%)]" />'],
    ['a zero translate', '<div className="translate-x-0 translate-none" />'],
    ['the swipe offset Base UI measures', '<div className="transform-[translate(var(--drawer-swipe-movement-x,0px),var(--drawer-swipe-movement-y,0px))]" />'],
    ['the origin Base UI measures', '<div className="origin-(--transform-origin)" />'],
    ['a centre or block-edge origin', '<div className="origin-center origin-top origin-bottom" />'],
    ['a vertical gradient', '<div className="bg-linear-to-b bg-gradient-to-t bg-linear-180" />'],
    ['a gradient angle times --tc-dir', '<div className="bg-linear-[calc(90deg*var(--tc-dir)),var(--a),var(--b)]" />'],
    ['the icon mirror times --tc-dir', '<svg className="inline-block shrink-0 scale-x-(--tc-dir)" />'],
    ['an object position with its rtl mirror', '<img className="object-left rtl:object-right" />'],
    ['a bg position with its rtl mirror', '<div className="bg-left-top rtl:bg-right-top" />'],
    ['a direction-neutral position', '<img className="object-center bg-top" />'],
    ['the data-ltr attribute variant, which is not ltr:', '<input className="data-ltr:text-match-parent" />'],
    ['a block-axis rotation', '<div className="group-data-panel-open:rotate-180" />'],
  ]
  for (const [label, code] of passes) {
    it(`allows ${label}`, () => {
      expect(ids(code), code).not.toContain(RULE)
    })
  }
})

describe('R-5.3-2 rejects the real sources once their direction is taken out', () => {
  const RULE = 'topclass/dir-aware-transforms'
  const sources = ['src/components/drawer/classes.ts', 'src/components/switch/classes.ts', 'src/components/svg/index.tsx']
  for (const file of sources) {
    const code = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
    it(`${file} passes as written`, () => {
      expect(ids(code, file)).not.toContain(RULE)
    })
    it(`${file} fails with --tc-dir removed or the mirror put back on rtl:`, () => {
      const broken = code.replaceAll('*var(--tc-dir)', '').replaceAll('scale-x-(--tc-dir)', 'rtl:-scale-x-100')
      expect(ids(broken, file)).toContain(RULE)
    })
  }
})

describe('R-8.5-2: components never fetch, cache or paginate', () => {
  const RULE = 'topclass/no-fetch-in-components'
  const only = (code: string, file = 'src/components/list/hook.ts') =>
    lint(code, file).filter((m) => m.ruleId === RULE)

  const bad: [string, string][] = [
    ['fetch()', "export const load = () => fetch('/api/items')"],
    ['window.fetch()', "export const load = () => window.fetch('/api/items')"],
    ['globalThis.fetch()', "export const load = () => globalThis.fetch('/api/items')"],
    ['XMLHttpRequest', 'export const x = new XMLHttpRequest()'],
    ['new Request()', "export const r = new Request('/api/items')"],
    ['localStorage', "export const v = localStorage.getItem('k')"],
    ['window.localStorage', "export const v = window.localStorage.getItem('k')"],
    ['sessionStorage', "sessionStorage.setItem('k', 'v')"],
    ['indexedDB', "export const db = indexedDB.open('items')"],
    ['caches', "export const c = caches.open('items')"],
    ["React's cache imported", "import { cache } from 'react'\nexport const get = cache(() => 1)"],
    ["React's cache renamed", "import { cache as memo } from 'react'\nexport const get = memo(() => 1)"],
    ['React.cache()', "import * as React from 'react'\nexport const get = React.cache(() => 1)"],
    ['an import from next/cache', "import { revalidateTag } from 'next/cache'\nexport const r = revalidateTag"],
    ['unstable_cache used', 'export const get = unstable_cache(async () => 1)'],
  ]
  for (const [label, code] of bad) {
    it(`fails on ${label}`, () => {
      expect(only(code), code).toHaveLength(1)
      expect(only(code)[0]?.message, code).toMatch(/R-8.5-2/)
    })
  }

  it('covers components, connectors and shared, and nothing else', () => {
    const code = "export const load = () => fetch('/api/items')"
    expect(only(code, 'src/components/combobox/hook.ts')).toHaveLength(1)
    expect(only(code, 'src/connectors/adaptive-menu/client.tsx')).toHaveLength(1)
    expect(only(code, 'src/shared/collection/use-collection.ts')).toHaveLength(1)
    expect(only(code, 'scripts/check-icons.ts')).toEqual([])
    expect(only(code, 'e2e/select.spec.ts')).toEqual([])
  })

  it('lets one name through where the config allows it, and only that name', () => {
    const allowed = [
      {
        files: ['**/*.ts'],
        plugins: { topclass },
        languageOptions: { parser: tseslint.parser },
        rules: { [RULE]: ['error', { allow: ['localStorage'] }] },
      },
    ] as unknown as Linter.Config[]
    const file = 'src/components/banner/lib.ts'
    expect(linter.verify("export const v = localStorage.getItem('k')", allowed, file)).toEqual([])
    expect(linter.verify("export const v = sessionStorage.getItem('k')", allowed, file)).toHaveLength(1)
    expect(linter.verify("export const v = fetch('/k')", allowed, file)).toHaveLength(1)
  })

  const good: [string, string][] = [
    ['calling loadMore', 'export function next(props: { loadMore: () => void }) { props.loadMore() }'],
    ['a prop named fetch is a member, not the global', 'export const run = (p: { fetch: () => void }) => p.fetch()'],
    ['a key named localStorage', "export const KEYS = { localStorage: 'tc' }"],
    ['the word in a string', "export const NOTE = 'never touches localStorage'"],
    ['other React imports', "import { use, useId } from 'react'\nexport const a = [use, useId]"],
    ['a Response built from data, not a request', "export const r = new Response('ok')"],
  ]
  for (const [label, code] of good) {
    it(`allows ${label}`, () => {
      expect(only(code), code).toEqual([])
    })
  }
})

describe('R-5.12-1: client.tsx is markup plus one hook from hook.ts', () => {
  const CLIENT = 'src/components/thing/client.tsx'
  const PART = 'src/components/thing/parts/thing-list.tsx'
  const shape = (code: string, filename = CLIENT) => ids(code, filename).filter((r) => r === 'topclass/client-shape')

  it('allows one hook from hook.ts in each component of the file', () => {
    const code = [
      "'use client'",
      "import { useThingRoot, useThingItem } from './hook.js'",
      'export function ThingRoot() { const root = useThingRoot(); return <div id={root.id} /> }',
      'export function ThingItem() { const item = useThingItem(); return <button onClick={() => { item.run() }} /> }',
    ].join('\n')
    expect(shape(code), code).toEqual([])
  })

  it('allows a component that calls no hook at all', () => {
    expect(shape("'use client'\nexport function ThingBody() { return <div /> }")).toEqual([])
  })

  const banned: [string, string][] = [
    ['useState', "import { useState } from 'react'\nexport function Thing() { const [v] = useState(0); return <i>{v}</i> }"],
    ['useEffect', "import { useEffect } from 'react'\nexport function Thing() { useEffect(() => {}); return <i /> }"],
    ['useReducer', "import { useReducer } from 'react'\nexport function Thing() { useReducer((s: number) => s, 0); return <i /> }"],
    ['useRef', "import { useRef } from 'react'\nexport function Thing() { const r = useRef(null); return <i ref={r} /> }"],
    ['useMemo', "import { useMemo } from 'react'\nexport function Thing() { useMemo(() => 1, []); return <i /> }"],
    ['useCallback', "import { useCallback } from 'react'\nexport function Thing() { useCallback(() => 1, []); return <i /> }"],
    ['React.useState', "import * as React from 'react'\nexport function Thing() { React.useState(0); return <i /> }"],
    ['an aliased import', "import { useState as useLocal } from 'react'\nexport function Thing() { useLocal(0); return <i /> }"],
  ]
  for (const [name, code] of banned) {
    it(`rejects ${name} in client.tsx`, () => {
      expect(shape(`'use client'\n${code}`), code).toEqual(['topclass/client-shape'])
    })
  }

  it('rejects a hook that does not come from hook.ts', () => {
    const code = "'use client'\nimport { useCollection } from '#shared/collection.js'\nexport function Thing() { useCollection(); return <i /> }"
    expect(shape(code), code).toEqual(['topclass/client-shape'])
  })

  it('rejects a second hook call in one component, even when both come from hook.ts', () => {
    const code = "'use client'\nimport { useA, useB } from './hook.js'\nexport function Thing() { useA(); useB(); return <i /> }"
    expect(shape(code), code).toEqual(['topclass/client-shape'])
  })

  it('rejects a helper declared beside the components, in either form', () => {
    const code = "'use client'\nfunction toLabel(s: string) { return s }\nexport const toKey = (s: string) => s\nexport function Thing() { return <i /> }"
    expect(shape(code), code).toEqual(['topclass/client-shape', 'topclass/client-shape'])
  })

  it('rejects a hook declared in client.tsx instead of hook.ts', () => {
    const code = "'use client'\nfunction useThing() { return 1 }\nexport function Thing() { return <i /> }"
    expect(shape(code), code).toEqual(['topclass/client-shape'])
  })

  it('holds a use client part to the same shape as client.tsx', () => {
    const code = "'use client'\nimport { useState } from 'react'\nexport function ThingList() { useState(0); return <i /> }"
    expect(shape(code, PART), code).toEqual(['topclass/client-shape'])
  })

  it('leaves a server part and every other file alone', () => {
    const code = "import { useId } from 'react'\nexport function ThingGroup() { const id = useId(); return <i id={id} /> }"
    expect(shape(code, PART), code).toEqual([])
    const hook = "import { useState } from 'react'\nexport function useThing() { return useState(0) }"
    expect(shape(hook, 'src/components/thing/hook.ts'), hook).toEqual([])
  })

  it('passes every client file the library ships', () => {
    const files = readdirSync('src', { recursive: true, encoding: 'utf8' })
      .map((f) => f.replace(/\\/g, '/'))
      .filter((f) => /^(components|connectors)\/[^/]+\/(client\.tsx|parts\/[^/]+\.tsx)$/.test(f))
    const offending = files.flatMap((f) =>
      lint(readFileSync(join('src', f), 'utf8'), `src/${f}`)
        .filter((m) => m.ruleId === 'topclass/client-shape')
        .map((m) => `${f}:${m.line} ${m.message}`))
    expect(files.filter((f) => f.endsWith('/client.tsx')).length).toBeGreaterThan(30)
    expect(offending).toEqual([])
  })
})

describe("R-5.2-2: the consumer's className is the last argument to cn()", () => {
  const rejected: [string, string][] = [
    ['className before an own class', 'cn(className, BUTTON)'],
    ['className in the middle', 'cn(BUTTON, className, BUTTON_SIZE[size])'],
    ['props.className before an own class', 'cn(props.className, "flex")'],
    ['a computed props["className"]', 'cn(props["className"], own)'],
    ['className under a type assertion', 'cn(className as string, "flex")'],
    ['className inside JSX', '<div className={cn(className, CARD)} />'],
  ]
  for (const [label, code] of rejected) {
    it(`rejects ${label}`, () => {
      expect(ids(code), code).toContain('topclass/cn-class-name-last')
    })
  }

  it('still rejects an own class after two caller classes', () => {
    expect(ids('cn(props.className, own.className, "flex")')).toContain('topclass/cn-class-name-last')
  })

  it('reports each misplaced argument once', () => {
    expect(ids('cn(className, props.className, "flex")').filter((r) => r === 'topclass/cn-class-name-last'))
      .toEqual(['topclass/cn-class-name-last', 'topclass/cn-class-name-last'])
  })

  const allowed: [string, string][] = [
    ['className last', 'cn(BUTTON, BUTTON_SIZE[size], className)'],
    ['props.className last', 'cn("flex", props.className)'],
    ['className alone', 'cn(className)'],
    ['no consumer class at all', 'cn(SWITCH_TRACK, SWITCH_TRACK_SIZE[size])'],
    ['another object that happens to hold a className', 'cn(own.className, "flex")'],
    ['a function other than cn', 'clsx(className, "flex")'],
    ['the render= element class after the props class, as renderElement does', 'cn(props["className"] as never, own["className"] as never)'],
  ]
  for (const [label, code] of allowed) {
    it(`allows ${label}`, () => {
      expect(ids(code), code).not.toContain('topclass/cn-class-name-last')
    })
  }
})

describe('R-5.3-4: never left or right as a side', () => {
  const bad: [string, string][] = [
    ['side="left" on a positioner', '<Popover.Positioner side="left" />'],
    ['side="right" on a positioner', '<Popover.Positioner side="right" />'],
    ['align="left"', '<Tooltip.Positioner align="left" />'],
    ['align="right" in braces', '<Tooltip.Positioner align={"right"} />'],
    ['a placement ending in right', '<PopoverRoot placement="bottom-right" />'],
    ['a placement starting with left', '<DropdownRoot placement="left-start" />'],
    ['a bare placement of left', '<DrawerRoot placement="left" />'],
    ['a template literal', '<PopoverRoot placement={`top-left`} />'],
    ['either branch of a conditional', '<PopoverRoot placement={rtl ? "start" : "right"} />'],
    ['the fallback of a logical expression', '<PopoverRoot placement={given ?? "left"} />'],
    ['a cast that hides the type error', '<PopoverRoot placement={"left" as Placement} />'],
    ['an object property', 'const settings = { placement: "bottom-left" }'],
    ['a side in a settings object', 'const positioner = { side: "right", align: "start" }'],
  ]
  for (const [label, code] of bad) {
    it(`fails on ${label}`, () => {
      expect(ids(code), code).toContain('topclass/no-physical-placement')
    })
  }

  const good = [
    '<PopoverRoot placement="bottom-start" />',
    '<PopoverRoot placement="end-top" />',
    '<DrawerRoot placement="start" />',
    '<Popover.Positioner side="inline-end" align="center" />',
    '<Popover.Positioner side={side} align={align} />',
    '<DrawerRoot swipeDirection="left" />',
    'const inlineEnd = direction === "rtl" ? "left" : "right"',
    'const copy = { title: "Bright lights" }',
    'const lookup = { [side]: "left" }',
  ]
  for (const code of good) {
    it(`allows ${code}`, () => {
      expect(ids(code).filter((r) => r?.startsWith('topclass/')), code).toEqual([])
    })
  }
})
