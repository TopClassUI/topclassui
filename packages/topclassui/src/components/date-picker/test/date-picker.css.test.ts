/** A closed popup renders none of its classes, so the static stylesheet never holds them (unit-5.md, "A popup's classes
 * never reach the static stylesheet"): this compiles the real entry with every class of the DatePicker's own strings
 * and reads the rule of the ones that carry a guarantee. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  DATE_PICKER_CELL, DATE_PICKER_DAY, DATE_PICKER_GRID, DATE_PICKER_HEADER, DATE_PICKER_ICON, DATE_PICKER_INPUT, DATE_PICKER_NAV,
  DATE_PICKER_POPUP, DATE_PICKER_POSITIONER, DATE_PICKER_ROOT, DATE_PICKER_SCROLL, DATE_PICKER_TITLE, DATE_PICKER_TRIGGER, DATE_PICKER_VALUE,
  DATE_PICKER_WEEKDAY,
} from '../classes.js'

const OWN = [
  DATE_PICKER_CELL, DATE_PICKER_DAY, DATE_PICKER_GRID, DATE_PICKER_HEADER, DATE_PICKER_ICON, DATE_PICKER_INPUT, DATE_PICKER_NAV,
  DATE_PICKER_POPUP, DATE_PICKER_POSITIONER, DATE_PICKER_ROOT, DATE_PICKER_SCROLL, DATE_PICKER_TITLE, DATE_PICKER_TRIGGER, DATE_PICKER_VALUE,
  DATE_PICKER_WEEKDAY,
]
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

/** The at-rule a class's rule sits in, read back from the rule. */
const mediaOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim()
}

describe('every class of the DatePicker paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(80)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the box, the trigger and the form input', () => {
  it('the box is one column that may shrink to nothing and grows to an Input, and holds the input', () => {
    expect(ruleOf(selectorOf('grid-cols-[minmax(0,var(--tc-input-width))]'))).toBe('grid-template-columns: minmax(0,var(--tc-input-width));')
    expect(DATE_PICKER_ROOT.split(' ')).toEqual(expect.arrayContaining(['relative', 'inline-grid', 'w-fit']))
  })

  it('the placeholder is muted, and the form input is out of sight', () => {
    expect(ruleOf(`${selectorOf('data-placeholder:text-muted')}[data-placeholder]`)).toBe('color: var(--tc-muted);')
    expect(ruleOf(selectorOf('sr-only'))).toContain('position: absolute; width: 1px; height: 1px;')
  })

  it('the trigger keeps the ring while the calendar is open, as the frame draws it', () => {
    expect(ruleOf(`${selectorOf('data-popup-open:outline-ring')}[data-popup-open]`)).toBe('outline-color: var(--tc-ring);')
    expect(ruleOf(`${selectorOf('data-popup-open:outline-(length:--tc-ring-width)')}[data-popup-open]`)).toBe('outline-style: var(--tw-outline-style); outline-width: var(--tc-ring-width);')
    expect(DATE_PICKER_TRIGGER.split(' ')).toEqual(expect.arrayContaining(['data-popup-open:outline-solid', 'data-popup-open:outline-offset-(length:--tc-ring-offset)']))
  })
})

describe('the popup', () => {
  it('sits on the popup layer and hides with its trigger', () => {
    expect(ruleOf(selectorOf('z-(--tc-z-popup)'))).toBe('z-index: var(--tc-z-popup);')
    expect(ruleOf(`${selectorOf('data-anchor-hidden:invisible')}[data-anchor-hidden]`)).toBe('visibility: hidden;')
  })

  it('is 268 px at density 1, never wider or taller than the room Base UI measured, and scrolls as one on a short screen', () => {
    expect(ruleOf(selectorOf('w-[calc(16.75rem*var(--tc-density))]'))).toBe('width: calc(16.75rem * var(--tc-density));')
    expect(ruleOf(selectorOf('max-w-[round(down,var(--available-width),1px)]'))).toBe('max-width: round(down, var(--available-width), 1px);')
    expect(ruleOf(selectorOf('max-h-(--available-height)'))).toBe('max-height: var(--available-height);')
    expect(ruleOf(selectorOf('overscroll-contain'))).toBe('overscroll-behavior: contain;')
    expect(DATE_PICKER_POPUP.split(' ')).not.toContain('*:shrink-0')
  })

  it('the month keeps its box while the grid scrolls in a wrapper of its own, which reaches into the padding by a ring', () => {
    expect(DATE_PICKER_HEADER.split(' ')).toContain('shrink-0')
    expect(DATE_PICKER_SCROLL.split(' ')).toEqual(expect.arrayContaining(['min-h-0', 'overflow-y-auto', 'overscroll-contain']))
    expect(ruleOf(selectorOf('-m-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]')))
      .toBe('margin: calc(calc(var(--tc-ring-width) + var(--tc-ring-offset)) * -1);')
    expect(ruleOf(selectorOf('p-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]'))).toBe('padding: calc(var(--tc-ring-width) + var(--tc-ring-offset));')
  })

  it('under 20rem of screen the grid stops scrolling, so the popup scrolls as one', () => {
    expect(ruleOf(selectorOf('[@media(height<20rem)]:overflow-y-visible'))).toBe('overflow-y: visible;')
    const at = css.indexOf(`${selectorOf('[@media(height<20rem)]:overflow-y-visible')} {`)
    expect(css.slice(css.lastIndexOf('@media (', at), at).split('{')[0]?.trim()).toBe('@media (height<20rem)')
    expect(ruleOf(selectorOf('[@media(height<20rem)]:shrink-0'))).toBe('flex-shrink: 0;')
  })

  it('the month wraps rather than being cut', () => {
    expect(ruleOf(selectorOf('wrap-anywhere'))).toBe('overflow-wrap: anywhere;')
    expect(DATE_PICKER_TITLE.split(' ')).toEqual(expect.arrayContaining(['min-w-0', 'flex-1', 'text-center']))
  })
})

describe('a day', () => {
  it('is a pill at the 24 px floor, 44 under a finger, and as wide as its column', () => {
    const fine = 'min-h-[var(--tc-target-min,24px)]'
    expect(ruleOf(selectorOf(fine))).toBe('min-height: var(--tc-target-min,24px);')
    expect(ruleOf(selectorOf('rounded-full'))).toBe('border-radius: calc(infinity * 1px);')
    expect(DATE_PICKER_DAY.split(' ')).toEqual(expect.arrayContaining([fine, 'rounded-full', 'text-xs']))
    expect(DATE_PICKER_DAY.split(' ')).not.toContain('h-control-sm')
    const coarse = 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'
    expect(ruleOf(selectorOf(coarse))).toBe('min-height: var(--tc-target-coarse,44px);')
    expect(mediaOf(selectorOf(coarse))).toBe('@media (pointer: coarse)')
    expect(DATE_PICKER_DAY.split(' ')).toEqual(expect.arrayContaining(['w-full', coarse]))
    expect(ruleOf(selectorOf('table-fixed'))).toBe('table-layout: fixed;')
  })

  it('the chosen day is a fill and a weight, and under forced colours the Highlight pair it paints itself', () => {
    expect(ruleOf(`${selectorOf('data-selected:bg-primary-solid')}[data-selected]`)).toBe('background-color: var(--tc-primary-solid);')
    expect(ruleOf(`${selectorOf('data-selected:font-medium')}[data-selected]`)).toBe('--tw-font-weight: var(--font-weight-medium); font-weight: var(--font-weight-medium);')
    expect(ruleOf(`${selectorOf('forced-colors:data-selected:bg-[Highlight]')}[data-selected]`)).toBe('background-color: Highlight;')
    expect(ruleOf(`${selectorOf('forced-colors:data-selected:forced-color-adjust-none')}[data-selected]`)).toBe('forced-color-adjust: none;')
  })

  it('the chosen day also has an inset line in the tone of the ring, which reaches 3:1 on the surface where the dark fill does not', () => {
    expect(ruleOf(`${selectorOf('data-selected:inset-ring-(length:--tc-line-width)')}[data-selected]`)).toContain('--tw-inset-ring-shadow: inset 0 0 0 var(--tc-line-width)')
    expect(ruleOf(`${selectorOf('data-selected:inset-ring-primary-on-soft')}[data-selected]`)).toBe('--tw-inset-ring-color: var(--tc-primary-on-soft);')
    expect(ruleOf(`${selectorOf('forced-colors:data-selected:inset-ring-[color:Highlight]')}[data-selected]`)).toBe('--tw-inset-ring-color: Highlight;')
  })

  it('under forced colours the chosen day, opted out of them, rings in CanvasText rather than the blue of the theme', () => {
    const forced = selectorOf('forced-colors:data-selected:[--tc-ring:CanvasText]')
    expect(ruleOf(`${forced}[data-selected]`)).toBe('--tc-ring: CanvasText;')
    expect(mediaOf(`${forced}[data-selected]`)).toBe('@media (forced-colors: active)')
  })

  it('a day is as wide as its column, and the popup gives up side padding to a narrow screen, so a 32 px root leaves two digits room', () => {
    const side = 'px-[clamp(4px,calc(0.875rem-(16.75rem*var(--tc-density)-var(--available-width,100vw))/2),min(0.875rem,14px))]'
    expect(ruleOf(selectorOf(side))).toBe('padding-inline: clamp(4px, calc(0.875rem - (16.75rem * var(--tc-density) - var(--available-width,100vw)) / 2), min(0.875rem, 14px));')
    expect(ruleOf(selectorOf('py-[min(0.875rem,14px)]'))).toBe('padding-block: min(0.875rem, 14px);')
    expect(ruleOf(selectorOf('py-[min(0.125rem,2px)]'))).toBe('padding-block: min(0.125rem, 2px);')
    expect(DATE_PICKER_POPUP.split(' ').filter((cls) => /^p[xy]?-/.test(cls))).toEqual(['py-[min(0.875rem,14px)]', side])
    expect(DATE_PICKER_CELL.split(' ')).toEqual(['px-0', 'py-[min(0.125rem,2px)]', 'text-center'])
  })

  it('today is a weight and an underline, never a fill', () => {
    expect(ruleOf(`${selectorOf('aria-[current=date]:underline')}[aria-current="date"]`)).toBe('text-decoration-line: underline;')
    expect(ruleOf(`${selectorOf('aria-[current=date]:font-semibold')}[aria-current="date"]`)).toContain('font-weight: var(--font-weight-semibold);')
    expect(DATE_PICKER_DAY).not.toMatch(/aria-\[current=date\]:bg-/)
  })

  it('a day outside the range dims to half and takes no press', () => {
    expect(ruleOf(`${selectorOf('aria-disabled:opacity-50')}[aria-disabled="true"]`)).toBe('opacity: 50%;')
    expect(ruleOf(`${selectorOf('aria-disabled:pointer-events-none')}[aria-disabled="true"]`)).toBe('pointer-events: none;')
  })
})

describe('the three buttons of the header', () => {
  it('are 24 px and 44 under a finger, where the drawing has bare 14 px carets', () => {
    expect(DATE_PICKER_NAV.split(' ')).toEqual(expect.arrayContaining(['min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]']))
  })

  it('a month button at the range\'s end dims by aria-disabled, never by disabled, which would drop the focus', () => {
    expect(DATE_PICKER_NAV.split(' ')).toEqual(expect.arrayContaining(['aria-disabled:opacity-50', 'aria-disabled:pointer-events-none']))
    expect(DATE_PICKER_NAV.split(' ').filter((cls) => /^disabled:(opacity|pointer-events)/.test(cls))).toEqual([])
  })
})
