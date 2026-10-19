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

/** The control heights of styles.css, written out: md is the height of a default Button. */
const CONTROL = { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem', xl: '3.5rem' } as const

describe('a cell is a square at the control height that a long number can widen', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} is ${CONTROL[size]} tall, scaled by the density knob, and sets no width`, () => {
      expect(ruleOf(`.h-control-${size}`), size).toBe(`height: calc(${CONTROL[size]} * var(--tc-density));`)
      expect(css, size).not.toContain(`.size-control-${size}`)
      expect(css, size).not.toContain(`.w-control-${size}`)
    })
  }

  it('gets its width from the ratio, which a fixed width would not let the text stretch', () => {
    expect(ruleOf('.aspect-square')).toBe('aspect-ratio: 1 / 1;')
  })

  // min-width: auto is what lets the content widen a box that has a preferred ratio.
  it('leaves the minimum width to the content, at a fine pointer and at a coarse one', () => {
    expect(ruleOf('.min-w-auto')).toBe('min-width: auto;')
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'))
    expect(coarse).toContain(`${selectorOf('pointer-coarse:min-w-auto')} {\n      min-width: auto;`)
  })

  it('keeps a number off the border with a little inline padding', () => {
    expect(ruleOf(selectorOf('px-0.5'))).toBe('padding-inline: calc(var(--spacing) * 0.5);')
    expect(ruleOf('.px-1')).toBe('padding-inline: var(--spacing);')
  })

  it('gives every digit one width, so Next does not move from page 111 to 112', () => {
    expect(ruleOf('.tabular-nums')).toContain('--tw-numeric-spacing: tabular-nums;')
  })
})

describe('the floors and the dimming reach the browser', () => {
  it('holds 24 px on the height with a px fallback, which the square carries to the width', () => {
    expect(ruleOf(selectorOf('min-h-[var(--tc-target-min,24px)]'))).toBe('min-height: var(--tc-target-min,24px);')
  })

  it('raises it to 44 px under a coarse pointer', () => {
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'))
    expect(coarse).toContain('min-height: var(--tc-target-coarse,44px);')
  })

  it('still holds both px floors on the width for size custom, which has no ratio', () => {
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

  it('hides the pages and the gaps below 36rem and under a coarse pointer, over their own inline-flex', () => {
    expect(flat()).toContain('@container pagination (width < 36rem) { .pagination-full { display: none !important; } }')
    expect(flat()).toContain('@media (pointer: coarse) { .pagination-full { display: none !important; } }')
  })

  it('shows "current of total" in exactly those two cases and nowhere else', () => {
    expect(flat()).toContain(
      '.pagination-compact { display: none; @container pagination (width < 36rem) { display: flex; } '
      + '@media (pointer: coarse) { display: flex; } }',
    )
  })
})
