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
vi.mock('../client.js', () => Object.fromEntries([
  'DialogBody', 'DialogClose', 'DialogDescription', 'DialogFooter', 'DialogHeader', 'DialogPopup', 'DialogRoot',
  'DialogTitle', 'DialogTrigger',
].map((name) => [name, reference(name)])))
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
      // An element in a prop crosses too: the Button passed as render, and whatever is inside it.
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
    expect(names).toEqual(['basic', 'confirm', 'long-body', 'long-content', 'no-close-button', 'rtl', 'sizes', 'with-form'])
  })

  for (const name of names) {
    it(`${name}: runs with no hook and no context, and returns an element`, async () => {
      const Demo = await load(name)
      expect(isValidElement(Demo())).toBe(true)
    })

    it(`${name}: passes no function, no symbol and no class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.length, name).toBeGreaterThan(5)
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }
})

describe('the parts a demo is built from', () => {
  const parts = async (name: string) => crossings((await load(name))()).map((crossing) => crossing.part)

  it('basic: the nine flat parts, each a reference, with the close used twice', async () => {
    expect(await parts('basic')).toEqual([
      'DialogRoot', 'DialogTrigger', 'DialogPopup', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'DialogBody',
      'DialogFooter', 'DialogClose', 'DialogClose',
    ])
  })

  it('rtl: the same parts inside the provider an island mounts', async () => {
    expect((await parts('rtl')).slice(0, 4)).toEqual(['TopClassProvider', 'DialogRoot', 'DialogTrigger', 'DialogPopup'])
  })

  it('sizes: six dialogs, one per size', async () => {
    const all = crossings((await load('sizes'))())
    expect(all.filter((crossing) => crossing.part === 'DialogPopup').map((crossing) => crossing.props['size']))
      .toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  it('hands each trigger and each close its control as an element in render, which is what crosses', async () => {
    const all = crossings((await load('basic'))())
    for (const crossing of all.filter((found) => found.part === 'DialogTrigger' || found.part === 'DialogClose')) {
      expect(isValidElement(crossing.props['render']), crossing.part).toBe(true)
      expect(crossing.props['children'], crossing.part).toBeUndefined()
    }
  })

  it('confirm: disablePointerDismissal is a plain boolean on the root', async () => {
    const [root] = crossings((await load('confirm'))())
    expect(root?.part).toBe('DialogRoot')
    expect(root?.props['disablePointerDismissal']).toBe(true)
  })
})

describe('the scans see what they claim to', () => {
  const Root = reference('DialogRoot')
  const Popup = reference('DialogPopup')
  function Server({ children }: { children?: ReactNode }) { return <section>{children}</section> }

  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    const props = {
      onOpenChange: () => undefined, initialFocus: { current: null }, when: new Date(0), mark: Symbol('x'),
      render: <button type="button" onClick={() => undefined} />, items: [1, 'two', { fine: true, bad: () => undefined }],
    }
    expect(unserializable(props, 'DialogRoot')).toEqual([
      'DialogRoot.onOpenChange', 'DialogRoot.when', 'DialogRoot.mark', 'DialogRoot.render.onClick', 'DialogRoot.items[2].bad',
    ])
  })

  it('a client part inside a Server Component, inside a prop and inside an array is found, and never called', () => {
    const tree = <Server><Root open render={<Popup size="xs" />}>{[<Popup key="a" size="lg" />]}</Root></Server>
    expect(crossings(tree).map(({ part, props }) => `${part} ${String(props['size'] ?? props['open'])}`))
      .toEqual(['DialogRoot true', 'DialogPopup xs', 'DialogPopup lg'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => Root({})).toThrow('DialogRoot ran on the server')
  })
})
