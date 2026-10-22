/** A class list cannot show that a class compiles or which rule wins, so this compiles
 * the real entry and reads what the browser would get. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { compileEntry, declarationIndex } from '#test/stylesheet.js'
import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** Every size on a first page, so an edge span, a link, the current page and a gap all render. */
const HTML = (['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const)
  .map((size) => markup(createElement(Pagination, { size, value: 1, pageCount: 12, getHref: blog })))
  .join('')

const RENDERED = [...new Set([...HTML.matchAll(/class="([^"]*)"/g)].flatMap((m) => (m[1] ?? '').split(' ')))]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(RENDERED)
})

/** Tailwind's selector for a class: every character outside a plain name is escaped. */
const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

/** The declarations of the first rule for a selector, without the braces. */
const ruleOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim()
}

describe('every class the component renders paints something', () => {
  it('rendered the classes at all, so an empty list cannot pass', () => {
    expect(RENDERED.length).toBeGreaterThan(35)
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

/** The control steps of styles.css, written out. Figma 138:1269 draws a cell as wide as a step and
 * shorter than it: 32 x 18 at sm, which the 24 px floor raises to 32 x 24. */
const STEP = { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem', xl: '3.5rem' } as const
const HEIGHT = { md: 'xs', lg: 'sm', xl: 'md' } as const
const WIDTH = { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' } as const

describe('a cell is wider than it is tall, and a long number can widen it', () => {
  for (const [size, step] of Object.entries(HEIGHT)) {
    it(`${size} is ${STEP[step]} tall, a step or two under its width, scaled by the density knob`, () => {
      expect(ruleOf(`.h-control-${step}`), size).toBe(`height: calc(${STEP[step]} * var(--tc-density));`)
    })
  }

  for (const [size, step] of Object.entries(WIDTH)) {
    it(`${size} is at least ${STEP[step]} wide, a minimum and not a width, so a long number widens it`, () => {
      expect(ruleOf(selectorOf(`min-w-control-${step}`)), size).toBe(`min-width: calc(${STEP[step]} * var(--tc-density));`)
    })
  }

  it('sets no fixed width and no ratio, which would cut a long number', () => {
    expect(css).not.toMatch(/\.(w|size)-control-/)
    expect(css).not.toContain('.aspect-square')
  })

  it('keeps a number off its edges with the inline padding of the control knobs', () => {
    expect(ruleOf('.px-pad-x-xs')).toBe('padding-inline: calc(0.5rem * var(--tc-density));')
    expect(ruleOf('.px-pad-x-sm')).toBe('padding-inline: calc(0.75rem * var(--tc-density));')
  })

  it('gives every digit one width, so Next does not move from page 111 to 112', () => {
    expect(ruleOf('.tabular-nums')).toContain('--tw-numeric-spacing: tabular-nums;')
  })
})

describe('the floors and the dimming reach the browser', () => {
  it('holds 24 px on the height with a px fallback, which xs and sm take as their height', () => {
    expect(ruleOf(selectorOf('min-h-[var(--tc-target-min,24px)]'))).toBe('min-height: var(--tc-target-min,24px);')
  })

  it('raises it to 44 px under a coarse pointer', () => {
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'))
    expect(coarse).toContain('min-height: var(--tc-target-coarse,44px);')
  })

  it('still holds both px floors on the width for xs and custom, which set no width of their own', () => {
    expect(ruleOf(selectorOf('min-w-[var(--tc-target-min,24px)]'))).toBe('min-width: var(--tc-target-min,24px);')
    expect(css).toContain('min-width: var(--tc-target-coarse,44px);')
  })

  it('dims an edge span by the attribute, since a span has no disabled state', () => {
    expect(css).toContain(`${selectorOf('data-disabled:opacity-50')}[data-disabled]`)
    expect(css).toContain(`${selectorOf('data-disabled:pointer-events-none')}[data-disabled]`)
  })
})

describe('hover and pressed win over the resting fill', () => {
  const at = (selector: string) => declarationIndex(css, selector, 'background-color')

  it('puts the hover fill of the current page after bg-primary-solid, so it is the one painted', () => {
    const rest = at('.bg-primary-solid')
    const hover = at(`${selectorOf('hover:bg-(--tc-hover)')}:hover`)
    const pressed = at(`${selectorOf('active:bg-(--tc-active)')}:active`)
    expect(rest, 'bg-primary-solid is not emitted').toBeGreaterThan(-1)
    expect(hover, 'the hover fill is not emitted after the resting one').toBeGreaterThan(rest)
    expect(pressed, 'the pressed fill is not emitted after the hover one').toBeGreaterThan(hover)
  })

  it('puts the pressed tint of the other links after their hover tint', () => {
    const hover = at(`${selectorOf('hover:bg-(--tc-soft)')}:hover`)
    const pressed = at(`${selectorOf('active:bg-(--tc-soft-hover)')}:active`)
    expect(hover, 'the hover tint is not emitted').toBeGreaterThan(-1)
    expect(pressed, 'the pressed tint is not emitted after the hover one').toBeGreaterThan(hover)
  })

  it('reads the tint from the tone on the cell: neutral for a link, primary for the current page', () => {
    expect(ruleOf('.tone-neutral')).toContain('--tc-soft: var(--tc-neutral-soft);')
    expect(ruleOf('.tone-primary')).toContain('--tc-hover: var(--tc-primary-hover);')
  })
})

describe('the current page under forced colours', () => {
  /** From the forced-colours query on. With no query this is one character, and every line below fails. */
  const forced = () => css.slice(css.indexOf('@media (forced-colors: active)'))

  it('paints the system pair and opts out of the adjustment that would repaint it', () => {
    expect(forced()).toContain(`${selectorOf('forced-colors:bg-[Highlight]')} {\n      background-color: Highlight;`)
    expect(forced()).toContain(`${selectorOf('forced-colors:text-[HighlightText]')} {\n      color: HighlightText;`)
    expect(forced()).toContain(`${selectorOf('forced-colors:forced-color-adjust-none')} {\n      forced-color-adjust: none;`)
  })

  it('points the ring at the same system colour, since nothing forces it on this cell', () => {
    expect(forced()).toContain(`${selectorOf('forced-colors:[--tc-ring:Highlight]')} {\n      --tc-ring: Highlight;`)
  })

  it('puts the forced fill after the hover and pressed fills, so it is the one painted under a pointer', () => {
    const hover = css.indexOf(`${selectorOf('hover:bg-(--tc-hover)')}:hover`)
    const pressed = css.indexOf(`${selectorOf('active:bg-(--tc-active)')}:active`)
    const forcedHover = css.indexOf(`${selectorOf('forced-colors:hover:bg-[Highlight]')}:hover {\n        background-color: Highlight;`)
    const forcedPressed = css.indexOf(`${selectorOf('forced-colors:active:bg-[Highlight]')}:active {\n      background-color: Highlight;`)
    expect(hover, 'the hover fill is not emitted').toBeGreaterThan(-1)
    expect(pressed, 'the pressed fill is not emitted after the hover one').toBeGreaterThan(hover)
    expect(forcedHover, 'the forced hover fill is not emitted after the pressed one').toBeGreaterThan(pressed)
    expect(forcedPressed, 'the forced pressed fill is not emitted after the forced hover one').toBeGreaterThan(forcedHover)
  })
})

/** The stylesheet on one line, so a nested block reads as the browser parses it. */
const flat = () => css.replace(/\s+/g, ' ')

describe('the compact row on a narrow list or under a finger', () => {
  it('makes the list the container the row measures', () => {
    expect(ruleOf('.\\@container\\/pagination')).toBe('container-type: inline-size;\n    container-name: pagination;')
  })

  it('hides the pages and the gaps on a phone and under a coarse pointer, over their own inline-flex', () => {
    expect(flat()).toContain('@media (width < 36rem) { .pagination-full { display: none !important; } }')
    expect(flat()).toContain('@media (pointer: coarse) { .pagination-full { display: none !important; } }')
  })

  it('shows "current of total" in exactly those two cases, and in a list narrower than its row', () => {
    expect(flat()).toContain(
      '.pagination-compact { display: none; @media (width < 36rem) { display: flex; } @media (pointer: coarse) { display: flex; } }',
    )
  })

  it('lets the list claim its row and turn compact below it, so a cell sized to its content shows the full row', () => {
    const steps = RENDERED.filter((cls) => cls.startsWith('pagination-at-')).sort()
    expect(steps).toEqual(['pagination-at-20', 'pagination-at-28', 'pagination-at-32', 'pagination-at-36', 'pagination-at-38', 'pagination-at-44'])
    expect(flat()).toContain(
      '.pagination-at-28 { contain-intrinsic-inline-size: 28rem; @container pagination (width < 28rem) { '
      + '& .pagination-full { display: none !important; } & .pagination-compact { display: flex; } } }',
    )
  })
})
