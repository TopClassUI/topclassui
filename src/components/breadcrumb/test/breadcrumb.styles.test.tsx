import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem, BreadcrumbProps } from '../types.js'

const TRAIL: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { label: 'Settings' },
  { label: 'Profile' },
]

const html = (props: Partial<BreadcrumbProps> = {}) => markup(<Breadcrumb items={TRAIL} {...props} />)

/** The sorted class list of the nth element with this tag; the lookahead keeps `a` off `aria`. */
const classesOf = (out: string, tag: string, nth = 0) => {
  const found = out.match(new RegExp(`<${tag}(?=[ >])[^>]*>`, 'g')) ?? []
  return (attr(found[nth] ?? '', 'class') ?? '').split(/\s+/).filter(Boolean).sort()
}

const sorted = (list: readonly string[]) => [...list].sort()

/** The Build this block, written out: a derived expectation would shrink with the source. */
const LINK = [
  'inline-flex', 'items-center', 'justify-center', 'rounded-chip', 'text-muted', 'underline-offset-4',
  'max-w-full',
  'hover:underline',
  'outline-hidden',
  'focus-visible:outline-solid',
  'focus-visible:outline-(length:--tc-ring-width)',
  'focus-visible:outline-offset-(length:--tc-ring-offset)',
  'focus-visible:outline-ring',
  'min-h-[var(--tc-target-min,24px)]',
  'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

describe('every part carries exactly its own classes', () => {
  it('the nav sets the 14 px type step and nothing else', () => {
    expect(classesOf(html(), 'nav')).toEqual(['text-sm'])
  })

  it('the list is a wrapping row with the 8 px gap', () => {
    expect(classesOf(html(), 'ol')).toEqual(['flex', 'flex-wrap', 'gap-2', 'items-center'])
  })

  it('each item is a row of its own that may shrink, with the same 8 px before its crumb', () => {
    const expected = ['flex', 'gap-2', 'items-center', 'max-w-full', 'min-w-0']
    expect(classesOf(html(), 'li', 0)).toEqual(expected)
    expect(classesOf(html(), 'li', 1)).toEqual(expected)
    expect(classesOf(html(), 'li', 2)).toEqual(expected)
  })

  it('the link is muted text with the ring, the touch target and the containment', () => {
    expect(classesOf(html(), 'a')).toEqual(sorted(LINK))
  })

  it('the label inside the link is the truncating element', () => {
    expect(html()).toContain('<a href="/" class="')
    expect(html()).toContain('"><span class="truncate min-w-0">Home</span></a>')
  })

  it('a crumb with no href in the middle is muted text', () => {
    expect(html()).toContain('<span class="truncate min-w-0 text-muted">Settings</span>')
  })

  it('the current page is in the body colour, and it truncates itself', () => {
    expect(html()).toContain('<span aria-current="page" class="truncate min-w-0 text-body">Profile</span>')
  })

  it('the separator is Svg\'s own classes, the rtl flip and the muted colour', () => {
    const expected = ['inline-block', 'rtl:-scale-x-100', 'shrink-0', 'text-muted']
    expect(classesOf(html(), 'svg', 0)).toEqual(expected)
    expect(classesOf(html(), 'svg', 1)).toEqual(expected)
  })
})

describe('the link is interactive, so it carries what R-5.6 asks of every control', () => {
  const link = () => classesOf(html(), 'a')

  it('has the whole focus ring, including the solid style without which it paints nothing', () => {
    expect(link()).toContain('outline-hidden')
    expect(link()).toContain('focus-visible:outline-solid')
    expect(link()).toContain('focus-visible:outline-(length:--tc-ring-width)')
    expect(link()).toContain('focus-visible:outline-offset-(length:--tc-ring-offset)')
    expect(link()).toContain('focus-visible:outline-ring')
  })

  it('has the 24 px floor on both axes and the 44 px floor under a coarse pointer', () => {
    expect(link()).toContain('min-h-[var(--tc-target-min,24px)]')
    expect(link()).toContain('min-w-[var(--tc-target-min,24px)]')
    expect(link()).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
    expect(link()).toContain('pointer-coarse:min-w-[var(--tc-target-coarse,44px)]')
  })

  it('centres its text in that box, so a short crumb does not sit against one edge', () => {
    expect(link()).toContain('inline-flex')
    expect(link()).toContain('items-center')
    expect(link()).toContain('justify-center')
  })

  it('underlines on hover through the shared link hover, with no hand-written colour change', () => {
    expect(link().filter((c) => c.startsWith('hover:'))).toEqual(['hover:underline'])
    expect(link().filter((c) => c.startsWith('active:'))).toEqual([])
  })
})

describe('what is not interactive stays plain', () => {
  const interactive = /^(hover:|active:|focus-visible:|focus:|outline-|transition|duration-|min-h-|pointer-coarse:|cursor-)/

  it('the nav, the list, the items and the separators carry no ring, hover or target', () => {
    const out = html()
    const plain = ['nav', 'ol', 'li', 'svg'].flatMap((tag) => classesOf(out, tag))
    expect(plain.length).toBeGreaterThan(8)
    expect(plain.filter((c) => interactive.test(c))).toEqual([])
  })

  it('the current page and a crumb with no href are not focusable and have no ring', () => {
    const out = html()
    const spans = [...out.matchAll(/<span(?: aria-current="page")? class="([^"]*)">(?:Settings|Profile)</g)]
    expect(spans).toHaveLength(2)
    for (const span of spans) {
      expect((span[1] ?? '').split(' ').filter((c) => interactive.test(c))).toEqual([])
    }
    expect(out).not.toContain('tabindex')
  })
})

describe('colours', () => {
  it('names no palette colour on any part', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    const all = [...html().matchAll(/class="([^"]*)"/g)].flatMap((m) => (m[1] ?? '').split(' '))
    expect(all.length).toBeGreaterThan(30)
    expect(all.filter((c) => palette.test(c))).toEqual([])
  })

  it('uses no physical direction, so the trail mirrors by itself', () => {
    const all = [...html().matchAll(/class="([^"]*)"/g)].flatMap((m) => (m[1] ?? '').split(' '))
    const physical = /^(?:(?:pl|pr|ml|mr|left|right|space-x|divide-x)-|text-(?:left|right)$)/
    expect(all.length).toBeGreaterThan(30)
    expect(all.filter((c) => physical.test(c))).toEqual([])
  })
})

describe('className is passed last, so the consumer wins every conflict', () => {
  it('replaces the type step', () => {
    expect(classesOf(html({ className: 'text-base' }), 'nav')).toEqual(['text-base'])
  })

  it('keeps a utility that conflicts with nothing', () => {
    expect(classesOf(html({ className: 'mt-4' }), 'nav')).toEqual(['mt-4', 'text-sm'])
  })

  it('adds a colour beside the type step, since they are different properties', () => {
    expect(classesOf(html({ className: 'text-body' }), 'nav')).toEqual(['text-body', 'text-sm'])
  })

  it('reaches only the nav, never the list, a link or a separator', () => {
    const out = html({ className: 'mt-4' })
    expect(classesOf(out, 'ol')).toEqual(['flex', 'flex-wrap', 'gap-2', 'items-center'])
    expect(classesOf(out, 'a')).toEqual(sorted(LINK))
    expect(classesOf(out, 'svg')).toEqual(['inline-block', 'rtl:-scale-x-100', 'shrink-0', 'text-muted'])
  })
})
