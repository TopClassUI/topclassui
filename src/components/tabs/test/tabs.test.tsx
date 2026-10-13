import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'
import type { TabsPanelProps, TabsRootProps } from '../types.js'

/** Two tabs and two panels: the first is active unless the root says otherwise. */
const tabs = (root: Partial<TabsRootProps> = { defaultValue: 'overview' }, panel: Partial<TabsPanelProps> = {}) => markup(
  <TabsRoot {...root}>
    <TabsList aria-label="Project">
      <TabsTab value="overview">Overview</TabsTab>
      <TabsTab value="activity">Activity</TabsTab>
    </TabsList>
    <TabsPanel value="overview">Revenue is up 12%.</TabsPanel>
    <TabsPanel value="activity" {...panel}>Three people edited this project.</TabsPanel>
  </TabsRoot>,
)

/** The tabindex of every tab, in order: '0' is a stop for the Tab key. */
const stops = (html: string) => (html.match(/<button [^>]*>/g) ?? []).map((tag) => attr(tag, 'tabindex'))

/** The opening tag of every panel, in order. */
const panels = (html: string) => html.match(/<div [^>]*role="tabpanel"[^>]*>/g) ?? []

// The ssr project: what reaches the HTML before any script runs. PLAN 19, Phase 6, accepts Tabs on this.
describe('the text of a panel that is not active is in the server HTML', () => {
  it('is there, in a panel the browser hides until its tab is opened', () => {
    const html = tabs()
    expect(html).toContain('Three people edited this project.')
    const [active, inactive] = panels(html)
    expect(attr(active ?? '', 'hidden')).toBeUndefined()
    expect(attr(inactive ?? '', 'hidden')).toBe('')
  })

  it('keeps the hidden panel away from the keyboard and from a screen reader: inert, and no tab stop', () => {
    const [active, inactive] = panels(tabs())
    expect(attr(inactive ?? '', 'inert')).toBe('')
    expect(attr(inactive ?? '', 'tabindex')).toBe('-1')
    expect(attr(active ?? '', 'inert')).toBeUndefined()
    expect(attr(active ?? '', 'tabindex')).toBe('0')
  })

  it('renders the panel of the other tab instead when the page opens on it', () => {
    const [first, second] = panels(tabs({ defaultValue: 'activity' }))
    expect(attr(first ?? '', 'hidden')).toBe('')
    expect(attr(second ?? '', 'hidden')).toBeUndefined()
  })

  it('leaves a panel out of the HTML only when its caller passes keepMounted={false}', () => {
    const html = tabs({ defaultValue: 'overview' }, { keepMounted: false })
    expect(html).not.toContain('Three people edited this project.')
    expect(panels(html)).toHaveLength(1)
  })

  it('still renders that panel when its own tab is the active one', () => {
    const html = tabs({ defaultValue: 'activity' }, { keepMounted: false })
    expect(html).toContain('Three people edited this project.')
    expect(panels(html)).toHaveLength(2)
  })

  it('holds whatever a Server Component built: a list and a form field arrive as markup', () => {
    const content: ReactNode = <ul><li>Amal</li><li><input name="email" /></li></ul>
    const html = markup(
      <TabsRoot defaultValue="a">
        <TabsList aria-label="Team"><TabsTab value="a">A</TabsTab><TabsTab value="b">B</TabsTab></TabsList>
        <TabsPanel value="a">Shown</TabsPanel>
        <TabsPanel value="b">{content}</TabsPanel>
      </TabsRoot>,
    )
    expect(html).toContain('<ul><li>Amal</li><li><input name="email"/></li></ul>')
  })
})

describe('what the server writes around the panels', () => {
  it('the root is a div that carries the look, with the defaults when none is given', () => {
    const html = tabs()
    expect(html).toMatch(/^<div /)
    expect(attr(html, 'data-variant')).toBe('line')
    expect(attr(html, 'data-size')).toBe('md')
  })

  it('the list is a tablist with the name its caller gave it', () => {
    const list = /<div [^>]*role="tablist"[^>]*>/.exec(tabs())?.[0] ?? ''
    expect(attr(list, 'aria-label')).toBe('Project')
  })

  it('each tab is a button that says whether it is selected', () => {
    const buttons = tabs().match(/<button [^>]*>/g) ?? []
    expect(buttons.map((tag) => `${attr(tag, 'type') ?? ''} ${attr(tag, 'role') ?? ''} ${attr(tag, 'aria-selected') ?? ''}`))
      .toEqual(['button tab true', 'button tab false'])
    expect(buttons.map((tag) => attr(tag, 'data-active'))).toEqual(['', undefined])
  })

  // Base UI serves every tab at tabindex -1 and finds its tab stop in an effect, after the page has hydrated.
  it('keeps the tab the page opens on in the tab order, and no other', () => {
    expect(stops(tabs())).toEqual(['0', '-1'])
    expect(stops(tabs({ defaultValue: 'activity' }))).toEqual(['-1', '0'])
    expect(stops(tabs({ value: 'activity' }))).toEqual(['-1', '0'])
  })

  it('keeps no tab in the tab order when the page opens on none: tabs named by strings and no defaultValue, or null', () => {
    expect(stops(tabs({}))).toEqual(['-1', '-1'])
    expect(stops(tabs({ defaultValue: null }))).toEqual(['-1', '-1'])
    expect(stops(tabs({ value: null }))).toEqual(['-1', '-1'])
  })

  it('leaves a tabIndex its caller wrote on a tab alone', () => {
    const html = markup(
      <TabsRoot defaultValue="a">
        <TabsList aria-label="Project"><TabsTab value="a" tabIndex={-1}>A</TabsTab></TabsList>
        <TabsPanel value="a">Panel</TabsPanel>
      </TabsRoot>,
    )
    expect(stops(html)).toEqual(['-1'])
  })

  it('puts each label in a span of its own, which is what can end in an ellipsis', () => {
    expect(tabs()).toContain('<span class="truncate min-w-0">Overview</span></button>')
  })

  // Base UI 1.8.0 learns which tab holds which value in an effect, so the server cannot match a string to 0.
  it('with no defaultValue and tabs named by strings, shows no panel until the page hydrates', () => {
    const html = tabs({})
    expect(panels(html).map((tag) => attr(tag, 'hidden'))).toEqual(['', ''])
    expect(html.match(/aria-selected="true"/g)).toBeNull()
  })

  it('with no defaultValue and tabs named 0 and 1, shows the first: 0 is the value Base UI starts on', () => {
    const html = markup(
      <TabsRoot>
        <TabsList aria-label="Project"><TabsTab value={0}>Overview</TabsTab><TabsTab value={1}>Activity</TabsTab></TabsList>
        <TabsPanel value={0}>First</TabsPanel>
        <TabsPanel value={1}>Second</TabsPanel>
      </TabsRoot>,
    )
    expect(panels(html).map((tag) => attr(tag, 'hidden'))).toEqual([undefined, ''])
    expect(stops(html)).toEqual(['0', '-1'])
  })
})
