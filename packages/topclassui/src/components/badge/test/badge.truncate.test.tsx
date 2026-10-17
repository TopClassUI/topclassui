import { describe, expect, it } from 'vitest'

import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { attr, classList, markup } from '#test/markup.js'
import { BADGE_BOUNDARIES } from '../boundaries.js'
import { Badge } from '../index.js'

const LONG = 'Awaiting a second approval from the finance team before release'
const spans = (html: string) => (html.match(/<span dir="auto" class="truncate min-w-0">/g) ?? []).length

describe('a long label truncates instead of breaking the layout', () => {
  it('never lets the badge outgrow its container', () => {
    expect(classList(markup(<Badge>{LONG}</Badge>))).toContain('max-w-full')
  })

  it('wraps the text in an element of its own, which is what makes the ellipsis work', () => {
    const html = markup(<Badge>{LONG}</Badge>)
    expect(html).toContain('<span dir="auto" class="truncate min-w-0">')
    expect(html).toContain(LONG)
  })

  it('leaves an icon alone, in its own flex slot before the label', () => {
    const html = markup(<Badge><Svg icon={checkCircle} />{LONG}</Badge>)
    expect(html.indexOf('<svg')).toBeLessThan(html.indexOf('<span dir="auto" class="truncate'))
    expect(html).not.toContain('<span dir="auto" class="truncate min-w-0"><svg')
  })

  it('keeps an icon at 1em, so it follows the type step of every size', () => {
    const html = markup(<Badge size="xl"><Svg icon={checkCircle} />Paid</Badge>)
    const icon = /<svg[^>]*>/.exec(html)?.[0] ?? ''
    expect(attr(icon, 'width')).toBe('1em')
    expect(attr(icon, 'height')).toBe('1em')
    // The attributes lose to any CSS, so the badge must aim no class at its children.
    expect(classList(html).filter((c) => /^(\*|\[&)|svg/.test(c))).toEqual([])
  })

  it('wraps a number, which React renders as text too', () => {
    expect(markup(<Badge>{42}</Badge>)).toContain('<span dir="auto" class="truncate min-w-0">42</span>')
  })

  it('wraps nothing when there is no text, so an icon-only badge gains no span', () => {
    expect(markup(<Badge><Svg icon={checkCircle} /></Badge>)).not.toContain('<span dir="auto" class="truncate')
  })

  it('adds no span at all when there are no children', () => {
    expect(spans(markup(<Badge />))).toBe(0)
  })

  it('does not add a span for a child that renders nothing', () => {
    expect(spans(markup(<Badge>{false}Paid</Badge>))).toBe(1)
    expect(spans(markup(<Badge>{null}Paid</Badge>))).toBe(1)
  })
})

describe('an interpolated label is one span, not one per child', () => {
  it('joins a run of text, so the gap does not open inside the words', () => {
    const count = 3
    const html = markup(<Badge>{count} new</Badge>)
    expect(spans(html)).toBe(1)
    expect(html).toContain('>3 new</span>')
  })

  it('starts a new run after an element, which is a real flex item', () => {
    const html = markup(<Badge>Before<Svg icon={checkCircle} />After</Badge>)
    expect(spans(html)).toBe(2)
    expect(html).toContain('>Before</span>')
    expect(html).toContain('>After</span>')
  })
})

describe('the label bound stops a megabyte reaching the DOM', () => {
  it('is 100 characters, far above any real badge and far below a pasted file', () => {
    expect(BADGE_BOUNDARIES.labelMaxLength).toBe(100)
  })

  it('cuts a label at the bound, not at the width', () => {
    const html = markup(<Badge>{'x'.repeat(10_000)}</Badge>)
    expect(html).toContain('x'.repeat(100))
    expect(html).not.toContain('x'.repeat(101))
  })

  it('leaves every real label untouched, which is what makes it a guard rail', () => {
    expect(LONG.length).toBeLessThan(100)
    expect(markup(<Badge>{LONG}</Badge>)).toContain(LONG)
  })

  it('bounds the joined run, not each child, so the cap means the whole label', () => {
    const html = markup(<Badge>{'a'.repeat(80)}{'b'.repeat(80)}</Badge>)
    const label = /<span dir="auto" class="truncate min-w-0">([^<]*)<\/span>/.exec(html)?.[1] ?? ''
    expect(label).toBe(`${'a'.repeat(80)}${'b'.repeat(20)}`)
  })
})
