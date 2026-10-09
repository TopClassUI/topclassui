/** A class list cannot show that size-control-sm compiles or that a cell is square, so
 * this compiles the real entry and reads what the browser would get. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { compileEntry } from '#test/stylesheet.js'
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
    expect(RENDERED.length).toBeGreaterThan(25)
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

/** The control heights of styles.css, written out: sm is the 32 px the frame draws. */
const CONTROL = { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem', xl: '3.5rem' } as const

describe('a cell is a square at the control size, scaled by the density knob', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} is ${CONTROL[size]} wide and ${CONTROL[size]} tall`, () => {
      const cell = ruleOf(`.size-control-${size}`)
      expect(cell, size).toContain(`width: calc(${CONTROL[size]} * var(--tc-density));`)
      expect(cell, size).toContain(`height: calc(${CONTROL[size]} * var(--tc-density));`)
    })
  }
})

describe('the floors and the dimming reach the browser', () => {
  it('holds 24 px on both axes with a px fallback', () => {
    expect(ruleOf(selectorOf('min-h-[var(--tc-target-min,24px)]'))).toBe('min-height: var(--tc-target-min,24px);')
    expect(ruleOf(selectorOf('min-w-[var(--tc-target-min,24px)]'))).toBe('min-width: var(--tc-target-min,24px);')
  })

  it('raises both to 44 px under a coarse pointer', () => {
    expect(css).toContain('min-height: var(--tc-target-coarse,44px);')
    expect(css).toContain('min-width: var(--tc-target-coarse,44px);')
    expect(css).toContain('@media (pointer: coarse)')
  })

  it('dims an edge span by the attribute, since a span has no disabled state', () => {
    expect(css).toContain(`${selectorOf('data-disabled:opacity-50')}[data-disabled]`)
    expect(css).toContain(`${selectorOf('data-disabled:pointer-events-none')}[data-disabled]`)
  })
})
