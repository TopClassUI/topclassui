/** A class list cannot show that a class compiles or what it resolves to, so this compiles the real entry with
 * every class of the radio group's own strings and reads the rule of each one. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { RADIO_BOX, RADIO_DOT, RADIO_GROUP, RADIO_ITEM, RADIO_ITEM_TEXT, RADIO_LABEL, RADIO_SIZE, RADIO_TARGET } from '../classes.js'

const OWN = [RADIO_BOX, RADIO_DOT, RADIO_ITEM, RADIO_LABEL, RADIO_TARGET, ...Object.values(RADIO_GROUP), ...Object.values(RADIO_ITEM_TEXT), ...Object.values(RADIO_SIZE)]
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
const INVALID = ':is(:where(.group\\/radios)[aria-invalid="true"] *)'
const INSET = '--tw-inset-ring-shadow: inset 0 0 0 calc(var(--tc-ring-width) - var(--tc-line-width)) var(--tw-inset-ring-color, currentcolor);'

describe('every class of the radio group paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(50)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the circle', () => {
  it('is round in every mode (choice 13), on the raised surface, and its dot takes the primary colour from it', () => {
    expect(ruleOf(selectorOf('rounded-full'))).toBe('border-radius: calc(infinity * 1px);')
    expect(ruleOf(selectorOf('bg-surface-raised'))).toBe('background-color: var(--tc-surface-raised);')
    expect(ruleOf(selectorOf('text-primary-on-soft'))).toBe('color: var(--tc-primary-on-soft);')
  })

  it('is a circle of the toggle scale at each size, and custom draws none', () => {
    const sizes = Object.fromEntries(Object.entries(RADIO_SIZE).filter(([size]) => size !== 'custom')
      .map(([size, cls]) => [size, ruleOf(selectorOf(cls))]))
    const square = (rem: string) => `width: calc(${rem}rem * var(--tc-density)); height: calc(${rem}rem * var(--tc-density));`
    expect(sizes).toEqual({ xs: square('1'), sm: square('1.25'), md: square('1.5'), lg: square('1.75'), xl: square('2') })
    expect(RADIO_SIZE.custom).toBe('')
  })

  it('checked: the line turns primary and an inset ring makes it 2 px; the fill does not change', () => {
    expect(ruleOf(`${selectorOf('group-data-checked/toggle:border-primary-on-soft')}${CHECKED}`)).toBe('border-color: var(--tc-primary-on-soft);')
    expect(ruleOf(`${selectorOf('group-data-checked/toggle:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]')}${CHECKED}`)).toContain(INSET)
    expect(ruleOf(`${selectorOf('group-data-checked/toggle:inset-ring-primary-on-soft')}${CHECKED}`)).toBe('--tw-inset-ring-color: var(--tc-primary-on-soft);')
    expect(RADIO_BOX).not.toMatch(/group-data-checked\/toggle:bg-/)
  })
})

describe('invalid sits on the group (RADIO_INVALID)', () => {
  it('every circle of an invalid group turns to danger, checked or not, and its line thickens', () => {
    expect(ruleOf(`${selectorOf('group-aria-invalid/radios:border-danger-solid')}${INVALID}`)).toBe('border-color: var(--tc-danger-solid);')
    expect(ruleOf(`${selectorOf('group-aria-invalid/radios:group-data-checked/toggle:border-danger-solid')}${INVALID}${CHECKED}`))
      .toBe('border-color: var(--tc-danger-solid);')
    expect(ruleOf(`${selectorOf('group-aria-invalid/radios:group-data-checked/toggle:inset-ring-danger-solid')}${INVALID}${CHECKED}`))
      .toBe('--tw-inset-ring-color: var(--tc-danger-solid);')
    expect(ruleOf(`${selectorOf('group-aria-invalid/radios:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]')}${INVALID}`)).toContain(INSET)
  })

  it('under forced colours, where a box-shadow is not painted, the border itself thickens', () => {
    const cls = 'forced-colors:group-aria-invalid/radios:border-(length:--tc-ring-width)'
    const at = css.indexOf(`${selectorOf(cls)}${INVALID} {`)
    expect(ruleOf(`${selectorOf(cls)}${INVALID}`)).toBe('border-style: var(--tw-border-style); border-width: var(--tc-ring-width);')
    expect(css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim()).toBe('@media (forced-colors: active)')
  })
})

describe('the layout', () => {
  it('a column, or a row that wraps; both shrink inside their parent', () => {
    expect(RADIO_GROUP.vertical.split(' ')).toEqual(expect.arrayContaining(['group/radios', 'flex-col', 'min-w-0', 'max-w-full']))
    expect(RADIO_GROUP.horizontal.split(' ')).toEqual(expect.arrayContaining(['group/radios', 'flex-row', 'flex-wrap', 'min-w-0', 'max-w-full']))
    expect(ruleOf(selectorOf('flex-wrap'))).toBe('flex-wrap: wrap;')
  })

  it('the text wraps anywhere, and dims with a disabled radio before it', () => {
    expect(ruleOf(selectorOf('wrap-anywhere'))).toBe('overflow-wrap: anywhere;')
    expect(ruleOf(`${selectorOf('peer-disabled:opacity-50')}:is(:where(.peer):disabled ~ *)`)).toBe('opacity: 50%;')
    expect(RADIO_TARGET.startsWith('peer group/toggle ')).toBe(true)
  })

  it('the dot is centred in the circle', () => {
    expect(RADIO_DOT).toBe('flex size-full items-center justify-center')
  })
})
