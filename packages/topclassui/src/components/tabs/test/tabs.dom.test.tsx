import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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
async function mount(options?: Options) {
  const view = render(tabs(options))
  // The active tab becomes the one tab stop in an effect.
  await waitFor(() => { expect(tab('Overview').getAttribute('tabindex')).not.toBeNull() })
  return view
}

describe('the roles Base UI gives the parts', () => {
  it('a tablist with its name, four tabs and the one panel that is shown', async () => {
    await mount()
    expect(screen.getByRole('tablist', { name: 'Project' })).toBeTruthy()
    expect(screen.getAllByRole('tab').map((el) => el.textContent)).toEqual(NAMES)
    expect(screen.getAllByRole('tabpanel').map((el) => el.textContent)).toEqual(['Panel of Overview'])
  })

  it('ties each tab to its panel and each panel to its tab, the hidden ones too', async () => {
    await mount()
    const panels = [...document.querySelectorAll('[role="tabpanel"]')]
    expect(panels).toHaveLength(4)
    await waitFor(() => { expect(tab('Billing').getAttribute('aria-controls')).toBe(panels[3]?.id) })
    expect(panels[3]?.getAttribute('aria-labelledby')).toBe(tab('Billing').id)
    expect(panels[0]?.getAttribute('aria-labelledby')).toBe(tab('Overview').id)
  })

  it('only the active tab is a tab stop, so Tab enters the list once and leaves it', async () => {
    await mount()
    expect(screen.getAllByRole('tab').map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1'])
  })
})

describe('a click', () => {
  it('opens the tab: aria-selected follows, its panel is shown and the old one is hidden', async () => {
    await mount()
    await userEvent.click(tab('Activity'))
    expect(selected()).toEqual(['Activity'])
    expect(screen.getAllByRole('tabpanel').map((el) => el.textContent)).toEqual(['Panel of Activity'])
    expect(tab('Activity').hasAttribute('data-active')).toBe(true)
    expect(tab('Overview').hasAttribute('data-active')).toBe(false)
  })

  it('tells onValueChange the value of the tab, and why', async () => {
    const onValueChange = vi.fn()
    await mount({ root: { defaultValue: 'Overview', onValueChange } })
    await userEvent.click(tab('Settings'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBe('Settings')
    expect((onValueChange.mock.calls[0]?.[1] as { reason: string }).reason).toBe('none')
  })

  it('does nothing on a disabled tab', async () => {
    const onValueChange = vi.fn()
    await mount({ root: { defaultValue: 'Overview', onValueChange }, disabled: 'Activity' })
    await userEvent.click(tab('Activity'))
    expect(selected()).toEqual(['Overview'])
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('keepMounted', () => {
  it('is on by default: every panel is in the document, and all but the active one are hidden and inert', async () => {
    await mount()
    const panels = [...document.querySelectorAll('[role="tabpanel"]')]
    expect(panels.map((el) => el.textContent)).toEqual(NAMES.map((name) => `Panel of ${name}`))
    expect(panels.map((el) => el.hasAttribute('hidden'))).toEqual([false, true, true, true])
    expect(panels.map((el) => el.hasAttribute('inert'))).toEqual([false, true, true, true])
    expect(panels.map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1'])
  })

  it('a panel given keepMounted={false} is not in the document until its tab is opened', async () => {
    await mount({ panel: { keepMounted: false } })
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(3)
    expect(tab('Billing').hasAttribute('aria-controls')).toBe(false)
    await userEvent.click(tab('Billing'))
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel of Billing')
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(4)
  })

  it('a panel that was open stays in the document after another tab is opened', async () => {
    await mount()
    await userEvent.click(tab('Activity'))
    const first = document.querySelector('[role="tabpanel"]')
    expect(first?.textContent).toBe('Panel of Overview')
    expect(first?.hasAttribute('hidden')).toBe(true)
  })
})

describe('the value', () => {
  it('a controlled root shows the tab its value names, and moves only when the value does', async () => {
    const view = render(tabs({ root: { value: 'Settings' } }))
    expect(selected()).toEqual(['Settings'])
    await userEvent.click(tab('Overview'))
    expect(selected()).toEqual(['Settings'])
    view.rerender(tabs({ root: { value: 'Billing' } }))
    expect(selected()).toEqual(['Billing'])
  })

  it('with no defaultValue, opens the first tab once the tabs have registered', async () => {
    render(tabs({ root: {} }))
    await waitFor(() => { expect(selected()).toEqual(['Overview']) })
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel of Overview')
  })

  it('with no defaultValue and a disabled first tab, opens the first tab that is enabled', async () => {
    render(tabs({ root: {}, disabled: 'Overview' }))
    await waitFor(() => { expect(selected()).toEqual(['Activity']) })
  })
})
