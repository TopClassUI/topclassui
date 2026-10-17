// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))

const { Stepper } = await import('../index.js')

interface Crossing { part: string, props: Props }

/** Every client module a tree references, in document order. A Server Component in between is run, as React would. */
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

/** Every host element a tree renders to, after each Server Component has run: what reaches the HTML. */
function hosts(node: ReactNode, found: string[] = []): string[] {
  if (Array.isArray(node)) for (const child of node) hosts(child as ReactNode, found)
  else if (isValidElement(node)) {
    const { type, props } = node as ReactElement<Props>
    if (typeof type === 'string') found.push(type)
    if (typeof type === 'function' && (type as Part).client === undefined) hosts((type as Part)(props), found)
    else hosts(props['children'] as ReactNode, found)
  }
  return found
}

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default
const STEPS = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B', status: 'error' as const }, { id: 'c', title: 'C' }]

describe('Stepper renders in a Server Component (R-5.1-1)', () => {
  it('runs against the react-server build, which has no state and no effects', async () => {
    const react = await import('react')
    expect(['useState' in react, 'useEffect' in react]).toEqual([false, false])
  })

  it('references no client module, at any size and status, with Arabic-Indic digits', () => {
    expect(crossings(<Stepper items={STEPS} value="c" />)).toEqual([])
    expect(crossings(<Stepper items={STEPS} value="a" size="xl" locale="ar-u-nu-arab" />)).toEqual([])
  })

  it('renders an ordered list of steps, each with its circle, its title and its word', () => {
    expect(hosts(<Stepper items={STEPS} value="c" />)).toEqual([
      'ol',
      'li', 'div', 'span', 'span', 'svg', 'path', 'span', 'span',
      'li', 'div', 'span', 'span', 'span', 'svg', 'path', 'span', 'span',
      'li', 'div', 'span', 'span', 'span',
    ])
  })
})

describe('every demo is a Server Component (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['arabic-digits', 'basic', 'custom-size', 'long-content', 'rtl', 'sizes', 'statuses'])
  })

  for (const name of names) {
    it(`${name}: runs with no client hook`, async () => {
      const Demo = await load(name)
      expect(() => crossings(Demo())).not.toThrow()
    })
  }

  it('only the rtl demo references a client module: the provider, handed two strings and its children', async () => {
    const found = await Promise.all(names.map(async (name) => [name, crossings((await load(name))())] as const))
    const crossed = found.filter(([, list]) => list.length > 0)
    expect(crossed.map(([name, list]) => [name, list.map(({ part }) => part)])).toEqual([['rtl', ['TopClassProvider']]])
    const { children, ...values } = crossed[0]?.[1][0]?.props ?? {}
    expect(values).toEqual({ direction: 'rtl', locale: 'ar' })
    expect(isValidElement(children)).toBe(true)
  })
})
