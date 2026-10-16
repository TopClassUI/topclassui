import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'popover')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `popover-probe-${name}.tsx`))

/** The six parts, by the names the README imports them under. */
const PARTS = 'PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger'

/** What a page that pastes a sample has in scope: the six parts and Button. */
const PRELUDE = [
  "import { Button } from '../../button/index.js'",
  `import { ${PARTS} } from '../index.js'`,
  `export const used = [Button, ${PARTS}]`,
].join('\n')

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
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
const popover = (root: string, popup: string, inside = '') => `<PopoverRoot${root}><PopoverPopup${popup}>${inside}</PopoverPopup></PopoverRoot>`
const trigger = (props: string) => `<PopoverRoot><PopoverTrigger${props} /></PopoverRoot>`

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  readmeSecond: sample(2),
  readmeThird: sample(3),
  placed: popover('', ' placement="end-top" className="w-96"'),
  controlled: popover(' open onOpenChange={(open, details) => { void [open, details.reason] }}', ''),
  modalValues: `<>${popover(' modal', '')}${popover(' modal={false}', '')}${popover(' modal="trap-focus"', '')}</>`,
  portal: popover('', ' keepMounted container={null} finalFocus={() => document.body} initialFocus={false}'),
  hover: trigger(' openOnHover delay={100} closeDelay={200} render={<Button>Details</Button>}'),
  linkTrigger: trigger(' nativeButton={false} render={<span role="button">Open</span>}'),
  named: popover('', ' aria-label="Filters" lang="ar" tabIndex={-1}', '<PopoverTitle render={<h3 />}>Filters</PopoverTitle>'),
  // It type-checks, because render passes to Base UI: that is why the README has to say not to write it.
  formOnPopup: popover('', ' render={<form />}'),
  physicalSide: popover('', ' placement="left"'),
  sideProp: popover('', ' side="left"'),
  size: popover('', ' size="lg"'),
  sideOffset: popover('', ' sideOffset={8}'),
  arrow: popover('', ' showArrow'),
  dismissible: popover(' dismissible={false}', ''),
  badModal: popover(' modal="half"', ''),
  rootClass: popover(' className="p-4"', ''),
  rootHandle: popover(' handle={undefined}', ''),
  payload: trigger(' payload={1}'),
  stringDelay: trigger(' openOnHover delay="100"'),
  classFunction: popover('', " className={() => 'p-4'}"),
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the three samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(4)
    expect(SAMPLES[0]).toContain("} from 'topclassui'")
    expect(SAMPLES[1]).toContain('<PopoverTitle>Share this page</PopoverTitle>')
    expect(SAMPLES[2]).toContain('<PopoverClose />')
    expect(SAMPLES[3]).toContain('openOnHover delay={100} closeDelay={200}')
  })

  it('the import line names six exports that exist, where the generated one names a Popover that does not', () => {
    expect(verdict['readmeImport']).toEqual([])
  })

  it('the first sample: a title, a description and an action', () => {
    expect(verdict['readmeFirst']).toEqual([])
  })

  it('the second sample: the x in a row with the title', () => {
    expect(verdict['readmeSecond']).toEqual([])
  })

  it('the third sample: a popover the pointer opens', () => {
    expect(verdict['readmeThird']).toEqual([])
  })
})

describe('what a Popover does take', () => {
  it('a placement and a width of the caller', () => {
    expect(verdict['placed']).toEqual([])
  })

  it('a controlled popover, whose handler reads the reason it was asked to close', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('each of the three values of modal', () => {
    expect(verdict['modalValues']).toEqual([])
  })

  it('where its portal mounts, whether it stays mounted, and where the first and the last focus go', () => {
    expect(verdict['portal']).toEqual([])
  })

  it('openOnHover and the two delays, as numbers', () => {
    expect(verdict['hover']).toEqual([])
  })

  it('a trigger that is not a button, with nativeButton={false}', () => {
    expect(verdict['linkTrigger']).toEqual([])
  })

  it('a name, a language and a tabIndex on the popup, and another heading level for the title', () => {
    expect(verdict['named']).toEqual([])
  })

  it('a form as the popup itself, because render passes to Base UI: valid TypeScript, invalid ARIA', () => {
    expect(verdict['formOnPopup']).toEqual([])
  })
})

describe('what a Popover does not take', () => {
  it('refuses a physical side as a placement (R-5.3-4)', () => {
    expect((verdict['physicalSide'] ?? []).join(' ')).toContain('Type \'"left"\' is not assignable')
  })

  it('refuses side on the popup: the positioner is ours, and takes what the placement maps to', () => {
    expect((verdict['sideProp'] ?? []).join(' ')).toContain("Property 'side' does not exist")
  })

  it('refuses size, which is not built: one width, and a class for another', () => {
    expect((verdict['size'] ?? []).join(' ')).toContain("Property 'size' does not exist")
  })

  it('refuses sideOffset, which is the shared 6 px, showArrow, since no arrow is drawn, and dismissible', () => {
    expect((verdict['sideOffset'] ?? []).join(' ')).toContain("Property 'sideOffset' does not exist")
    expect((verdict['arrow'] ?? []).join(' ')).toContain("Property 'showArrow' does not exist")
    expect((verdict['dismissible'] ?? []).join(' ')).toContain("Property 'dismissible' does not exist")
  })

  it('refuses a fourth value of modal', () => {
    expect((verdict['badModal'] ?? []).join(' ')).toContain('Type \'"half"\' is not assignable')
  })

  it('refuses a className on the root, which renders no element', () => {
    expect((verdict['rootClass'] ?? []).join(' ')).toContain("Property 'className' does not exist")
  })

  it('refuses a handle on the root and a payload on the trigger: nothing exported can create a handle', () => {
    expect((verdict['rootHandle'] ?? []).join(' ')).toContain("Property 'handle' does not exist")
    expect((verdict['payload'] ?? []).join(' ')).toContain("Property 'payload' does not exist")
  })

  it('refuses a delay that is not a number', () => {
    expect((verdict['stringDelay'] ?? []).join(' ')).toContain("Type 'string' is not assignable to type 'number")
  })

  it('refuses the state function Base UI takes as a className, so cn() always has a string', () => {
    expect((verdict['classFunction'] ?? []).join(' ')).toContain("is not assignable to type 'string'")
  })
})
