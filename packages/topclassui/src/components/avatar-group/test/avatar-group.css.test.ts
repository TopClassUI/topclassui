/** A class list cannot show that a `*:` variant compiles or which margin it sets, so this
 * compiles the real entry and reads what the browser would get. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { compileEntry } from '#test/stylesheet.js'
import { AvatarGroup } from '../index.js'

/** md and xs, because the overlap is not the same class at both. */
const HTML = (['md', 'xs'] as const)
  .map((size) => markup(createElement(AvatarGroup, { max: 1, size }, createElement('span'), createElement('span'))))
  .join('')

/** What the group really renders, counter included, so a renamed class is compiled as renamed. */
const RENDERED = [...new Set([...HTML.matchAll(/class="([^"]*)"/g)].flatMap((m) => (m[1] ?? '').split(' ')))]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(RENDERED)
})

/** Tailwind's selector for a class: every character outside a plain name is escaped. */
const escaped = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)

/** The declarations of the first rule whose selector starts this way, without the braces. */
const ruleOf = (selector: string) => {
  const at = css.indexOf(selector)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim()
}

describe('every class the group renders paints something', () => {
  it('rendered the classes at all, the counter among them, so an empty list cannot pass', () => {
    expect(RENDERED.length).toBeGreaterThan(20)
    expect(RENDERED).toContain('*:ring-page')
    expect(RENDERED).toContain('rounded-full')
    expect(RENDERED).toContain('min-w-control-xs')
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => !css.includes(escaped(cls)))).toEqual([])
  })
})

describe('the overlap', () => {
  it('steps every direct child back on the inline start, the side that follows the direction (R-5.3-1)', () => {
    expect(ruleOf(':is(.\\*\\:-ms-2 > *) {')).toBe('margin-inline-start: calc(var(--spacing) * -2);')
    expect(ruleOf(':is(.\\*\\:-ms-1 > *) {')).toBe('margin-inline-start: calc(var(--spacing) * -1);')
  })

  it('pads the root by the same step on the same side, so the first child of every row sits on the edge', () => {
    expect(ruleOf('.ps-2 {')).toBe('padding-inline-start: calc(var(--spacing) * 2);')
    expect(ruleOf('.ps-1 {')).toBe('padding-inline-start: var(--spacing);')
  })
})

describe('the containment', () => {
  it('wraps, caps the width at the container and does not shrink', () => {
    expect(ruleOf('.flex-wrap {')).toBe('flex-wrap: wrap;')
    expect(ruleOf('.max-w-full {')).toBe('max-width: 100%;')
    expect(ruleOf('.shrink-0 {')).toBe('flex-shrink: 0;')
  })

  it('is as wide as its one row, so the least a table column may give it is every face', () => {
    expect(ruleOf('.w-max {')).toBe('width: max-content;')
  })
})

describe('the ring', () => {
  it('reaches every direct child, so the counter is ringed like an avatar', () => {
    expect(css).toContain(':is(.\\*\\:ring-2 > *) {')
    expect(css).toContain(':is(.\\*\\:ring-page > *) {')
  })

  it('is two pixels of box shadow, which follows the circle and takes no space', () => {
    const rule = ruleOf(':is(.\\*\\:ring-2 > *)')
    expect(rule).toContain('--tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width))')
    expect(rule).toContain('box-shadow:')
  })

  it('takes the page colour from the token, so it changes with the mode and is never a fixed white', () => {
    expect(ruleOf(':is(.\\*\\:ring-page > *)')).toBe('--tw-ring-color: var(--tc-page);')
  })

  it('finds that token declared for light and for dark, so the ring is never an unset colour', () => {
    expect(css).toMatch(/\[data-theme='light'\] \{[^}]*--tc-page:/)
    expect(css).toMatch(/\[data-theme='dark'\] \{[^}]*--tc-page:/)
  })

  it('follows a circle whatever the child is, and each child is its own layer', () => {
    expect(ruleOf(':is(.\\*\\:rounded-full > *) {')).toBe('border-radius: calc(infinity * 1px);')
    expect(ruleOf(':is(.\\*\\:isolate > *) {')).toBe('isolation: isolate;')
  })

  it('lifts only the child that has keyboard focus', () => {
    expect(ruleOf(':is(.\\*\\:focus-visible\\:z-1 > *):focus-visible {')).toBe('z-index: 1;')
  })
})

describe('the counter may widen', () => {
  it('has a floor of the control size, the width of the circle it is for a short count', () => {
    expect(ruleOf('.min-w-control-md {')).toBe('min-width: calc(2.5rem * var(--tc-density));')
    expect(ruleOf('.min-w-control-xs {')).toBe('min-width: calc(1.75rem * var(--tc-density));')
  })

  it('sets width: auto after the box of the avatar, or the fixed width would win and cut the count', () => {
    expect(ruleOf('.w-auto {')).toBe('width: auto;')
    expect(css.indexOf('.size-control-md {')).toBeGreaterThan(-1)
    expect(css.indexOf('.w-auto {')).toBeGreaterThan(css.indexOf('.size-control-md {'))
    expect(css.indexOf('.w-auto {')).toBeGreaterThan(css.indexOf('.size-control-xs {'))
  })
})
