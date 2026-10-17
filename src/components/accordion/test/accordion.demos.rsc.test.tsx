// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

// Both modules start with 'use client', so a Server Component only ever holds references to their exports.
vi.mock('../client.js', () => ({ AccordionItem: reference('AccordionItem'), AccordionRoot: reference('AccordionRoot') }))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))

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
      // An element in a prop crosses too: the title, and whatever the panel holds.
      for (const value of Object.values(props)) crossings(value as ReactNode, found)
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
    const element = value as ReactElement<Props>
    // A Server Component inside a prop is rendered on the server: only what it returns would cross.
    if (typeof element.type === 'function' && (element.type as Part).client === undefined) return found
    for (const [key, inner] of Object.entries(element.props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

describe('every demo is a Server Component that only hands the parts what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'disabled', 'first-open', 'long-content', 'many-items', 'multiple', 'playground', 'rtl', 'states'])
  })

  for (const name of names) {
    it(`${name}: runs with no hook and no context, and returns an element`, async () => {
      const Demo = await load(name)
      expect(isValidElement(Demo())).toBe(true)
    })

    it(`${name}: passes no function, no symbol and no class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.length, name).toBeGreaterThan(3)
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }
})

describe('the parts a demo is built from', () => {
  const parts = async (name: string) => crossings((await load(name))()).map((crossing) => crossing.part)

  it('basic: one root and three items, each a reference', async () => {
    expect(await parts('basic')).toEqual(['AccordionRoot', 'AccordionItem', 'AccordionItem', 'AccordionItem'])
  })

  it('rtl: the same parts inside the provider an island mounts', async () => {
    expect(await parts('rtl')).toEqual(['TopClassProvider', 'AccordionRoot', 'AccordionItem', 'AccordionItem', 'AccordionItem'])
  })

  it('many-items: sixty items under one root', async () => {
    const found = await parts('many-items')
    expect(found.filter((part) => part === 'AccordionItem')).toHaveLength(60)
    expect(found.filter((part) => part === 'AccordionRoot')).toHaveLength(1)
  })

  it('long-content: a second root, inside the panel of the fourth item', async () => {
    expect(await parts('long-content')).toEqual([
      'AccordionRoot', 'AccordionItem', 'AccordionItem', 'AccordionItem', 'AccordionItem',
      'AccordionRoot', 'AccordionItem', 'AccordionItem',
    ])
  })

  it('hands each item its value as a string, its title, and a level that is a plain number', async () => {
    const items = crossings((await load('first-open'))()).filter((crossing) => crossing.part === 'AccordionItem')
    expect(items.map((crossing) => crossing.props['value'])).toEqual(['install', 'arabic', 'bundle'])
    expect(items.map((crossing) => crossing.props['headingLevel'])).toEqual([2, 2, 2])
    expect(items[0]?.props['title']).toBe('How do I install a component?')
  })

  it('first-open and multiple: the open items are an array of strings on the root, which crosses', async () => {
    const [first] = crossings((await load('first-open'))())
    expect(first?.props['defaultValue']).toEqual(['install'])
    const [many] = crossings((await load('multiple'))())
    expect(many?.props).toMatchObject({ multiple: true, defaultValue: ['plan', 'seats'] })
  })
})

describe('the scans see what they claim to', () => {
  const Root = reference('AccordionRoot')
  const Item = reference('AccordionItem')
  function Server({ children }: { children?: ReactNode }) { return <section>{children}</section> }

  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    const props = {
      onValueChange: () => undefined, when: new Date(0), mark: Symbol('x'),
      title: <button type="button" onClick={() => undefined} />, items: [1, 'two', { fine: true, bad: () => undefined }],
    }
    expect(unserializable(props, 'AccordionRoot')).toEqual([
      'AccordionRoot.onValueChange', 'AccordionRoot.when', 'AccordionRoot.mark', 'AccordionRoot.title.onClick',
      'AccordionRoot.items[2].bad',
    ])
  })

  it('a client part inside a Server Component, inside a prop and inside an array is found, and never called', () => {
    const tree = <Server><Root multiple title={<Item value="in a prop" />}>{[<Item key="a" value="in an array" />]}</Root></Server>
    expect(crossings(tree).map(({ part, props }) => `${part} ${String(props['value'] ?? props['multiple'])}`))
      .toEqual(['AccordionRoot true', 'AccordionItem in a prop', 'AccordionItem in an array'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => Root({})).toThrow('AccordionRoot ran on the server')
  })
})
