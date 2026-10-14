// The rsc project. No Flight renderer is installed, so what crosses is read by Flight's own rule for a function.
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })
const references = (names: string[]) => Object.fromEntries(names.map((name) => [name, reference(name)]))

// Each of these modules starts with 'use client', so a Server Component only ever holds references to their exports.
vi.mock('../client.js', () => references([
  'DropdownGroup', 'DropdownGroupLabel', 'DropdownItem', 'DropdownLinkItem', 'DropdownMenu', 'DropdownPopup', 'DropdownRoot',
  'DropdownSeparator', 'DropdownTrigger',
]))
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

/** A function a bundler registers as a Server Action: its body opens with the 'use server' directive. */
const isServerAction = (value: unknown) =>
  typeof value === 'function' && /^(async\s+)?function[^{]*\{\s*["']use server["']/.test(Function.prototype.toString.call(value))

/** The path of everything in a value that Flight cannot serialize: a function that is no Server Action, a symbol, a class instance. */
function unserializable(value: unknown, path: string, found: string[] = []): string[] {
  if (typeof value === 'function') { if (!isServerAction(value)) found.push(path) }
  else if (typeof value === 'symbol' || typeof value === 'bigint') found.push(path)
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

describe('what the data-driven menu takes from a server page', () => {
  const menu = async () => {
    const [found] = crossings((await load('data-driven'))())
    return found as Crossing
  }
  type Item = Record<string, unknown>

  it('is one client part, DropdownMenu, and the page renders none of the flat parts itself', async () => {
    const all = crossings((await load('data-driven'))())
    expect(all.map((crossing) => crossing.part)).toEqual(['DropdownMenu'])
  })

  it('href items cross as plain strings', async () => {
    const items = (await menu()).props['items'] as Item[]
    expect(items.map((item) => item['href'])).toEqual(['#profile', '#settings', '#billing', undefined])
  })

  it('the action of an item crosses because it is a Server Action, and it is the only function on the page', async () => {
    const { props } = await menu()
    const items = props['items'] as Item[]
    expect(items.map((item) => typeof item['action'])).toEqual(['undefined', 'undefined', 'undefined', 'function'])
    expect(isServerAction(items[3]?.['action'])).toBe(true)
    expect(items.some((item) => 'onSelect' in item)).toBe(false)
  })

  it('the link and the trigger cross as elements, and each icon as an element inside its item', async () => {
    const { props } = await menu()
    expect(isValidElement(props['link'])).toBe(true)
    expect((props['link'] as ReactElement<Props>).props).toEqual({ 'data-link': 'app', 'href': '' })
    expect(isValidElement(props['trigger'])).toBe(true)
    expect(isValidElement((props['items'] as Item[])[0]?.['icon'])).toBe(true)
  })

  it('title is a string, and nothing else is passed: no handler for the open state', async () => {
    const { props } = await menu()
    expect(Object.keys(props).sort()).toEqual(['items', 'link', 'title', 'trigger'])
    expect(props['title']).toBe('Account')
  })
})

describe('what a server page cannot pass', () => {
  const DropdownMenu = reference('DropdownMenu')
  const action = async function () { 'use server'; await Promise.resolve() }

  it('onSelect: a plain function is reported by the path that holds it, and the action beside it is not', () => {
    const tree = (
      <DropdownMenu
        title="Account"
        items={[
          { id: 'signout', label: 'Sign out', action },
          { id: 'copy', label: 'Copy link', onSelect: () => undefined },
        ]}
      />
    )
    expect(crossings(tree).flatMap(({ part, props }) => unserializable(props, part))).toEqual(['DropdownMenu.items[1].onSelect'])
  })

  it('onOpenChange, a function form of the trigger, and an action with no directive', () => {
    const props = { onOpenChange: () => undefined, trigger: () => null, items: [{ id: 'a', label: 'A', action: async () => { await Promise.resolve() } }] }
    expect(unserializable(props, 'DropdownMenu')).toEqual(['DropdownMenu.onOpenChange', 'DropdownMenu.trigger', 'DropdownMenu.items[0].action'])
  })
})
