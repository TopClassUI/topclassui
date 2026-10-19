/** A class list cannot show that a class compiles or which rule wins, so this compiles the real entry with the
 * row of a menu and the two classes a list of options adds to it, and reads the sheet. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { ROW, ROW_SELECTED, ROW_TOUCH } from './classes.js'

const CLASSES = [...new Set([ROW, ROW_SELECTED, ROW_TOUCH].flatMap((constant) => constant.split(' ')))]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(CLASSES)
})

/** Tailwind's selector for a class: every character outside a plain name is escaped. */
const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

/** The declarations of the first rule that starts with a selector, without the braces. */
const ruleOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim()
}

/** The query of the at-rule a selector's rule sits inside, or '' when it sits in none. */
const mediaOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  const media = css.lastIndexOf('@media', at)
  if (at === -1 || media === -1) return ''
  const between = css.slice(media, at)
  return between.split('{').length - between.split('}').length === 1 ? between.slice(0, between.indexOf('{')).trim() : ''
}

const COARSE = selectorOf('pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]')

describe('every class of a row of options paints something', () => {
  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES).toContain('pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]')
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('a row under a finger', () => {
  it('is the larger of the row height and the coarse target, 44 px by its fallback, and only under a coarse pointer', () => {
    expect(ruleOf(COARSE)).toBe('min-height: max(var(--tc-row-height), var(--tc-target-coarse,44px));')
    expect(mediaOf(COARSE)).toBe('@media (pointer: coarse)')
  })

  it('comes after the row height in the sheet, so on a phone the larger floor wins and a taller row is never shortened', () => {
    const row = css.indexOf(`${selectorOf('min-h-(--tc-row-height)')} {`)
    expect(row).toBeGreaterThan(-1)
    expect(css.indexOf(`${COARSE} {`)).toBeGreaterThan(row)
  })
})

describe('the chosen row', () => {
  it('is tinted with the primary pair, on the attribute Base UI sets', () => {
    expect(ruleOf(`${selectorOf('data-selected:bg-primary-soft')}[data-selected]`)).toBe('background-color: var(--tc-primary-soft);')
    expect(ruleOf(`${selectorOf('data-selected:text-primary-on-soft')}[data-selected]`)).toBe('color: var(--tc-primary-on-soft);')
  })
})
