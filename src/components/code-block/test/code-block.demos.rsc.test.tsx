// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type * as ReactModule from 'react'
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('../client.js', () => ({ CodeBlockCopy: reference('CodeBlockCopy') }))
// useId is the one hook the react-server build keeps, and it needs a render to run in: this walk calls the parts by hand.
vi.mock('react', async (original) => ({ ...await original<typeof ReactModule>(), useId: () => '_r_rsc_' }))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

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
    for (const [key, inner] of Object.entries((value as ReactElement<Props>).props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default
// Loaded after the mocks above exist, as a bundler would resolve the client file to its reference.
const { CodeBlock } = await import('../index.js')
const run = (props: Props) => crossings(createElement(CodeBlock, { children: 'const a = 1', ...props }))

describe('CodeBlock renders in a Server Component (R-5.1-1)', () => {
  it('runs against the react-server build, which has no state and no effects', async () => {
    const react = await import('react')
    expect(['useState' in react, 'useLayoutEffect' in react, typeof react.useId]).toEqual([false, false, 'function'])
  })

  it('with showCopy={false} it crosses into no client part, so it ships no script', () => {
    expect(run({ showCopy: false })).toEqual([])
    expect(run({ showCopy: false, title: 'page.tsx', wrap: true, highlighted: createElement('b', null, 'a') })).toEqual([])
  })

  it('with the button it crosses once, into CodeBlockCopy, with the code and three strings', () => {
    const [button, ...more] = run({ title: 'page.tsx' })
    expect(more).toEqual([])
    expect(button?.props).toEqual({ code: 'const a = 1', label: 'Copy', copied: 'Copied', failed: 'Could not copy', titleId: '_r_rsc_' })
    expect(unserializable(button?.props, 'CodeBlockCopy')).toEqual([])
  })

  it('with no title the button gets no title id', () => {
    expect(run({})[0]?.props['titleId']).toBeUndefined()
  })
})

describe('every demo is a Server Component that only hands client parts what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'highlighted', 'long-line', 'no-copy', 'no-header', 'playground', 'rtl', 'states', 'wrap'])
  })

  for (const name of names) {
    it(`${name}: runs with no client hook, and passes no function, symbol or class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      // A client part's children are rendered on the server first, and the walk above already went into them.
      expect(found.flatMap(({ part, props }) => unserializable({ ...props, children: undefined }, part)), name).toEqual([])
    })
  }

  it('only the demos with a copy button load it', async () => {
    const counts = await Promise.all(names.map(async (name) => [name, crossings((await load(name))()).filter(({ part }) => part === 'CodeBlockCopy').length]))
    expect(Object.fromEntries(counts)).toEqual({
      'basic': 1, 'highlighted': 1, 'long-line': 1, 'no-copy': 0, 'no-header': 0, 'playground': 1, 'rtl': 1, 'states': 2, 'wrap': 1,
    })
  })

  it('rtl: the provider, then the button with its Arabic words as plain strings', async () => {
    const found = crossings((await load('rtl'))())
    expect(found.map(({ part }) => part)).toEqual(['TopClassProvider', 'CodeBlockCopy'])
    expect(found[1]?.props['label']).toBe('نسخ')
  })
})
