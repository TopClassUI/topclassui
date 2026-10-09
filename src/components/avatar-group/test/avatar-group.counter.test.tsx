import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { attr, markup } from '#test/markup.js'
import { AvatarGroup } from '../index.js'
import type { AvatarGroupProps } from '../types.js'

/** So many plain members: the counter is then the only img the markup holds. */
const group = (count: number, props: AvatarGroupProps = {}) => markup(
  <AvatarGroup {...props}>
    {Array.from({ length: count }, (_, i) => <span key={i}>m</span>)}
  </AvatarGroup>,
)

const shown = (html: string) => html.split('<span>m</span>').length - 1
/** The opening tag of the counter, which carries its role, its name and its size. */
const counter = (html: string) => /<span [^>]*role="img"[^>]*>/.exec(html)?.[0] ?? ''
const name = (html: string) => attr(counter(html), 'aria-label')
/** What the counter shows: the text of the one element inside it. */
const text = (html: string) => /role="img"[^>]*><span[^>]*>([^<]*)<\/span><\/span><\/span>$/.exec(html)?.[1]

describe('the counter appears only when children remain', () => {
  it('is absent for two under the default max of four', () => {
    const html = group(2)
    expect(shown(html)).toBe(2)
    expect(html).not.toContain('role="img"')
    expect(html).not.toContain('+')
  })

  it('is absent for exactly four, so a full row never ends in +0', () => {
    const html = group(4)
    expect(shown(html)).toBe(4)
    expect(html).not.toContain('role="img"')
    expect(html).not.toContain('+')
  })

  it('counts one for five, shown as +1 after the first four', () => {
    const html = group(5)
    expect(shown(html)).toBe(4)
    expect(text(html)).toBe('+1')
  })

  it('shows four of thirteen and then +9, the overflow state the site draws', () => {
    const html = group(13)
    expect(shown(html)).toBe(4)
    expect(text(html)).toBe('+9')
  })

  it('counts children against max, so three under max 2 show two and +1', () => {
    const html = group(3, { max: 2 })
    expect(shown(html)).toBe(2)
    expect(text(html)).toBe('+1')
  })

  it('comes last, after every child that shows', () => {
    expect(group(3, { max: 2 })).toMatch(/^<span role="group"[^>]*><span>m<\/span><span>m<\/span><span [^>]*role="img"/)
  })

  it('renders exactly one counter', () => {
    expect(group(30).split('role="img"')).toHaveLength(2)
  })
})

describe('max is clamped before any child is hidden (R-5.7-7)', () => {
  /** max given, how many of thirty show, and what the counter says: written out. */
  const CASES = [
    [1, 1, '+29'],
    [4, 4, '+26'],
    [20, 20, '+10'],
    [0, 1, '+29'],
    [-5, 1, '+29'],
    [21, 20, '+10'],
    [500, 20, '+10'],
    [2.5, 2, '+28'],
    [Number.POSITIVE_INFINITY, 20, '+10'],
    [Number.NaN, 1, '+29'],
  ] as const

  for (const [max, visible, label] of CASES) {
    it(`max ${String(max)} shows ${String(visible)} of thirty, then ${label}`, () => {
      const html = group(30, { max })
      expect(shown(html), String(max)).toBe(visible)
      expect(text(html), String(max)).toBe(label)
    })
  }

  it('falls back to four for an explicit undefined', () => {
    expect(shown(group(30, { max: undefined }))).toBe(4)
  })

  it('shows all twenty and no counter when max is past the bound and the list is not', () => {
    const html = group(20, { max: 500 })
    expect(shown(html)).toBe(20)
    expect(html).not.toContain('role="img"')
  })
})

describe('the accessible name of the counter', () => {
  it('is an img named by labels.avatar.more, so +9 is read as "9 more"', () => {
    const html = group(13)
    expect(attr(counter(html), 'role')).toBe('img')
    expect(name(html)).toBe('9 more')
  })

  it('reads "1 more" for one', () => {
    expect(name(group(5))).toBe('1 more')
  })

  it('comes from the labels prop, so Arabic names it in Arabic and picks the plural form', () => {
    expect(name(group(5, { labels: ar }))).toBe('واحد آخر')
    expect(name(group(6, { labels: ar }))).toBe('اثنان آخران')
    expect(name(group(13, { labels: ar }))).toBe('9 آخرون')
  })

  it('follows a caller who changes the one string', () => {
    const labels = { ...en, avatar: { more: (n: number) => `and ${String(n)} others` } }
    expect(name(group(13, { labels }))).toBe('and 9 others')
  })

  it('keeps the visible text a plain +N whatever the labels say', () => {
    expect(text(group(13, { labels: ar }))).toBe('+9')
  })

  it('reads labels and never forwards the object onto an element', () => {
    expect(group(13, { labels: ar })).not.toContain('labels=')
  })
})

describe('locale formats the count', () => {
  it('groups a large count the English way by default', () => {
    const html = group(1004)
    expect(text(html)).toBe('+1,000')
    expect(name(html)).toBe('1,000 more')
  })

  it('groups it the German way for locale="de", in the text and in the name', () => {
    const html = group(1004, { locale: 'de' })
    expect(text(html)).toBe('+1.000')
    expect(name(html)).toBe('1.000 more')
  })

  it('keeps Latin digits for Arabic, which createNumberFormat asks for', () => {
    expect(text(group(13, { locale: 'ar', labels: ar }))).toBe('+9')
  })

  it('falls back to English for a tag Intl refuses, instead of taking the tree down', () => {
    expect(text(group(1004, { locale: 'not a locale' }))).toBe('+1,000')
  })
})

describe('the plus stays in front of its digits', () => {
  it('sets dir="ltr" on the text, because an rtl paragraph would paint +9 as 9+', () => {
    expect(group(13)).toMatch(/role="img"[^>]*><span [^>]*dir="ltr"[^>]*>\+9<\/span>/)
  })
})
