import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { attr, markup } from '#test/markup.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

/** A whole sheet, as a page would write it. */
const sheet = (open = false) => (
  <DrawerRoot defaultOpen={open}>
    <DrawerTrigger render={<Button variant="outline">Publish</Button>} />
    <DrawerPopup>
      <DrawerHeader><DrawerTitle>Publish changes</DrawerTitle></DrawerHeader>
      <DrawerBody>11 files changed.</DrawerBody>
      <DrawerFooter><DrawerClose render={<Button>Done</Button>} /></DrawerFooter>
    </DrawerPopup>
  </DrawerRoot>
)

// The ssr project: what reaches the HTML before any script runs.
describe('on the server', () => {
  it('DrawerRoot renders no element of its own, only its children', () => {
    expect(markup(<DrawerRoot><span>Inside</span></DrawerRoot>)).toBe('<span>Inside</span>')
  })

  it('renders the trigger as the Button it is given, closed, and says what it opens', () => {
    const html = markup(sheet())
    expect(html).toMatch(/^<button type="button" tabindex="0" data-variant="outline"/)
    expect(attr(html, 'aria-haspopup')).toBe('dialog')
    expect(attr(html, 'aria-expanded')).toBe('false')
    expect(html).toContain('<span class="truncate min-w-0">Publish</span>')
  })

  it('renders nothing but the trigger: no scrim, no popup and none of its text', () => {
    const html = markup(sheet())
    expect(html.match(/<button /g) ?? []).toHaveLength(1)
    expect(html).toMatch(/<\/button>$/)
    expect(html).not.toContain('Publish changes')
    expect(html).not.toContain('Done')
  })

  it('renders no popup even for one open from the start, because the portal needs the browser', () => {
    const html = markup(sheet(true))
    expect(html.match(/<button /g) ?? []).toHaveLength(1)
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('bg-overlay')
  })

  it('renders a bare trigger as a plain button with no class when nothing is passed to render', () => {
    const html = markup(
      <DrawerRoot>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerPopup><DrawerBody>Body</DrawerBody></DrawerPopup>
      </DrawerRoot>,
    )
    expect(html).toMatch(/^<button type="button"[^>]*>Open<\/button>$/)
    expect(html).not.toContain('class=')
  })
})
