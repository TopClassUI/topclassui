/** A class list cannot show that a class compiles, what it declares or which rule wins, so
 * this compiles the real entry with every class of the overlay constants and reads the sheet. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  FADE_MOTION, FOCUS_RING_INSET, FOCUS_RING_WITHIN, ICON_BUTTON, LIST_CAP, OVERLAY_SURFACE, POPUP_MOTION,
  POPUP_PASSIVE, ROW, ROW_HIGHLIGHT, SCRIM, SCROLL_X, SLIDE_MOTION, STICKY_TOP, VIEWPORT_PASSIVE,
} from './classes.js'

const CONSTANTS = {
  SCRIM, FADE_MOTION, POPUP_MOTION, SLIDE_MOTION, OVERLAY_SURFACE, ROW, ROW_HIGHLIGHT, LIST_CAP, SCROLL_X,
  STICKY_TOP, ICON_BUTTON, FOCUS_RING_INSET, FOCUS_RING_WITHIN, VIEWPORT_PASSIVE, POPUP_PASSIVE,
}

const CLASSES = [...new Set(Object.values(CONSTANTS).flatMap((constant) => constant.split(' ')))]

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

describe('every class of every constant paints something', () => {
  it('read fifteen constants and their classes, so an empty list cannot pass', () => {
    expect(Object.keys(CONSTANTS)).toHaveLength(15)
    expect(CLASSES.length).toBeGreaterThan(50)
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('what the classes with a value in them declare', () => {
  it('caps a list at the row count times the row height, and at the room Base UI measured', () => {
    expect(ruleOf(selectorOf(LIST_CAP)))
      .toBe('max-height: min(var(--available-height,100dvh), calc(var(--tc-list-rows) * var(--tc-row-height)));')
  })

  it('gives a row the height of the row token, as a minimum so two lines of text still fit', () => {
    expect(ruleOf(selectorOf('min-h-(--tc-row-height)'))).toBe('min-height: var(--tc-row-height);')
  })

  it('puts a sticky bar on the sticky step of the scale', () => {
    expect(ruleOf(selectorOf('z-(--tc-z-sticky)'))).toBe('z-index: var(--tc-z-sticky);')
    expect(ruleOf('.sticky')).toBe('position: sticky;')
    expect(ruleOf('.top-0')).toBe('top: 0px;')
  })

  it('covers the viewport with the scrim', () => {
    expect(ruleOf('.fixed')).toBe('position: fixed;')
    expect(ruleOf('.inset-0')).toBe('inset: 0px;')
    expect(ruleOf('.bg-overlay')).toBe('background-color: var(--tc-overlay);')
  })

  it('lets presses through a viewport that is not modal, and hands them back to the popup inside it', () => {
    expect(ruleOf('.pointer-events-none')).toBe('pointer-events: none;')
    expect(ruleOf('.pointer-events-auto')).toBe('pointer-events: auto;')
  })

  it('keeps a sideways scroll inside its own box', () => {
    expect(ruleOf('.overflow-x-auto')).toBe('overflow-x: auto;')
    expect(ruleOf('.overscroll-x-contain')).toBe('overscroll-behavior-x: contain;')
  })
})

describe('motion', () => {
  it('reads both durations from the tokens, which --tc-motion multiplies', () => {
    expect(ruleOf(selectorOf('duration-(--tc-duration)'))).toContain('transition-duration: var(--tc-duration);')
    expect(ruleOf(selectorOf('duration-(--tc-duration-slow)'))).toContain('transition-duration: var(--tc-duration-slow);')
  })

  it('starts and ends a popup transparent and at 95 percent, on the attributes Base UI sets', () => {
    for (const edge of ['starting', 'ending']) {
      expect(ruleOf(`${selectorOf(`data-${edge}-style:opacity-0`)}[data-${edge}-style]`), edge).toBe('opacity: 0%;')
      expect(ruleOf(`${selectorOf(`data-${edge}-style:scale-95`)}[data-${edge}-style]`), edge).toContain('--tw-scale-x: 95%;')
    }
  })

  it('grows a popup from the origin Base UI measures', () => {
    expect(ruleOf(selectorOf('origin-(--transform-origin)'))).toBe('transform-origin: var(--transform-origin);')
  })

  it('slides on the transform properties, the ones Base UI moves a swiped sheet by', () => {
    expect(ruleOf(selectorOf('transition-transform'))).toContain('transition-property: transform, translate, scale, rotate;')
  })
})

describe('the highlight of a row', () => {
  const lit = (cls: string) => `${selectorOf(cls)}[data-highlighted]`

  it('fills and recolours the row Base UI marks', () => {
    expect(ruleOf(lit('data-highlighted:bg-primary-soft'))).toBe('background-color: var(--tc-primary-soft);')
    expect(ruleOf(lit('data-highlighted:text-primary-on-soft'))).toBe('color: var(--tc-primary-on-soft);')
  })

  it('takes the system pair inside the forced-colours query, after the fill it replaces', () => {
    const query = css.indexOf('@media (forced-colors: active)')
    const fill = css.indexOf(`${lit('data-highlighted:bg-primary-soft')} {`)
    const forcedFill = css.indexOf(`${lit('forced-colors:data-highlighted:bg-[Highlight]')} {\n      background-color: Highlight;`)
    const forcedText = css.indexOf(`${lit('forced-colors:data-highlighted:text-[HighlightText]')} {\n      color: HighlightText;`)
    expect(fill).toBeGreaterThan(-1)
    expect(query).toBeGreaterThan(fill)
    expect(forcedFill).toBeGreaterThan(query)
    expect(forcedText).toBeGreaterThan(query)
  })

  it('rings the row Base UI marks, its own width inside its edge, after the reset ROW writes', () => {
    expect(ruleOf(lit('data-highlighted:outline-solid'))).toContain('outline-style: solid;')
    expect(ruleOf(lit('data-highlighted:outline-(length:--tc-ring-width)'))).toContain('outline-width: var(--tc-ring-width);')
    expect(ruleOf(lit('data-highlighted:-outline-offset-(length:--tc-ring-width)'))).toBe('outline-offset: calc(var(--tc-ring-width) * -1);')
    expect(ruleOf(lit('data-highlighted:outline-ring'))).toBe('outline-color: var(--tc-ring);')
    expect(css.indexOf(`${lit('data-highlighted:outline-solid')} {`)).toBeGreaterThan(css.indexOf('.outline-none {'))
  })

  it('draws that ring in HighlightText under forced colours, on the Highlight the row paints itself', () => {
    const rule = `${lit('forced-colors:data-highlighted:outline-[HighlightText]')} {\n      outline-color: HighlightText;`
    expect(css.indexOf(rule)).toBeGreaterThan(css.indexOf('@media (forced-colors: active)'))
  })

  it('opts the highlighted row out of the adjustment that would lay a backplate under its label', () => {
    const rule = `${lit('forced-colors:data-highlighted:forced-color-adjust-none')} {\n      forced-color-adjust: none;`
    expect(css.indexOf(rule)).toBeGreaterThan(css.indexOf('@media (forced-colors: active)'))
  })
})

describe('the two other rings', () => {
  it('draws the inset ring its own width inside the box', () => {
    expect(ruleOf(`${selectorOf('focus-visible:-outline-offset-(length:--tc-ring-width)')}:focus-visible`))
      .toBe('outline-offset: calc(var(--tc-ring-width) * -1);')
  })

  it('matches a wrapper that holds a focused element, by the pseudo-class and by the forced attribute', () => {
    const ring = selectorOf('has-focus-visible:outline-solid')
    expect(ruleOf(`${ring}:has(:focus-visible)`)).toContain('outline-style: solid;')
    expect(ruleOf(`${ring}:has([data-focus-visible])`)).toContain('outline-style: solid;')
    expect(ruleOf(`${selectorOf('has-focus-visible:outline-offset-(length:--tc-ring-offset)')}:has(:focus-visible)`))
      .toBe('outline-offset: var(--tc-ring-offset);')
  })

  it('restores the style the reset zeroes, after the reset, on both of them', () => {
    const reset = css.indexOf('.outline-none {')
    expect(reset).toBeGreaterThan(-1)
    expect(css.indexOf(`${selectorOf('focus-visible:outline-solid')}:focus-visible {`)).toBeGreaterThan(reset)
    expect(css.indexOf(`${selectorOf('has-focus-visible:outline-solid')}:has(:focus-visible) {`)).toBeGreaterThan(reset)
  })

  it('declares no outline of its own under forced colours, as outline-hidden would', () => {
    expect(css).not.toContain('solid transparent')
  })
})
