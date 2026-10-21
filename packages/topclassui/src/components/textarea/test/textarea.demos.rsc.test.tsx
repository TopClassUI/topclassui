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

vi.mock('../client.js', () => ({ TextareaField: reference('TextareaField') }))
// useId is the one hook the react-server build keeps, and it needs a render to run in: this walk calls the parts by hand.
vi.mock('react', async (original) => ({ ...await original<typeof ReactModule>(), useId: () => '_r_rsc_' }))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))
vi.mock('#components/button/index.js', () => ({ Button: reference('Button') }))

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
const { Textarea } = await import('../index.js')
const run = (props: Props) => crossings(createElement(Textarea, { 'aria-label': 'Bio', ...props }))

describe('Textarea renders in a Server Component (R-5.1-1)', () => {
  it('runs against the react-server build, which has no state and no effects', async () => {
    const react = await import('react')
    expect(['useState' in react, 'useLayoutEffect' in react, typeof react.useId]).toEqual([false, false, 'function'])
  })

  it('a plain one crosses into no client part: a walk of the tree finds none', () => {
    expect(run({})).toEqual([])
    expect(run({ rows: 5, invalid: true, readOnly: true, maxLength: null })).toEqual([])
  })

  it('with autosize or showCount it crosses once, into TextareaField, with plain values and the textarea', () => {
    const [field, ...more] = run({ autosize: true, showCount: true, maxRows: 99, defaultValue: 'Hello' })
    expect(more).toEqual([])
    const { children, counterId, ...values } = field?.props ?? {}
    expect(values).toEqual({ size: 'md', fullWidth: false, rows: 3, maxRows: 40, autosize: true, showCount: true, cap: 5000, length: 5 })
    expect(typeof counterId).toBe('string')
    expect(isValidElement(children) && children.type).toBe('textarea')
    expect(unserializable(field?.props, 'TextareaField')).toEqual([])
  })
})

describe('every demo is a Server Component that only hands client parts what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['autosize', 'basic', 'form', 'long-content', 'playground', 'row', 'rtl', 'show-count', 'sizes', 'skeleton', 'states'])
  })

  for (const name of names) {
    it(`${name}: runs with no client hook, and passes no function, symbol or class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }

  it('the demos that ask for autosize or a count are the ones that load the holder', async () => {
    const counts = await Promise.all(names.map(async (name) => [name, crossings((await load(name))()).filter(({ part }) => part === 'TextareaField').length]))
    expect(Object.fromEntries(counts)).toEqual({
      'autosize': 2, 'basic': 0, 'form': 1, 'long-content': 1, 'playground': 0, 'row': 2, 'rtl': 1, 'show-count': 4, 'sizes': 0, 'skeleton': 0, 'states': 1,
    })
  })
})
