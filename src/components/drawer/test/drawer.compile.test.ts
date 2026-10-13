import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'drawer')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `drawer-probe-${name}.tsx`))

/** The nine parts, by the names the README imports them under. */
const PARTS = 'DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger'

/** What a page that pastes a sample has in scope: the nine parts, Button, Input and its own Server Action. */
const PRELUDE = [
  "import { Button } from '../../button/index.js'",
  "import { Input } from '../../input/index.js'",
  `import { ${PARTS} } from '../index.js'`,
  'declare function inviteTeammate(data: FormData): Promise<void>',
  `export const used = [Button, Input, ${PARTS}, inviteTeammate]`,
].join('\n')

/** The import line compiles as a module that uses what it imports, and any other sample as JSX, the way a page would paste it. */
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
const sheet = (root: string, popup: string, inside = '') => `<DrawerRoot${root}><DrawerPopup${popup}>${inside}</DrawerPopup></DrawerRoot>`

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  readmeForm: sample(2),
  // It type-checks, which is why the README has to say not to write it.
  formOnPopup: sheet('', ' render={<form action={inviteTeammate} />}', '<DrawerBody>Body</DrawerBody>'),
  placements: `<>${sheet(' placement="start"', '')}${sheet(' placement="end"', '')}${sheet(' placement="top"', '')}${sheet(' placement="bottom"', '')}</>`,
  sizes: `<>${sheet(' size="xs"', '')}${sheet(' size="custom"', ' className="max-w-xl"')}</>`,
  noHeader: sheet(' placement="start"', ' aria-label="Browse"', '<DrawerBody>Links</DrawerBody>'),
  controlled: sheet(" open onOpenChange={(open, details) => { void [open, details.reason === 'swipe'] }}", ''),
  modalValues: `<>${sheet(' modal', '')}${sheet(' modal={false}', '')}${sheet(' modal="trap-focus"', '')}</>`,
  portal: sheet('', ' keepMounted container={null} initialFocus finalFocus={() => document.body}'),
  physicalPlacement: sheet(' placement="left"', ''),
  swipeNamePlacement: sheet(' placement="down"', ''),
  badSize: sheet(' size="huge"', ''),
  rootClass: sheet(' className="p-4"', ''),
  rootHandle: sheet(' handle={undefined}', ''),
  swipeDirection: sheet(' swipeDirection="left"', ''),
  snapPoints: sheet(' snapPoints={[0.5, 1]}', ''),
  dismissible: sheet(' dismissible={false}', ''),
  classFunction: sheet('', " className={() => 'p-4'}"),
  placementOnPopup: sheet('', ' placement="start"'),
  sizeOnPopup: sheet('', ' size="lg"'),
  closeButton: sheet('', '', '<DrawerHeader closeButton={false} />'),
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("} from 'topclassui'")
    expect(SAMPLES[1]).toContain('<DrawerTitle>Filters</DrawerTitle>')
    expect(SAMPLES[2]).toContain('<form action={inviteTeammate} className="contents">')
  })

  it('the import line names nine exports that exist, where the generated one names a Drawer that does not', () => {
    expect(verdict['readmeImport']).toEqual([])
  })

  it('the first sample: a header, a body and a footer with two ways out', () => {
    expect(verdict['readmeFirst']).toEqual([])
  })

  it('the second sample: a bottom sheet around a form with a Server Action', () => {
    expect(verdict['readmeForm']).toEqual([])
  })
})

describe('what a Drawer does take', () => {
  it('each of the four placements, on the root', () => {
    expect(verdict['placements']).toEqual([])
  })

  it('a size on the root, and custom with a width on the popup', () => {
    expect(verdict['sizes']).toEqual([])
  })

  it('a sheet with no header and no title, named by aria-label', () => {
    expect(verdict['noHeader']).toEqual([])
  })

  it('a controlled sheet, whose handler reads swipe as the reason it was asked to close', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('each of the three values of modal', () => {
    expect(verdict['modalValues']).toEqual([])
  })

  it('where its portal mounts, whether it stays mounted, initialFocus as a boolean, and a function for the last focus', () => {
    expect(verdict['portal']).toEqual([])
  })

  it('a form as the popup itself, because render passes to Base UI: valid TypeScript, invalid ARIA', () => {
    expect(verdict['formOnPopup']).toEqual([])
  })
})

describe('what a Drawer does not take', () => {
  it('refuses a physical side as a placement (R-5.3-4)', () => {
    expect((verdict['physicalPlacement'] ?? []).join(' ')).toContain('Type \'"left"\' is not assignable')
  })

  it('refuses the swipe names of Base UI as a placement', () => {
    expect((verdict['swipeNamePlacement'] ?? []).join(' ')).toContain('Type \'"down"\' is not assignable')
  })

  it('refuses swipeDirection on the root: it follows the placement', () => {
    expect((verdict['swipeDirection'] ?? []).join(' ')).toContain("Property 'swipeDirection' does not exist")
  })

  it('refuses snapPoints, which is not built: Base UI would count snaps that no class draws', () => {
    expect((verdict['snapPoints'] ?? []).join(' ')).toContain("Property 'snapPoints' does not exist")
  })

  it('refuses a handle on the root: nothing exported can create one', () => {
    expect((verdict['rootHandle'] ?? []).join(' ')).toContain("Property 'handle' does not exist")
  })

  it('refuses a size outside the scale', () => {
    expect((verdict['badSize'] ?? []).join(' ')).toContain('Type \'"huge"\' is not assignable')
  })

  it('refuses a className on the root, which renders no element', () => {
    expect((verdict['rootClass'] ?? []).join(' ')).toContain("Property 'className' does not exist")
  })

  it('refuses dismissible, which is not built: pass disablePointerDismissal', () => {
    expect((verdict['dismissible'] ?? []).join(' ')).toContain("Property 'dismissible' does not exist")
  })

  it('refuses the state function Base UI takes as a className, so cn() always has a string', () => {
    expect((verdict['classFunction'] ?? []).join(' ')).toContain("is not assignable to type 'string'")
  })

  it('refuses placement and size on the popup, where the docs sample wrote the first: both are on the root', () => {
    expect((verdict['placementOnPopup'] ?? []).join(' ')).toContain("Property 'placement' does not exist")
    expect((verdict['sizeOnPopup'] ?? []).join(' ')).toContain("Property 'size' does not exist")
  })

  it('refuses closeButton on the header: the x is on the sheet, and nothing removes it', () => {
    expect((verdict['closeButton'] ?? []).join(' ')).toContain("Property 'closeButton' does not exist")
  })
})
