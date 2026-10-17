import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'
import type { DropdownPopupProps } from '../types.js'

/** happy-dom lays nothing out and its ResizeObserver never calls back, so the box and the observer are given. */
const box = { scrollHeight: 100, clientHeight: 100, scrollWidth: 192, clientWidth: 192 }

class Sizes {
  static made: Sizes[] = []
  constructor(readonly notify: (entries: unknown[]) => void) { Sizes.made.push(this) }
  observe() { return undefined }
  unobserve() { return undefined }
  disconnect() { return undefined }
}

/** What the browser does when a watched box changes size. No entries: Floating UI watches too, and reads the first one. */
const resize = () => { act(() => { for (const sizes of Sizes.made) sizes.notify([]) }) }

const isMenu = (element: Element) => element.getAttribute('role') === 'menu'

beforeEach(() => {
  Object.assign(box, { scrollHeight: 100, clientHeight: 100, scrollWidth: 192, clientWidth: 192 })
  Sizes.made = []
  vi.stubGlobal('ResizeObserver', Sizes)
  // Only the menu is given a size: every other box stays at happy-dom's zero.
  for (const key of ['scrollHeight', 'scrollWidth'] as const) {
    vi.spyOn(Element.prototype, key, 'get').mockImplementation(function (this: Element) { return isMenu(this) ? box[key] : 0 })
  }
  for (const key of ['clientHeight', 'clientWidth'] as const) {
    vi.spyOn(HTMLElement.prototype, key, 'get').mockImplementation(function (this: Element) { return isMenu(this) ? box[key] : 0 })
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const tree = (props: DropdownPopupProps = {}, open = true) => (
  <DropdownRoot defaultOpen={open} modal={false}>
    <DropdownTrigger render={<Button>Time zone</Button>} />
    <DropdownPopup {...props}><DropdownItem>Zone 1</DropdownItem><DropdownItem>Zone 2</DropdownItem></DropdownPopup>
  </DropdownRoot>
)

async function menu(props: DropdownPopupProps = {}) {
  render(tree(props))
  return screen.findByRole('menu')
}

// How far a real menu scrolls, and what axe says of it, is measured in e2e/dropdown.spec.ts.
describe('the menu is a tab stop only while its rows overflow it', () => {
  it('keeps the -1 of Base UI while everything fits', async () => {
    expect((await menu()).getAttribute('tabindex')).toBe('-1')
  })

  it('takes tabindex 0 when its rows are taller than its box, so a menu no row of which holds the focus is still reached', async () => {
    box.scrollHeight = 2530
    expect((await menu()).getAttribute('tabindex')).toBe('0')
  })

  // Base UI focuses a menu it opens with no row highlighted, and a stop that holds the focus is kept until it leaves.
  it('becomes one when its box shrinks under its rows, a short landscape phone', async () => {
    const element = await menu()
    box.clientHeight = 60
    resize()
    expect(element.getAttribute('tabindex')).toBe('0')
  })

  it('leaves a tabIndex of the caller alone', async () => {
    box.scrollHeight = 2530
    expect((await menu({ tabIndex: -1 })).getAttribute('tabindex')).toBe('-1')
  })

  // The hook runs in a part mounted with the portal. Called from DropdownPopup, it ran once on a closed menu and never again.
  it('a menu that opens later is measured when it mounts', async () => {
    box.scrollHeight = 2530
    render(tree({}, false))
    await userEvent.click(screen.getByRole('button', { name: 'Time zone' }))
    expect((await screen.findByRole('menu')).getAttribute('tabindex')).toBe('0')
  })
})

describe('the ref of the caller follows the menu the hook measures', () => {
  it('an object ref holds the menu itself, which is the one that becomes the tab stop', async () => {
    box.scrollHeight = 2530
    const ref = { current: null as HTMLDivElement | null }
    const element = await menu({ ref })
    expect(ref.current).toBe(element)
    expect(ref.current?.getAttribute('tabindex')).toBe('0')
  })

  it('a callback ref is given the div, and null when the menu leaves', async () => {
    const seen: (string | null)[] = []
    const { unmount } = render(tree({ ref: (node) => { seen.push(node ? node.tagName : null) } }))
    await screen.findByRole('menu')
    expect(seen).toEqual(['DIV'])
    unmount()
    expect(seen).toEqual(['DIV', null])
  })
})
