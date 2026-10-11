import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { attr, markup } from '#test/markup.js'
import { PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'

/** A whole popover, as a page would write it. */
const popover = (open = false) => (
  <PopoverRoot defaultOpen={open}>
    <PopoverTrigger render={<Button variant="outline">Share</Button>} />
    <PopoverPopup>
      <PopoverTitle>Share this page</PopoverTitle>
      <PopoverDescription>Anyone with the link can read it.</PopoverDescription>
      <PopoverClose render={<Button>Done</Button>} />
    </PopoverPopup>
  </PopoverRoot>
)

// The ssr project: what reaches the HTML before any script runs.
describe('on the server', () => {
  it('PopoverRoot renders no element of its own, only its children', () => {
    expect(markup(<PopoverRoot><span>Inside</span></PopoverRoot>)).toBe('<span>Inside</span>')
  })

  it('renders the trigger as the Button it is given, closed, and says what it opens', () => {
    const html = markup(popover())
    expect(html).toMatch(/^<button type="button" tabindex="0" data-variant="outline"/)
    expect(attr(html, 'aria-haspopup')).toBe('dialog')
    expect(attr(html, 'aria-expanded')).toBe('false')
    expect(html).toContain('<span class="truncate min-w-0">Share</span>')
  })

  it('renders nothing but the trigger: no popup, no positioner and none of its text', () => {
    const html = markup(popover())
    expect(html.match(/<button /g) ?? []).toHaveLength(1)
    expect(html).toMatch(/<\/button>$/)
    expect(html).not.toContain('Share this page')
    expect(html).not.toContain('Done')
    expect(html).not.toContain('data-popover')
  })

  it('renders no popup even for one open from the start, because the portal needs the browser', () => {
    const html = markup(popover(true))
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('Share this page')
  })

  it('writes no delay on the element: the two are for Base UI, not attributes', () => {
    const html = markup(
      <PopoverRoot>
        <PopoverTrigger openOnHover delay={100} closeDelay={200} render={<Button>Details</Button>} />
      </PopoverRoot>,
    )
    expect(html).not.toContain('delay')
    expect(html).not.toContain('openonhover')
  })

  it('renders a bare trigger as a plain button with no class when nothing is passed to render', () => {
    const html = markup(
      <PopoverRoot>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPopup><PopoverTitle>Title</PopoverTitle></PopoverPopup>
      </PopoverRoot>,
    )
    expect(html).toMatch(/^<button type="button"[^>]*>Open<\/button>$/)
    expect(html).not.toContain('class=')
  })
})
