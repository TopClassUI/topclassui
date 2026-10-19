import { describe, expect, it } from 'vitest'

import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { Svg } from '#components/svg/index.js'
import { attr, markup } from '#test/markup.js'
import { EmptyState } from '../index.js'
import type { EmptyStateProps } from '../types.js'

const html = (props: EmptyStateProps = {}) => markup(<EmptyState {...props} />)

const TITLE = 'Nothing here yet'
const DESCRIPTION = 'When there is something to show, it will appear here.'

/** The opening tags of the two text parts, written out from the Build this block. */
const TITLE_TAG = '<p class="text-base leading-tight font-semibold text-body">'
const DESCRIPTION_TAG = '<div class="text-sm leading-tight text-muted">'

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

describe('the element it renders', () => {
  it('is a div, so the description may hold paragraphs and the action a block', () => {
    expect(html()).toMatch(/^<div /)
  })

  it('has no role and no live region, because it is page content and stays silent', () => {
    const root = /^<div[^>]*>/.exec(html())?.[0] ?? ''
    expect(root).not.toContain('role=')
    expect(root).not.toContain('aria-live')
    expect(root).not.toContain('aria-atomic')
    expect(root).not.toContain('aria-busy')
  })

  it('never writes the title prop onto the root as a tooltip', () => {
    expect(attr(html({ title: 'No projects yet' }), 'title')).toBeUndefined()
  })

  it('spreads the rest onto the root and nowhere else', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html_ = markup(<EmptyState id="empty" data-testid="x" aria-labelledby="h" />)
    expect(attr(html_, 'id')).toBe('empty')
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'aria-labelledby')).toBe('h')
    expect(count(html_, 'id="empty"')).toBe(1)
    expect(count(html_, 'data-testid="x"')).toBe(1)
    expect(count(html_, 'aria-labelledby="h"')).toBe(1)
  })

  it('lets a caller who needs a live region add the role themselves', () => {
    const out = html({ role: 'status' })
    expect(attr(out, 'role')).toBe('status')
    expect(count(out, 'role=')).toBe(1)
  })

  it('passes style through to the root', () => {
    expect(attr(html({ style: { opacity: 0.5 } }), 'style')).toBe('opacity:0.5')
  })

  it('carries no design or state attribute, because it has no design prop and no state', () => {
    expect(html()).not.toMatch(/data-(variant|tone|size|state|open|loading|disabled)/)
  })
})

describe('with nothing passed', () => {
  it('shows the default title in a paragraph, exactly once', () => {
    const out = html()
    expect(out).toContain(`${TITLE_TAG}${TITLE}</p>`)
    expect(count(out, TITLE)).toBe(1)
  })

  it('shows the default description under it, exactly once', () => {
    const out = html()
    expect(out).toContain(`${DESCRIPTION_TAG}${DESCRIPTION}</div>`)
    expect(count(out, DESCRIPTION)).toBe(1)
  })

  it('puts the icon first, then the title, then the description', () => {
    const out = html()
    expect(out.indexOf('<svg')).toBeGreaterThan(-1)
    expect(out.indexOf('<svg')).toBeLessThan(out.indexOf(TITLE))
    expect(out.indexOf(TITLE)).toBeLessThan(out.indexOf(DESCRIPTION))
  })
})

describe('the description follows the title', () => {
  it('drops the default description under a caller title, which it would not describe', () => {
    const out = html({ title: 'No projects yet' })
    expect(out).toContain(`${TITLE_TAG}No projects yet</p>`)
    expect(out).not.toContain(DESCRIPTION)
    expect(out).not.toContain(DESCRIPTION_TAG)
  })

  it('keeps the default title above a caller description', () => {
    const out = html({ description: 'Invoices you send will show up here.' })
    expect(out).toContain(`${TITLE_TAG}${TITLE}</p>`)
    expect(out).toContain(`${DESCRIPTION_TAG}Invoices you send will show up here.</div>`)
    expect(out).not.toContain(DESCRIPTION)
  })

  it('shows both of the caller texts and neither default', () => {
    const out = html({ title: 'No projects yet', description: 'Create one to start.' })
    expect(out).toContain(`${TITLE_TAG}No projects yet</p>`)
    expect(out).toContain(`${DESCRIPTION_TAG}Create one to start.</div>`)
    expect(out).not.toContain(TITLE)
    expect(out).not.toContain(DESCRIPTION)
  })

  it('takes elements, not only strings, for both', () => {
    const out = markup(
      <EmptyState title={<>No <em>projects</em></>} description={<><p>One.</p><p>Two.</p></>} />,
    )
    expect(out).toContain(`${TITLE_TAG}No <em>projects</em></p>`)
    expect(out).toContain(`${DESCRIPTION_TAG}<p>One.</p><p>Two.</p></div>`)
  })
})

describe('null hides a part, and so does anything else that renders nothing', () => {
  it('hides the description and keeps the default title', () => {
    const out = html({ description: null })
    expect(out).toContain(`${TITLE_TAG}${TITLE}</p>`)
    expect(out).not.toContain(DESCRIPTION_TAG)
  })

  it('hides the title, and the default description goes with it, because a title was passed', () => {
    const out = html({ title: null })
    expect(out).not.toContain('<p ')
    expect(out).not.toContain(DESCRIPTION)
  })

  it('keeps a caller description when the title is hidden', () => {
    const out = html({ title: null, description: 'Only this.' })
    expect(out).not.toContain('<p ')
    expect(out).toContain(`${DESCRIPTION_TAG}Only this.</div>`)
  })

  it('leaves no empty wrapper for false, true or an empty string, which would open a gap', () => {
    expect(html({ description: false })).not.toContain(DESCRIPTION_TAG)
    expect(html({ description: true })).not.toContain(DESCRIPTION_TAG)
    expect(html({ description: '' })).not.toContain(DESCRIPTION_TAG)
    expect(html({ title: false })).not.toContain('<p ')
    expect(html({ title: true })).not.toContain('<p ')
    expect(html({ title: '' })).not.toContain('<p ')
  })

  it('renders a zero, which React shows as text', () => {
    expect(html({ description: 0 })).toContain(`${DESCRIPTION_TAG}0</div>`)
  })
})

describe('the icon', () => {
  it('defaults to one decorative svg, hidden from the accessibility tree', () => {
    const out = html()
    expect(count(out, '<svg')).toBe(1)
    expect(attr(/<svg[^>]*>/.exec(out)?.[0] ?? '', 'aria-hidden')).toBe('true')
  })

  it('is hidden by null, with no wrapper left behind', () => {
    const out = html({ icon: null })
    expect(out).not.toContain('<svg')
    expect(out).toMatch(/^<div [^>]*><p /)
  })

  it('renders a caller icon exactly as passed, with no class added to it', () => {
    const out = html({ icon: <Svg icon={magnifyingGlass} size="lg" className="text-danger-on-soft" /> })
    const svg = /<svg[^>]*>/.exec(out)?.[0] ?? ''
    expect(attr(svg, 'class')).toBe('inline-block shrink-0 text-danger-on-soft')
    expect(attr(svg, 'width')).toBe('32')
    expect(count(out, '<svg')).toBe(1)
  })

  it('keeps the default title and description beside a caller icon', () => {
    const out = html({ icon: <Svg icon={magnifyingGlass} /> })
    expect(out).toContain(TITLE)
    expect(out).toContain(DESCRIPTION)
  })
})

describe('children are the action', () => {
  it('renders the action last, after the description', () => {
    const out = markup(<EmptyState><button type="button">New project</button></EmptyState>)
    expect(out.indexOf(DESCRIPTION)).toBeLessThan(out.indexOf('<button'))
    expect(out).toMatch(/<button type="button">New project<\/button><\/div>$/)
  })

  it('does not count as a title, so both defaults stay', () => {
    const out = markup(<EmptyState><button type="button">New project</button></EmptyState>)
    expect(out).toContain(TITLE)
    expect(out).toContain(DESCRIPTION)
  })

  it('draws no button of its own when there are none', () => {
    expect(html()).not.toMatch(/<(button|a) /)
  })
})
