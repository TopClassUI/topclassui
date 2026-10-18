// The rsc project, where React resolves its react-server build and has no client hooks.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('../client.js', () => ({ TagRemovable: reference('TagRemovable') }))

const { Tag, TagRemovable } = await import('../index.js')

interface Crossing { part: string, props: Props }

/** Every client part a tree hands props to, in document order. A Server Component in between is run, as React would. */
function crossings(node: ReactNode, found: Crossing[] = []): Crossing[] {
  if (Array.isArray(node)) for (const child of node) crossings(child as ReactNode, found)
  else if (isValidElement(node)) {
    const { type, props } = node as ReactElement<Props>
    const part = typeof type === 'function' ? (type as Part) : undefined
    if (part?.client !== undefined) found.push({ part: part.client, props })
    else if (part) crossings(part(props), found)
    else crossings(props['children'] as ReactNode, found)
  }
  return found
}

/** What of a client part's props Flight cannot serialize: a function, unless it is a Server Action. */
const unserializable = ({ part, props }: Crossing) => Object.entries(props)
  .filter(([, value]) => typeof value === 'function' || typeof value === 'symbol')
  .map(([key]) => `${part}.${key}`)

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const demos = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const isClient = (name: string) => readFileSync(join(DUMMY, `${name}.tsx`), 'utf8').startsWith("'use client'")

describe('a Tag is a Server Component that renders no client part', () => {
  it('runs outside a render, so it calls no hook, and returns the span itself', () => {
    const element = Tag({ children: 'React' }) as ReactElement<Props>
    expect(element.type).toBe('span')
  })

  it('hands no client part anything', () => {
    expect(crossings(<Tag tone="info" size="xs">React</Tag>)).toEqual([])
  })

  it('every demo a server page renders is such a tree; only the removable demos are client files', async () => {
    expect(demos.filter(isClient)).toEqual(['removable', 'removable-sizes', 'states'])
    for (const name of demos.filter((demo) => !isClient(demo))) {
      const Demo = (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default
      expect(crossings(Demo()), name).toEqual([])
    }
  })
})

describe('TagRemovable is the client export, re-exported by index.tsx', () => {
  const found = crossings(<TagRemovable tone="danger" size="lg" onRemove={() => undefined}>React</TagRemovable>)

  it('reaches a server file as the client reference itself, never run there', () => {
    expect((TagRemovable as unknown as Part).client).toBe('TagRemovable')
    expect(found.map((crossing) => crossing.part)).toEqual(['TagRemovable'])
    expect(found[0]?.props['children']).toBe('React')
  })

  // R-5.1-3: a server page can send it a function only as a Server Action; a list kept in state needs a client component.
  it('takes the handler, the one prop a Server Component can send only as a Server Action', () => {
    expect(found.flatMap(unserializable)).toEqual(['TagRemovable.onRemove'])
  })

  it('the scan sees a function, and passes strings and numbers', () => {
    expect(unserializable({ part: 'P', props: { a: 'x', b: 1, c: () => undefined, d: Symbol('s') } })).toEqual(['P.c', 'P.d'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => reference('TagRemovable')({})).toThrow('TagRemovable ran on the server')
  })
})
