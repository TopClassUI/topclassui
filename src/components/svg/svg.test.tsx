import { describe, expect, it } from 'vitest'

import { ICON_SIZE } from '#shared/contracts/size.js'
import { attr, classList, markup } from '#test/markup.js'
import { Svg } from './index.js'

const icon = { path: 'M0 0h8v8H0z', viewBox: '0 0 256 256', directional: false }
const arrow = { ...icon, directional: true }

describe('the element it renders', () => {
  it('is one svg carrying the icon viewBox and a single currentColor path', () => {
    const html = markup(<Svg icon={icon} />)
    expect(html).toMatch(/^<svg /)
    expect(attr(html, 'viewBox')).toBe('0 0 256 256')
    expect([...html.matchAll(/<path /g)]).toHaveLength(1)
    expect(html).toContain('fill="currentColor"')
  })

  it('renders no path at all for an empty icon rather than an empty one', () => {
    expect(markup(<Svg icon={{ ...icon, path: '' }} />)).not.toContain('<path')
  })

  it('spreads the rest onto the root', () => {
    const html = markup(<Svg icon={icon} id="x" data-testid="t" />)
    expect(attr(html, 'id')).toBe('x')
    expect(attr(html, 'data-testid')).toBe('t')
  })
})

describe('size', () => {
  it('defaults to 1em, so an icon matches the text beside it', () => {
    const html = markup(<Svg icon={icon} />)
    expect(attr(html, 'width')).toBe('1em')
    expect(attr(html, 'height')).toBe('1em')
  })

  for (const [name, pixels] of Object.entries(ICON_SIZE)) {
    it(`${name} resolves to ${String(pixels)} pixels on both axes`, () => {
      const html = markup(<Svg icon={icon} size={name} />)
      expect(attr(html, 'width')).toBe(String(pixels))
      expect(attr(html, 'height')).toBe(String(pixels))
    })
  }

  it('passes any CSS length through untouched', () => {
    expect(attr(markup(<Svg icon={icon} size="2.5rem" />), 'width')).toBe('2.5rem')
  })
})

describe('the accessible name', () => {
  it('is hidden with no label, because a decorative icon has nothing to announce', () => {
    const html = markup(<Svg icon={icon} />)
    expect(attr(html, 'aria-hidden')).toBe('true')
    expect(html).not.toContain('role="img"')
  })

  it('becomes an image with a name when labelled', () => {
    const html = markup(<Svg icon={icon} label="Save" />)
    expect(attr(html, 'role')).toBe('img')
    expect(attr(html, 'aria-label')).toBe('Save')
    expect(html).not.toContain('aria-hidden')
  })

  it('treats an empty label as decorative, which would otherwise fail axe', () => {
    expect(attr(markup(<Svg icon={icon} label="" />), 'aria-hidden')).toBe('true')
  })

  it('is never focusable, which Internet-Explorer-era svg defaults got wrong', () => {
    expect(attr(markup(<Svg icon={icon} />), 'focusable')).toBe('false')
  })
})

describe('direction', () => {
  it('mirrors an icon the set marks directional', () => {
    expect(classList(markup(<Svg icon={arrow} />))).toContain('rtl:-scale-x-100')
  })

  it('leaves a non-directional icon alone', () => {
    expect(classList(markup(<Svg icon={icon} />))).not.toContain('rtl:-scale-x-100')
  })

  it('lets the caller override the set either way', () => {
    expect(classList(markup(<Svg icon={arrow} flipRtl={false} />))).not.toContain('rtl:-scale-x-100')
    expect(classList(markup(<Svg icon={icon} flipRtl />))).toContain('rtl:-scale-x-100')
  })
})

describe('className', () => {
  it('keeps the layout classes every icon needs', () => {
    const list = classList(markup(<Svg icon={icon} />))
    expect(list).toContain('inline-block')
    expect(list).toContain('shrink-0')
  })

  it('lets the consumer win a conflict, which proves cn() is used', () => {
    const list = classList(markup(<Svg icon={icon} className="hidden" />))
    expect(list).toContain('hidden')
    expect(list).not.toContain('inline-block')
  })
})
