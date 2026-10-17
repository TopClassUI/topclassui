// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type * as ReactModule from 'react'
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { FieldControl } from '../types.js'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('../client.js', () => ({ FieldLive: reference('FieldLive') }))
// useId is the one hook the react-server build keeps, and it needs a render to run in: this walk calls the parts by hand.
vi.mock('react', async (original) => ({ ...await original<typeof ReactModule>(), useId: () => '_r_rsc_' }))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))
vi.mock('#components/button/index.js', () => ({ Button: reference('Button') }))
vi.mock('../../textarea/client.js', () => ({ TextareaField: reference('TextareaField') }))
// Input's server half imports its 'use client' holder for validate, so here it is a reference too.
vi.mock('#components/input/client.js', () => ({ InputCheck: reference('InputCheck') }))
vi.mock('#components/checkbox/index.js', () => ({ Checkbox: reference('Checkbox') }))
vi.mock('#components/switch/index.js', () => ({ Switch: reference('Switch') }))
vi.mock('#components/radio-group/index.js', () => ({ RadioGroupRoot: reference('RadioGroupRoot'), RadioGroupItem: reference('RadioGroupItem') }))
vi.mock('#components/segmented-control/index.js', () => ({
  SegmentedControlRoot: reference('SegmentedControlRoot'), SegmentedControlItem: reference('SegmentedControlItem'),
}))
vi.mock('#components/slider/index.js', () => ({ Slider: reference('Slider') }))
vi.mock('#components/number-field/index.js', () => ({ NumberField: reference('NumberField') }))
vi.mock('#components/otp-field/index.js', () => ({ OTPField: reference('OTPField') }))
vi.mock('#components/select/index.js', () => ({ Select: reference('Select') }))
vi.mock('#components/combobox/index.js', () => ({ Combobox: reference('Combobox') }))

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const all = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
/** A client demo is itself a reference on the server: it is rendered by the client, not walked here. */
const isClient = (name: string) => readFileSync(join(DUMMY, `${name}.tsx`), 'utf8').startsWith("'use client'")
const names = all.filter((name) => !isClient(name))

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
    const { type, props } = value as ReactElement<Props>
    // A Server Component inside a client part's children is rendered on the server first, so its own props never cross.
    if (typeof type === 'function' && (type as Part).client === undefined) return found
    for (const [key, inner] of Object.entries(props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default
// Loaded after the mocks above exist, as a bundler would resolve the client file to its reference.
const { Field } = await import('../index.js')
const { Checkbox } = await import('#components/checkbox/index.js')

describe('Field renders in a Server Component (R-5.1-1)', () => {
  it('runs against the react-server build, which has no state and no effects', async () => {
    const react = await import('react')
    expect(['useState' in react, 'useEffect' in react, typeof react.useId]).toEqual([false, false, 'function'])
  })

  it('calls its function child on the server: only the control object crosses, never the function', () => {
    const found = crossings(createElement(Field, {
      name: 'terms', label: 'Terms', hint: 'H', error: 'E', required: true, inline: true,
      children: (control: FieldControl) => createElement(Checkbox, control),
    }))
    expect(found).toEqual([{
      part: 'Checkbox',
      props: {
        'id': '_r_rsc_', 'name': 'terms', 'required': true,
        'aria-labelledby': '_r_rsc_-label', 'aria-describedby': '_r_rsc_-hint _r_rsc_-err', 'aria-invalid': true,
      },
    }])
  })
})

describe('every server demo only hands client parts what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass; live is the one client demo', () => {
    expect(names).toEqual(['basic', 'controls', 'form', 'group', 'hint-error', 'inline', 'long-content', 'required', 'rtl'])
    expect(all.filter(isClient)).toEqual(['live'])
  })

  for (const name of names) {
    it(`${name}: runs with no client hook, and passes no function, symbol or class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }

  it('controls: each of the nine client controls gets the control object as plain values', async () => {
    const found = crossings((await load('controls'))()).filter(({ part }) => !part.endsWith('Item'))
    expect(found.map(({ part }) => part)).toEqual([
      'Checkbox', 'Switch', 'RadioGroupRoot', 'SegmentedControlRoot', 'Slider', 'NumberField', 'OTPField', 'Select', 'Combobox',
    ])
    for (const { part, props } of found) {
      expect([typeof props['id'], typeof props['name'], typeof props['aria-labelledby'], props['aria-invalid']], part).toEqual(['string', 'string', 'string', true])
    }
  })
})
