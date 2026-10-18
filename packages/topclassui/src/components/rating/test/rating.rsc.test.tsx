// The rsc project, where React resolves its react-server build and has no client hooks.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

// client.tsx starts with 'use client', so the server only ever holds a reference to RatingField and RatingInput.
vi.mock('../client.js', () => ({ RatingField: reference('RatingField'), RatingInput: reference('RatingInput') }))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))

const { Rating, RatingInput } = await import('../index.js')

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

/** The path of everything in a value that Flight cannot serialize: a function, a symbol, a class instance. */
function unserializable(value: unknown, path: string, found: string[] = []): string[] {
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') found.push(path)
  else if (Array.isArray(value)) value.forEach((item, index) => unserializable(item, `${path}[${String(index)}]`, found))
  else if (isValidElement(value)) found.push(`${path} (an element)`)
  else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const every = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const isClient = (name: string) => readFileSync(join(DUMMY, `${name}.tsx`), 'utf8').startsWith("'use client'")
const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

describe('a read-only Rating references no client module', () => {
  it('a value alone renders server HTML only: no RatingField, nothing else marked for the client', () => {
    expect(crossings(<Rating value={4} />)).toEqual([])
    expect(crossings(<Rating value={3.5} max={10} size="xl" readOnly />)).toEqual([])
  })

  it('the read-only demo, five ratings and a review count, ships no client code at all', async () => {
    expect(crossings((await load('read-only'))())).toEqual([])
  })

  it('the reference would throw if the server called it, so an empty list means it was never reached', () => {
    expect(() => reference('RatingField')({})).toThrow('RatingField ran on the server')
  })
})

describe('readOnly={false} renders the client half, handed only what can cross (R-5.1-3)', () => {
  it('one RatingField, with clamped numbers and the name of each step as strings', () => {
    const found = crossings(<Rating readOnly={false} value={9} defaultValue={2.6} max={3} aria-label="Stay" name="stay" />)
    expect(found).toEqual([{
      part: 'RatingField',
      props: {
        'aria-label': 'Stay', name: 'stay', value: 3, defaultValue: 3, size: 'md', disabled: false,
        names: ['1 star', '2 stars', '3 stars'],
      },
    }])
  })

  it('never hands it the labels object, whose counts are functions', () => {
    const [field] = crossings(<Rating readOnly={false} aria-label="Stay" />)
    expect(Object.keys(field?.props ?? {}).sort()).toEqual(['aria-label', 'defaultValue', 'disabled', 'names', 'size', 'value'])
    expect(unserializable(field?.props, 'RatingField')).toEqual([])
  })

  it('found the demo folder, so an empty list cannot pass', () => {
    expect(every).toEqual(['controlled', 'disabled', 'editable', 'in-form', 'max-ten', 'read-only', 'rtl', 'sizes'])
    expect(every.filter(isClient)).toEqual(['controlled'])
  })

  for (const name of every.filter((demo) => !isClient(demo))) {
    it(`${name}: passes no function, no symbol and no class instance across`, async () => {
      const found = crossings((await load(name))())
      expect(found.flatMap(({ part, props }) => unserializable({ ...props, children: undefined }, part))).toEqual([])
    })
  }

  it('which demos hydrate: only those that edit', async () => {
    const parts = async (name: string) => crossings((await load(name))()).map((crossing) => crossing.part)
    expect(await parts('editable')).toEqual(['RatingField'])
    expect(await parts('max-ten')).toEqual(['RatingField'])
    expect(await parts('sizes')).toEqual(['RatingField', 'RatingField'])
    expect(await parts('rtl')).toEqual(['TopClassProvider', 'RatingField'])
  })
})

describe('RatingInput is the client export, re-exported by index.tsx', () => {
  const found = crossings(<RatingInput aria-label="Stay" onValueChange={() => undefined} />)

  it('reaches a server file as the client reference itself, never run there', () => {
    expect((RatingInput as unknown as Part).client).toBe('RatingInput')
    expect(found.map((crossing) => crossing.part)).toEqual(['RatingInput'])
  })

  // R-5.1-3: a server page can send it a function only as a Server Action, and the scan reports one.
  it('takes onValueChange, the one prop a Server Component can send only as a Server Action', () => {
    expect(found.flatMap(({ part, props }) => unserializable(props, part))).toEqual(['RatingInput.onValueChange'])
  })
})
