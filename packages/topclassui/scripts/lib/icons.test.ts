import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  camelCase, documentedDirectional, documentedNames, generate, iconModule, isDirectional,
  manualDirectional, readIcon, section, versionModule,
} from './icons.js'

const ROOT = process.cwd()
const DOCS = readFileSync(join(ROOT, 'docs', 'icons.md'), 'utf8')
const RAW = join(ROOT, 'raw')
const sources = readdirSync(RAW)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => ({ name: f.slice(0, -4), svg: readFileSync(join(RAW, f), 'utf8') }))

const svg = (inner: string, viewBox = '0 0 256 256') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">${inner}</svg>`
const read = (inner: string, viewBox?: string) =>
  readIcon({ name: 'probe', svg: svg(inner, viewBox) }, new Set())

describe('readIcon', () => {
  it('takes the viewBox and the single path', () => {
    const icon = read('<path d="M1 2"/>')
    expect(icon).toEqual({ name: 'probe', viewBox: '0 0 256 256', path: 'M1 2', directional: false })
  })

  it('refuses two paths, because IconData carries one', () => {
    expect(() => read('<path d="M1 2"/><path d="M3 4"/>')).toThrow(/has 2 paths/)
  })

  it('refuses a shape element, which would be dropped silently', () => {
    expect(() => read('<circle cx="1" cy="2" r="3"/>')).toThrow(/<circle>/)
    expect(() => read('<rect x="0" y="0" width="1" height="1"/>')).toThrow(/<rect>/)
  })

  it('refuses a missing or wrong viewBox, so every icon shares one coordinate system', () => {
    expect(() => readIcon({ name: 'probe', svg: '<svg><path d="M1 2"/></svg>' }, new Set()))
      .toThrow(/no viewBox/)
    expect(() => read('<path d="M1 2"/>', '0 0 24 24')).toThrow(/expected "0 0 256 256"/)
  })

  it('refuses a hard-coded colour, which would ignore the text colour', () => {
    expect(() => read('<path d="M1 2" fill="#000"/>')).toThrow(/hard-codes the colour "#000"/)
  })

  it('names the file in the message, so the fix is obvious', () => {
    expect(() => read('<path d="M1 2"/><path d="M3 4"/>')).toThrow(/^raw\/probe\.svg:/)
  })
})

describe('camelCase', () => {
  it('builds the export name a per-icon import uses', () => {
    expect(camelCase('arrow-left')).toBe('arrowLeft')
    expect(camelCase('arrow-u-up-left')).toBe('arrowUUpLeft')
    expect(camelCase('x')).toBe('x')
    expect(camelCase('github-logo')).toBe('githubLogo')
    expect(camelCase('circle-fill')).toBe('circleFill')
  })
})

describe('reading docs/icons.md', () => {
  it('stops at the next heading, so a name quoted later is not a member of the set', () => {
    const body = section('## The set\n`a` `b`\n## Later\n`c`', '## The set')
    expect(body).toContain('`a`')
    expect(body).not.toContain('`c`')
  })

  it('reads the 84 names of the set and nothing from the prose after it', () => {
    const names = documentedNames(DOCS)
    expect(names).toHaveLength(84)
    expect(names).toContain('arrow-left')
    expect(names).toContain('star-fill')
    expect(names).not.toContain('wifi-slash')
    expect(names).not.toContain('eyedropper')
  })

  it('reads the directional table, which the doc says is sixteen of the eighty-four', () => {
    expect(documentedDirectional(DOCS)).toHaveLength(16)
  })

  it('reads the manual list the patterns cannot infer', () => {
    expect(manualDirectional(DOCS)).toEqual(['paper-plane-tilt', 'sidebar-simple', 'sign-out'])
  })
})

describe('isDirectional', () => {
  const manual = new Set(['sign-out'])

  it('flips by shape for arrows, carets and chevrons', () => {
    expect(isDirectional('arrow-left', manual)).toBe(true)
    expect(isDirectional('caret-up-down', manual)).toBe(true)
    expect(isDirectional('chevron-right', manual)).toBe(true)
  })

  it('flips a name only on the manual list', () => {
    expect(isDirectional('sign-out', manual)).toBe(true)
    expect(isDirectional('paper-plane-tilt', manual)).toBe(false)
  })

  it('does not flip a shape that means the same in both scripts', () => {
    for (const name of ['magnifying-glass', 'check', 'clock', 'sort-ascending', 'translate']) {
      expect(isDirectional(name, manual), name).toBe(false)
    }
  })
})

describe('generate', () => {
  it('writes one module per icon plus the four generated modules', () => {
    const files = generate(sources, DOCS)
    expect([...files.keys()].filter((k) => k.startsWith('data/'))).toHaveLength(84)
    expect(files.has('names.generated.ts')).toBe(true)
    expect(files.has('directional.generated.ts')).toBe(true)
    expect(files.has('loaders.generated.ts')).toBe(true)
    expect(files.has('version.generated.ts')).toBe(true)
  })

  it('sorts the output, so two runs on the same raw/ are byte-identical', () => {
    const a = [...generate(sources, DOCS)].map(([k, v]) => k + v).join()
    const b = [...generate([...sources].reverse(), DOCS)].map(([k, v]) => k + v).join()
    expect(a).toBe(b)
  })

  it('gives the loader map one lazy entry per icon and no static import of path data', () => {
    const loaders = generate(sources, DOCS).get('loaders.generated.ts') ?? ''
    expect([...loaders.matchAll(/=> import\(/g)]).toHaveLength(84)
    expect(loaders).not.toMatch(/^import \{/m)
  })

  it('fails when raw/ and docs/icons.md disagree, in either direction', () => {
    expect(() => generate(sources.slice(1), DOCS)).toThrow(/docs\/icons\.md lists icons raw\/ does not have/)
    expect(() => generate([...sources, { name: 'rocket', svg: svg('<path d="M1 2"/>') }], DOCS))
      .toThrow(/raw\/ has icons docs\/icons\.md does not list: rocket/)
  })

  it('fails when the derived directional set drifts from the table', () => {
    const edited = DOCS.replace('**Manual list:** `sign-out`', '**Manual list:** `sign-out`, `clock`')
    expect(() => generate(sources, edited)).toThrow(/does not match the table/)
  })
})

describe('versionModule', () => {
  const icon = { name: 'a', viewBox: '0 0 256 256', path: 'M1', directional: false }

  it('is stable for the same icons', () => {
    expect(versionModule([icon])).toBe(versionModule([icon]))
  })

  it('changes when a path changes, so a stale copy is detectable', () => {
    expect(versionModule([icon])).not.toBe(versionModule([{ ...icon, path: 'M2' }]))
  })

  it('changes when an icon starts or stops flipping', () => {
    expect(versionModule([icon])).not.toBe(versionModule([{ ...icon, directional: true }]))
  })
})

describe('readIcon rejects what <Svg> would render wrongly', () => {
  it('refuses a stroke-drawn icon, which would be filled and render nothing', () => {
    const lucide = '<svg viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16">'
      + '<path d="M40 128h176M128 40v176"/></svg>'
    expect(() => readIcon({ name: 'plus-outline', svg: lucide }, new Set())).toThrow(/stroke-drawn/)
  })

  it('refuses a stroke on the path element itself', () => {
    expect(() => read('<path d="M1 2" stroke="currentColor"/>')).toThrow(/stroke-drawn/)
  })

  it('refuses fill="none", because the path has to have an area', () => {
    expect(() => read('<path d="M1 2" fill="none"/>')).toThrow(/fill="none"/)
  })

  it('refuses an attribute whose effect would be silently dropped', () => {
    expect(() => read('<path d="M1 2" transform="translate(8 8)"/>')).toThrow(/transform/)
    expect(() => read('<path d="M1 2" fill-rule="evenodd"/>')).toThrow(/fill-rule/)
    expect(() => read('<path d="M1 2" opacity="0.5"/>')).toThrow(/opacity/)
  })

  it('refuses a wrapper or a definition block it cannot flatten', () => {
    expect(() => read('<defs><path d="M9 9"/></defs><path d="M1 2"/>')).toThrow(/<defs>/)
    expect(() => read('<path d="M1 2" clip-path="url(#c)"/>')).toThrow(/clip-path/)
  })
})

describe('readIcon is not fooled by the SVG text', () => {
  it('ignores a path inside an XML comment', () => {
    expect(read('<!-- <path d="M9 9"/> --><path d="M1 2"/>').path).toBe('M1 2')
  })

  it('counts a commented-out second path as absent, not as a second path', () => {
    expect(() => read('<path d="M1 2"/><!-- <path d="M3 4"/> -->')).not.toThrow()
  })

  it('collapses a legal multi-line d, which would otherwise break the module', () => {
    expect(read('<path\n  d="M1 2\n     L3 4"\n/>').path).toBe('M1 2 L3 4')
  })

  it('takes the d of the path, not a later attribute that merely looks like one', () => {
    expect(read('<path d="M1 2" data-x="d=&quot;M9 9&quot;"/>').path).toBe('M1 2')
  })

  it('accepts currentColor in any casing, which CSS treats as one keyword', () => {
    expect(() => read('<path d="M1 2" fill="currentcolor"/>')).not.toThrow()
    expect(() => read('<path d="M1 2" fill="CurrentColor"/>')).not.toThrow()
  })

  it('refuses an empty path rather than emitting an invisible icon', () => {
    expect(() => read('<path d=""/>')).toThrow(/empty path/)
  })
})

describe('the generated module cannot be injected into', () => {
  it('refuses a quote in the path data, which would close the string', () => {
    expect(() => read(`<path d="M1 2','x:1,y:(()=&gt;1)"/>`)).toThrow(/path data/)
  })

  it('refuses a backslash, which would escape the closing quote', () => {
    expect(() => read('<path d="M1 2\\"/>')).toThrow(/path data/)
  })

  it('refuses anything that is not a path command, a number or a separator', () => {
    expect(() => read('<path d="M1 2 url(#x)"/>')).toThrow(/path data/)
    expect(() => read('<path d="M1 2 ${x}"/>')).toThrow(/path data/)
  })

  it('accepts every real command letter and the exponent form', () => {
    expect(() => read('<path d="M0 0 L1 1 H2 V3 C1 2 3 4 5 6 S1 2 3 4 Q1 2 3 4 T5 6 A1 1 0 0 1 2 2 Z"/>'))
      .not.toThrow()
    expect(() => read('<path d="M1e2 2.5e-3 l-1 +2"/>')).not.toThrow()
  })

  it('refuses a name whose export would not be a valid identifier', () => {
    expect(() => readIcon({ name: '2cool', svg: svg('<path d="M1 2"/>') }, new Set()))
      .toThrow(/invalid export name/)
  })
})

describe('the generated data module', () => {
  it('says it is generated, so nobody edits it by hand', () => {
    const icon = { name: 'a', viewBox: '0 0 256 256', path: 'M1', directional: false }
    expect(iconModule(icon).split('\n')[0]).toMatch(/Generated by pnpm icons:build/)
  })
})

describe('export name collisions', () => {
  // camelCase is injective on single-hyphen names, so a doubled hyphen is the way in.
  const docs = '## The set\n`x-y` `x--y`\n\n## Which icons flip in RTL\n| Flips | Why |\n|---|---|\n'

  it('refuses two names that collapse to one export', () => {
    const pair = ['x-y', 'x--y'].map((name) => ({ name, svg: svg('<path d="M1 2"/>') }))
    expect(() => generate(pair, docs)).toThrow(/both export "xY"/)
  })

  it('accepts the same set without the collision', () => {
    const one = [{ name: 'x-y', svg: svg('<path d="M1 2"/>') }]
    expect(() => generate(one, docs.replace(' `x--y`', ''))).not.toThrow()
  })
})
