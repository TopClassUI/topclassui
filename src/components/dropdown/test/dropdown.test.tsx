import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { attr, markup } from '#test/markup.js'
import { DropdownItem, DropdownMenu, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'

/** A whole menu, as a page would write it. */
const dropdown = (open = false) => (
  <DropdownRoot defaultOpen={open}>
    <DropdownTrigger render={<Button variant="outline">Actions</Button>} />
    <DropdownPopup>
      <DropdownItem shortcut="Ctrl P">Profile</DropdownItem>
      <DropdownItem tone="danger">Delete</DropdownItem>
    </DropdownPopup>
  </DropdownRoot>
)

// The ssr project: what reaches the HTML before any script runs.
describe('on the server', () => {
  it('DropdownRoot renders no element of its own, only its children', () => {
    expect(markup(<DropdownRoot><span>Inside</span></DropdownRoot>)).toBe('<span>Inside</span>')
  })

  it('renders the trigger as the Button it is given, closed, and says it opens a menu', () => {
    const html = markup(dropdown())
    expect(html).toMatch(/^<button type="button" tabindex="0" data-variant="outline"/)
    expect(attr(html, 'aria-haspopup')).toBe('menu')
    expect(attr(html, 'aria-expanded')).toBe('false')
    expect(html).toContain('<span class="truncate min-w-0">Actions</span>')
  })

  it('renders nothing but the trigger: no menu, no positioner and none of its rows', () => {
    const html = markup(dropdown())
    expect(html.match(/<button /g) ?? []).toHaveLength(1)
    expect(html).toMatch(/<\/button>$/)
    expect(html).not.toContain('Profile')
    expect(html).not.toContain('role="menu')
    expect(html).not.toContain('data-dropdown')
  })

  it('renders no menu even for one open from the start, because the portal needs the browser', () => {
    const html = markup(dropdown(true))
    expect(html).not.toContain('role="menu')
    expect(html).not.toContain('Delete')
  })

  it('writes no delay on the element: the two are for Base UI, not attributes', () => {
    const html = markup(
      <DropdownRoot>
        <DropdownTrigger openOnHover delay={100} closeDelay={200} render={<Button>More</Button>} />
      </DropdownRoot>,
    )
    expect(html).not.toContain('delay')
    expect(html).not.toContain('openonhover')
  })

  it('renders a bare trigger as a plain button with no class when nothing is passed to render', () => {
    const html = markup(
      <DropdownRoot>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownPopup><DropdownItem>Rename</DropdownItem></DropdownPopup>
      </DropdownRoot>,
    )
    expect(html).toMatch(/^<button type="button"[^>]*>Open<\/button>$/)
    expect(html).not.toContain('class=')
  })

  it('the data-driven menu serves the same thing: its trigger, and none of its items', () => {
    const html = markup(
      <DropdownMenu
        trigger={<Button variant="outline">Account</Button>}
        title="Account"
        items={[{ id: 'profile', label: 'Profile', href: '/profile' }]}
      />,
    )
    expect(html).toMatch(/^<button type="button" tabindex="0" data-variant="outline"/)
    expect(attr(html, 'aria-haspopup')).toBe('menu')
    expect(html).toMatch(/<\/button>$/)
    expect(html).not.toContain('/profile')
  })
})
