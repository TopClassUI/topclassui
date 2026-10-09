/** A class list cannot show that a `*:` variant compiles or which margin it sets, so this
 * compiles the real entry and reads what the browser would get. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { compileEntry } from '#test/stylesheet.js'
import { AvatarGroup } from '../index.js'

const HTML = markup(createElement(AvatarGroup, { max: 1 }, createElement('span'), createElement('span')))

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
    expect(RENDERED.length).toBeGreaterThan(10)
    expect(RENDERED).toContain('*:ring-page')
    expect(RENDERED).toContain('rounded-full')
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => !css.includes(escaped(cls)))).toEqual([])
  })
})

describe('the overlap', () => {
  it('reaches each direct child after the first, and leaves the first where it is', () => {
    expect(css).toContain(':is(.\\*\\:not-first\\:-ms-2 > *):not(:first-child) {')
  })

  it('is a negative margin on the inline start alone, the side that follows the direction (R-5.3-1)', () => {
    expect(ruleOf(':is(.\\*\\:not-first\\:-ms-2 > *)')).toBe('margin-inline-start: calc(var(--spacing) * -2);')
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
})
