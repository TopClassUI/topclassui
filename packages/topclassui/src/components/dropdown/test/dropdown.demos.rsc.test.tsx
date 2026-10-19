// The rsc project, where React resolves its react-server build and has no client hooks.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })
const references = (names: string[]) => Object.fromEntries(names.map((name) => [name, reference(name)]))

// Each of these modules starts with 'use client', so a Server Component only ever holds references to their exports.
vi.mock('../client.js', () => references([
  'DropdownGroup', 'DropdownGroupLabel', 'DropdownItem', 'DropdownLinkItem', 'DropdownMenu', 'DropdownPopup', 'DropdownRoot',
  'DropdownSeparator', 'DropdownTrigger',
]))
vi.mock('#components/dialog/client.js', () => references([
  'DialogBody', 'DialogClose', 'DialogDescription', 'DialogFooter', 'DialogHeader', 'DialogPopup', 'DialogRoot', 'DialogTitle',
  'DialogTrigger',
]))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const every = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** A demo that is itself a client file: it holds a ref, so a server page imports it as a reference and never runs it. */
const isClient = (name: string) => readFileSync(join(DUMMY, `${name}.tsx`), 'utf8').startsWith("'use client'")
const names = every.filter((name) => !isClient(name))

interface Crossing { part: string, props: Props }

/** Every client part a tree hands props to, in document order. A Server Component in between is run, as React would. */
function crossings(node: ReactNode, found: Crossing[] = []): Crossing[] {
  if (Array.isArray(node)) for (const child of node) crossings(child as ReactNode, found)
  else if (isValidElement(node)) {
    const { type, props } = node as ReactElement<Props>
    const part = typeof type === 'function' ? (type as Part) : undefined
    if (part?.client !== undefined) {
      found.push({ part: part.client, props })
      // An element in a prop crosses too: the Button passed as render, and whatever is inside it.
      for (const value of Object.values(props)) crossings(value as ReactNode, found)
    } else if (part) crossings(part(props), found)
    else crossings(props['children'] as ReactNode, found)
  }
  return found
}

/** A function a bundler registers as a Server Action: its body opens with the 'use server' directive. */
const isServerAction = (value: unknown) =>
  typeof value === 'function' && /^(async\s+)?function[^{]*\{\s*["']use server["']/.test(Function.prototype.toString.call(value))

/** The path of everything in a value that Flight cannot serialize: a function that is no Server Action, a symbol, a class instance. */
function unserializable(value: unknown, path: string, found: string[] = []): string[] {
  if (typeof value === 'function') { if (!isServerAction(value)) found.push(path) }
  else if (typeof value === 'symbol' || typeof value === 'bigint') found.push(path)
  else if (Array.isArray(value)) value.forEach((item, index) => unserializable(item, `${path}[${String(index)}]`, found))
  else if (isValidElement(value)) {
    const element = value as ReactElement<Props>
    for (const [key, inner] of Object.entries(element.props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

describe('every demo is a Server Component that only hands the parts what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual([
      'basic', 'danger-item', 'data-driven', 'groups', 'in-dialog', 'placements', 'rtl', 'sixty-items', 'with-links',
    ])
  })

  it('leaves out the two demos that are client files, which cannot run here: they draw a menu open in a box of their own, held by useRef', async () => {
    expect(every.filter(isClient)).toEqual(['playground', 'states'])
    const Demo = await load('playground')
    expect(() => Demo()).toThrow(/useRef/)
  })

  for (const name of names) {
    it(`${name}: runs with no hook and no context, and returns an element`, async () => {
      const Demo = await load(name)
      expect(isValidElement(Demo())).toBe(true)
    })

    it(`${name}: passes no function but a Server Action, no symbol and no class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.length, name).toBeGreaterThan(0)
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }
})

describe('the parts a demo is built from', () => {
  const parts = async (name: string) => crossings((await load(name))()).map((crossing) => crossing.part)

  it('basic: the root, the trigger, the popup, five rows and a separator, each a reference', async () => {
    expect(await parts('basic')).toEqual([
      'DropdownRoot', 'DropdownTrigger', 'DropdownPopup', 'DropdownItem', 'DropdownItem', 'DropdownItem', 'DropdownItem',
      'DropdownSeparator', 'DropdownItem',
    ])
  })

  it('groups: two groups, each with its label', async () => {
    const all = await parts('groups')
    expect(all.filter((part) => part === 'DropdownGroup')).toHaveLength(2)
    expect(all.filter((part) => part === 'DropdownGroupLabel')).toHaveLength(2)
  })

  it('with-links: four link items, whose href and render are a string and an element', async () => {
    const links = crossings((await load('with-links'))()).filter((crossing) => crossing.part === 'DropdownLinkItem')
    expect(links.map((link) => link.props['href'])).toEqual(['#docs', '#changelog', undefined, 'https://example.com/status'])
    expect(isValidElement(links[2]?.props['render'])).toBe(true)
  })

  it('placements: twelve menus, one per placement, each a plain string', async () => {
    const all = crossings((await load('placements'))())
    expect(all.filter((crossing) => crossing.part === 'DropdownPopup').map((crossing) => crossing.props['placement'])).toEqual([
      'top-start', 'top', 'top-end', 'start-top', 'start', 'start-bottom',
      'end-top', 'end', 'end-bottom', 'bottom-start', 'bottom', 'bottom-end',
    ])
  })

  it('rtl: the same parts inside the provider an island mounts', async () => {
    expect((await parts('rtl')).slice(0, 4)).toEqual(['TopClassProvider', 'DropdownRoot', 'DropdownTrigger', 'DropdownPopup'])
  })

  it('in-dialog: the menu is inside the body of a dialog, and both are references', async () => {
    const all = await parts('in-dialog')
    expect(all.indexOf('DialogBody')).toBeLessThan(all.indexOf('DropdownRoot'))
    expect(all.filter((part) => part === 'DropdownItem')).toHaveLength(3)
  })

  it('sixty-items: sixty rows, every one mounted', async () => {
    expect((await parts('sixty-items')).filter((part) => part === 'DropdownItem')).toHaveLength(60)
  })

  it('hands each trigger its control as an element in render, with the label inside it', async () => {
    const triggers = crossings((await load('placements'))()).filter((found) => found.part === 'DropdownTrigger')
    expect(triggers).toHaveLength(12)
    for (const crossing of triggers) {
      expect(isValidElement(crossing.props['render'])).toBe(true)
      expect(crossing.props['children']).toBeUndefined()
    }
  })
})

describe('the scans see what they claim to', () => {
  const Root = reference('DropdownRoot')
  const Popup = reference('DropdownPopup')
  function Server({ children }: { children?: ReactNode }) { return <section>{children}</section> }

  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    const props = {
      onOpenChange: () => undefined, when: new Date(0), mark: Symbol('x'),
      render: <button type="button" onClick={() => undefined} />, items: [1, 'two', { fine: true, bad: () => undefined }],
    }
    expect(unserializable(props, 'DropdownRoot')).toEqual([
      'DropdownRoot.onOpenChange', 'DropdownRoot.when', 'DropdownRoot.mark', 'DropdownRoot.render.onClick', 'DropdownRoot.items[2].bad',
    ])
  })

  it('only a function whose body opens with the directive is a Server Action', () => {
    expect(isServerAction(async function () { 'use server'; await Promise.resolve() })).toBe(true)
    expect(isServerAction(async function () { await Promise.resolve('use server') })).toBe(false)
    expect(isServerAction(() => 'use server')).toBe(false)
    expect(isServerAction('use server')).toBe(false)
  })

  it('a client part inside a Server Component, inside a prop and inside an array is found, and never called', () => {
    const tree = <Server><Root open render={<Popup placement="top" />}>{[<Popup key="a" placement="end" />]}</Root></Server>
    expect(crossings(tree).map(({ part, props }) => `${part} ${String(props['placement'] ?? props['open'])}`))
      .toEqual(['DropdownRoot true', 'DropdownPopup top', 'DropdownPopup end'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => Root({})).toThrow('DropdownRoot ran on the server')
  })
})
