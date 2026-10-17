import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

/** Renders one tab, written out by its test so its children are the ones JSX would pass. */
function mount(tab: ReactElement) {
  render(
    <TabsRoot defaultValue="a">
      <TabsList aria-label="Project">{tab}</TabsList>
      <TabsPanel value="a">Panel</TabsPanel>
    </TabsRoot>,
  )
  return screen.getByTestId('tab')
}

const tab = (label: string) => mount(<TabsTab value="a" data-testid="tab">{label}</TabsTab>)

// R-5.2-7: the label sits on an element of its own, or text-overflow has nothing to apply to.
describe('the label of a tab', () => {
  it('is one span that truncates, around the whole text', () => {
    const element = tab('Overview')
    expect(element.children).toHaveLength(1)
    expect(element.firstElementChild?.tagName).toBe('SPAN')
    expect(element.firstElementChild?.getAttribute('class')).toBe('truncate min-w-0')
    expect(element.firstElementChild?.textContent).toBe('Overview')
  })

  it('keeps a run of text and a number in one span, so `{count} files` is one flex item', () => {
    const count = 3
    const element = mount(<TabsTab value="a" data-testid="tab">{count} files</TabsTab>)
    expect(element.children).toHaveLength(1)
    expect(element.textContent).toBe('3 files')
  })

  it('cuts a label of 300 characters at 100: the string is bounded, not only its box', () => {
    const element = tab('W'.repeat(300))
    expect(element.textContent).toHaveLength(100)
    expect(element.textContent).toBe('WWWWWWWWWW'.repeat(10))
  })

  it('leaves a label of exactly 100 characters whole', () => {
    expect(tab('abcdefghij'.repeat(10)).textContent).toBe('abcdefghij'.repeat(10))
  })

  it('passes an element through as it is, beside a span for the text around it', () => {
    const element = mount(<TabsTab value="a" data-testid="tab"><svg aria-hidden="true" />Settings</TabsTab>)
    expect([...element.children].map((child) => child.tagName.toLowerCase())).toEqual(['svg', 'span'])
    expect(element.lastElementChild?.textContent).toBe('Settings')
  })

  it('renders an empty tab with no span at all, so it is the 24 px target and nothing else', () => {
    render(
      <TabsRoot defaultValue="a">
        <TabsList aria-label="Project"><TabsTab value="a" aria-label="Empty" data-testid="empty" /></TabsList>
        <TabsPanel value="a">Panel</TabsPanel>
      </TabsRoot>,
    )
    expect(screen.getByTestId('empty').children).toHaveLength(0)
    expect(screen.getByRole('tab', { name: 'Empty' })).toBe(screen.getByTestId('empty'))
  })

  it('does not bound what a panel holds: only a tab is a control', () => {
    render(
      <TabsRoot defaultValue="a">
        <TabsList aria-label="Project"><TabsTab value="a">A</TabsTab></TabsList>
        <TabsPanel value="a">{'W'.repeat(300)}</TabsPanel>
      </TabsRoot>,
    )
    expect(screen.getByRole('tabpanel').textContent).toHaveLength(300)
    expect(screen.getByRole('tabpanel').children).toHaveLength(0)
  })
})
