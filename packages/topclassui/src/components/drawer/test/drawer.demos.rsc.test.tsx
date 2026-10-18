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
  'DrawerBody', 'DrawerClose', 'DrawerDescription', 'DrawerFooter', 'DrawerHeader', 'DrawerPopup', 'DrawerRoot',
  'DrawerTitle', 'DrawerTrigger',
].map((name) => [name, reference(name)])))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const every = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** A demo that is itself a client file: it holds state, so a server page imports it as a reference and never runs it. */
const isClient = (name: string) => readFileSync(join(DUMMY, `${name}.tsx`), 'utf8').startsWith("'use client'")
const names = every.filter((name) => !isClient(name))

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
    expect(names).toEqual([
      'bottom', 'end', 'long-body', 'long-content', 'non-modal', 'playground', 'rtl', 'sizes', 'start', 'states', 'top',
      'trap-focus', 'with-form',
    ])
  })

  it('leaves none out: no demo is a client file, so a server page can write every one of them', () => {
    expect(every.filter(isClient)).toEqual([])
    expect(isClient('../client')).toBe(true)
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

  it('end: the nine flat parts, each a reference, with the close used twice', async () => {
    expect(await parts('end')).toEqual([
      'DrawerRoot', 'DrawerTrigger', 'DrawerPopup', 'DrawerHeader', 'DrawerTitle', 'DrawerDescription', 'DrawerBody',
      'DrawerFooter', 'DrawerClose', 'DrawerClose',
    ])
  })

  it('rtl: the same parts inside the provider an island mounts', async () => {
    expect((await parts('rtl')).slice(0, 4)).toEqual(['TopClassProvider', 'DrawerRoot', 'DrawerTrigger', 'DrawerPopup'])
  })

  it('sizes: six sheets, one per size, and the size is on the root', async () => {
    const all = crossings((await load('sizes'))())
    expect(all.filter((crossing) => crossing.part === 'DrawerRoot').map((crossing) => crossing.props['size']))
      .toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(all.filter((crossing) => crossing.part === 'DrawerPopup').map((crossing) => crossing.props['size']))
      .toEqual([undefined, undefined, undefined, undefined, undefined, undefined])
  })

  it('hands each trigger and each close its control as an element in render, which is what crosses', async () => {
    const all = crossings((await load('end'))())
    for (const crossing of all.filter((found) => found.part === 'DrawerTrigger' || found.part === 'DrawerClose')) {
      expect(isValidElement(crossing.props['render']), crossing.part).toBe(true)
      expect(crossing.props['children'], crossing.part).toBeUndefined()
    }
  })

  // The root works the swipe out in the browser: a server page hands it a word, never a direction it had to read.
  it('placement is a plain string on the root: start, top and bottom are written, and end is left to the default', async () => {
    const placementOf = async (name: string) => crossings((await load(name))())[0]?.props['placement']
    expect(await placementOf('start')).toBe('start')
    expect(await placementOf('top')).toBe('top')
    expect(await placementOf('bottom')).toBe('bottom')
    expect(await placementOf('with-form')).toBe('bottom')
    expect(await placementOf('end')).toBeUndefined()
  })

  it('non-modal and trap-focus: modal is a plain value on the root', async () => {
    const rootOf = async (name: string) => crossings((await load(name))()).find((crossing) => crossing.part === 'DrawerRoot')
    expect((await rootOf('non-modal'))?.props['modal']).toBe(false)
    expect((await rootOf('trap-focus'))?.props['modal']).toBe('trap-focus')
  })
})

describe('the scans see what they claim to', () => {
  const Root = reference('DrawerRoot')
  const Popup = reference('DrawerPopup')
  function Server({ children }: { children?: ReactNode }) { return <section>{children}</section> }

  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    const props = {
      onOpenChange: () => undefined, initialFocus: { current: null }, when: new Date(0), mark: Symbol('x'),
      render: <button type="button" onClick={() => undefined} />, items: [1, 'two', { fine: true, bad: () => undefined }],
    }
    expect(unserializable(props, 'DrawerRoot')).toEqual([
      'DrawerRoot.onOpenChange', 'DrawerRoot.when', 'DrawerRoot.mark', 'DrawerRoot.render.onClick', 'DrawerRoot.items[2].bad',
    ])
  })

  it('a client part inside a Server Component, inside a prop and inside an array is found, and never called', () => {
    const tree = <Server><Root open render={<Popup size="xs" />}>{[<Popup key="a" size="lg" />]}</Root></Server>
    expect(crossings(tree).map(({ part, props }) => `${part} ${String(props['size'] ?? props['open'])}`))
      .toEqual(['DrawerRoot true', 'DrawerPopup xs', 'DrawerPopup lg'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => Root({})).toThrow('DrawerRoot ran on the server')
  })
})
