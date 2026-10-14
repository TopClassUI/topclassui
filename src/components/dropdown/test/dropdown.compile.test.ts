import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'dropdown')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `dropdown-probe-${name}.tsx`))

/** The nine exports, by the names the README imports them under. */
const PARTS = 'DropdownGroup, DropdownGroupLabel, DropdownItem, DropdownLinkItem, DropdownMenu, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger'

/** What a page that pastes a sample has in scope: the parts, Button, the Link of its framework and a Server Action. */
const PRELUDE = [
  "import { Button } from '../../button/index.js'",
  `import { ${PARTS} } from '../index.js'`,
  'declare function Link(props: { href: string, prefetch?: boolean }): React.JSX.Element',
  'declare function signOut(formData: FormData): Promise<void>',
  'declare function copy(): void',
  `export const used = [Button, Link, signOut, copy, ${PARTS}]`,
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
const menu = (root: string, popup: string, inside = '<DropdownItem>Rename</DropdownItem>') =>
  `<DropdownRoot${root}><DropdownPopup${popup}>${inside}</DropdownPopup></DropdownRoot>`
const rows = (inside: string) => menu('', '', inside)
const trigger = (props: string) => `<DropdownRoot><DropdownTrigger${props} /></DropdownRoot>`
const data = (props: string, items = "[{ id: 'profile', label: 'Profile', href: '/profile' }]") =>
  `<DropdownMenu trigger={<Button>Account</Button>} title="Account" items={${items}}${props} />`

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  readmeSecond: sample(2),
  readmeThird: sample(3),
  placed: menu('', ' placement="end-top" className="max-w-96"'),
  controlled: menu(' open onOpenChange={(open, details) => { void [open, details.reason] }}', ''),
  rootProps: menu(' modal={false} loopFocus={false} highlightItemOnHover={false}', ''),
  portal: menu('', ' keepMounted container={null} finalFocus={false}'),
  hover: trigger(' openOnHover delay={100} closeDelay={200} render={<Button>More</Button>}'),
  row: rows('<DropdownItem icon={<svg />} shortcut="Ctrl P" tone="danger" disabled closeOnClick={false} label="Profile" onClick={copy}>Profile</DropdownItem>'),
  iconOnlyNamed: rows('<DropdownItem icon={<svg />} aria-label="Settings" />'),
  linkRow: rows('<DropdownLinkItem href="/docs" target="_blank" rel="noreferrer" icon={<svg />} shortcut="F1">Docs</DropdownLinkItem>'),
  linkRender: rows('<DropdownLinkItem render={<Link href="/docs" prefetch />}>Docs</DropdownLinkItem>'),
  grouped: rows('<DropdownGroup><DropdownGroupLabel>Sort by</DropdownGroupLabel><DropdownItem>Name</DropdownItem></DropdownGroup><DropdownSeparator />'),
  dataKinds: data(' link={<Link href="" />} placement="top-end" className="max-w-96" defaultOpen', "[{ id: 'a', label: 'A', href: '/a' }, { id: 'b', label: 'B', onSelect: copy }, { id: 'c', label: 'C', action: signOut, tone: 'danger', separatorBefore: true, disabled: true }]"),
  iconOnly: rows('<DropdownItem icon={<svg />} />'),
  iconOnlyLink: rows('<DropdownLinkItem href="/docs" icon={<svg />} />'),
  physicalSide: menu('', ' placement="left"'),
  sideProp: menu('', ' side="left"'),
  size: menu('', ' size="lg"'),
  sideOffset: menu('', ' sideOffset={8}'),
  arrow: menu('', ' showArrow'),
  trapFocus: menu(' modal="trap-focus"', ''),
  rootClass: menu(' className="p-4"', ''),
  rootHandle: menu(' handle={undefined}', ''),
  payload: trigger(' payload={1}'),
  stringDelay: trigger(' openOnHover delay="100"'),
  classFunction: menu('', " className={() => 'p-4'}"),
  primaryTone: rows('<DropdownItem tone="primary">Rename</DropdownItem>'),
  iconName: rows('<DropdownItem icon={{ name: "user" }}>Profile</DropdownItem>'),
  disabledLink: rows('<DropdownLinkItem href="/docs" disabled>Docs</DropdownLinkItem>'),
  checked: rows('<DropdownItem checked>Show hidden files</DropdownItem>'),
  dataNoTitle: '<DropdownMenu trigger={<Button>Account</Button>} items={[]} />',
  dataSize: data(' size="md"'),
  dataModal: data(' modal={false}'),
  dataBareItem: data('', "[{ id: 'profile', label: 'Profile' }]"),
  dataTwoKinds: data('', "[{ id: 'profile', label: 'Profile', href: '/profile', onSelect: copy }]"),
  dataIconName: data('', "[{ id: 'profile', label: 'Profile', icon: { name: 'user' }, href: '/profile' }]"),
})

const said = (name: string) => (verdict[name] ?? ['the probe did not compile at all']).join(' ')

describe('the samples in the README compile as written', () => {
  it('finds the import line and the three samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(4)
    expect(SAMPLES[0]).toContain("} from 'topclassui'")
    expect(SAMPLES[1]).toContain('<DropdownItem tone="danger">Delete</DropdownItem>')
    expect(SAMPLES[2]).toContain('link={<Link href="" />}')
    expect(SAMPLES[3]).toContain('<DropdownLinkItem render={<Link href="/support" />}>')
  })

  for (const [name, what] of [
    ['readmeImport', 'the import line names nine exports that exist, where the generated one names a Dropdown that does not'],
    ['readmeFirst', 'the first sample: the parts, with a shortcut, a disabled row, a separator and a danger row'],
    ['readmeSecond', 'the second sample: the menu from data, with two links, a link element and a Server Action'],
    ['readmeThird', 'the third sample: link items, one of them through render'],
  ] as const) {
    it(what, () => { expect(verdict[name]).toEqual([]) })
  }
})

/** Every probe that must compile clean, by what it shows a Dropdown takes. */
const TAKES: Record<string, string> = {
  placed: 'a placement and a width cap of the caller',
  controlled: 'a controlled menu, whose handler reads the reason it was asked to close',
  rootProps: 'modal, loopFocus and highlightItemOnHover on the root, as booleans',
  portal: 'where its portal mounts, whether it stays mounted, and where the last focus goes',
  hover: 'openOnHover and the two delays, as numbers',
  row: 'a row with an icon, a shortcut, a tone, disabled, closeOnClick, a type-ahead label and a handler',
  iconOnlyNamed: 'a row with an icon alone, once it has an aria-label',
  linkRow: 'a link row with the attributes of an anchor',
  linkRender: 'a link row that is the Link of a framework, through render',
  grouped: 'a group with its label, and a separator',
  dataKinds: 'the data-driven menu with its three kinds of item, a link element, a placement, a className and defaultOpen',
}

describe('what a Dropdown does take', () => {
  for (const [name, what] of Object.entries(TAKES)) {
    it(what, () => { expect(verdict[name]).toEqual([]) })
  }
})

/** Every probe that must not compile, by what it shows a Dropdown refuses, and the compiler's own words for it. */
const REFUSES: Record<string, [what: string, message: string]> = {
  iconOnly: ['a row with an icon alone and no name (R-5.6-1)', "Property ''aria-label'' is missing"],
  iconOnlyLink: ['a link row with an icon alone and no name', "Property ''aria-label'' is missing"],
  physicalSide: ['a physical side as a placement (R-5.3-4)', 'Type \'"left"\' is not assignable'],
  sideProp: ['side on the popup: the positioner is ours', "Property 'side' does not exist"],
  size: ['size, which is not built', "Property 'size' does not exist"],
  sideOffset: ['sideOffset, which is the shared 6 px', "Property 'sideOffset' does not exist"],
  arrow: ['showArrow: no arrow is drawn', "Property 'showArrow' does not exist"],
  trapFocus: ['trap-focus: a menu is modal or it is not', "Type 'string' is not assignable to type 'boolean | undefined'"],
  rootClass: ['a className on the root, which renders no element', "Property 'className' does not exist"],
  rootHandle: ['a handle on the root: nothing exported can create one', "Property 'handle' does not exist"],
  payload: ['a payload on the trigger', "Property 'payload' does not exist"],
  stringDelay: ['a delay that is not a number', "Type 'string' is not assignable to type 'number"],
  classFunction: ['the state function Base UI takes as a className', "is not assignable to type 'string'"],
  primaryTone: ['a tone a menu has no look for', 'Type \'"primary"\' is not assignable'],
  iconName: ['an icon by name', "'name' does not exist in type 'ReactElement"],
  disabledLink: ['disabled on a link item, which Base UI does not have', "Property 'disabled' does not exist"],
  checked: ['checked on an item: checkbox items are not built', "Property 'checked' does not exist"],
  dataNoTitle: ['the data-driven menu with no title', "Property 'title' is missing"],
  dataSize: ['size on the data-driven menu', "Property 'size' does not exist"],
  dataModal: ['modal on the data-driven menu', "Property 'modal' does not exist"],
  dataBareItem: ['an item with no kind', "is not assignable to type 'MenuItem'"],
  dataTwoKinds: ['an item with two kinds', "Type '() => void' is not assignable to type 'undefined'"],
  dataIconName: ['an item with an icon by name', "'name' does not exist in type 'ReactElement"],
}

describe('what a Dropdown does not take', () => {
  it('names twenty-three probes, and with the eleven above and the four samples that is every probe compiled', () => {
    expect(Object.keys(REFUSES)).toHaveLength(23)
    expect(Object.keys(verdict).sort()).toEqual(
      [...Object.keys(TAKES), ...Object.keys(REFUSES), 'readmeFirst', 'readmeImport', 'readmeSecond', 'readmeThird'].sort(),
    )
  })

  for (const [name, [what, message]] of Object.entries(REFUSES)) {
    it(`refuses ${what}`, () => { expect(said(name)).toContain(message) })
  }
})
