/** A class list cannot show that a class compiles or what it resolves to, so this compiles the real entry with
 * every class of the switch's own strings and reads the rule of each one. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { SWITCH_SLIDE, SWITCH_THUMB, SWITCH_TRACK, SWITCH_TRACK_SIZE } from '../classes.js'

const OWN = [SWITCH_THUMB, ...Object.values(SWITCH_TRACK_SIZE), ...Object.values(SWITCH_SLIDE), SWITCH_TRACK]
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

const CHECKED = ':is(:where(.group\\/toggle)[data-checked] *)'

describe('every class of the switch paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(40)
  })

  it('finds each one in the sheet but the group marker, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the track', () => {
  it('is round, on the neutral tint, with one pixel of padding inside its line', () => {
    expect(ruleOf(selectorOf('rounded-full'))).toBe('border-radius: calc(infinity * 1px);')
    expect(ruleOf(selectorOf('bg-neutral-soft'))).toBe('background-color: var(--tc-neutral-soft);')
    expect(ruleOf(selectorOf('p-px'))).toBe('padding: 1px;')
  })

  it('takes the height of the toggle scale and 1.75 times that as its width, at each size', () => {
    const widths = Object.fromEntries(Object.entries(SWITCH_TRACK_SIZE).filter(([size]) => size !== 'custom')
      .map(([size, classes]) => [size, classes.split(' ').map((cls) => ruleOf(selectorOf(cls)))]))
    expect(widths).toEqual({
      xs: ['height: calc(0.875rem * var(--tc-density));', 'width: calc(1.53125rem * var(--tc-density));'],
      sm: ['height: calc(1rem * var(--tc-density));', 'width: calc(1.75rem * var(--tc-density));'],
      md: ['height: calc(1.25rem * var(--tc-density));', 'width: calc(2.1875rem * var(--tc-density));'],
      lg: ['height: calc(1.5rem * var(--tc-density));', 'width: calc(2.625rem * var(--tc-density));'],
      xl: ['height: calc(1.75rem * var(--tc-density));', 'width: calc(3.0625rem * var(--tc-density));'],
    })
    expect(SWITCH_TRACK_SIZE.custom).toBe('')
  })
})

describe('the thumb', () => {
  it('is a circle as tall as the inside of the track, line-strong when off (3:1 on the track), and on the on-solid colour when checked', () => {
    expect(ruleOf(selectorOf('aspect-square'))).toBe('aspect-ratio: 1 / 1;')
    expect(ruleOf(selectorOf('h-full'))).toBe('height: 100%;')
    expect(ruleOf(selectorOf('bg-line-strong'))).toBe('background-color: var(--tc-line-strong);')
    expect(SWITCH_THUMB.split(' ')).not.toContain('bg-surface-raised')
    expect(ruleOf(`${selectorOf('group-data-checked/toggle:bg-primary-on-solid')}${CHECKED}`))
      .toBe('background-color: var(--tc-primary-on-solid);')
  })

  it('slides by translate, which TRANSITION animates, and the width minus the height, times --tc-dir (R-5.3-2)', () => {
    expect(ruleOf(selectorOf('transition-[color,background-color,border-color,outline-color,opacity,translate]')))
      .toContain('transition-property: color,background-color,border-color,outline-color,opacity,translate;')
    const slides = Object.fromEntries(Object.entries(SWITCH_SLIDE).filter(([size]) => size !== 'custom')
      .map(([size, cls]) => [size, ruleOf(`${selectorOf(cls)}${CHECKED}`)]))
    const step = (rem: string) => `--tw-translate-x: calc(${rem}rem * var(--tc-density) * var(--tc-dir)); translate: var(--tw-translate-x) var(--tw-translate-y);`
    expect(slides).toEqual({ xs: step('0.65625'), sm: step('0.75'), md: step('0.9375'), lg: step('1.125'), xl: step('1.3125') })
    expect(SWITCH_SLIDE.custom).toBe('')
  })

  it('takes a system colour under forced colours, ButtonText off and HighlightText on, and paints it itself', () => {
    const forced = (cls: string, scope = '') => {
      const at = css.indexOf(`${selectorOf(cls)}${scope} {`)
      return { rule: ruleOf(`${selectorOf(cls)}${scope}`), query: css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim() }
    }
    expect(forced('forced-colors:forced-color-adjust-none')).toEqual({ rule: 'forced-color-adjust: none;', query: '@media (forced-colors: active)' })
    expect(forced('forced-colors:bg-[ButtonText]')).toEqual({ rule: 'background-color: ButtonText;', query: '@media (forced-colors: active)' })
    expect(forced('forced-colors:group-data-checked/toggle:bg-[HighlightText]', CHECKED))
      .toEqual({ rule: 'background-color: HighlightText;', query: '@media (forced-colors: active)' })
  })
})
