// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { Meter } from '../index.js'

type Props = Record<string, unknown>

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Runs every function component in a tree, as React would on the server, and returns the host elements left. */
function hosts(node: ReactNode, found: string[] = []): string[] {
  if (Array.isArray(node)) for (const child of node) hosts(child as ReactNode, found)
  else if (isValidElement(node)) {
    const { type, props } = node as ReactElement<Props>
    if (typeof type === 'function') hosts((type as (p: Props) => ReactNode)(props), found)
    else if (typeof type === 'string') {
      found.push(type)
      hosts(props['children'] as ReactNode, found)
    } else throw new Error(`a ${String(type)} element: Meter has no client part to cross into`)
  }
  return found
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

describe('Meter renders in a Server Component (R-5.1-1)', () => {
  it('runs against the react-server build, which has no state and no effects', async () => {
    const react = await import('react')
    expect(['useState' in react, 'useLayoutEffect' in react]).toEqual([false, false])
  })

  it('is two host divs and nothing else: no hook, no client part, no context', () => {
    expect(hosts(createElement(Meter, { 'aria-label': 'Battery', value: 40 }))).toEqual(['div', 'div'])
  })
})

describe('every demo is a Server Component made of host elements only (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'custom-size', 'range', 'rtl', 'sizes', 'tones'])
  })

  for (const name of names) {
    it(`${name}: runs with no client hook and reaches no client part`, async () => {
      const found = hosts((await load(name))())
      expect(found.filter((tag) => tag === 'div').length, name).toBeGreaterThan(1)
    })
  }
})
