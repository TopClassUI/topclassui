// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type * as ReactModule from 'react'
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { FormActionState } from '../types.js'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('../client.js', () => ({ FormAction: reference('FormAction') }))
vi.mock('#components/field/client.js', () => ({ FieldLive: reference('FieldLive') }))
vi.mock('#components/textarea/client.js', () => ({ TextareaField: reference('TextareaField') }))
vi.mock('#components/button/index.js', () => ({ Button: reference('Button') }))
// useId is the one hook the react-server build keeps, and it needs a render to run in: this walk calls the parts by hand.
vi.mock('react', async (original) => ({ ...await original<typeof ReactModule>(), useId: () => '_r_rsc_' }))

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
/** A client demo is itself a client reference to a server page: it holds the action's state, so it never runs there. */
const CLIENT = ['form-action']

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
const { Form, FormAction } = await import('../index.js')

describe('Form renders in a Server Component (R-5.1-1)', () => {
  it('runs against the react-server build, which has no state, no effects and no action state', async () => {
    const react = await import('react')
    expect(['useState' in react, 'useActionState' in react, typeof react.useId]).toEqual([false, false, 'function'])
  })

  it('is a plain form there, crossing into no client part', () => {
    const element = createElement(Form, { action: '/subscribe', className: 'grid' })
    expect(crossings(element)).toEqual([])
    const form = (Form as (props: Props) => ReactElement<Props>)({ action: '/subscribe', className: 'grid' })
    expect([form.type, form.props]).toEqual(['form', { action: '/subscribe', className: 'grid' }])
  })

  it('FormAction is the client half: a server page hands it plain children, never a function child (R-5.1-3)', () => {
    // On a real page the action is a Server Action, which Flight sends as a reference: only the children are checked here.
    const [crossing] = crossings(createElement(FormAction, { action: (state: FormActionState) => state, children: createElement('p', null, 'Fields') }))
    expect(crossing?.part).toBe('FormAction')
    expect(unserializable({ children: crossing?.props['children'] }, 'props')).toEqual([])
  })
})

describe('every server demo only hands client parts what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form-action', 'server-errors'])
  })

  for (const name of names.filter((one) => !CLIENT.includes(one))) {
    it(`${name}: runs with no client hook; Field calls its child on the server, so only the Button crosses`, async () => {
      const found = crossings((await load(name))())
      expect(found.map(({ part }) => part), name).toEqual(['Button'])
      expect(found.flatMap(({ props }) => unserializable(props, 'props')), name).toEqual([])
    })
  }

  it('form-action is a client file, so a server page imports it as a reference and never runs it', () => {
    expect(readFileSync(join(DUMMY, 'form-action.tsx'), 'utf8').startsWith("'use client'\n")).toBe(true)
  })
})
