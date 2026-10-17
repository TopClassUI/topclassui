/** A class list cannot show that a class compiles or which rule wins, so this compiles the real entry with
 * every class of the toggle constants and reads the sheet: the group a state is read from, and the order. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { TOGGLE_BOX, TOGGLE_INVALID, TOGGLE_ON, TOGGLE_RING, TOGGLE_TARGET } from './classes.js'

const CONSTANTS = { TOGGLE_TARGET, TOGGLE_RING, TOGGLE_BOX, TOGGLE_ON, TOGGLE_INVALID }

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

const FOCUSED = ':is(:where(.group\\/toggle):focus-visible *)'
const CHECKED = ':is(:where(.group\\/toggle)[data-checked] *)'
const INVALID = ':is(:where(.group\\/toggle)[aria-invalid="true"] *)'

describe('every class of every toggle constant paints something', () => {
  it('read five constants and their classes, so an empty list cannot pass', () => {
    expect(Object.keys(CONSTANTS)).toHaveLength(5)
    expect(CLASSES.length).toBeGreaterThan(30)
  })

  it('finds each one in the sheet, the group marker inside the selectors that read it, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
    expect(css).not.toContain(`${selectorOf('group/toggle')} {`)
  })
})

describe('the box reads the target it sits in', () => {
  it('draws the ring on a descendant of the focused target, also when the focus is forced for the docs', () => {
    expect(ruleOf(`${selectorOf('group-focus-visible/toggle:outline-solid')}${FOCUSED}`)).toContain('outline-style: solid;')
    expect(ruleOf(`${selectorOf('group-focus-visible/toggle:outline-solid')}:is(:where(.group\\/toggle)[data-focus-visible] *)`))
      .toContain('outline-style: solid;')
    expect(ruleOf(`${selectorOf('group-focus-visible/toggle:outline-(length:--tc-ring-width)')}${FOCUSED}`))
      .toContain('outline-width: var(--tc-ring-width);')
    expect(ruleOf(`${selectorOf('group-focus-visible/toggle:outline-offset-(length:--tc-ring-offset)')}${FOCUSED}`))
      .toBe('outline-offset: var(--tc-ring-offset);')
    expect(ruleOf(`${selectorOf('group-focus-visible/toggle:outline-ring')}${FOCUSED}`)).toBe('outline-color: var(--tc-ring);')
  })

  it('paints the ring CanvasText under forced colours, after the author ring, so a filled box that opts out keeps the user palette', () => {
    const forced = `${selectorOf('forced-colors:group-focus-visible/toggle:outline-[CanvasText]')}${FOCUSED}`
    expect(ruleOf(forced)).toBe('outline-color: CanvasText;')
    expect(css.slice(0, css.indexOf(`${forced} {`))).toMatch(/@media \(forced-colors: active\) \{\s*$/)
    expect(css.indexOf(`${forced} {`)).toBeGreaterThan(css.indexOf(`${selectorOf('group-focus-visible/toggle:outline-ring')}${FOCUSED} {`))
  })

  it('reads no bare group anywhere, which an accordion trigger around the toggle would match', () => {
    expect(css).not.toContain(':where(.group):')
    expect(css).not.toContain(':where(.group)[')
  })

  it('fills a checked box, and grows an invalid one by an inset ring of the ring width less the line', () => {
    expect(ruleOf(`${selectorOf('group-data-checked/toggle:bg-primary-solid')}${CHECKED}`)).toBe('background-color: var(--tc-primary-solid);')
    expect(ruleOf(`${selectorOf('group-aria-invalid/toggle:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]')}${INVALID}`))
      .toContain('inset 0 0 0 calc(var(--tc-ring-width) - var(--tc-line-width))')
  })
})

describe('under forced colours, where a checked box opts out of the user palette', () => {
  /** The at-rule a selector's rule sits in. */
  const mediaOf = (selector: string) => { const before = css.slice(0, css.indexOf(`${selector} {`)); return before.slice(before.lastIndexOf('@media')).split('{')[0]?.trim() }
  const DISABLED = ':is(:where(.group\\/toggle):disabled *)'
  const invalid = `${selectorOf('forced-colors:group-aria-invalid/toggle:group-data-checked/toggle:border-[CanvasText]')}${INVALID}${CHECKED}`
  const disabled = `${selectorOf('forced-colors:group-disabled/toggle:group-data-checked/toggle:bg-[GrayText]')}${DISABLED}${CHECKED}`

  it('a checked box that is invalid has a CanvasText line, after the red one it replaces, and a zero inset ring', () => {
    expect(ruleOf(invalid)).toBe('border-color: CanvasText;')
    expect(mediaOf(invalid)).toBe('@media (forced-colors: active)')
    expect(css.indexOf(`${invalid} {`)).toBeGreaterThan(css.indexOf(`${selectorOf('group-aria-invalid/toggle:group-data-checked/toggle:border-danger-solid')}${INVALID}${CHECKED} {`))
    expect(ruleOf(`${selectorOf('forced-colors:group-aria-invalid/toggle:inset-ring-0')}${INVALID}`)).toContain('--tw-inset-ring-shadow: inset 0 0 0 0px')
  })

  it('a checked box that is disabled, by the prop or a fieldset, is GrayText, after the Highlight it replaces', () => {
    expect(ruleOf(disabled)).toBe('background-color: GrayText;')
    expect(ruleOf(`${selectorOf('forced-colors:group-disabled/toggle:group-data-checked/toggle:border-[GrayText]')}${DISABLED}${CHECKED}`)).toBe('border-color: GrayText;')
    expect(mediaOf(disabled)).toBe('@media (forced-colors: active)')
    expect(css.indexOf(`${disabled} {`)).toBeGreaterThan(css.indexOf(`${selectorOf('forced-colors:group-data-checked/toggle:bg-[Highlight]')}${CHECKED} {`))
  })
})

describe('invalid wins over checked', () => {
  const invalid = `${selectorOf('group-aria-invalid/toggle:border-danger-solid')}${INVALID}`
  const checked = `${selectorOf('group-data-checked/toggle:border-primary-solid')}${CHECKED}`
  const both = `${selectorOf('group-aria-invalid/toggle:group-data-checked/toggle:border-danger-solid')}${INVALID}${CHECKED}`

  it('needs the compound class: alone, the red line comes first and the checked line, as specific, wins', () => {
    expect(css.indexOf(`${invalid} {`)).toBeGreaterThan(-1)
    expect(css.indexOf(`${checked} {`)).toBeGreaterThan(css.indexOf(`${invalid} {`))
  })

  it('which matches both states, so it is more specific than the checked line wherever it is emitted', () => {
    expect(ruleOf(both)).toBe('border-color: var(--tc-danger-solid);')
  })
})

describe('under forced colours', () => {
  const query = () => css.indexOf('@media (forced-colors: active)')
  const forced = (cls: string, state: string, declaration: string) =>
    css.indexOf(`${selectorOf(cls)}${state} {\n      ${declaration}`)

  it('a checked box opts out of the adjustment and paints the Highlight pair itself', () => {
    expect(query()).toBeGreaterThan(-1)
    for (const [cls, declaration] of [
      ['forced-colors:group-data-checked/toggle:forced-color-adjust-none', 'forced-color-adjust: none;'],
      ['forced-colors:group-data-checked/toggle:bg-[Highlight]', 'background-color: Highlight;'],
      ['forced-colors:group-data-checked/toggle:border-[Highlight]', 'border-color: Highlight;'],
      ['forced-colors:group-data-checked/toggle:text-[HighlightText]', 'color: HighlightText;'],
    ] as const) expect(forced(cls, CHECKED, declaration), cls).toBeGreaterThan(query())
  })

  it('an invalid line, whose inset ring is dropped there, grows to the ring width', () => {
    expect(forced('forced-colors:group-aria-invalid/toggle:border-(length:--tc-ring-width)', INVALID, 'border-style: var(--tw-border-style);'))
      .toBeGreaterThan(query())
    expect(css).toContain('border-width: var(--tc-ring-width);')
  })
})
