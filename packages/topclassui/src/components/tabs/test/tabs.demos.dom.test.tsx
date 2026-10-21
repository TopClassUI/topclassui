import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** The name of every list of tabs in each demo, in order, written out. */
const LISTS: Record<string, string[]> = {
  'basic': ['Project'],
  'controlled': ['Post'],
  'disabled': ['Release', 'Release, enclosed'],
  'enclosed': ['Project'],
  'long-label': ['Report', 'Report, enclosed'],
  'many': ['Workspace', 'Workspace, enclosed'],
  'playground': ['Project'],
  'rtl': ['المشروع'],
  'server-content': ['Team'],
  'sizes': [
    'line xs', 'line sm', 'line md', 'line lg', 'line xl', 'line custom',
    'enclosed xs', 'enclosed sm', 'enclosed md', 'enclosed lg', 'enclosed xl', 'enclosed custom',
  ],
  'states': ['Line', 'Enclosed', 'Focused', 'Every tab disabled'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

/** The panel a tab controls, found the way a screen reader finds it. */
const panelOf = (tab: HTMLElement) => document.getElementById(tab.getAttribute('aria-controls') ?? '')

describe('every list of tabs in every demo', () => {
  it('has an expectation for every demo, so a new one cannot skip the rules', () => {
    expect(Object.keys(LISTS).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: each list is named, by the name written here`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      expect(screen.getAllByRole('tablist').map((list) => list.getAttribute('aria-label'))).toEqual(LISTS[name])
    })

    it(`${name}: every tab that is not disabled opens a panel that is named after it and holds something`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const list of screen.getAllByRole('tablist')) {
        const tabs = within(list).getAllByRole('tab')
        expect(tabs.length, name).toBeGreaterThanOrEqual(2)
        for (const tab of tabs) {
          if (tab.getAttribute('aria-disabled') === 'true') continue
          await userEvent.click(tab)
          expect(tab.getAttribute('aria-selected'), tab.textContent).toBe('true')
          await waitFor(() => { expect(panelOf(tab)?.hasAttribute('hidden'), tab.textContent).toBe(false) })
          expect(panelOf(tab)?.getAttribute('aria-labelledby')).toBe(tab.id)
          expect(panelOf(tab)?.textContent.length, tab.textContent).toBeGreaterThan(5)
        }
      }
    })

    it(`${name}: only one panel of each list is ever shown`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      const lists = screen.getAllByRole('tablist')
      await userEvent.click(within(lists[0] as HTMLElement).getAllByRole('tab').at(-1) as HTMLElement)
      expect(screen.getAllByRole('tabpanel')).toHaveLength(lists.length)
    })
  }
})

/** Focuses the first tab of a demo, presses one key, and reads which tab holds the focus. */
async function arrow(name: string, key: string): Promise<string | null | undefined> {
  const Demo = await load(name)
  render(<Demo />)
  const [first] = screen.getAllByRole('tab')
  await waitFor(() => { expect(first?.getAttribute('tabindex')).toBe('0') })
  act(() => { first?.focus() })
  await userEvent.keyboard(key)
  return document.activeElement?.textContent
}

describe('the arrow keys in the demos', () => {
  it('basic, with no provider of its own: the right arrow goes to the next tab', async () => {
    expect(await arrow('basic', '{ArrowRight}')).toBe('Activity')
  })

  it('rtl, inside the provider it mounts: the left arrow goes to the next tab', async () => {
    expect(await arrow('rtl', '{ArrowLeft}')).toBe('النشاط')
  })

  it('rtl: the right arrow goes round to the last tab', async () => {
    expect(await arrow('rtl', '{ArrowRight}')).toBe('الإعدادات')
  })
})

describe('the demos that show one thing', () => {
  it('disabled: a click on the disabled tab opens nothing, and its panel stays hidden', async () => {
    const Demo = await load('disabled')
    render(<Demo />)
    const [changelog] = screen.getAllByRole('tab', { name: 'Changelog' })
    await userEvent.click(changelog as HTMLElement)
    expect(changelog?.getAttribute('aria-selected')).toBe('false')
    expect(screen.getAllByRole('tabpanel').map((panel) => panel.textContent)).toEqual([
      'Version 2.4 ships on Monday.', 'Version 2.4 ships on Monday.',
    ])
  })

  it('controlled: the button outside the list opens the last tab, through the state the demo holds', async () => {
    const Demo = await load('controlled')
    render(<Demo />)
    expect(screen.getByRole('tabpanel').textContent).toBe('Only you can see a draft.')
    await userEvent.click(screen.getByRole('button', { name: 'Go to Published' }))
    expect(screen.getByRole('tab', { name: 'Published' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('Everyone can read a published post.')
  })

  it('controlled: a click on a tab still moves it, because the demo writes the new value back', async () => {
    const Demo = await load('controlled')
    render(<Demo />)
    await userEvent.click(screen.getByRole('tab', { name: 'Review' }))
    expect(screen.getByRole('tabpanel').textContent).toBe('Two reviewers have been asked.')
  })

  it('server-content: opens on the form, and the list of the other panel cannot be reached until its tab is opened', async () => {
    const Demo = await load('server-content')
    render(<Demo />)
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeTruthy()
    expect(screen.queryByRole('listitem')).toBeNull()
    await userEvent.click(screen.getByRole('tab', { name: 'Members' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.queryByRole('textbox')).toBeNull()
  })
})
