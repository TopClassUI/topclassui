/** A class list cannot show that a class compiles or what it resolves to, so this compiles the real entry with
 * every class of the code field's own strings and reads the rule of each one. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { OTP_CELL, OTP_CELL_FIT, OTP_CELL_SIZE, OTP_CELL_WHOLE, OTP_ROOT, OTP_SEPARATOR } from '../classes.js'

const OWN = [OTP_CELL, OTP_CELL_FIT, OTP_CELL_WHOLE, OTP_ROOT, OTP_SEPARATOR, ...Object.values(OTP_CELL_SIZE)]
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

/** The rule of a class and the media query it sits in. */
const within = (cls: string) => {
  const at = css.indexOf(`${selectorOf(cls)} {`)
  return { rule: ruleOf(selectorOf(cls)), query: css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim() }
}

describe('every class of the code field paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(40)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the row', () => {
  it('is as wide as its cells and never wider than its parent, so it sits at the inline start', () => {
    expect(['flex', 'w-fit', 'min-w-0', 'max-w-full'].map((cls) => ruleOf(selectorOf(cls))))
      .toEqual(['display: flex;', 'width: fit-content;', 'min-width: 0px;', 'max-width: 100%;'])
  })

  it('wraps, so a parent under the floor of its cells gets a second line and never a sideways scroll', () => {
    expect(OTP_ROOT.split(' ')).toContain('flex-wrap')
    expect(ruleOf(selectorOf('flex-wrap'))).toBe('flex-wrap: wrap;')
  })
})

describe('a cell', () => {
  it('gives up width, never below the 24 px floor', () => {
    expect(['min-w-[var(--tc-target-min,24px)]', 'shrink'].map((cls) => ruleOf(selectorOf(cls))))
      .toEqual(['min-width: var(--tc-target-min,24px);', 'flex-shrink: 1;'])
  })

  it('up to eight items starts from the 24 px floor and grows to its cap, so a line breaks only where 24 px cells do not fit', () => {
    expect(OTP_CELL_FIT.split(' ').map((cls) => ruleOf(selectorOf(cls))))
      .toEqual(['flex-basis: var(--tc-target-min,24px);', 'flex-grow: 1;'])
  })

  it('past eight items fills up to its cap and never grows, so a line breaks at whole cells', () => {
    expect(OTP_CELL_WHOLE.split(' ').map((cls) => ruleOf(selectorOf(cls)))).toEqual(['width: 100%;', 'flex-grow: 0;'])
  })

  it('has no basis but the 24 px floor: a larger one is a floor a table cell counts (a css rule a mutation reaches)', () => {
    expect(OWN.join(' ').match(/\bbasis-\S+/g)).toEqual(['basis-[var(--tc-target-min,24px)]'])
    expect(css.match(/flex-basis: [^;]+;/g)).toEqual(['flex-basis: var(--tc-target-min,24px);'])
  })

  it('is a square of the control scale at each size, with its type step; custom draws none', () => {
    const sizes = Object.fromEntries(Object.entries(OTP_CELL_SIZE).filter(([size]) => size !== 'custom')
      .map(([size, classes]) => [size, classes.split(' ').slice(0, 2).map((cls) => ruleOf(selectorOf(cls)))]))
    const square = (rem: string) => [`height: calc(${rem}rem * var(--tc-density));`, `max-width: calc(${rem}rem * var(--tc-density));`]
    expect(sizes).toEqual({ xs: square('1.75'), sm: square('2'), md: square('2.5'), lg: square('3'), xl: square('3.5') })
    expect(OTP_CELL_SIZE.custom).toBe('')
  })

  it('under a coarse pointer the three small sizes may be 44 px wide, and typed text is never under 16 px', () => {
    expect(within('pointer-coarse:max-w-[var(--tc-target-coarse,44px)]'))
      .toEqual({ rule: 'max-width: var(--tc-target-coarse,44px);', query: '@media (pointer: coarse)' })
    expect(within('pointer-coarse:text-[max(1rem,16px)]')).toEqual({ rule: 'font-size: max(1rem, 16px);', query: '@media (pointer: coarse)' })
    expect(within('pointer-coarse:text-[max(1.125rem,16px)]')).toEqual({ rule: 'font-size: max(1.125rem, 16px);', query: '@media (pointer: coarse)' })
    expect(within('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'))
      .toEqual({ rule: 'min-height: var(--tc-target-coarse,44px);', query: '@media (pointer: coarse)' })
    for (const size of ['xs', 'sm', 'md'] as const) expect(OTP_CELL_SIZE[size], size).toContain('pointer-coarse:max-w-[var(--tc-target-coarse,44px)]')
    expect(OTP_CELL_SIZE.lg).not.toContain('pointer-coarse:max-w')
  })

  it('draws a field: the raised surface, the 3:1 line, the control radius, centred tabular digits', () => {
    expect(ruleOf(selectorOf('bg-surface-raised'))).toBe('background-color: var(--tc-surface-raised);')
    expect(ruleOf(selectorOf('border-line-strong'))).toBe('border-color: var(--tc-line-strong);')
    expect(ruleOf(selectorOf('rounded-control'))).toContain('border-radius:')
    expect(ruleOf(selectorOf('text-center'))).toBe('text-align: center;')
    expect(ruleOf(selectorOf('tabular-nums'))).toContain('--tw-numeric-spacing: tabular-nums;')
    expect(ruleOf(selectorOf('p-0'))).toBe('padding: 0px;')
  })

  it('invalid turns the line to danger and thickens it; under forced colours the border itself thickens', () => {
    expect(ruleOf(`${selectorOf('aria-invalid:border-danger-solid')}[aria-invalid="true"]`)).toBe('border-color: var(--tc-danger-solid);')
    expect(ruleOf(`${selectorOf('aria-invalid:inset-ring-danger-solid')}[aria-invalid="true"]`)).toBe('--tw-inset-ring-color: var(--tc-danger-solid);')
    expect(ruleOf(`${selectorOf('forced-colors:aria-invalid:border-(length:--tc-ring-width)')}[aria-invalid="true"]`))
      .toBe('border-style: var(--tw-border-style); border-width: var(--tc-ring-width);')
  })
})

describe('the separator', () => {
  it('is a 10 x 2 bar on the 3:1 line, and the text colour of the system under forced colours', () => {
    expect(['h-0.5', 'w-2.5', 'shrink-0', 'bg-line-strong'].map((cls) => ruleOf(selectorOf(cls))))
      .toEqual(['height: calc(var(--spacing) * 0.5);', 'width: calc(var(--spacing) * 2.5);', 'flex-shrink: 0;', 'background-color: var(--tc-line-strong);'])
    expect(within('forced-colors:bg-[CanvasText]')).toEqual({ rule: 'background-color: CanvasText;', query: '@media (forced-colors: active)' })
  })
})
