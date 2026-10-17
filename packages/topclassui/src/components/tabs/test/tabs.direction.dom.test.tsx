import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

const NAMES = ['First', 'Second', 'Third']

const tabs = (
  <TabsRoot defaultValue="First">
    <TabsList aria-label="Order">
      {NAMES.map((name) => <TabsTab key={name} value={name}>{name}</TabsTab>)}
    </TabsList>
    {NAMES.map((name) => <TabsPanel key={name} value={name}>Panel of {name}</TabsPanel>)}
  </TabsRoot>
)

const rtl = (children: ReactNode) => <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
const ltr = (children: ReactNode) => <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>

/** Focuses the first tab, presses the keys one at a time, and reads where the focus is after each. */
async function walk(tree: ReactNode, keys: string[]): Promise<(string | null | undefined)[]> {
  render(tree)
  const first = screen.getByRole('tab', { name: 'First' })
  await waitFor(() => { expect(first.getAttribute('tabindex')).toBe('0') })
  act(() => { first.focus() })
  const seen: (string | null | undefined)[] = []
  for (const key of keys) {
    await userEvent.keyboard(key)
    seen.push(document.activeElement?.textContent)
  }
  return seen
}

// Not a portal, so nothing is stamped on an element: Base UI reads the DirectionProvider that TopClassProvider mounts.
describe('the arrow keys follow the direction of the provider', () => {
  it('left to right: ArrowRight is the next tab, ArrowLeft the one before', async () => {
    expect(await walk(ltr(tabs), ['{ArrowRight}', '{ArrowRight}', '{ArrowLeft}'])).toEqual(['Second', 'Third', 'Second'])
  })

  it('right to left: ArrowLeft is the next tab, ArrowRight the one before', async () => {
    expect(await walk(rtl(tabs), ['{ArrowLeft}', '{ArrowLeft}', '{ArrowRight}'])).toEqual(['Second', 'Third', 'Second'])
  })

  it('right to left: ArrowRight from the first tab goes round to the last', async () => {
    expect(await walk(rtl(tabs), ['{ArrowRight}', '{ArrowLeft}'])).toEqual(['Third', 'First'])
  })

  it('right to left: Home is still the first tab and End the last, whichever side they are drawn on', async () => {
    expect(await walk(rtl(tabs), ['{End}', '{Home}'])).toEqual(['Third', 'First'])
  })

  it('an RTL island on a left-to-right page takes the direction of its own provider', async () => {
    expect(await walk(ltr(rtl(tabs)), ['{ArrowLeft}', '{ArrowLeft}'])).toEqual(['Second', 'Third'])
  })

  it('an LTR island on a right-to-left page does too', async () => {
    expect(await walk(rtl(ltr(tabs)), ['{ArrowRight}', '{ArrowRight}'])).toEqual(['Second', 'Third'])
  })

  // R-13-1: the app mounts the provider. Without one Base UI falls back to left to right, whatever dir the page has.
  it('with no provider at all the arrows are left to right, even inside dir="rtl"', async () => {
    expect(await walk(<div dir="rtl">{tabs}</div>, ['{ArrowRight}', '{ArrowLeft}'])).toEqual(['Second', 'First'])
  })
})

describe('nothing about the direction is written on an element', () => {
  it('no part carries dir or lang: the tabs are laid out by the page they sit in', () => {
    const { container } = render(rtl(tabs))
    // A label's own dir="auto" sets the direction of its text, never of the tabs around it.
    expect(container.querySelectorAll('[dir]:not(span[dir="auto"])')).toHaveLength(0)
    expect(container.querySelectorAll('[lang]')).toHaveLength(0)
  })

  it('a dir its caller writes on the root stays where it was written', () => {
    render(
      <TabsRoot defaultValue="a" dir="rtl" lang="ar">
        <TabsList aria-label="Order"><TabsTab value="a">A</TabsTab></TabsList>
        <TabsPanel value="a">Panel</TabsPanel>
      </TabsRoot>,
    )
    const root = screen.getByRole('tablist').parentElement
    expect(root?.getAttribute('dir')).toBe('rtl')
    expect(root?.getAttribute('lang')).toBe('ar')
  })
})
