import { describe, expect, it } from 'vitest'

import { dotsThree } from '#icons/data/dots-three.js'
import { house } from '#icons/data/house.js'
import { markup } from '#test/markup.js'
import { Breadcrumb } from '../index.js'
import { collapseTrail } from '../lib.js'
import type { BreadcrumbItem, BreadcrumbProps } from '../types.js'

const FIVE: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { href: '/docs/components', label: 'Components' },
  { href: '/docs/components/button', label: 'Button' },
  { label: 'Props' },
]

const html = (props: Partial<BreadcrumbProps> = {}) => markup(<Breadcrumb items={FIVE} {...props} />)

/** The text each list item shows, or 'gap' for the folded crumbs. */
const shown = (out: string) => [...out.matchAll(/<li([^>]*)>(.*?)<\/li>/g)].map((match) =>
  (match[1]?.includes('aria-hidden') ? 'gap' : (match[2] ?? '').replace(/<[^>]*>/g, '')))

describe('collapseTrail', () => {
  it('keeps every crumb with no maxItems, and when the trail fits', () => {
    expect(collapseTrail(5, undefined)).toEqual([0, 1, 2, 3, 4])
    expect(collapseTrail(5, 5)).toEqual([0, 1, 2, 3, 4])
    expect(collapseTrail(5, 9)).toEqual([0, 1, 2, 3, 4])
  })

  it('keeps the first crumb and the last maxItems - 1, with one gap between', () => {
    expect(collapseTrail(5, 3)).toEqual([0, 'gap', 3, 4])
    expect(collapseTrail(5, 4)).toEqual([0, 'gap', 2, 3, 4])
  })

  it('clamps maxItems to 2..100, so 0, a negative or NaN still leaves the first and the last', () => {
    expect(collapseTrail(5, 0)).toEqual([0, 'gap', 4])
    expect(collapseTrail(5, -3)).toEqual([0, 'gap', 4])
    expect(collapseTrail(5, Number.NaN)).toEqual([0, 'gap', 4])
    expect(collapseTrail(150, 1000)).toHaveLength(101)
  })
})

describe('maxItems', () => {
  it('draws the first crumb, three dots and the last two at maxItems 3', () => {
    expect(shown(html({ maxItems: 3 }))).toEqual(['Home', 'gap', 'Button', 'Props'])
  })

  it('hides the gap from a screen reader and draws it as the dots icon after a caret', () => {
    const gap = /<li aria-hidden="true"[^>]*>(.*?)<\/li>/.exec(html({ maxItems: 3 }))?.[1] ?? ''
    expect(gap).toContain(`d="${dotsThree.path}"`)
    expect(gap.match(/<svg /g)).toHaveLength(2)
    expect(gap).not.toContain('<a ')
  })

  it('starts at the 100 rail: five crumbs stay whole, and a 150-crumb trail folds to the first and the last 99', () => {
    expect(shown(html())).toEqual(['Home', 'Docs', 'Components', 'Button', 'Props'])
    const long = Array.from({ length: 150 }, (_, index) => ({ href: `/${String(index)}`, label: `Crumb ${String(index)}` }))
    expect(shown(markup(<Breadcrumb items={long} />))).toHaveLength(101)
  })

  it('leaves the JSON-LD whole, every crumb in it', () => {
    const json = /<script type="application\/ld\+json">(.*?)<\/script>/.exec(html({ maxItems: 3, siteUrl: 'https://example.com' }))?.[1] ?? ''
    expect((JSON.parse(json) as { itemListElement: unknown[] }).itemListElement).toHaveLength(5)
  })
})

describe('showHome', () => {
  it('draws the first crumb as the house icon and keeps its label for a screen reader', () => {
    const first = /<li[^>]*>(.*?)<\/li>/.exec(html({ showHome: true }))?.[1] ?? ''
    expect(first).toContain(`d="${house.path}"`)
    expect(first).toContain('<span class="sr-only">Home</span>')
    expect(first).toMatch(/^<a href="\/"/)
  })

  it('touches no crumb but the first, and nothing without it', () => {
    expect(html({ showHome: true }).split(house.path)).toHaveLength(2)
    expect(html()).not.toContain(house.path)
    expect(html()).not.toContain('sr-only')
  })
})
