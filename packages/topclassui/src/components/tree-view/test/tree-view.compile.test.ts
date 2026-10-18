import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'tree-view')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `tree-view-probe-${name}.tsx`))

const PRELUDE = [
  "import { TreeView, type TreeNode, type TreeViewProps } from '../index.js'",
  'export const used = [TreeView]',
  'export type Used = [TreeViewProps, TreeNode]',
  "const ITEMS = [{ id: 'app', label: 'app', children: [{ id: 'page', label: 'page.tsx' }] }]",
  'export const items = ITEMS',
].join('\n')

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [TreeView]\n`
  if (code.startsWith('type ') || code.startsWith('export ')) return `${PRELUDE}\n${code}\n`
  return `${PRELUDE}\nexport const sample = (\n<>\n${code}\n</>\n)\n`
}

/** The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so no mutation could reach it. */
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

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  byAriaLabel: '<TreeView aria-label="Files" items={ITEMS} />',
  byLabelledBy: '<TreeView aria-labelledby="files-heading" items={ITEMS} />',
  controlled: '<TreeView aria-label="F" items={ITEMS} value={null} onValueChange={(id) => { void (id satisfies string) }} expanded={[]} onExpandedChange={(ids) => { void (ids satisfies readonly string[]) }} />',
  uncontrolled: '<TreeView aria-label="F" items={ITEMS} defaultValue="page" defaultExpanded={[\'app\']} />',
  setter: 'type S = (next: string | null) => void\nexport const make = (set: S) => <TreeView aria-label="F" items={ITEMS} onValueChange={set} />',
  paging: '<TreeView aria-label="F" items={ITEMS} hasMore loadMore={async () => { await Promise.resolve() }} loadMoreThreshold={20} status="loading-more" virtualize visibleRows={12} loadingFallback={<b>Wait</b>} emptyFallback="None" />',
  rest: '<TreeView aria-label="F" items={ITEMS} id="t" className="ms-2" style={{ marginBlock: 4 }} data-x="1" onKeyDown={(e) => { void e.key }} ref={(node: HTMLDivElement | null) => { void node }} />',
  iconNode: "export const withIcon: TreeNode = { id: 'a', label: 'A', icon: <b>i</b>, disabled: true, children: [] }",
  readonlyItems: "export const list = [{ id: 'a', label: 'A', children: [{ id: 'b', label: 'B' }] }] as const\nexport const ok = <TreeView aria-label='F' items={list} />",
  noName: '<TreeView items={ITEMS} />',
  idOnly: '<TreeView id="files" items={ITEMS} />',
  noItems: '<TreeView aria-label="F" />',
  getKey: '<TreeView aria-label="F" items={ITEMS} getKey={(node: TreeNode) => node.id} />',
  numberValue: '<TreeView aria-label="F" items={ITEMS} value={1} />',
  badStatus: '<TreeView aria-label="F" items={ITEMS} status="error" />',
  tabIndex: '<TreeView aria-label="F" items={ITEMS} tabIndex={-1} />',
  role: '<TreeView aria-label="F" items={ITEMS} role="list" />',
  size: '<TreeView aria-label="F" items={ITEMS} size="sm" />',
  children: '<TreeView aria-label="F" items={ITEMS}>Files</TreeView>',
  classFunction: "<TreeView aria-label='F' items={ITEMS} className={() => 'p-4'} />",
  // An object: a callback ref is bivariant, and a div is assignable to a span or an input.
  wrongRef: '<TreeView aria-label="F" items={ITEMS} ref={{ current: null as HTMLSpanElement | null }} />',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toContain("import { TreeView } from 'topclassui/tree-view'")
    expect(SAMPLES[1]).toContain('<TreeView\n  aria-label="Files"')
  })

  for (const name of ['readmeImport', 'readmeFirst']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a TreeView takes', () => {
  for (const name of ['byAriaLabel', 'byLabelledBy', 'controlled', 'uncontrolled', 'setter', 'paging', 'rest', 'iconNode', 'readonlyItems']) {
    it(name, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a TreeView refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('no name, or an id alone, since no <label for> names a tree (R-5.6-1); and no items', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('idOnly')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('noItems')).toContain("Property 'items' is missing")
  })

  it('no getKey (the id is the key), and no number value', () => {
    expect(said('getKey')).toContain("Property 'getKey' does not exist")
    expect(said('numberValue')).toContain("Type 'number' is not assignable")
  })

  it('the error status, tabIndex, role, size and children are not props', () => {
    expect(said('badStatus')).toContain('Type \'"error"\' is not assignable')
    expect(said('tabIndex')).toContain("Property 'tabIndex' does not exist")
    expect(said('role')).toContain("Property 'role' does not exist")
    expect(said('size')).toContain("Property 'size' does not exist")
    expect(said('children')).toMatch(/children/)
  })

  it('a className function and a ref to another element', () => {
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
    expect(said('wrongRef')).toContain('HTMLDivElement')
  })
})
