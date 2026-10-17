/** A class list cannot show that a class compiles, so this compiles the real entry with every class of the field
 * constants Input does not wear, and reads the rule each one gives. Input's own css test covers the rest. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { FIELD_HOLDER, FIELD_HOLDER_FULL, FIELD_INVALID_WITHIN, FIELD_SURFACE, FIELD_TEXT, TARGET_HEIGHT } from './classes.js'

const CONSTANTS = { TARGET_HEIGHT, FIELD_HOLDER, FIELD_HOLDER_FULL, FIELD_INVALID_WITHIN, FIELD_SURFACE, ...FIELD_TEXT }

const CLASSES = [...new Set(Object.values(CONSTANTS).flatMap((constant) => constant.split(' ')).filter(Boolean))]

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

const INVALID_INSIDE = ':has([aria-invalid="true"])'

describe('every class of the field constants Input does not wear paints something', () => {
  it('read their classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(20)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the holder', () => {
  it('is one column with a minimum of nothing and a maximum of an Input, as wide as its content and no wider than its parent', () => {
    expect(ruleOf(selectorOf('grid-cols-[minmax(0,var(--tc-input-width))]'))).toBe('grid-template-columns: minmax(0,var(--tc-input-width));')
    expect(ruleOf(selectorOf('w-fit'))).toBe('width: fit-content;')
    expect(ruleOf(selectorOf('max-w-full'))).toBe('max-width: 100%;')
  })

  it('full width fills its box with one column that can still shrink', () => {
    expect(ruleOf(selectorOf('w-full'))).toBe('width: 100%;')
    expect(ruleOf(selectorOf('grid-cols-1'))).toBe('grid-template-columns: repeat(1, minmax(0, 1fr));')
  })
})

describe('a box whose field is invalid', () => {
  it('turns red, and draws the ring width less the line inside its line', () => {
    expect(ruleOf(`${selectorOf('has-aria-invalid:border-danger-solid')}${INVALID_INSIDE}`)).toBe('border-color: var(--tc-danger-solid);')
    expect(ruleOf(`${selectorOf('has-aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]')}${INVALID_INSIDE}`))
      .toContain('inset 0 0 0 calc(var(--tc-ring-width) - var(--tc-line-width))')
    expect(ruleOf(`${selectorOf('has-aria-invalid:inset-ring-danger-solid')}${INVALID_INSIDE}`)).toBe('--tw-inset-ring-color: var(--tc-danger-solid);')
  })

  it('grows its line to the ring width under forced colours, and only there', () => {
    const selector = `${selectorOf('forced-colors:has-aria-invalid:border-(length:--tc-ring-width)')}${INVALID_INSIDE}`
    expect(ruleOf(selector)).toContain('border-width: var(--tc-ring-width);')
    expect(mediaOf(selector)).toBe('@media (forced-colors: active)')
  })
})

describe('the target height and the type step', () => {
  it('a 24 px floor, and 44 px under a coarse pointer, in px tokens', () => {
    expect(ruleOf(selectorOf('min-h-[var(--tc-target-min,24px)]'))).toBe('min-height: var(--tc-target-min,24px);')
    const coarse = selectorOf('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
    expect(ruleOf(coarse)).toBe('min-height: var(--tc-target-coarse,44px);')
    expect(mediaOf(coarse)).toBe('@media (pointer: coarse)')
  })

  it('16 px text under a coarse pointer, whatever the root font size says', () => {
    const coarse = selectorOf('pointer-coarse:text-[max(1rem,16px)]')
    expect(ruleOf(coarse)).toBe('font-size: max(1rem, 16px);')
    expect(mediaOf(coarse)).toBe('@media (pointer: coarse)')
  })

  it('a surface with the radius knob, the raised fill and the 3:1 line', () => {
    expect(ruleOf(selectorOf('rounded-control'))).toBe('border-radius: var(--tc-radius);')
    expect(ruleOf(selectorOf('bg-surface-raised'))).toBe('background-color: var(--tc-surface-raised);')
    expect(ruleOf(selectorOf('border-line-strong'))).toBe('border-color: var(--tc-line-strong);')
  })
})
