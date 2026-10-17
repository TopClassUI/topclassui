import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'shared', 'contracts')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, `menu-probe-${name}.tsx`))

const PRELUDE = [
  "import type { MenuContract, MenuItem } from './menu.js'",
  'export declare function signOut(formData: FormData): Promise<void>',
  'export declare function copy(): void',
  'export type Seen = MenuContract | MenuItem',
].join('\n')

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `${PRELUDE}\n${code}\n`]))

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

/** An item written in place, the way a page writes it. */
const item = (fields: string) => `export const probe: MenuItem = { id: 'a', label: 'A', ${fields} }`

/** An item held in a variable first, so the verdict is assignability and not a literal's excess-property check. */
const held = (fields: string) =>
  `declare const held: { id: string; label: string; ${fields} }\nexport const probe: MenuItem = held`

const ACTION = 'action: (formData: FormData) => Promise<void>'
const SELECT = 'onSelect: () => void'

/** The sample of the Dropdown card, with its icons as elements. */
const ITEMS = [
  "{ id: 'profile', label: 'Profile', icon: <svg />, shortcut: 'Ctrl P', href: '/profile' }",
  "{ id: 'copy', label: 'Copy', disabled: true, onSelect: copy }",
  "{ id: 'signout', label: 'Sign out', tone: 'danger', separatorBefore: true, action: signOut }",
].join(', ')

const menu = (rest: string, items = `[${ITEMS}]`) =>
  `export const probe: MenuContract = { trigger: <button type='button'>Account</button>, items: ${items}, ${rest} }`

const verdict = compile({
  link: item("href: '/profile'"),
  action: item('action: signOut'),
  syncAction: item('action: (formData: FormData) => { void formData }'),
  select: item('onSelect: copy'),
  none: item("tone: 'danger'"),
  noneHeld: held('disabled: boolean'),
  linkAndAction: held(`href: string; ${ACTION}`),
  linkAndSelect: held(`href: string; ${SELECT}`),
  actionAndSelect: held(`${ACTION}; ${SELECT}`),
  allThree: held(`href: string; ${ACTION}; ${SELECT}`),
  written: item("href: '/profile', onSelect: copy"),
  maybeLink: held('href: string | undefined'),
  actionAsSelect: item('onSelect: signOut'),
  primary: item("tone: 'primary', href: '/'"),
  narrowed: [
    'export function run(item: MenuItem): string {',
    '  if (item.href !== undefined) return item.href',
    "  if (item.action !== undefined) { void item.action(new FormData()); return 'action' }",
    '  item.onSelect()',
    "  return 'select'",
    '}',
  ].join('\n'),
  menu: menu("title: 'Account'"),
  frozen: `const items = [{ id: 'profile', label: 'Profile', href: '/profile' }] as const\n${menu("title: 'Account'", 'items')}`,
  controlled: menu("title: 'Account', open: true, defaultOpen: false, onOpenChange: (open) => { void open.valueOf() }"),
  linked: menu("title: 'Account', link: <a rel='nofollow' />"),
  stringLink: menu("title: 'Account', link: 'a'"),
  untitled: menu('open: true'),
  stringTrigger: `export const probe: MenuContract = { trigger: 'Account', title: 'Account', items: [] }`,
  sized: menu("title: 'Account', size: 'md'"),
  bareItem: menu("title: 'Account'", "[{ id: 'profile', label: 'Profile' }]"),
})

const said = (name: string) => (verdict[name] ?? ['the probe did not compile at all']).join(' ')

// The message, not a count: a program that fails for any other reason also has errors.
const NOT_AN_ITEM = "is not assignable to type 'MenuItem'"
const HANDLER_BESIDE_ANOTHER = "Type '() => void' is not assignable to type 'undefined'"
const ACTION_BESIDE_ANOTHER = "Type '(formData: FormData) => Promise<void>' is not assignable to type 'undefined'"

describe('a menu item is exactly one of three kinds', () => {
  it('compiles a link, a Server Action that is async or not, and a client handler', () => {
    expect(verdict['link']).toEqual([])
    expect(verdict['action']).toEqual([])
    expect(verdict['syncAction']).toEqual([])
    expect(verdict['select']).toEqual([])
  })

  it('does not compile with none of the three, written in place or held in a variable', () => {
    expect(said('none')).toContain(NOT_AN_ITEM)
    expect(said('noneHeld')).toContain(NOT_AN_ITEM)
  })

  it('does not compile with two of them, whichever two', () => {
    expect(said('linkAndAction')).toContain(ACTION_BESIDE_ANOTHER)
    expect(said('linkAndSelect')).toContain(HANDLER_BESIDE_ANOTHER)
    expect(said('actionAndSelect')).toContain(HANDLER_BESIDE_ANOTHER)
  })

  it('does not compile with all three', () => {
    expect(said('allThree')).toContain(ACTION_BESIDE_ANOTHER)
  })

  it('refuses two kinds written in place for the same reason, not as an unknown property', () => {
    expect(said('written')).toContain(HANDLER_BESIDE_ANOTHER)
  })

  it('does not compile when its one kind may be undefined, which would leave it with none', () => {
    expect(said('maybeLink')).toContain(NOT_AN_ITEM)
  })

  it('refuses a Server Action handed to onSelect, which calls it with no FormData', () => {
    expect(said('actionAsSelect')).toContain('Target signature provides too few arguments. Expected 1 or more, but got 0')
  })

  it('refuses a tone the menu has no look for', () => {
    expect(said('primary')).toContain('Type \'"primary"\' is not assignable to type')
  })

  it('narrows on the three keys, so a component reads each kind without a cast', () => {
    expect(verdict['narrowed']).toEqual([])
  })
})

describe('the contract of a data-driven menu', () => {
  it('compiles the sample of the Dropdown card, with its three kinds of item', () => {
    expect(verdict['menu']).toEqual([])
  })

  it('accepts a list declared as const, the open pair with its event, and a link element', () => {
    expect(verdict['frozen']).toEqual([])
    expect(verdict['controlled']).toEqual([])
    expect(verdict['linked']).toEqual([])
  })

  it('refuses a menu with no title, which is what names its group', () => {
    expect(said('untitled')).toContain("Property 'title' is missing")
  })

  it('takes the trigger and the link as elements, never as strings', () => {
    expect(said('stringTrigger')).toContain("Type 'string' is not assignable to type 'ReactElement")
    expect(said('stringLink')).toContain("Type 'string' is not assignable to type 'ReactElement")
  })

  it('has no size until a menu has more than one row height', () => {
    expect(said('sized')).toContain("'size' does not exist in type 'MenuContract'")
  })

  it('refuses an item with no kind inside a menu too', () => {
    expect(said('bareItem')).toContain(NOT_AN_ITEM)
  })
})
