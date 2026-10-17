// The rsc project, where React resolves its react-server build and has no client hooks.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

// Both modules start with 'use client', so a Server Component only ever holds references to their exports.
vi.mock('../client.js', () => Object.fromEntries(
  ['TabsList', 'TabsPanel', 'TabsRoot', 'TabsTab'].map((name) => [name, reference(name)]),
))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))

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
      // An element in a prop crosses too: the children of a panel, and whatever is inside them.
      for (const value of Object.values(props)) crossings(value as ReactNode, found)
    } else if (part) crossings(part(props), found)
    else crossings(props['children'] as ReactNode, found)
  }
  return found
}

/** The path of everything in a value that Flight cannot serialize: a function, a symbol, a class instance. */
function unserializable(value: unknown, path: string, found: string[] = []): string[] {
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') found.push(path)
  else if (Array.isArray(value)) value.forEach((item, index) => unserializable(item, `${path}[${String(index)}]`, found))
  else if (isValidElement(value)) {
    const element = value as ReactElement<Props>
    // A Server Component inside a panel is run on the server: what crosses is what it returns, not its type.
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

describe('every demo is a Server Component that only hands the parts what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'disabled', 'enclosed', 'long-label', 'many', 'rtl', 'server-content', 'sizes'])
  })

  it('leaves out the one demo that is a client file, which cannot run here: it calls useState', async () => {
    expect(every.filter(isClient)).toEqual(['controlled'])
    const Demo = await load('controlled')
    expect(() => Demo()).toThrow(/useState/)
  })

  for (const name of names) {
    it(`${name}: runs with no hook and no context, and returns an element`, async () => {
      const Demo = await load(name)
      expect(isValidElement(Demo())).toBe(true)
    })

    it(`${name}: passes no function, no symbol and no class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.length, name).toBeGreaterThan(5)
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }
})

describe('the parts a demo is built from', () => {
  const parts = async (name: string) => crossings((await load(name))()).map((crossing) => crossing.part)

  it('basic: the four flat parts, each a reference: one root, one list, three tabs and three panels', async () => {
    expect(await parts('basic')).toEqual([
      'TabsRoot', 'TabsList', 'TabsTab', 'TabsTab', 'TabsTab', 'TabsPanel', 'TabsPanel', 'TabsPanel',
    ])
  })

  it('rtl: the same parts inside the provider an island mounts', async () => {
    expect((await parts('rtl')).slice(0, 3)).toEqual(['TopClassProvider', 'TabsRoot', 'TabsList'])
  })

  it('every root is given the tab it opens on as a plain string, so the server HTML shows a panel', async () => {
    for (const name of names) {
      const roots = crossings((await load(name))()).filter((crossing) => crossing.part === 'TabsRoot')
      expect(roots.length, name).toBeGreaterThanOrEqual(1)
      for (const root of roots) expect(typeof root.props['defaultValue'], name).toBe('string')
    }
  })

  it('server-content: the list and the form inside the panels are built on the server and cross as elements', async () => {
    const panels = crossings((await load('server-content'))()).filter((crossing) => crossing.part === 'TabsPanel')
    expect(panels).toHaveLength(2)
    const [members, invite] = panels.map((panel) => panel.props['children'] as ReactElement<Props>)
    expect(members?.type).toBe('ul')
    expect(invite?.type).toBe('form')
    // The field and the button are Server Components: functions the server runs, never a client reference.
    const inForm = (invite?.props['children'] as ReactElement[]).map((child) => typeof child.type === 'function' ? (child.type as Part).client ?? 'server' : child.type)
    expect(inForm).toEqual(['label', 'server', 'server'])
  })

  it('sizes: twelve roots, the six sizes of each look', async () => {
    const roots = crossings((await load('sizes'))()).filter((crossing) => crossing.part === 'TabsRoot')
    expect(roots.map((root) => `${String(root.props['variant'])} ${String(root.props['size'])}`)).toEqual([
      'line xs', 'line sm', 'line md', 'line lg', 'line xl', 'line custom',
      'enclosed xs', 'enclosed sm', 'enclosed md', 'enclosed lg', 'enclosed xl', 'enclosed custom',
    ])
  })
})

describe('the scans see what they claim to', () => {
  const Root = reference('TabsRoot')
  const Panel = reference('TabsPanel')
  function Server({ children }: { children?: ReactNode }) { return <section>{children}</section> }
  function Leaky() { return <button type="button" onClick={() => undefined}>Leak</button> }

  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    const props = {
      onValueChange: () => undefined, when: new Date(0), mark: Symbol('x'),
      render: <button type="button" onClick={() => undefined} />, items: [1, 'two', { fine: true, bad: () => undefined }],
    }
    expect(unserializable(props, 'TabsRoot')).toEqual([
      'TabsRoot.onValueChange', 'TabsRoot.when', 'TabsRoot.mark', 'TabsRoot.render.onClick', 'TabsRoot.items[2].bad',
    ])
  })

  it('a function a Server Component inside a panel hands on is found through what that component returns', () => {
    expect(unserializable({ children: <Leaky /> }, 'TabsPanel')).toEqual(['TabsPanel.children.onClick'])
  })

  it('a client part inside a Server Component, inside a prop and inside an array is found, and never called', () => {
    const tree = <Server><Root defaultValue="a" render={<Panel value="x" />}>{[<Panel key="a" value="y" />]}</Root></Server>
    expect(crossings(tree).map(({ part, props }) => `${part} ${String(props['value'] ?? props['defaultValue'])}`))
      .toEqual(['TabsRoot a', 'TabsPanel x', 'TabsPanel y'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => Root({})).toThrow('TabsRoot ran on the server')
  })
})
