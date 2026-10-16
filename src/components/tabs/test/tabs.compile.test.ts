import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'tabs')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `tabs-probe-${name}.tsx`))

/** The four parts, by the names the README imports them under. */
const PARTS = 'TabsList, TabsPanel, TabsRoot, TabsTab'

/** What a page that pastes a sample has in scope: the four parts. */
const PRELUDE = [`import { ${PARTS} } from '../index.js'`, `export const used = [${PARTS}]`].join('\n')

/** The import line compiles as a module that uses what it imports, any other sample as JSX a page would paste. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${code.replace("'topclassui'", "'../index.js'")}\nexport const imported = [${PARTS}]\n`
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

/** One root with one list and one panel; each argument is the text of that part's attributes. */
const tabs = (root: string, list: string, tab = '', panel = '') => (
  `<TabsRoot${root}><TabsList${list}><TabsTab value="a"${tab}>A</TabsTab></TabsList><TabsPanel value="a"${panel}>Panel</TabsPanel></TabsRoot>`
)

const NAMED = ' aria-label="Project"'

const verdict = compile({
  readmeImport: sample(0),
  readmeSample: sample(1),
  // The name of the list, which its type requires one way or the other.
  listLabel: tabs(' defaultValue="a"', ' aria-label="Project"'),
  listLabelledBy: tabs(' defaultValue="a"', ' aria-labelledby="heading"'),
  listBoth: tabs(' defaultValue="a"', ' aria-label="Project" aria-labelledby="heading"'),
  listNeither: tabs(' defaultValue="a"', ''),
  listEmptyName: tabs(' defaultValue="a"', ' aria-label={undefined}'),
  // What the parts do take.
  looks: `<>${tabs(' variant="line" size="xs"', NAMED)}${tabs(' variant="enclosed" size="custom"', NAMED)}</>`,
  controlled: tabs(' value="a" onValueChange={(value, details) => { void [value, details.reason] }}', NAMED),
  listProps: tabs(' orientation="vertical"', `${NAMED} activateOnFocus loopFocus={false}`),
  tabProps: tabs('', NAMED, ' disabled nativeButton={false} render={<span />}'),
  panelProps: tabs('', NAMED, '', ' keepMounted={false} tabIndex={-1} lang="ar"'),
  numbers: '<TabsRoot defaultValue={0}><TabsList aria-label="Project"><TabsTab value={0}>A</TabsTab></TabsList><TabsPanel value={0}>Panel</TabsPanel></TabsRoot>',
  // What they refuse.
  badVariant: tabs(' variant="pills"', NAMED),
  badSize: tabs(' size="huge"', NAMED),
  classFunction: tabs('', NAMED, " className={() => 'p-4'}"),
  tabNoValue: `<TabsRoot><TabsList${NAMED}><TabsTab>A</TabsTab></TabsList></TabsRoot>`,
  panelNoValue: `<TabsRoot><TabsList${NAMED}><TabsTab value="a">A</TabsTab></TabsList><TabsPanel>Panel</TabsPanel></TabsRoot>`,
  sizeOnTab: tabs('', NAMED, ' size="lg"'),
  variantOnList: tabs('', `${NAMED} variant="enclosed"`),
  fullWidth: tabs(' fullWidth', NAMED),
  badKeepMounted: tabs('', NAMED, '', ' keepMounted="no"'),
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toBe("import { TabsList, TabsPanel, TabsRoot, TabsTab } from 'topclassui'\n")
    expect(SAMPLES[1]).toContain('<TabsPanel value="activity">Three people edited this project today.</TabsPanel>')
  })

  it('the import line names four exports that exist, where the generated one names a Tabs that does not', () => {
    expect(verdict['readmeImport']).toEqual([])
  })

  it('the sample: a root, a named list of two tabs and their two panels', () => {
    expect(verdict['readmeSample']).toEqual([])
  })
})

describe('TabsList must be named (R-5.6-1)', () => {
  it('compiles with aria-label', () => {
    expect(verdict['listLabel']).toEqual([])
  })

  it('compiles with aria-labelledby', () => {
    expect(verdict['listLabelledBy']).toEqual([])
  })

  it('compiles with both', () => {
    expect(verdict['listBoth']).toEqual([])
  })

  // TypeScript reports one member of the union: the name it says is missing is aria-labelledby.
  it('is refused with neither: the one error says a name is missing', () => {
    expect(verdict['listNeither']).toHaveLength(1)
    expect(verdict['listNeither']?.[0]).toContain("is not assignable to type 'IntrinsicAttributes & TabsListProps'")
    expect(verdict['listNeither']?.[0]).toContain("Property ''aria-labelledby'' is missing")
  })

  it('is refused with a name that is undefined, for the same reason', () => {
    expect(verdict['listEmptyName']).toHaveLength(1)
    expect(verdict['listEmptyName']?.[0]).toContain("Property ''aria-labelledby'' is missing")
  })
})

describe('what Tabs does take', () => {
  it('each look and a size on the root', () => {
    expect(verdict['looks']).toEqual([])
  })

  it('a controlled value, whose handler reads the value and the reason', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('orientation on the root, and activateOnFocus and loopFocus on the list', () => {
    expect(verdict['listProps']).toEqual([])
  })

  it('a disabled tab, and one that is not a button', () => {
    expect(verdict['tabProps']).toEqual([])
  })

  it('a panel that unmounts, takes no tab stop and has its own language', () => {
    expect(verdict['panelProps']).toEqual([])
  })

  it('values that are numbers, which is what Base UI starts on', () => {
    expect(verdict['numbers']).toEqual([])
  })
})

describe('what Tabs does not take', () => {
  it('refuses a look outside the two', () => {
    expect((verdict['badVariant'] ?? []).join(' ')).toContain('Type \'"pills"\' is not assignable')
  })

  it('refuses a size outside the scale', () => {
    expect((verdict['badSize'] ?? []).join(' ')).toContain('Type \'"huge"\' is not assignable')
  })

  it('refuses the state function Base UI takes as a className, so cn() always has a string', () => {
    expect((verdict['classFunction'] ?? []).join(' ')).toContain("is not assignable to type 'string'")
  })

  it('refuses a tab and a panel with no value', () => {
    expect((verdict['tabNoValue'] ?? []).join(' ')).toContain("Property 'value' is missing")
    expect((verdict['panelNoValue'] ?? []).join(' ')).toContain("Property 'value' is missing")
  })

  it('refuses a size on a tab and a variant on the list: both follow the root', () => {
    expect((verdict['sizeOnTab'] ?? []).join(' ')).toContain("Property 'size' does not exist")
    expect((verdict['variantOnList'] ?? []).join(' ')).toContain("Property 'variant' does not exist")
  })

  it('refuses fullWidth, which is not built', () => {
    expect((verdict['fullWidth'] ?? []).join(' ')).toContain("Property 'fullWidth' does not exist")
  })

  it('refuses a keepMounted that is not a boolean', () => {
    expect((verdict['badKeepMounted'] ?? []).join(' ')).toContain("Type 'string' is not assignable to type 'boolean")
  })
})
