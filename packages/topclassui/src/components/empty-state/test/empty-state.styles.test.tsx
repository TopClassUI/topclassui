import { describe, expect, it } from 'vitest'

import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { Svg } from '#components/svg/index.js'
import { attr, classList, markup } from '#test/markup.js'
import { EmptyState } from '../index.js'
import type { EmptyStateProps } from '../types.js'

const html = (props: EmptyStateProps = {}) => markup(<EmptyState {...props} />)
const rootClasses = (props: EmptyStateProps = {}) => classList(html(props))

/** The sorted class list of the first element with this tag; the lookahead skips <path>. */
const classesOf = (out: string, tag: string) =>
  [...(attr(new RegExp(`<${tag}(?=[ >])[^>]*>`).exec(out)?.[0] ?? '', 'class') ?? '').split(/\s+/).filter(Boolean)].sort()

/** The Build this block, written out: a derived expectation would shrink with ROOT. */
const ROOT = [
  'bg-surface', 'border-(length:--tc-line-width)', 'border-dashed', 'border-line-strong', 'flex', 'flex-col',
  'gap-2.5', 'items-center', 'p-7', 'rounded-box', 'text-center', 'wrap-anywhere',
]

describe('every part carries exactly its own classes', () => {
  it('the root is the dashed decorative frame and nothing else', () => {
    expect([...rootClasses()].sort()).toEqual(ROOT)
  })

  it('the title is a paragraph at the base step, semibold, in the body colour', () => {
    expect(classesOf(html(), 'p')).toEqual(['font-semibold', 'text-base', 'text-body'])
  })

  it('the description is a div at the small step in the muted colour', () => {
    const out = html()
    const description = /<div class="([^"]*)">When there/.exec(out)?.[1] ?? ''
    expect(description.split(' ').sort()).toEqual(['text-muted', 'text-sm'])
  })

  it('the default icon is Svg\'s own two classes plus the muted colour', () => {
    expect(classesOf(html(), 'svg')).toEqual(['inline-block', 'shrink-0', 'text-muted'])
  })

  it('keeps the same classes on each part when the caller passes every text', () => {
    const out = html({ title: 'No projects yet', description: 'Create one.' })
    expect([...classList(out)].sort()).toEqual(ROOT)
    expect(classesOf(out, 'p')).toEqual(['font-semibold', 'text-base', 'text-body'])
    expect(/<div class="([^"]*)">Create one/.exec(out)?.[1]).toBe('text-sm text-muted')
  })
})

describe('the default icon', () => {
  it('is the tray at the xl step, 40 px, which the parent asks for rather than Svg\'s 1em', () => {
    const svg = /<svg[^>]*>/.exec(html())?.[0] ?? ''
    expect(attr(svg, 'width')).toBe('40')
    expect(attr(svg, 'height')).toBe('40')
    expect(attr(svg, 'viewBox')).toBe('0 0 256 256')
    expect(html()).toContain('<path d="M208,32H48A16,16,0,0,0,32,48V208')
  })

  it('leaves a caller icon at its own size, because the root aims no class at its children', () => {
    const descendant = /^(\*|\*\*|\[&)|svg|\[&_/
    expect(rootClasses().filter((c) => descendant.test(c))).toEqual([])
    const out = html({ icon: <Svg icon={magnifyingGlass} /> })
    expect(attr(/<svg[^>]*>/.exec(out)?.[0] ?? '', 'width')).toBe('1em')
    expect(classList(out).filter((c) => descendant.test(c))).toEqual([])
  })
})

describe('the frame', () => {
  it('is not interactive, so it carries no ring, hover, transition or touch target', () => {
    const interactive = /^(hover:|active:|focus-visible:|focus:|outline-|transition|duration-|min-[hw]-|disabled:|data-disabled:|cursor-)/
    expect(rootClasses().filter((c) => interactive.test(c))).toEqual([])
  })

  it('draws its dash in the strong line, as the previewer does, not the faint decorative one', () => {
    expect(rootClasses()).toContain('border-line-strong')
    expect(rootClasses()).not.toContain('border-line')
  })

  it('names no palette colour on any part', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    const all = [...html().matchAll(/class="([^"]*)"/g)].flatMap((m) => (m[1] ?? '').split(' '))
    expect(all.length).toBeGreaterThan(12)
    expect(all.filter((c) => palette.test(c))).toEqual([])
  })
})

describe('className is passed last, so the consumer wins every conflict', () => {
  /** Each pair is the consumer class and the root class it must replace. */
  const CONFLICTS = [
    ['rounded-control', 'rounded-box'],
    ['p-4', 'p-7'],
    ['gap-6', 'gap-2.5'],
    ['bg-page', 'bg-surface'],
    ['border-solid', 'border-dashed'],
    ['border-line', 'border-line-strong'],
    ['items-start', 'items-center'],
    ['text-start', 'text-center'],
    ['wrap-normal', 'wrap-anywhere'],
  ] as const

  for (const [mine, theirs] of CONFLICTS) {
    it(`${mine} replaces ${theirs}`, () => {
      const list = rootClasses({ className: mine })
      expect(list).toContain(mine)
      expect(list).not.toContain(theirs)
    })
  }

  it('keeps a utility that conflicts with nothing', () => {
    expect(rootClasses({ className: 'mt-4' })).toContain('mt-4')
  })

  it('reaches only the root, never the icon, the title or the description', () => {
    const out = html({ className: 'text-lg' })
    expect(classList(out)).toContain('text-lg')
    expect(classesOf(out, 'svg')).toEqual(['inline-block', 'shrink-0', 'text-muted'])
    expect(classesOf(out, 'p')).toEqual(['font-semibold', 'text-base', 'text-body'])
    expect(/<div class="([^"]*)">When there/.exec(out)?.[1]).toBe('text-sm text-muted')
  })
})
