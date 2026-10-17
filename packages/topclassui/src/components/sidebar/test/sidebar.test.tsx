import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { SidebarBody, SidebarHeader, SidebarRoot, SidebarTrigger } from '../index.js'
import type { SidebarRootProps } from '../types.js'

/** The opening tag of the first element of a kind: its attributes, as the server writes them. */
const tag = (html: string, name: string) => new RegExp(`<${name}[ >][^>]*>|<${name}>`).exec(html)?.[0] ?? ''

const rail = (props: Partial<SidebarRootProps> = {}, children: ReactNode = <SidebarHeader>Workspace</SidebarHeader>) =>
  markup(<SidebarRoot {...props}>{children}</SidebarRoot>)

describe('SidebarRoot on the server', () => {
  it('is a nav, named Sidebar by the labels, and holds its children', () => {
    const html = rail()
    expect(html.startsWith('<nav aria-label="Sidebar" data-open="" class="')).toBe(true)
    expect(html.endsWith('</nav>')).toBe(true)
    expect(html).toContain('Workspace')
  })

  it('is expanded by default: data-open and no data-closed, in the HTML itself', () => {
    const nav = tag(rail(), 'nav')
    expect(attr(nav, 'data-open')).toBe('')
    expect(attr(nav, 'data-closed')).toBeUndefined()
  })

  it('is collapsed in the HTML with defaultOpen={false}, so nothing moves when the page hydrates', () => {
    const nav = tag(rail({ defaultOpen: false }), 'nav')
    expect(attr(nav, 'data-closed')).toBe('')
    expect(attr(nav, 'data-open')).toBeUndefined()
  })

  it('follows open over defaultOpen when its caller holds the state', () => {
    expect(attr(tag(rail({ open: false, defaultOpen: true }), 'nav'), 'data-closed')).toBe('')
    expect(attr(tag(rail({ open: true, defaultOpen: false }), 'nav'), 'data-open')).toBe('')
  })

  // R-5.7-6: a boolean presence attribute, never data-state="open".
  it('writes the state as a presence attribute and never as data-state', () => {
    expect(rail()).not.toContain('data-state')
    expect(rail({ defaultOpen: false })).not.toContain('data-state')
  })

  it('takes the name its caller gives it, and falls back to the label for an empty one', () => {
    expect(attr(tag(rail({ 'aria-label': 'Documentation' }), 'nav'), 'aria-label')).toBe('Documentation')
    expect(attr(tag(rail({ 'aria-label': '' }), 'nav'), 'aria-label')).toBe('Sidebar')
    expect(attr(tag(rail({ 'aria-labelledby': 'heading' }), 'nav'), 'aria-labelledby')).toBe('heading')
  })

  it('passes the rest of its props to the nav, and cannot be talked out of its state', () => {
    const nav = tag(rail({ id: 'rail', lang: 'en', ...{ 'data-closed': '' } }), 'nav')
    expect(attr(nav, 'id')).toBe('rail')
    expect(attr(nav, 'lang')).toBe('en')
    expect(attr(nav, 'data-open')).toBe('')
    expect(attr(nav, 'data-closed')).toBeUndefined()
    const collapsed = tag(rail({ defaultOpen: false, ...{ 'data-open': '' } }), 'nav')
    expect(attr(collapsed, 'data-closed')).toBe('')
    expect(attr(collapsed, 'data-open')).toBeUndefined()
  })

  it('merges className last, so a caller sets another width for one state and keeps the other', () => {
    const classes = classList(tag(rail({ className: 'data-open:w-72' }), 'nav'))
    expect(classes).toContain('data-open:w-72')
    expect(classes).not.toContain('data-open:w-55')
    expect(classes).toContain('data-closed:w-15')
    expect(classes.at(-1)).toBe('data-open:w-72')
  })

  it('renders nothing of its own inside the nav: an empty rail is an empty nav', () => {
    expect(rail({}, null)).toMatch(/^<nav [^>]*><\/nav>$/)
  })
})

describe('SidebarTrigger on the server', () => {
  const toggle = (props: Partial<SidebarRootProps> = {}) => tag(rail(props), 'button')

  it('is a real button of type button that says the rail is expanded, named by what a press will do', () => {
    const button = toggle()
    expect(button.startsWith('<button aria-label="Collapse the sidebar" type="button" aria-expanded="true" class="')).toBe(true)
  })

  it('says collapsed, and is named Expand, in a rail that starts collapsed', () => {
    const button = toggle({ defaultOpen: false })
    expect(attr(button, 'aria-expanded')).toBe('false')
    expect(attr(button, 'aria-label')).toBe('Expand the sidebar')
  })

  it('holds one icon, hidden from a screen reader and mirrored in a right-to-left rail', () => {
    const html = rail()
    const button = html.slice(html.indexOf('<button'), html.indexOf('</button>'))
    expect(button.match(/<svg /g)).toHaveLength(1)
    const svg = tag(button, 'svg')
    expect(attr(svg, 'aria-hidden')).toBe('true')
    expect(classList(svg)).toContain('rtl:-scale-x-100')
    // The path of sidebar-simple, so another icon is a failure here.
    expect(button).toContain('M216,40H40A16,16,0,0,0,24,56V200')
  })

  it('takes a name, an id and a class from its caller, and keeps its type and its state', () => {
    const html = markup(
      <SidebarRoot defaultOpen={false}>
        <SidebarTrigger id="toggle" aria-label="Menu" className="text-body" {...{ type: 'submit', 'aria-expanded': true }} />
      </SidebarRoot>,
    )
    const button = tag(html, 'button')
    expect(attr(button, 'id')).toBe('toggle')
    expect(attr(button, 'aria-label')).toBe('Menu')
    expect(attr(button, 'type')).toBe('button')
    expect(attr(button, 'aria-expanded')).toBe('false')
    expect(classList(button).at(-1)).toBe('text-body')
    expect(classList(button)).not.toContain('text-muted')
  })

  it('refuses to render outside a rail, and says where it belongs', () => {
    expect(() => markup(<SidebarTrigger />)).toThrow('SidebarTrigger must be rendered inside a SidebarRoot')
    expect(() => markup(<SidebarHeader>Workspace</SidebarHeader>)).toThrow('SidebarTrigger must be rendered inside a SidebarRoot')
  })
})

describe('SidebarHeader on the server', () => {
  it('is a div holding the toggle and then the title in a span of its own', () => {
    const html = rail()
    const header = html.slice(html.indexOf('<div'), html.indexOf('</div>') + 6)
    expect(header).toMatch(/^<div class="[^"]*"><button [^>]*><svg [^>]*><path [^>]*><\/path><\/svg><\/button><span dir="auto" class="[^"]*">Workspace<\/span><\/div>$/)
  })

  it('leaves the span out when it has no title, a false or an empty string', () => {
    for (const title of [undefined, null, false, '']) {
      expect(rail({}, <SidebarHeader>{title}</SidebarHeader>), String(title)).not.toContain('<span')
    }
  })

  it('cuts a title of 300 characters at 100, and leaves an element as it came', () => {
    expect(rail({}, <SidebarHeader>{'W'.repeat(300)}</SidebarHeader>)).toContain(`>${'W'.repeat(100)}</span>`)
    expect(rail({}, <SidebarHeader><em>{'W'.repeat(300)}</em></SidebarHeader>)).toContain(`<em>${'W'.repeat(300)}</em>`)
  })

  it('passes its props to the div and merges className last', () => {
    const html = rail({}, <SidebarHeader id="top" className="pb-4" data-testid="header">Workspace</SidebarHeader>)
    const div = tag(html, 'div')
    expect(attr(div, 'id')).toBe('top')
    expect(attr(div, 'data-testid')).toBe('header')
    expect(classList(div).at(-1)).toBe('pb-4')
    expect(classList(div)).not.toContain('pb-1.5')
  })
})

describe('SidebarBody on the server', () => {
  const body = (html: string) => tag(html, 'div')

  it('is a div around its children, with no role and no tab stop: its rows are the stops', () => {
    const html = rail({}, <SidebarBody><p>Rows</p></SidebarBody>)
    expect(html).toMatch(/<div class="[^"]*"><p>Rows<\/p><\/div><\/nav>$/)
    expect(attr(body(html), 'tabindex')).toBeUndefined()
    expect(attr(body(html), 'role')).toBeUndefined()
  })

  it('passes its props to the div and merges className last', () => {
    const html = rail({}, <SidebarBody id="rows" className="gap-2">Rows</SidebarBody>)
    expect(attr(body(html), 'id')).toBe('rows')
    expect(classList(body(html)).at(-1)).toBe('gap-2')
    expect(classList(body(html))).not.toContain('gap-1')
  })
})
