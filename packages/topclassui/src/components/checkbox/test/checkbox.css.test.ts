/** A class list cannot show that a class compiles or what it resolves to, so this compiles the real entry with
 * every class of the checkbox's own strings and reads the rule of each one. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { CHECKBOX_BOX, CHECKBOX_MARK, CHECKBOX_MIXED, CHECKBOX_SIZE } from '../classes.js'

const OWN = [CHECKBOX_BOX, CHECKBOX_MARK, ...Object.values(CHECKBOX_SIZE)]
const CLASSES = [...new Set(OWN.join(' ').split(' ').filter(Boolean))]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(CLASSES)
})

/** Tailwind's selector for a class: every character outside a plain name is escaped. */
const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

/** The declarations of the first rule that starts with a selector, without the braces, on one line. */
const ruleOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).replace(/\s+/g, ' ').trim()
}

/** The rule of a class, and the media query it sits in. */
const forced = (cls: string, scope = '') => {
  const at = css.indexOf(`${selectorOf(cls)}${scope} {`)
  return { rule: ruleOf(`${selectorOf(cls)}${scope}`), query: css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim() }
}

const MIXED = ':is(:where(.group\\/toggle)[data-indeterminate] *)'
const INVALID = ':is(:where(.group\\/toggle)[aria-invalid="true"] *)'

describe('every class of the checkbox paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(40)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the box', () => {
  it('takes the chip radius, half the knob and never past 8 px (choice 12), and the raised surface', () => {
    expect(ruleOf(selectorOf('rounded-chip'))).toBe('border-radius: min(calc(var(--tc-radius) * 0.5), 0.5rem);')
    expect(ruleOf(selectorOf('bg-surface-raised'))).toBe('background-color: var(--tc-surface-raised);')
  })

  it('is a square of the toggle scale at each size, and custom draws none', () => {
    const sizes = Object.fromEntries(Object.entries(CHECKBOX_SIZE).filter(([size]) => size !== 'custom')
      .map(([size, cls]) => [size, ruleOf(selectorOf(cls))]))
    const square = (rem: string) => `width: calc(${rem}rem * var(--tc-density)); height: calc(${rem}rem * var(--tc-density));`
    expect(sizes).toEqual({ xs: square('0.875'), sm: square('1'), md: square('1.25'), lg: square('1.5'), xl: square('1.75') })
    expect(CHECKBOX_SIZE.custom).toBe('')
  })
})

describe('indeterminate is filled as checked is (CHECKBOX_MIXED)', () => {
  it('the primary fill, its line and the on-solid colour of the dash', () => {
    expect(ruleOf(`${selectorOf('group-data-indeterminate/toggle:bg-primary-solid')}${MIXED}`)).toBe('background-color: var(--tc-primary-solid);')
    expect(ruleOf(`${selectorOf('group-data-indeterminate/toggle:border-primary-solid')}${MIXED}`)).toBe('border-color: var(--tc-primary-solid);')
    expect(ruleOf(`${selectorOf('group-data-indeterminate/toggle:text-primary-on-solid')}${MIXED}`)).toBe('color: var(--tc-primary-on-solid);')
  })

  it('under forced colours, the Highlight pair, painted by the box itself', () => {
    const scoped = (cls: string) => forced(cls, MIXED)
    expect(scoped('forced-colors:group-data-indeterminate/toggle:forced-color-adjust-none'))
      .toEqual({ rule: 'forced-color-adjust: none;', query: '@media (forced-colors: active)' })
    expect(scoped('forced-colors:group-data-indeterminate/toggle:bg-[Highlight]'))
      .toEqual({ rule: 'background-color: Highlight;', query: '@media (forced-colors: active)' })
    expect(scoped('forced-colors:group-data-indeterminate/toggle:text-[HighlightText]'))
      .toEqual({ rule: 'color: HighlightText;', query: '@media (forced-colors: active)' })
  })

  it('an invalid mixed box keeps the danger line over the fill', () => {
    const cls = 'group-aria-invalid/toggle:group-data-indeterminate/toggle:border-danger-solid'
    expect(CHECKBOX_MIXED.split(' ')).toContain(cls)
    expect(ruleOf(`${selectorOf(cls)}${INVALID}${MIXED}`)).toBe('border-color: var(--tc-danger-solid);')
  })

  it('under forced colours, which the mixed box opts out of, invalid is a CanvasText line and disabled is GrayText', () => {
    const DISABLED = ':is(:where(.group\\/toggle):disabled *)'
    expect(forced('forced-colors:group-aria-invalid/toggle:group-data-indeterminate/toggle:border-[CanvasText]', `${INVALID}${MIXED}`))
      .toEqual({ rule: 'border-color: CanvasText;', query: '@media (forced-colors: active)' })
    expect(forced('forced-colors:group-disabled/toggle:group-data-indeterminate/toggle:bg-[GrayText]', `${DISABLED}${MIXED}`))
      .toEqual({ rule: 'background-color: GrayText;', query: '@media (forced-colors: active)' })
    expect(forced('forced-colors:group-disabled/toggle:group-data-indeterminate/toggle:border-[GrayText]', `${DISABLED}${MIXED}`))
      .toEqual({ rule: 'border-color: GrayText;', query: '@media (forced-colors: active)' })
  })
})

describe('the mark', () => {
  it('fills the inside of the box and centres the tick or the dash', () => {
    expect(CHECKBOX_MARK).toBe('flex size-full items-center justify-center')
    expect(ruleOf(selectorOf('size-full'))).toBe('width: 100%; height: 100%;')
    expect(ruleOf(selectorOf('justify-center'))).toBe('justify-content: center;')
  })
})
