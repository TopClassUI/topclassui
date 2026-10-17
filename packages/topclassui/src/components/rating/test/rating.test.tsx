import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { ar } from '#shared/labels/ar.js'
import { Rating } from '../index.js'

/** How much of each star the HTML draws, from the width class of its clip: 1, 0.5 or 0. */
function fills(html: string): number[] {
  return [...html.matchAll(/<span class="relative inline-flex shrink-0 text-line-strong">(.*?)<\/svg>(<span aria-hidden="true" class="[^"]*\b(w-full|w-1\/2)\b)?/g)]
    .map((match) => (match[3] === 'w-full' ? 1 : match[3] === 'w-1/2' ? 0.5 : 0))
}

describe('a read-only Rating is one span on the server', () => {
  it('renders role img, named by its value out of its max, with no radio', () => {
    const html = markup(<Rating value={4} />)
    expect(html.startsWith('<span role="img" aria-label="4 out of 5" data-size="md"')).toBe(true)
    expect(html).not.toContain('<input')
    expect(fills(html)).toEqual([1, 1, 1, 1, 0])
  })

  it('defaults to 0 of 5, an empty row', () => {
    const html = markup(<Rating />)
    expect(attr(html, 'aria-label')).toBe('0 out of 5')
    expect(fills(html)).toEqual([0, 0, 0, 0, 0])
  })

  it('draws a half star for a half, and says it', () => {
    const html = markup(<Rating value={3.5} />)
    expect(fills(html)).toEqual([1, 1, 1, 0.5, 0])
    expect(attr(html, 'aria-label')).toBe('3.5 out of 5')
  })

  it('rounds to the nearest half, in the picture and in the name', () => {
    expect(fills(markup(<Rating value={3.7} />))).toEqual([1, 1, 1, 0.5, 0])
    expect(fills(markup(<Rating value={3.8} />))).toEqual([1, 1, 1, 1, 0])
    expect(attr(markup(<Rating value={3.2} />), 'aria-label')).toBe('3 out of 5')
  })

  it('clamps the value to 0 and max (R-5.7-7)', () => {
    expect(attr(markup(<Rating value={-2} />), 'aria-label')).toBe('0 out of 5')
    expect(attr(markup(<Rating value={9} />), 'aria-label')).toBe('5 out of 5')
    expect(attr(markup(<Rating value={Number.NaN} />), 'aria-label')).toBe('0 out of 5')
  })

  it('clamps max to 1-10 and rounds it to whole stars', () => {
    expect(fills(markup(<Rating value={2} max={0} />))).toEqual([1])
    expect(fills(markup(<Rating value={2} max={1000} />))).toHaveLength(10)
    expect(attr(markup(<Rating value={2} max={3.4} />), 'aria-label')).toBe('2 out of 3')
  })

  it('takes a caller name over its own, for "4.3 from 128 reviews"', () => {
    expect(attr(markup(<Rating value={4} aria-label="4.3 from 128 reviews" />), 'aria-label')).toBe('4.3 from 128 reviews')
  })

  it('says it in Arabic with the Arabic labels, in Latin digits as every server part formats them', () => {
    expect(attr(markup(<Rating value={4} labels={ar} locale="ar" />), 'aria-label')).toBe('4 من 5')
  })

  it('passes the rest to the span and merges className last', () => {
    const html = markup(<Rating value={1} id="r" data-testid="stars" className="gap-3" />)
    expect(attr(html, 'id')).toBe('r')
    expect(attr(html, 'data-testid')).toBe('stars')
    expect(attr(html, 'class')).toBe('inline-flex flex-wrap items-center max-w-full gap-3')
  })

  it('never lets a caller hand the span another role, or write readonly on it', () => {
    const html = markup(<Rating {...({ role: 'button', readOnly: true } as object)} />)
    expect(attr(html, 'role')).toBe('img')
    expect(html).not.toContain('readonly')
  })

  it('draws each star at the size the icon scale gives it, and custom at 1em', () => {
    expect(markup(<Rating size="xl" max={1} />)).toContain('width="40" height="40"')
    expect(markup(<Rating size="xs" max={1} />)).toContain('width="16" height="16"')
    expect(markup(<Rating size="custom" max={1} />)).toContain('width="1em" height="1em"')
  })

  it('a filled star is the outline plus one filled icon in a clip: two icons, no third', () => {
    const html = markup(<Rating value={0.5} max={1} />)
    expect(html.match(/<svg/g)).toHaveLength(2)
    expect(html).toContain('<span aria-hidden="true" class="absolute inset-y-0 inset-s-0 flex overflow-hidden text-warning-on-soft w-1/2">')
  })
})
