import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'accordion')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `accordion-probe-${name}.tsx`))

/** The two parts, by the names the README imports them under. */
const PARTS = 'AccordionItem, AccordionRoot'

/** What a page that pastes a sample has in scope. */
const PRELUDE = [`import { ${PARTS} } from '../index.js'`, `export const used = [${PARTS}]`].join('\n')

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
const item = (props: string) => `<AccordionRoot><AccordionItem ${props}>Text</AccordionItem></AccordionRoot>`
const root = (props: string) => `<AccordionRoot ${props}><AccordionItem value="a" title="A">Text</AccordionItem></AccordionRoot>`

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  server: root('multiple disabled defaultValue={["a"]} hiddenUntilFound={false} keepMounted'),
  controlled: root('value={["a"]} onValueChange={(value, details) => { void [value.join(","), details.reason] }}'),
  level: item('value="a" title="A" headingLevel={2} disabled'),
  elementTitle: item('value="a" title={<><strong>A</strong> <em>new</em></>} onOpenChange={(open) => { void open }}'),
  rest: item('value="a" title="A" id="first" data-kind="faq" className="bg-surface" style={{ scrollMarginTop: 80 }}'),
  noValue: item('title="A"'),
  noTitle: item('value="a"'),
  numberValue: item('value={1} title="A"'),
  numberOpen: root('defaultValue={[1]}'),
  loopFocus: root('loopFocus'),
  orientation: root('orientation="horizontal"'),
  type: root('type="single"'),
  collapsible: root('collapsible'),
  variant: root('variant="outline"'),
  badLevel: item('value="a" title="A" headingLevel="2"'),
  classFunction: root("className={() => 'p-4'}"),
  itemClassFunction: item("value=\"a\" title=\"A\" className={() => 'p-4'}"),
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toBe("import { AccordionItem, AccordionRoot } from 'topclassui/accordion'\n")
    expect(SAMPLES[1]).toContain('<AccordionItem value="install" title="How do I install a component?" headingLevel={2}>')
  })

  it('the import line names two exports that exist, where the generated one names an Accordion that does not', () => {
    expect(verdict['readmeImport']).toEqual([])
  })

  it('the sample: two items, the first open from the start', () => {
    expect(verdict['readmeFirst']).toEqual([])
  })
})

describe('what an Accordion does take', () => {
  it('what a server page passes: multiple, disabled, defaultValue, hiddenUntilFound and keepMounted', () => {
    expect(verdict['server']).toEqual([])
  })

  it('a controlled value, whose handler reads an array of strings and the reason', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('a heading level and disabled on an item', () => {
    expect(verdict['level']).toEqual([])
  })

  it('a title that is an element, and onOpenChange on the item', () => {
    expect(verdict['elementTitle']).toEqual([])
  })

  it('an id, a data attribute, a className and a style on the item', () => {
    expect(verdict['rest']).toEqual([])
  })
})

describe('what an Accordion does not take', () => {
  it('refuses an item with no value: the root could never name it', () => {
    expect((verdict['noValue'] ?? []).join(' ')).toContain("Property 'value' is missing")
  })

  it('refuses an item with no title: its trigger would be a button with no name', () => {
    expect((verdict['noTitle'] ?? []).join(' ')).toContain("Property 'title' is missing")
  })

  it('refuses a value that is not a string, on the item and in the list of the root', () => {
    expect((verdict['numberValue'] ?? []).join(' ')).toContain("Type 'number' is not assignable to type 'string'")
    expect((verdict['numberOpen'] ?? []).join(' ')).toContain("Type 'number' is not assignable to type 'string'")
  })

  it('refuses loopFocus and orientation, which Base UI 1.8.0 deprecates and no longer acts on', () => {
    expect((verdict['loopFocus'] ?? []).join(' ')).toContain("Property 'loopFocus' does not exist")
    expect((verdict['orientation'] ?? []).join(' ')).toContain("Property 'orientation' does not exist")
  })

  it('refuses type, collapsible and variant, which the docs card draws and nothing builds', () => {
    expect((verdict['type'] ?? []).join(' ')).toContain("Property 'type' does not exist")
    expect((verdict['collapsible'] ?? []).join(' ')).toContain("Property 'collapsible' does not exist")
    expect((verdict['variant'] ?? []).join(' ')).toContain("Property 'variant' does not exist")
  })

  it('refuses a heading level that is not a number', () => {
    expect((verdict['badLevel'] ?? []).join(' ')).toContain("Type 'string' is not assignable to type 'number'")
  })

  it('refuses the state function Base UI takes as a className, so cn() always has a string', () => {
    expect((verdict['classFunction'] ?? []).join(' ')).toContain("is not assignable to type 'string'")
    expect((verdict['itemClassFunction'] ?? []).join(' ')).toContain("is not assignable to type 'string'")
  })
})
