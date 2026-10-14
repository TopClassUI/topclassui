// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('../client.js', () => ({ Slider: reference('Slider') }))
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

describe('every demo is a Server Component that only hands the slider what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'range', 'rtl', 'show-value', 'sizes', 'states'])
  })

  for (const name of names) {
    it(`${name}: runs with no hook, and passes no function, symbol or class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.filter(({ part }) => part === 'Slider').length, name).toBeGreaterThan(0)
      expect(found.flatMap(({ props }) => unserializable({ ...props, children: undefined }, 'props')), name).toEqual([])
    })
  }

  it('a range and a format are plain data: an array of two numbers and an options object', async () => {
    const budget = crossings((await load('show-value'))()).at(-1)?.props ?? {}
    expect([budget['defaultValue'], budget['format']]).toEqual([[200, 800], { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }])
  })

  it('rtl: the sliders sit inside the provider an island mounts', async () => {
    expect(crossings((await load('rtl'))()).map(({ part }) => part)).toEqual(['TopClassProvider', 'Slider', 'Slider'])
  })
})

describe('the scans see what they claim to', () => {
  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    expect(unserializable({ on: () => undefined, when: new Date(0), mark: Symbol('x'), fine: [1, 'a'] }, 'Slider'))
      .toEqual(['Slider.on', 'Slider.when', 'Slider.mark'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => reference('Slider')({})).toThrow('Slider ran on the server')
  })
})
