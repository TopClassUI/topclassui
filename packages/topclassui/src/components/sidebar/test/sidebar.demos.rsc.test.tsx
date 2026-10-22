// The rsc project, where React resolves its react-server build and has no client hooks.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import type * as ReactExports from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

// Both modules start with 'use client', so a Server Component only ever holds references to their exports.
vi.mock('../client.js', () => Object.fromEntries(['SidebarRoot', 'SidebarTrigger'].map((name) => [name, reference(name)])))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))
// The body of the Table in-a-layout shows is a client part as well: it is handed rows already rendered, and plain data.
vi.mock('#components/table/client.js', () => ({ TableRows: reference('TableRows') }))
// The scan calls a Server Component as a plain function, outside a render, where the real useId has no dispatcher.
vi.mock('react', async (original) => ({ ...await original<typeof ReactExports>(), useId: () => 'an-id' }))

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const every = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** A demo that is itself a client file: it holds state, so a server page imports it as a reference and never runs it. */
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
      // An element in a prop crosses too: the children of the rail, and whatever is inside them.
      for (const value of Object.values(props)) crossings(value as ReactNode, found)
    } else if (part) crossings(part(props), found)
    else for (const value of Object.values(props)) crossings(value as ReactNode, found)
  }
  return found
}

/** The path of everything in a value that Flight cannot serialize: a function, a symbol, a class instance. */
function unserializable(value: unknown, path: string, found: string[] = []): string[] {
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') found.push(path)
  else if (Array.isArray(value)) value.forEach((item, index) => unserializable(item, `${path}[${String(index)}]`, found))
  else if (isValidElement(value)) {
    const element = value as ReactElement<Props>
    // A Server Component inside the rail is run on the server: what crosses is what it returns, not its type.
    if (typeof element.type === 'function' && (element.type as Part).client === undefined) {
      unserializable((element.type as Part)(element.props), path, found)
    } else for (const [key, inner] of Object.entries(element.props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

describe('every demo is a Server Component that only hands the client parts what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'collapsed', 'groups', 'in-a-layout', 'long-list', 'playground', 'rtl', 'states'])
  })

  it('leaves out the one demo that is a client file, which cannot run here: it calls useState', async () => {
    expect(every.filter(isClient)).toEqual(['controlled'])
    const Demo = await load('controlled')
    expect(() => Demo()).toThrow(/useState/)
  })

  for (const name of names) {
    it(`${name}: runs with no client hook and no context, and returns an element`, async () => {
      const Demo = await load(name)
      expect(isValidElement(Demo())).toBe(true)
    })

    it(`${name}: passes no function, no symbol and no class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.length, name).toBeGreaterThanOrEqual(2)
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }
})

describe('the parts a demo is built from', () => {
  const parts = async (name: string) => crossings((await load(name))()).map((crossing) => crossing.part)

  it('two client parts and no more: the rail, and the toggle its header draws. Every link is server markup', async () => {
    for (const name of names.filter((demo) => demo !== 'rtl' && demo !== 'states' && demo !== 'in-a-layout')) expect(await parts(name), name).toEqual(['SidebarRoot', 'SidebarTrigger'])
    expect(await parts('states')).toEqual([
      'SidebarRoot', 'SidebarTrigger', 'SidebarRoot', 'SidebarTrigger', 'SidebarRoot', 'SidebarTrigger',
      'SidebarRoot', 'SidebarTrigger', 'SidebarRoot', 'SidebarTrigger',
    ])
    // The page beside the rail holds a Table, whose body is its own client part.
    expect(await parts('in-a-layout')).toEqual(['SidebarRoot', 'SidebarTrigger', 'TableRows'])
  })

  it('rtl: the same two inside the provider an island mounts', async () => {
    expect(await parts('rtl')).toEqual(['TopClassProvider', 'SidebarRoot', 'SidebarTrigger'])
  })

  it('the rail is handed its state as a boolean or nothing, and its children as elements', async () => {
    const handed: Record<string, Props[]> = {}
    for (const name of names) {
      handed[name] = crossings((await load(name))()).filter((crossing) => crossing.part === 'SidebarRoot')
        .map(({ props }) => Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'children')))
    }
    expect(handed).toEqual({
      'basic': [{}], 'collapsed': [{ defaultOpen: false }], 'groups': [{}], 'in-a-layout': [{}], 'long-list': [{}],
      // The Try it rail hands on what the controls pass, which is nothing until one is set.
      'playground': [{ defaultOpen: undefined, open: undefined, className: 'h-auto rounded-box border-(length:--tc-line-width) data-open:w-47.5' }], 'rtl': [{}],
      'states': [
        { 'aria-label': 'expanded', 'defaultOpen': true, 'className': 'data-open:w-40 rounded-box border-(length:--tc-line-width)' },
        { 'aria-label': 'collapsed', 'defaultOpen': false, 'className': 'data-open:w-40 rounded-box border-(length:--tc-line-width)' },
        { 'aria-label': 'active item', 'defaultOpen': true, 'className': 'data-open:w-40 rounded-box border-(length:--tc-line-width)' },
        { 'aria-label': 'hover', 'defaultOpen': true, 'className': 'data-open:w-40 rounded-box border-(length:--tc-line-width)' },
        { 'aria-label': 'focus-visible', 'defaultOpen': true, 'className': 'data-open:w-40 rounded-box border-(length:--tc-line-width)' },
      ],
    })
    const collapsed = crossings((await load('collapsed'))()).find((crossing) => crossing.part === 'SidebarRoot')
    expect(collapsed?.props['defaultOpen']).toBe(false)
  })

  it('the toggle is handed nothing at all: it reads the rail through context, in the browser', async () => {
    const toggle = crossings((await load('basic'))()).find((crossing) => crossing.part === 'SidebarTrigger')
    expect(toggle?.props).toEqual({})
  })
})

describe('the scans see what they claim to', () => {
  const Root = reference('SidebarRoot')
  const Toggle = reference('SidebarTrigger')
  function Server({ children }: { children?: ReactNode }) { return <section>{children}</section> }
  function Leaky() { return <button type="button" onClick={() => undefined}>Leak</button> }

  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    const props = {
      onOpenChange: () => undefined, when: new Date(0), mark: Symbol('x'),
      render: <button type="button" onClick={() => undefined} />, items: [1, 'two', { fine: true, bad: () => undefined }],
    }
    expect(unserializable(props, 'SidebarRoot')).toEqual([
      'SidebarRoot.onOpenChange', 'SidebarRoot.when', 'SidebarRoot.mark', 'SidebarRoot.render.onClick', 'SidebarRoot.items[2].bad',
    ])
  })

  it('a function a Server Component inside the rail hands on is found through what that component returns', () => {
    expect(unserializable({ children: <Leaky /> }, 'SidebarRoot')).toEqual(['SidebarRoot.children.onClick'])
  })

  it('a client part inside a Server Component, inside a prop and inside an array is found, and never called', () => {
    const tree = <Server><Root id="a" header={<Toggle id="x" />}>{[<Toggle key="b" id="y" />]}</Root></Server>
    expect(crossings(tree).map(({ part, props }) => `${part} ${String(props['id'])}`)).toEqual(['SidebarRoot a', 'SidebarTrigger x', 'SidebarTrigger y'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => Root({})).toThrow('SidebarRoot ran on the server')
  })
})
