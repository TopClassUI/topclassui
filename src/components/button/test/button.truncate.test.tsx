import { describe, expect, it } from 'vitest'

import { check } from '#icons/data/check.js'
import { Svg } from '#components/svg/index.js'
import { attr, classList, markup } from '#test/markup.js'
import { BUTTON_BOUNDARIES } from '../boundaries.js'
import { Button } from '../index.js'

const LONG = 'Save this document and continue to the next step of the wizard'

describe('a long label truncates instead of breaking the layout', () => {
  it('never lets the control outgrow its container', () => {
    expect(classList(markup(<Button>{LONG}</Button>))).toContain('max-w-full')
  })

  it('wraps the text in an element of its own, which is what makes the ellipsis work', () => {
    const html = markup(<Button>{LONG}</Button>)
    expect(html).toContain('<span dir="auto" class="truncate min-w-0">')
    expect(html).toContain(LONG)
  })

  it('leaves an element child alone, so an icon keeps its own width', () => {
    const html = markup(<Button><Svg icon={check} />{LONG}</Button>)
    // The icon is its own flex item; only the text is wrapped.
    expect(html.indexOf('<svg')).toBeLessThan(html.indexOf('<span dir="auto" class="truncate'))
    expect(html).not.toContain('<span dir="auto" class="truncate min-w-0"><svg')
  })

  it('wraps a number, which React renders as text too', () => {
    expect(markup(<Button>{42}</Button>)).toContain('<span dir="auto" class="truncate min-w-0">42</span>')
  })

  it('wraps nothing when there is no text, so an icon-only button gains no span', () => {
    expect(markup(<Button><Svg icon={check} /></Button>)).not.toContain('<span dir="auto" class="truncate')
  })

  it('still carries the label through a render element', () => {
    const html = markup(<Button render={<a href="/x" />}>{LONG}</Button>)
    expect(attr(html, 'href')).toBe('/x')
    expect(html).toContain('<span dir="auto" class="truncate min-w-0">')
  })

  it('keeps the spinner outside the truncating span while loading', () => {
    const html = markup(<Button loading>{LONG}</Button>)
    expect(html.indexOf('<svg')).toBeLessThan(html.indexOf('<span dir="auto" class="truncate'))
  })
})

describe('the label wrapper survives the shapes children really take', () => {
  const spans = (html: string) => (html.match(/<span dir="auto" class="truncate min-w-0">/g) ?? []).length

  it('does not add a span for a child that renders nothing', () => {
    expect(spans(markup(<Button>{false}Save</Button>))).toBe(1)
    expect(spans(markup(<Button>{null}Save</Button>))).toBe(1)
  })

  it('adds no span at all when there are no children', () => {
    expect(markup(<Button />)).not.toContain('<span')
  })

  it('leaves a fragment child alone, which is the one shape it cannot reach into', () => {
    /**
     * Documented rather than fixed: a caller who wraps a label in a fragment is asking
     * for their own element, and reaching into it would break an icon beside the text.
     */
    expect(spans(markup(<Button><>Save</></Button>))).toBe(0)
  })

  it('keeps an element and its text in separate flex items', () => {
    const html = markup(<Button><Svg icon={check} />Save</Button>)
    expect(html).not.toContain('<span dir="auto" class="truncate min-w-0"><svg')
    expect(spans(html)).toBe(1)
  })
})

describe('the label bound stops a megabyte reaching the DOM', () => {
  it('cuts a label at the boundary, not at the width', () => {
    const huge = 'x'.repeat(10_000)
    const html = markup(<Button>{huge}</Button>)
    expect(html).toContain('x'.repeat(BUTTON_BOUNDARIES.labelMaxLength))
    expect(html).not.toContain('x'.repeat(BUTTON_BOUNDARIES.labelMaxLength + 1))
  })

  it('leaves every real label untouched, which is what makes it a guard rail', () => {
    const real = 'Save this document and continue to the next step of the wizard'
    expect(real.length).toBeLessThan(BUTTON_BOUNDARIES.labelMaxLength)
    expect(markup(<Button>{real}</Button>)).toContain(real)
  })

  it('bounds the label as a whole, since adjacent text is one run', () => {
    const over = BUTTON_BOUNDARIES.labelMaxLength + 50
    const html = markup(<Button>{'a'.repeat(over)}{'b'.repeat(over)}</Button>)
    // Scoped to the label: the class attribute is full of b's and a's of its own.
    const label = /<span dir="auto" class="truncate min-w-0">([^<]*)<\/span>/.exec(html)?.[1] ?? ''
    expect(label).toBe('a'.repeat(BUTTON_BOUNDARIES.labelMaxLength))
  })

  it('is a number a real label never reaches, or it would cut one', () => {
    const longestReal = 'Save this document and continue to the next step of the wizard'
    expect(longestReal.length).toBeLessThan(BUTTON_BOUNDARIES.labelMaxLength)
    // And low enough to be a bound at all: a button is not a paragraph.
    expect(BUTTON_BOUNDARIES.labelMaxLength).toBeLessThanOrEqual(200)
  })
})

describe('an interpolated label is one span, not one per child', () => {
  const spans = (html: string) => (html.match(/<span dir="auto" class="truncate min-w-0">/g) ?? []).length

  it('joins a run of text, so the gap does not open inside the words', () => {
    const count = 5
    const html = markup(<Button>Save {count} items</Button>)
    expect(spans(html)).toBe(1)
    expect(html).toContain('>Save 5 items</span>')
  })

  it('starts a new run after an element, which is a real flex item', () => {
    const html = markup(<Button>Before<Svg icon={check} />After</Button>)
    expect(spans(html)).toBe(2)
    expect(html).toContain('>Before</span>')
    expect(html).toContain('>After</span>')
  })

  it('bounds the joined run, not each child, so the cap means the whole label', () => {
    const half = 'x'.repeat(BUTTON_BOUNDARIES.labelMaxLength)
    const html = markup(<Button>{half}{half}</Button>)
    expect(spans(html)).toBe(1)
    expect(html).not.toContain('x'.repeat(BUTTON_BOUNDARIES.labelMaxLength + 1))
  })
})
