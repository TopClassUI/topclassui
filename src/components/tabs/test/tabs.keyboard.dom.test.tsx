import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'
import type { TabsListProps, TabsPanelProps, TabsRootProps } from '../types.js'

interface Options {
  root?: Partial<TabsRootProps>
  list?: Partial<TabsListProps>
  /** Props of the last panel, which is never the one the tree opens on. */
  panel?: Partial<TabsPanelProps>
  disabled?: string
}

const NAMES = ['Overview', 'Activity', 'Settings', 'Billing']

/** Four tabs and their panels, opened on the first unless the root says otherwise. */
function tabs({ root = { defaultValue: 'Overview' }, list = {}, panel = {}, disabled }: Options = {}) {
  return (
    <TabsRoot {...root}>
      <TabsList aria-label="Project" {...list}>
        {NAMES.map((name) => <TabsTab key={name} value={name} disabled={name === disabled}>{name}</TabsTab>)}
      </TabsList>
      {NAMES.map((name) => (
        <TabsPanel key={name} value={name} {...(name === 'Billing' ? panel : {})}>Panel of {name}</TabsPanel>
      ))}
    </TabsRoot>
  )
}

const tab = (name: string) => screen.getByRole('tab', { name })
const selected = () => screen.getAllByRole('tab').filter((el) => el.getAttribute('aria-selected') === 'true').map((el) => el.textContent)
const focused = () => document.activeElement?.textContent

/** Presses keys one at a time: Base UI moves the focus in a microtask after each. */
async function press(...keys: string[]) {
  for (const key of keys) await userEvent.keyboard(key)
}

async function mount(options?: Options) {
  const view = render(tabs(options))
  // The active tab becomes the one tab stop in an effect.
  await waitFor(() => { expect(tab('Overview').getAttribute('tabindex')).not.toBeNull() })
  return view
}

describe('the keyboard, left to right (ARIA Authoring Practices, Tabs)', () => {
  it('ArrowRight moves the focus to the next tab and ArrowLeft back, and neither opens it', async () => {
    await mount()
    act(() => { tab('Overview').focus() })
    await press('{ArrowRight}')
    expect(focused()).toBe('Activity')
    await press('{ArrowRight}')
    expect(focused()).toBe('Settings')
    await press('{ArrowLeft}')
    expect(focused()).toBe('Activity')
    expect(selected()).toEqual(['Overview'])
  })

  it('Enter opens the focused tab, and so does Space', async () => {
    await mount()
    act(() => { tab('Overview').focus() })
    await press('{ArrowRight}', '{Enter}')
    expect(selected()).toEqual(['Activity'])
    await press('{ArrowRight}', ' ')
    expect(selected()).toEqual(['Settings'])
  })

  it('Home goes to the first tab and End to the last', async () => {
    await mount()
    act(() => { tab('Overview').focus() })
    await press('{End}')
    expect(focused()).toBe('Billing')
    await press('{Home}')
    expect(focused()).toBe('Overview')
  })

  it('the arrows go round: forward from the last tab is the first, back from the first is the last', async () => {
    await mount()
    act(() => { tab('Overview').focus() })
    await press('{ArrowLeft}')
    expect(focused()).toBe('Billing')
    await press('{ArrowRight}')
    expect(focused()).toBe('Overview')
  })

  it('with loopFocus off they stop at the ends', async () => {
    await mount({ list: { loopFocus: false } })
    act(() => { tab('Overview').focus() })
    await press('{ArrowLeft}')
    expect(focused()).toBe('Overview')
    await press('{End}', '{ArrowRight}')
    expect(focused()).toBe('Billing')
  })

  it('the tab stop follows the focus, so Tab comes back to the tab the arrows left', async () => {
    await mount()
    act(() => { tab('Overview').focus() })
    await press('{ArrowRight}')
    expect(screen.getAllByRole('tab').map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1'])
  })

  it('with activateOnFocus an arrow opens the tab it lands on', async () => {
    await mount({ list: { activateOnFocus: true } })
    act(() => { tab('Overview').focus() })
    await press('{ArrowRight}')
    expect(selected()).toEqual(['Activity'])
    await press('{End}')
    expect(selected()).toEqual(['Billing'])
  })
})

// Base UI 1.8.0 keeps a disabled tab focusable, as the Authoring Practices allow for a tab: it is found, never opened.
describe('a disabled tab', () => {
  it('is announced as disabled and carries data-disabled, with no disabled attribute to take it out of the list', async () => {
    await mount({ disabled: 'Activity' })
    expect(tab('Activity').getAttribute('aria-disabled')).toBe('true')
    expect(tab('Activity').hasAttribute('data-disabled')).toBe(true)
    expect(tab('Activity').hasAttribute('disabled')).toBe(false)
    expect(tab('Overview').hasAttribute('data-disabled')).toBe(false)
  })

  it('is a stop for the arrow keys, and Enter and Space on it open nothing', async () => {
    await mount({ disabled: 'Activity' })
    act(() => { tab('Overview').focus() })
    await press('{ArrowRight}')
    expect(focused()).toBe('Activity')
    await press('{Enter}', ' ')
    expect(selected()).toEqual(['Overview'])
    await press('{ArrowRight}')
    expect(focused()).toBe('Settings')
  })

  it('is passed over by activateOnFocus: the tab before it stays open until an enabled one takes the focus', async () => {
    await mount({ list: { activateOnFocus: true }, disabled: 'Activity' })
    act(() => { tab('Overview').focus() })
    await press('{ArrowRight}')
    expect(focused()).toBe('Activity')
    expect(selected()).toEqual(['Overview'])
    await press('{ArrowRight}')
    expect(selected()).toEqual(['Settings'])
  })
})
