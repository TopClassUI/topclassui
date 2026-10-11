// The rsc project, where React resolves its react-server build and has no client hooks.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

// Both modules start with 'use client', so a Server Component only ever holds references to their exports.
vi.mock('../client.js', () => Object.fromEntries([
  'PopoverClose', 'PopoverDescription', 'PopoverPopup', 'PopoverRoot', 'PopoverTitle', 'PopoverTrigger',
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
    expect(names).toEqual(['basic', 'hover', 'long-content', 'modal', 'placements', 'rtl', 'with-close', 'with-form'])
  })

  it('none of them is a client file: a popover needs no state of the page to open', () => {
    expect(names.filter((name) => readFileSync(join(DUMMY, `${name}.tsx`), 'utf8').startsWith("'use client'"))).toEqual([])
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

  it('basic: five of the six flat parts, each a reference', async () => {
    expect(await parts('basic')).toEqual(['PopoverRoot', 'PopoverTrigger', 'PopoverPopup', 'PopoverTitle', 'PopoverDescription'])
  })

  it('modal: the sixth, used three times: the x and the two actions', async () => {
    expect((await parts('modal')).filter((part) => part === 'PopoverClose')).toHaveLength(3)
  })

  it('rtl: the same parts inside the provider an island mounts', async () => {
    expect((await parts('rtl')).slice(0, 4)).toEqual(['TopClassProvider', 'PopoverRoot', 'PopoverTrigger', 'PopoverPopup'])
  })

  it('placements: twelve popovers, one per placement, each a plain string', async () => {
    const all = crossings((await load('placements'))())
    expect(all.filter((crossing) => crossing.part === 'PopoverPopup').map((crossing) => crossing.props['placement'])).toEqual([
      'top-start', 'top', 'top-end', 'start-top', 'start', 'start-bottom',
      'end-top', 'end', 'end-bottom', 'bottom-start', 'bottom', 'bottom-end',
    ])
  })

  it('hands each trigger and each close its control as an element in render, which is what crosses', async () => {
    const all = crossings((await load('modal'))())
    const controls = all.filter((found) => found.part === 'PopoverTrigger' || (found.part === 'PopoverClose' && 'render' in found.props))
    expect(controls).toHaveLength(3)
    for (const crossing of controls) {
      expect(isValidElement(crossing.props['render']), crossing.part).toBe(true)
      expect(crossing.props['children'], crossing.part).toBeUndefined()
    }
  })

  it('hover: openOnHover and the two delays are a boolean and two numbers on the trigger', async () => {
    const trigger = crossings((await load('hover'))()).find((crossing) => crossing.part === 'PopoverTrigger')
    expect(trigger?.props).toMatchObject({ openOnHover: true, delay: 100, closeDelay: 200 })
  })

  it('modal: modal is a plain boolean on the root', async () => {
    const [root] = crossings((await load('modal'))())
    expect(root?.part).toBe('PopoverRoot')
    expect(root?.props['modal']).toBe(true)
  })
})

describe('the scans see what they claim to', () => {
  const Root = reference('PopoverRoot')
  const Popup = reference('PopoverPopup')
  function Server({ children }: { children?: ReactNode }) { return <section>{children}</section> }

  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    const props = {
      onOpenChange: () => undefined, initialFocus: { current: null }, when: new Date(0), mark: Symbol('x'),
      render: <button type="button" onClick={() => undefined} />, items: [1, 'two', { fine: true, bad: () => undefined }],
    }
    expect(unserializable(props, 'PopoverRoot')).toEqual([
      'PopoverRoot.onOpenChange', 'PopoverRoot.when', 'PopoverRoot.mark', 'PopoverRoot.render.onClick', 'PopoverRoot.items[2].bad',
    ])
  })

  it('a client part inside a Server Component, inside a prop and inside an array is found, and never called', () => {
    const tree = <Server><Root open render={<Popup placement="top" />}>{[<Popup key="a" placement="end" />]}</Root></Server>
    expect(crossings(tree).map(({ part, props }) => `${part} ${String(props['placement'] ?? props['open'])}`))
      .toEqual(['PopoverRoot true', 'PopoverPopup top', 'PopoverPopup end'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => Root({})).toThrow('PopoverRoot ran on the server')
  })
})
