import { describe, expect, it } from 'vitest'

import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { attr, classList, markup } from '#test/markup.js'
import { TAG_BOUNDARIES } from '../boundaries.js'
import { Tag } from '../index.js'

const LONG = 'Infrastructure, platform reliability and developer experience working group'
const spans = (html: string) => (html.match(/<span class="truncate min-w-0">/g) ?? []).length

describe('a long label truncates instead of breaking the layout', () => {
  it('never lets the tag outgrow its container', () => {
    expect(classList(markup(<Tag>{LONG}</Tag>))).toContain('max-w-full')
  })

  it('wraps the text in an element of its own, which is what makes the ellipsis work', () => {
    const html = markup(<Tag>{LONG}</Tag>)
    expect(html).toContain('<span class="truncate min-w-0">')
    expect(html).toContain(LONG)
  })

  it('leaves an icon alone, in its own flex slot before the label', () => {
    const html = markup(<Tag><Svg icon={checkCircle} />{LONG}</Tag>)
    expect(html.indexOf('<svg')).toBeLessThan(html.indexOf('<span class="truncate'))
    expect(html).not.toContain('<span class="truncate min-w-0"><svg')
  })

  it('keeps an icon at 1em, so it follows the type step of every size', () => {
    const html = markup(<Tag size="xl"><Svg icon={checkCircle} />React</Tag>)
    const icon = /<svg[^>]*>/.exec(html)?.[0] ?? ''
    expect(attr(icon, 'width')).toBe('1em')
    expect(attr(icon, 'height')).toBe('1em')
    // The attributes lose to any CSS, so the tag must aim no class at its children.
    expect(classList(html).filter((c) => /^(\*|\[&)|svg/.test(c))).toEqual([])
  })

  it('wraps a number, which React renders as text too', () => {
    expect(markup(<Tag>{42}</Tag>)).toContain('<span class="truncate min-w-0">42</span>')
  })

  it('wraps nothing when there is no text, so an icon-only tag gains no span', () => {
    expect(markup(<Tag><Svg icon={checkCircle} /></Tag>)).not.toContain('<span class="truncate')
  })

  it('adds no span at all when there are no children', () => {
    expect(spans(markup(<Tag />))).toBe(0)
  })

  it('does not add a span for a child that renders nothing', () => {
    expect(spans(markup(<Tag>{false}React</Tag>))).toBe(1)
    expect(spans(markup(<Tag>{null}React</Tag>))).toBe(1)
  })
})

describe('an interpolated label is one span, not one per child', () => {
  it('joins a run of text, so the gap does not open inside the words', () => {
    const count = 3
    const html = markup(<Tag>{count} topics</Tag>)
    expect(spans(html)).toBe(1)
    expect(html).toContain('>3 topics</span>')
  })

  it('starts a new run after an element, which is a real flex item', () => {
    const html = markup(<Tag>Before<Svg icon={checkCircle} />After</Tag>)
    expect(spans(html)).toBe(2)
    expect(html).toContain('>Before</span>')
    expect(html).toContain('>After</span>')
  })
})

describe('the label bound stops a megabyte reaching the DOM', () => {
  it('is 100 characters, far above any real tag and far below a pasted file', () => {
    expect(TAG_BOUNDARIES).toEqual({ labelMaxLength: 100 })
  })

  it('cuts a label at the bound, not at the width', () => {
    const html = markup(<Tag>{'x'.repeat(10_000)}</Tag>)
    expect(html).toContain('x'.repeat(100))
    expect(html).not.toContain('x'.repeat(101))
  })

  it('leaves every real label untouched, which is what makes it a guard rail', () => {
    expect(LONG.length).toBeLessThan(100)
    expect(markup(<Tag>{LONG}</Tag>)).toContain(LONG)
  })

  it('bounds the joined run, not each child, so the cap means the whole label', () => {
    const html = markup(<Tag>{'a'.repeat(80)}{'b'.repeat(80)}</Tag>)
    const label = /<span class="truncate min-w-0">([^<]*)<\/span>/.exec(html)?.[1] ?? ''
    expect(label).toBe(`${'a'.repeat(80)}${'b'.repeat(20)}`)
  })
})
