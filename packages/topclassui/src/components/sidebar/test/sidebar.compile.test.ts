import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'sidebar')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `sidebar-probe-${name}.tsx`))

/** The five parts the README imports beside Icon. */
const PARTS = 'SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot'

/** What a probe of this file has in scope: the parts, the toggle and the server Icon. A README sample has only its own import line. */
const PRELUDE = [
  `import { ${PARTS}, SidebarTrigger } from '../index.js'`,
  "import { Icon } from '#components/icon/index.js'",
  `export const used = [${PARTS}, SidebarTrigger, Icon]`,
].join('\n')

const IMPORT_LINE = /^import \{([^}]*)\} from '[^']+'\r?\n?/

const jsx = (code: string) => `export const sample = (\n<>\n${code}\n</>\n)\n`

/** The import lines, pointed at the repo, then the JSX after them; a probe with no import line gets the PRELUDE. */
function wrap(code: string): string {
  if (!code.startsWith('import ')) return `${PRELUDE}\n${jsx(code)}`
  const names: string[] = []
  let rest = code
  for (let line = IMPORT_LINE.exec(rest); line !== null; line = IMPORT_LINE.exec(rest)) {
    names.push(...(line[1] ?? '').split(',').map((name) => name.trim()).filter(Boolean))
    rest = rest.slice(line[0].length)
  }
  const imports = importsFromRepo(code.slice(0, code.length - rest.length)).trim()
  rest = rest.trim()
  return `${imports}\nexport const imported = [${names.join(', ')}]\n${rest === '' ? '' : jsx(rest)}`
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

/** One rail holding one link; each argument is the text of that part's attributes. */
const rail = (root: string, link = ' href="/home"') => `<SidebarRoot${root}><SidebarBody><SidebarGroup><SidebarLink${link}>Home</SidebarLink></SidebarGroup></SidebarBody></SidebarRoot>`

const verdict = compile({
  readmeImport: sample(0),
  // As a reader pastes it: the README's own import line, then the sample, and nothing else in scope.
  readmeSample: `${sample(0)}${sample(1)}`,
  // What the parts do take.
  uncontrolled: rail(' defaultOpen={false} aria-label="Documentation" id="rail"'),
  controlled: rail(' open onOpenChange={(open) => { void open.valueOf() }}'),
  otherWidth: rail(' className="data-open:w-72"'),
  linkRender: rail('', ' render={<a href="/home" />} icon={<Icon name="house" />} current'),
  linkIconOnly: '<SidebarRoot><SidebarBody><SidebarGroup><SidebarLink href="/home" icon={<Icon name="house" />} aria-label="Home" /></SidebarGroup></SidebarBody></SidebarRoot>',
  linkRenderAlone: '<SidebarRoot><SidebarBody><SidebarGroup><SidebarLink render={<a href="/home">Home</a>} /></SidebarGroup></SidebarBody></SidebarRoot>',
  linkRest: rail('', ' href="/home" target="_blank" rel="noreferrer" id="home" className="px-4" current={false}'),
  group: '<SidebarRoot><SidebarGroup label="Pages" /><SidebarGroup label={<b>Pages</b>} /><SidebarGroup /></SidebarRoot>',
  header: '<SidebarRoot><SidebarHeader>Workspace</SidebarHeader><SidebarHeader /></SidebarRoot>',
  trigger: '<SidebarRoot><SidebarTrigger aria-label="Menu" disabled onClick={(event) => { event.preventDefault() }} /></SidebarRoot>',
  // What they refuse.
  linkNowhere: rail('', ''),
  linkUnnamed: '<SidebarRoot><SidebarBody><SidebarGroup><SidebarLink href="/home" icon={<Icon name="house" />} /></SidebarGroup></SidebarBody></SidebarRoot>',
  linkRenderFunction: rail('', ' render={() => <a href="/home" />}'),
  badCurrent: rail('', ' href="/home" current="page"'),
  badDefaultOpen: rail(' defaultOpen="yes"'),
  width: rail(' width={300}'),
  collapsible: rail(' collapsible'),
  classFunction: rail(" className={() => 'p-4'}"),
  triggerType: '<SidebarRoot><SidebarTrigger type="submit" /></SidebarRoot>',
  triggerChildren: '<SidebarRoot><SidebarTrigger>Menu</SidebarTrigger></SidebarRoot>',
  groupIcon: '<SidebarRoot><SidebarGroup icon={<Icon name="house" />} /></SidebarRoot>',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toBe("import { Icon } from 'topclassui/icon'\nimport { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from 'topclassui/sidebar'\n")
    expect(SAMPLES[1]).toContain('<SidebarLink href="/docs/theming" icon={<Icon name="palette" />}>Theming</SidebarLink>')
    expect(SAMPLES[1]).toContain('<main className="min-w-0 flex-1 overflow-y-auto">Your page</main>')
  })

  it('the import lines name six exports that exist, the Icon its sample draws among them', () => {
    expect(verdict['readmeImport']).toEqual([])
  })

  it('the sample, pasted under that import line alone: a rail in a flex row, a header, a named group of two links, one of them current', () => {
    expect(verdict['readmeSample']).toEqual([])
  })
})

describe('what Sidebar does take', () => {
  it('a rail that starts collapsed, with its own name and an id', () => {
    expect(verdict['uncontrolled']).toEqual([])
  })

  it('a rail whose caller holds the state, with a handler that is given a boolean', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('another width for one state, as a class', () => {
    expect(verdict['otherWidth']).toEqual([])
  })

  it('a link as an element with its own href, an icon and current', () => {
    expect(verdict['linkRender']).toEqual([])
  })

  it('a link that is an icon alone, named by aria-label, and one whose element carries its own text (R-5.6-1)', () => {
    expect(verdict['linkIconOnly']).toEqual([])
    expect(verdict['linkRenderAlone']).toEqual([])
  })

  it('a plain link with the attributes of an anchor', () => {
    expect(verdict['linkRest']).toEqual([])
  })

  it('a group named by a string, by an element, or not at all', () => {
    expect(verdict['group']).toEqual([])
  })

  it('a header with a title and one without', () => {
    expect(verdict['header']).toEqual([])
  })

  it('a toggle with its own name, disabled, and a press handler that can prevent the default', () => {
    expect(verdict['trigger']).toEqual([])
  })
})

describe('what Sidebar does not take', () => {
  // TypeScript reports the last member of the union, the plain anchor, so it names what that one lacks.
  it('refuses a link that goes nowhere, with no href and no render: the one error says the href is missing', () => {
    expect(verdict['linkNowhere']).toHaveLength(1)
    expect(verdict['linkNowhere']?.[0]).toContain("is not assignable to type 'IntrinsicAttributes & SidebarLinkProps'")
    expect(verdict['linkNowhere']?.[0]).toContain("Property 'href' is missing")
  })

  it('refuses a link with no name, an href and an icon alone, which axe reports as link-name: the error asks for aria-label (R-5.6-1)', () => {
    expect(verdict['linkUnnamed']).toHaveLength(1)
    expect(verdict['linkUnnamed']?.[0]).toContain("is not assignable to type 'IntrinsicAttributes & SidebarLinkProps'")
    expect(verdict['linkUnnamed']?.[0]).toContain("Property ''aria-label'' is missing")
  })

  it('refuses the function form of render: a Server Component resolves an element only (R-5.7-4)', () => {
    expect((verdict['linkRenderFunction'] ?? []).join(' ')).toContain('is not assignable to type')
    expect(verdict['linkRenderFunction']).toHaveLength(1)
  })

  it('refuses a current that is not a boolean', () => {
    expect((verdict['badCurrent'] ?? []).join(' ')).toContain("Type 'string' is not assignable to type 'boolean")
  })

  it('refuses a defaultOpen that is not a boolean', () => {
    expect((verdict['badDefaultOpen'] ?? []).join(' ')).toContain("Type 'string' is not assignable to type 'boolean")
  })

  it('refuses width and collapsible, which are not built', () => {
    expect((verdict['width'] ?? []).join(' ')).toContain("Property 'width' does not exist")
    expect((verdict['collapsible'] ?? []).join(' ')).toContain("Property 'collapsible' does not exist")
  })

  it('refuses a className that is not a string, so cn() always has one', () => {
    expect((verdict['classFunction'] ?? []).join(' ')).toContain("is not assignable to type 'string'")
  })

  // JSX lets any hyphenated attribute through, so aria-expanded and aria-current are overwritten at runtime instead.
  it('refuses a type and children on the toggle: both are its own', () => {
    expect((verdict['triggerType'] ?? []).join(' ')).toContain("Property 'type' does not exist")
    expect((verdict['triggerChildren'] ?? []).join(' ')).toContain("'{ children: string; }' has no properties in common with type 'IntrinsicAttributes & SidebarTriggerProps'")
  })

  it('refuses an icon on a group: a group has a label and no more', () => {
    expect((verdict['groupIcon'] ?? []).join(' ')).toContain("Property 'icon' does not exist")
  })
})
