// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('../client.js', () => ({ TreeView: reference('TreeView') }))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
/** A client demo is itself a client reference to a server page: it holds state, so it never runs there. */
const CLIENT = ['load-more']

interface Crossing { part: string, props: Props }

/** Every client part a tree hands props to, in document order. A Server Component in between is run, as React would. */
function crossings(node: ReactNode, found: Crossing[] = []): Crossing[] {
  if (Array.isArray(node)) for (const child of node) crossings(child as ReactNode, found)
  else if (isValidElement(node)) {
    const { type, props } = node as ReactElement<Props>
    const part = typeof type === 'function' ? (type as Part) : undefined
    if (part?.client !== undefined) {
      found.push({ part: part.client, props })
      crossings(props['children'] as ReactNode, found)
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
    // A server component inside a prop is run by Flight; only its output crosses.
    if (typeof element.type === 'function') unserializable((element.type as Part)(element.props), path, found)
    else for (const [key, inner] of Object.entries(element.props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

describe('every server demo only hands the TreeView what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'load-more', 'long-content', 'playground', 'rtl', 'selected', 'states', 'status', 'ten-thousand'])
  })

  for (const name of names.filter((one) => !CLIENT.includes(one))) {
    it(`${name}: runs with no hook, and passes no function, symbol or class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.filter(({ part }) => part === 'TreeView').length, name).toBeGreaterThan(0)
      expect(found.flatMap(({ props }) => unserializable({ ...props, children: undefined }, 'props')), name).toEqual([])
    })
  }

  it('load-more is a client file, so a server page imports it as a reference and never runs it', () => {
    expect(readFileSync(join(DUMMY, 'load-more.tsx'), 'utf8').startsWith("'use client'\n")).toBe(true)
  })

  it('basic: each icon crosses as an element, and the nodes as plain objects', async () => {
    const [tree] = crossings((await load('basic'))())
    const items = tree?.props['items'] as { id: string, icon?: unknown, children?: unknown[] }[]
    expect(items.map((node) => node.id)).toEqual(['src', 'package', 'readme'])
    expect(isValidElement(items[0]?.icon)).toBe(true)
  })

  it('ten-thousand: ten folders of a thousand files cross as plain objects', async () => {
    const [tree] = crossings((await load('ten-thousand'))())
    const items = tree?.props['items'] as { id: string, label: string, children: unknown[] }[]
    expect(items).toHaveLength(10)
    expect(items.flatMap((node) => node.children)).toHaveLength(10_000)
    expect(items.at(-1)?.children.at(-1)).toEqual({ id: 'f10-1000', label: 'File 10000.ts' })
  })

  it('rtl: the TreeView sits inside the provider an island mounts', async () => {
    expect(crossings((await load('rtl'))()).map(({ part }) => part)).toEqual(['TopClassProvider', 'TreeView'])
  })
})

describe('the scans see what they claim to', () => {
  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    expect(unserializable({ on: () => undefined, when: new Date(0), mark: Symbol('x'), fine: [1, 'a'] }, 'TreeView'))
      .toEqual(['TreeView.on', 'TreeView.when', 'TreeView.mark'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => reference('TreeView')({})).toThrow('TreeView ran on the server')
  })
})
