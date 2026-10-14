import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { attr, markup } from '#test/markup.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

/** A whole dialog, as a page would write it. */
const dialog = (open = false) => (
  <DialogRoot defaultOpen={open}>
    <DialogTrigger render={<Button variant="outline">Publish</Button>} />
    <DialogPopup>
      <DialogHeader><DialogTitle>Publish changes</DialogTitle></DialogHeader>
      <DialogBody>11 files changed.</DialogBody>
      <DialogFooter><DialogClose render={<Button>Done</Button>} /></DialogFooter>
    </DialogPopup>
  </DialogRoot>
)

// The ssr project: what reaches the HTML before any script runs.
describe('on the server', () => {
  it('DialogRoot renders no element of its own, only its children', () => {
    expect(markup(<DialogRoot><span>Inside</span></DialogRoot>)).toBe('<span>Inside</span>')
  })

  it('renders the trigger as the Button it is given, closed, and says what it opens', () => {
    const html = markup(dialog())
    expect(html).toMatch(/^<button type="button" tabindex="0" data-variant="outline"/)
    expect(attr(html, 'aria-haspopup')).toBe('dialog')
    expect(attr(html, 'aria-expanded')).toBe('false')
    expect(html).toContain('<span dir="auto" class="truncate min-w-0">Publish</span>')
  })

  it('renders nothing but the trigger: no scrim, no popup and none of its text', () => {
    const html = markup(dialog())
    expect(html.match(/<button /g) ?? []).toHaveLength(1)
    expect(html).toMatch(/<\/button>$/)
    expect(html).not.toContain('Publish changes')
    expect(html).not.toContain('Done')
  })

  it('renders no popup even for one open from the start, because the portal needs the browser', () => {
    const html = markup(dialog(true))
    expect(html.match(/<button /g) ?? []).toHaveLength(1)
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('bg-overlay')
  })

  it('renders a bare trigger as a plain button with no class when nothing is passed to render', () => {
    const html = markup(
      <DialogRoot>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPopup><DialogBody>Body</DialogBody></DialogPopup>
      </DialogRoot>,
    )
    expect(html).toMatch(/^<button type="button"[^>]*>Open<\/button>$/)
    expect(html).not.toContain('class=')
  })
})
