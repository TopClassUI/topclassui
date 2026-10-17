import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem, BreadcrumbProps } from '../types.js'

const TRAIL: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { label: 'Breadcrumb' },
]

const html = (props: Partial<BreadcrumbProps> = {}) => markup(<Breadcrumb items={TRAIL} {...props} />)
const of = (items: BreadcrumbItem[]) => markup(<Breadcrumb items={items} />)

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

/** Every opening tag of this name, in document order. */
const tags = (out: string, tag: string) => out.match(new RegExp(`<${tag}(?=[ >])[^>]*>`, 'g')) ?? []

/** The markup of each list item, so a test can read one crumb without its neighbours. */
const crumbs = (out: string) => out.match(/<li[^>]*>.*?<\/li>/g) ?? []

describe('the element it renders', () => {
  it('is a nav named by the breadcrumb label, which is what makes it a landmark worth finding', () => {
    const root = tags(html(), 'nav')[0] ?? ''
    expect(html()).toMatch(/^<nav /)
    expect(html()).toMatch(/<\/nav>$/)
    expect(attr(root, 'aria-label')).toBe('Breadcrumb')
  })

  it('holds one ordered list directly inside the nav, with one item per crumb', () => {
    const out = html()
    expect(out).toMatch(/^<nav [^>]*><ol /)
    expect(count(out, '<li')).toBe(3)
  })

  // Preflight removes the list style, and Safari with VoiceOver then drops the list role.
  it('states role="list" on its one ol, so the list and its item count are still announced', () => {
    expect(tags(html(), 'ol')).toEqual(['<ol role="list" class="flex flex-wrap items-center gap-2">'])
  })

  it('keeps the crumbs in the order of the array', () => {
    const out = html()
    expect(out.indexOf('>Home<')).toBeGreaterThan(-1)
    expect(out.indexOf('>Home<')).toBeLessThan(out.indexOf('>Docs<'))
    expect(out.indexOf('>Docs<')).toBeLessThan(out.indexOf('>Breadcrumb<'))
  })

  it('renders nothing for an empty trail, so no landmark is announced that leads nowhere', () => {
    expect(of([])).toBe('')
  })

  it('carries no design or state attribute, because it has no design prop and no state', () => {
    expect(html()).not.toMatch(/data-(variant|tone|size|state|open|loading|disabled)/)
  })
})

describe('a crumb with an href', () => {
  it('is a real anchor with that href, so it is crawlable and works without JavaScript', () => {
    const anchors = tags(html(), 'a')
    expect(anchors).toHaveLength(2)
    expect(attr(anchors[0] ?? '', 'href')).toBe('/')
    expect(attr(anchors[1] ?? '', 'href')).toBe('/docs')
  })

  it('holds its label in a span of its own, the element the ellipsis needs', () => {
    const out = html()
    expect(out).toContain('<span dir="auto" class="truncate min-w-0">Home</span></a>')
    expect(out).toContain('<span dir="auto" class="truncate min-w-0">Docs</span></a>')
  })

  it('is never marked as the current page', () => {
    for (const anchor of tags(html(), 'a')) expect(anchor).not.toContain('aria-current')
  })

  it('stays a link when it is the last item, and then nothing is marked current', () => {
    const out = of([{ href: '/', label: 'Home' }, { href: '/shop', label: 'Shop' }])
    expect(tags(out, 'a')).toHaveLength(2)
    expect(attr(tags(out, 'a')[1] ?? '', 'href')).toBe('/shop')
    expect(out).not.toContain('aria-current')
  })

  it('keeps an empty href as a link, because the caller wrote one', () => {
    const out = of([{ href: '', label: 'Here' }])
    expect(tags(out, 'a')).toHaveLength(1)
    expect(attr(tags(out, 'a')[0] ?? '', 'href')).toBe('')
  })

  it('escapes the href as an attribute, so a quote cannot open another one', () => {
    const out = of([{ href: '/a"onmouseover="x', label: 'A' }, { label: 'B' }])
    expect(tags(out, 'a')).toHaveLength(1)
    expect(out).toContain('href="/a&quot;onmouseover=&quot;x"')
    expect(out).not.toContain(' onmouseover="x"')
  })
})

describe('the last crumb without an href', () => {
  it('is a span marked aria-current="page", and not a link', () => {
    const last = crumbs(html())[2] ?? ''
    expect(last).toMatch(/<span dir="auto" aria-current="page" class="[^"]*">Breadcrumb<\/span><\/li>$/)
    expect(last).not.toContain('<a')
    expect(last).not.toContain('href')
  })

  it('is the only element marked current in the whole trail', () => {
    expect(count(html(), 'aria-current')).toBe(1)
    expect(count(html(), 'aria-current="page"')).toBe(1)
  })

  it('is current even when it is the only crumb', () => {
    const out = of([{ label: 'Home' }])
    expect(out).toMatch(/<li[^>]*><span dir="auto" aria-current="page" class="[^"]*">Home<\/span><\/li>/)
  })
})

describe('a crumb without an href that is not the last', () => {
  const out = of([{ href: '/', label: 'Home' }, { label: 'Settings' }, { label: 'Profile' }])

  it('is plain text: a span with no href and no aria-current', () => {
    const middle = crumbs(out)[1] ?? ''
    expect(middle).toMatch(/<span dir="auto" class="[^"]*">Settings<\/span><\/li>$/)
    expect(middle).not.toContain('<a')
    expect(middle).not.toContain('aria-current')
  })

  it('leaves the current page on the last crumb alone', () => {
    expect(count(out, 'aria-current="page"')).toBe(1)
    expect(crumbs(out)[2] ?? '').toContain('<span dir="auto" aria-current="page"')
  })
})

describe('the separator', () => {
  it('sits between crumbs only: one fewer than the crumbs, and none before the first', () => {
    const out = html()
    expect(count(out, '<svg')).toBe(2)
    expect(crumbs(out)[0] ?? '').not.toContain('<svg')
    expect(crumbs(out)[1] ?? '').toMatch(/^<li[^>]*><svg /)
    expect(crumbs(out)[2] ?? '').toMatch(/^<li[^>]*><svg /)
  })

  it('is absent from a trail of one', () => {
    expect(of([{ label: 'Home' }])).not.toContain('<svg')
  })

  it('is the caret-right glyph at 1em, so it follows the text size', () => {
    const svg = tags(html(), 'svg')[0] ?? ''
    expect(attr(svg, 'width')).toBe('1em')
    expect(attr(svg, 'height')).toBe('1em')
    expect(html()).toContain('<path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128')
  })

  it('is hidden from the accessibility tree and has no name', () => {
    for (const svg of tags(html(), 'svg')) {
      expect(attr(svg, 'aria-hidden')).toBe('true')
      expect(svg).not.toContain('aria-label')
      expect(svg).not.toContain('role=')
    }
  })

  it('is flipped under dir="rtl", because a caret points along the trail', () => {
    for (const svg of tags(html(), 'svg')) {
      expect((attr(svg, 'class') ?? '').split(' ')).toContain('rtl:-scale-x-100')
    }
  })
})

describe('the label is text, never markup', () => {
  it('escapes a label in a link and in the current page', () => {
    const out = of([{ href: '/', label: '<b>Home</b>' }, { label: 'Tom & <i>Jerry</i>' }])
    expect(out).toContain('>&lt;b&gt;Home&lt;/b&gt;</span></a>')
    expect(out).toContain('>Tom &amp; &lt;i&gt;Jerry&lt;/i&gt;</span></li>')
    expect(out).not.toContain('<b>')
    expect(out).not.toContain('<i>')
  })
})

describe('the rest props reach the nav and nowhere else', () => {
  it('spreads id, data-* and aria-* onto the root, once each', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const out = markup(<Breadcrumb items={TRAIL} id="trail" data-testid="x" aria-describedby="d" />)
    const root = tags(out, 'nav')[0] ?? ''
    expect(attr(root, 'id')).toBe('trail')
    expect(attr(root, 'data-testid')).toBe('x')
    expect(attr(root, 'aria-describedby')).toBe('d')
    expect(count(out, 'id="trail"')).toBe(1)
    expect(count(out, 'data-testid="x"')).toBe(1)
  })

  it('passes style through to the root', () => {
    expect(attr(tags(html({ style: { opacity: 0.5 } }), 'nav')[0] ?? '', 'style')).toBe('opacity:0.5')
  })

  it('lets a caller rename the landmark, since a page with two trails needs two names', () => {
    const out = html({ 'aria-label': 'Category trail' })
    expect(attr(tags(out, 'nav')[0] ?? '', 'aria-label')).toBe('Category trail')
    expect(count(out, 'aria-label=')).toBe(1)
  })
})
