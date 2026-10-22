import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'navbar')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `navbar-probe-${name}.tsx`))

/** The five parts, by the names the README imports them under. */
const PARTS = 'NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot'

/** What a page that pastes a sample has in scope: the parts, a Button, the Arabic labels and a framework link. */
const PRELUDE = [
  "import type { ReactNode } from 'react'",
  `import { ${PARTS} } from '../index.js'`,
  "import { Button } from '#components/button/index.js'",
  "import { ar } from '#shared/labels/ar.js'",
  'declare function Link(props: { href: string, prefetch?: boolean, className?: string, children?: ReactNode }): ReactNode',
  `export const used = [${PARTS}, Button, ar, Link]`,
].join('\n')

/** The import line compiles as a module that uses what it imports, any other sample as JSX a page would paste. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [${PARTS}]\n`
  return `${PRELUDE}\nexport const sample = (\n<>\n${code}\n</>\n)\n`
}

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) => [probePath(name), wrap(code)]))

  const host = ts.createCompilerHost(options)
  const getSourceFile = host.getSourceFile.bind(host)
  const fileExists = host.fileExists.bind(host)
  const readFile = host.readFile.bind(host)
  host.getSourceFile = (name, language, ...rest) => {
    const code = probes.get(slash(name))
    return code === undefined ? getSourceFile(name, language, ...rest) : ts.createSourceFile(name, code, language)
  }
  host.fileExists = (name) => probes.has(slash(name)) || fileExists(name)
  host.readFile = (name) => probes.get(slash(name)) ?? readFile(name)

  const program = ts.createProgram([...probes.keys()], options, host)
  const out: Record<string, string[]> = {}
  for (const name of Object.keys(snippets)) {
    out[name] = ts.getPreEmitDiagnostics(program, program.getSourceFile(probePath(name)))
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))
  }
  return out
}

/** Every code block a reader can copy out of the hand-written half of the README, in order. */
function readmeSamples(): string[] {
  const readme = readFileSync(join(FOLDER, 'README.md'), 'utf8')
  const hand = readme.slice(readme.indexOf('<!-- hand-written -->'), readme.indexOf('<!-- /hand-written -->'))
  return [...hand.matchAll(/```tsx?\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')
}

const SAMPLES = readmeSamples()
const sample = (index: number) => SAMPLES[index] ?? '<Missing />'

const bar = (root: string, inside: string) => `<NavbarRoot${root}>${inside}</NavbarRoot>`

const verdict = compile({
  readmeImport: sample(0),
  readmeSample: sample(1),
  readmeNext: sample(2),
  // What the parts do take.
  notSticky: bar(' sticky={false} id="top" className="shadow-sm"', ''),
  brandLink: bar('', '<NavbarBrand render={<Link href="/" />}>Home</NavbarBrand>'),
  brandHref: bar('', '<NavbarBrand href="/" aria-label="Home" />'),
  named: bar('', '<NavbarLinks aria-label="Docs sections"><NavbarLink href="/a">A</NavbarLink></NavbarLinks>'),
  arabic: bar('', '<NavbarLinks labels={ar} locale="ar"><NavbarLink href="/a" current>A</NavbarLink></NavbarLinks>'),
  linkProps: bar('', '<NavbarLinks><NavbarLink href="https://example.com" target="_blank" rel="noreferrer" className="text-body">Out</NavbarLink></NavbarLinks>'),
  actions: bar('', '<NavbarActions className="gap-4"><Button>Go</Button></NavbarActions>'),
  // What they refuse.
  renderFunction: bar('', '<NavbarLinks><NavbarLink render={() => <a href="/a">A</a>}>A</NavbarLink></NavbarLinks>'),
  brandFunction: bar('', '<NavbarBrand render={(props: object) => <a {...props} />}>Home</NavbarBrand>'),
  size: bar(' size="md"', ''),
  bordered: bar(' bordered', ''),
  variant: bar(' variant="transparent"', ''),
  badVariant: bar(' variant="glass"', ''),
  badSticky: bar(' sticky="top"', ''),
  badCurrent: bar('', '<NavbarLinks><NavbarLink href="/a" current="page">A</NavbarLink></NavbarLinks>'),
  currentOnRoot: bar(' current', ''),
  stickyOnLink: bar('', '<NavbarLinks><NavbarLink href="/a" sticky>A</NavbarLink></NavbarLinks>'),
  rootRender: bar(' render={<div />}', ''),
  labelsOnRoot: bar(' labels={ar}', ''),
  bare: '<Navbar />',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toBe("import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from 'topclassui/navbar'\n")
    expect(SAMPLES[1]).toContain('<NavbarLink href="/docs" current>Docs</NavbarLink>')
    expect(SAMPLES[2]).toBe('<NavbarLink render={<Link href="/docs" />} current>Docs</NavbarLink>\n')
  })

  it('the import line names five exports that exist, where the generated one names a Navbar that does not', () => {
    expect(verdict['readmeImport']).toEqual([])
    expect((verdict['bare'] ?? []).join(' ')).toContain("Cannot find name 'Navbar'")
  })

  it('the sample: a brand, two links with one current, and a Button that is a link', () => {
    expect(verdict['readmeSample']).toEqual([])
  })

  it('the Next.js sample: a framework link as the element of a NavbarLink', () => {
    expect(verdict['readmeNext']).toEqual([])
  })
})

describe('what Navbar does take', () => {
  it('a bar that is not sticky, with an id and a className', () => {
    expect(verdict['notSticky']).toEqual([])
  })

  it('a brand that is a framework link, and one that is a plain anchor named by the caller', () => {
    expect(verdict['brandLink']).toEqual([])
    expect(verdict['brandHref']).toEqual([])
  })

  it('a nav the caller names, and one with the Arabic labels and a locale', () => {
    expect(verdict['named']).toEqual([])
    expect(verdict['arabic']).toEqual([])
  })

  it('a link with the attributes of an anchor and a className', () => {
    expect(verdict['linkProps']).toEqual([])
  })

  it('actions holding a Button', () => {
    expect(verdict['actions']).toEqual([])
  })
})

describe('what Navbar does not take', () => {
  // R-5.7-4: a server part cannot call a function a Server Component passed it.
  it('refuses the function form of render, on a link and on the brand', () => {
    expect((verdict['renderFunction'] ?? []).join(' ')).toContain('is not assignable to type')
    expect((verdict['renderFunction'] ?? []).join(' ')).toContain('ReactElement')
    expect((verdict['brandFunction'] ?? []).join(' ')).toContain('ReactElement')
  })

  it('refuses size and bordered, which are not built', () => {
    expect((verdict['size'] ?? []).join(' ')).toContain("Property 'size' does not exist")
    expect((verdict['bordered'] ?? []).join(' ')).toContain("Property 'bordered' does not exist")
  })

  it('takes the transparent variant on the root, and refuses one that is not in the list', () => {
    expect(verdict['variant'] ?? []).toEqual([])
    expect((verdict['badVariant'] ?? []).join(' ')).toContain('is not assignable to type')
  })

  it('refuses a sticky or a current that is not a boolean', () => {
    expect((verdict['badSticky'] ?? []).join(' ')).toContain("Type 'string' is not assignable to type 'boolean")
    expect((verdict['badCurrent'] ?? []).join(' ')).toContain("Type 'string' is not assignable to type 'boolean")
  })

  it('refuses current on the root and sticky on a link: each belongs to one part', () => {
    expect((verdict['currentOnRoot'] ?? []).join(' ')).toContain("Property 'current' does not exist")
    expect((verdict['stickyOnLink'] ?? []).join(' ')).toContain("Property 'sticky' does not exist")
  })

  it('refuses render and labels on the root: it is a header, and it names nothing', () => {
    expect((verdict['rootRender'] ?? []).join(' ')).toContain("Property 'render' does not exist")
    expect((verdict['labelsOnRoot'] ?? []).join(' ')).toContain("Property 'labels' does not exist")
  })
})
