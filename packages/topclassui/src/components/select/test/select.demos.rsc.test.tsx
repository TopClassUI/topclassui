// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('../client.js', () => ({ Select: reference('Select') }))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))
vi.mock('#components/button/index.js', () => ({ Button: reference('Button') }))
vi.mock('#components/checkbox/index.js', () => ({ Checkbox: reference('Checkbox') }))
vi.mock('#components/number-field/index.js', () => ({ NumberField: reference('NumberField') }))
vi.mock('#components/radio-group/index.js', () => ({ RadioGroupRoot: reference('RadioGroupRoot'), RadioGroupItem: reference('RadioGroupItem') }))
vi.mock('#components/slider/index.js', () => ({ Slider: reference('Slider') }))
vi.mock('#components/switch/index.js', () => ({ Switch: reference('Switch') }))

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

describe('every demo is a Server Component that only hands the Select what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'four-rows', 'long-content', 'phase-4-form', 'playground', 'rtl', 'sixty-items', 'sizes', 'states'])
  })

  for (const name of names) {
    it(`${name}: runs with no hook, and passes no function, symbol or class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.filter(({ part }) => part === 'Select').length, name).toBeGreaterThan(0)
      expect(found.flatMap(({ props }) => unserializable({ ...props, children: undefined }, 'props')), name).toEqual([])
    })
  }

  it('sixty-items: the sixty options cross as plain objects, the thirteenth disabled', async () => {
    const [select] = crossings((await load('sixty-items'))())
    const items = select?.props['items'] as { value: string, label: string, disabled?: boolean }[]
    expect(items).toHaveLength(60)
    expect(items[12]).toEqual({ value: '13', label: 'Option 13', disabled: true })
    expect(items.filter((item) => item.disabled === true)).toHaveLength(1)
  })

  it('rtl: the Select sits inside the provider an island mounts', async () => {
    expect(crossings((await load('rtl'))()).map(({ part }) => part)).toEqual(['TopClassProvider', 'Select'])
  })

  it('phase-4-form: the six controls of Phase 4 in one form, each handed a name and a default, and only data', async () => {
    const found = crossings((await load('phase-4-form'))()).filter(({ part }) => !['Button', 'RadioGroupItem'].includes(part))
    expect(found.map(({ part, props }) => `${part}: ${String(props['name'])}`)).toEqual([
      'Checkbox: terms', 'RadioGroupRoot: plan', 'Switch: digest', 'Select: country', 'Slider: volume', 'NumberField: guests',
    ])
  })
})

describe('the scans see what they claim to', () => {
  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    expect(unserializable({ on: () => undefined, when: new Date(0), mark: Symbol('x'), fine: [1, 'a'] }, 'Select'))
      .toEqual(['Select.on', 'Select.when', 'Select.mark'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => reference('Select')({})).toThrow('Select ran on the server')
  })
})
