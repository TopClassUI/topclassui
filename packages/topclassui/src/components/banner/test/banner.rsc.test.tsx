// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Banner, BannerDismissible } from '../index.js'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const { reference } = vi.hoisted(() => ({
  reference: (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name }),
}))

vi.mock('../client.js', () => ({ BannerShell: reference('BannerShell'), BannerDismissible: reference('BannerDismissible') }))

interface Crossing { part: string, props: Props }

/** Every client part a tree hands props to. A Server Component in between is run, as React would. */
function crossings(node: ReactNode, found: Crossing[] = []): Crossing[] {
  if (Array.isArray(node)) for (const child of node) crossings(child as ReactNode, found)
  else if (isValidElement(node)) {
    const { type, props } = node as ReactElement<Props>
    const part = typeof type === 'function' ? (type as Part) : undefined
    if (part?.client !== undefined) found.push({ part: part.client, props })
    else if (part) crossings(part(props), found)
    else for (const value of Object.values(props)) crossings(value as ReactNode, found)
  }
  return found
}

/** The path of everything in a value that Flight cannot serialize: a function, a symbol, a class instance. */
function unserializable(value: unknown, path: string, found: string[] = []): string[] {
  if (typeof value === 'function' || typeof value === 'symbol') found.push(path)
  else if (Array.isArray(value)) value.forEach((item, index) => unserializable(item, `${path}[${String(index)}]`, found))
  else if (isValidElement(value)) {
    const element = value as ReactElement<Props>
    if (typeof element.type === 'function' && (element.type as Part).client === undefined) {
      unserializable((element.type as Part)(element.props), path, found)
    } else for (const [key, inner] of Object.entries(element.props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

describe('a plain banner in a Server Component tree', () => {
  const out = Banner({ 'aria-label': 'Notice', children: 'Version 2 is out.' }) as ReactElement<Props>

  it('is a div the server renders itself, with no hook', () => {
    expect(out.type).toBe('div')
    expect(out.props['role']).toBe('region')
  })

  it('hands nothing to a client part, so the page holds no reference to the shell', () => {
    expect(crossings(out)).toEqual([])
  })

  it('stays plain with dismissible={false} and an id', () => {
    const plain = Banner({ 'aria-label': 'Notice', 'dismissible': false, 'id': 'v2', 'children': 'Out.' }) as ReactElement<Props>
    expect(plain.type).toBe('div')
    expect(crossings(plain)).toEqual([])
  })
})

describe('a dismissible banner written in a Server Component, with no client wrapper', () => {
  const out = Banner({ 'aria-label': 'Notice', 'tone': 'warning', 'dismissible': true, 'id': 'release-v2', 'children': 'Version 2 is out.' })

  it('crosses into the shell once, as a reference the server never calls', () => {
    expect(crossings(out).map((crossing) => crossing.part)).toEqual(['BannerShell'])
  })

  it('hands it only what Flight can carry: dismissible and id work from a server page', () => {
    const [shell] = crossings(out)
    expect(unserializable(shell?.props, 'BannerShell')).toEqual([])
    expect(shell?.props['id']).toBe('release-v2')
    expect(shell?.props['data-tone']).toBe('warning')
    expect(shell?.props['role']).toBe('region')
    expect(shell?.props['onDismiss']).toBeUndefined()
  })

})

describe('BannerDismissible is the client export, re-exported by index.tsx', () => {
  const found = crossings(<BannerDismissible aria-label="N" id="x" onDismiss={() => undefined}>Out.</BannerDismissible>)

  it('reaches a server file as the client reference itself, never run there', () => {
    expect((BannerDismissible as unknown as Part).client).toBe('BannerDismissible')
    expect(found.map((crossing) => crossing.part)).toEqual(['BannerDismissible'])
  })

  // R-5.1-3: a server page can send it a function only as a Server Action, and the scan reports one.
  it('takes onDismiss, the one prop a Server Component can send only as a Server Action', () => {
    expect(found.flatMap(({ part, props }) => unserializable(props, part))).toEqual(['BannerDismissible.onDismiss'])
  })
})

describe('every demo is a Server Component (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual([
      'basic', 'dismissible', 'long-action', 'long-text', 'minimal', 'playground', 'rtl', 'states', 'tones', 'with-action',
    ])
  })

  for (const name of names) {
    it(`${name}: runs with no hook and passes no function to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }

  it('only the dismissible demo reaches the shell: the other nine render no client code of Banner', async () => {
    const reached: string[] = []
    for (const name of names) {
      const shells = crossings((await load(name))()).filter((crossing) => crossing.part === 'BannerShell')
      if (shells.length > 0) reached.push(`${name} ${String(shells.length)}`)
    }
    expect(reached).toEqual(['dismissible 2'])
  })
})
