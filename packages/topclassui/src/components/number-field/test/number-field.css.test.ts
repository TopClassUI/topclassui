/** A class list cannot show that a class compiles or what it resolves to, so this compiles the real entry with
 * every class of the field's own strings and reads the rule of each one. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { NUMBER_FIELD_DECREASE, NUMBER_FIELD_GROUP, NUMBER_FIELD_INPUT, NUMBER_FIELD_ROOT, NUMBER_FIELD_STEP } from '../classes.js'

const OWN = [NUMBER_FIELD_ROOT, NUMBER_FIELD_GROUP, NUMBER_FIELD_INPUT, NUMBER_FIELD_STEP, NUMBER_FIELD_DECREASE]
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

/** The full selector of the rule a class starts, up to its brace. */
const selectorLine = (cls: string) => {
  const at = css.indexOf(selectorOf(cls))
  return at === -1 ? '' : css.slice(at, css.indexOf('{', at)).trim()
}

describe('every class of the field paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(50)
  })

  it('finds each one in the sheet but the group marker, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => cls !== 'group/number' && !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the root owns the width', () => {
  it('is an inline grid of one column that may shrink to nothing and grows to an Input', () => {
    expect(ruleOf(selectorOf('inline-grid'))).toBe('display: inline-grid;')
    expect(ruleOf(selectorOf('grid-cols-[minmax(0,var(--tc-input-width))]'))).toBe('grid-template-columns: minmax(0,var(--tc-input-width));')
    expect(ruleOf(selectorOf('w-fit'))).toBe('width: fit-content;')
  })
})

describe('the box', () => {
  it('rings while the input inside it has the focus, and dims as a whole when disabled', () => {
    expect(selectorLine('has-focus-visible:outline-solid')).toBe('.has-focus-visible\\:outline-solid:has(:focus-visible)')
    expect(ruleOf(`${selectorOf('data-disabled:opacity-50')}[data-disabled]`)).toBe('opacity: 50%;')
  })

  it('dims as a whole when a disabled fieldset disables its input, and not when only a stepper at its limit is disabled', () => {
    expect(selectorLine('has-[input:disabled]:opacity-50')).toBe('.has-\\[input\\:disabled\\]\\:opacity-50:has(:is(input:disabled))')
    expect(ruleOf(selectorLine('has-[input:disabled]:opacity-50'))).toBe('opacity: 50%;')
  })

  it('turns to danger and thickens while the input inside it is invalid', () => {
    expect(selectorLine('has-aria-invalid:border-danger-solid')).toBe('.has-aria-invalid\\:border-danger-solid:has([aria-invalid="true"])')
  })
})

describe('the input and the steppers', () => {
  it('reach over the line of the box, so on touch they are 44 px and not 42', () => {
    expect(ruleOf(selectorOf('-my-(--tc-line-width)'))).toBe('margin-block: calc(var(--tc-line-width) * -1);')
  })

  it('the number is centred, in figures of one width', () => {
    expect(ruleOf(selectorOf('text-center'))).toBe('text-align: center;')
    expect(ruleOf(selectorOf('tabular-nums'))).toContain('--tw-numeric-spacing: tabular-nums;')
  })

  it('a stepper is four fifths as wide as tall but gives way to its floor before it is cut, and keeps full opacity inside a disabled box', () => {
    expect(ruleOf(selectorOf('aspect-4/5'))).toBe('aspect-ratio: 4/5;')
    expect(ruleOf(selectorOf('shrink'))).toBe('flex-shrink: 1;')
    expect(NUMBER_FIELD_STEP.split(' ')).not.toContain('shrink-0')
    expect(selectorLine('group-data-disabled/number:disabled:opacity-100')).toMatch(/:is\(:where\(\.group\\\/number\)\[data-disabled\] \*\):disabled$/)
    expect(ruleOf(selectorLine('group-data-disabled/number:disabled:opacity-100'))).toBe('opacity: 100%;')
    expect(selectorLine('group-has-[input:disabled]/number:disabled:opacity-100')).toContain(String.raw`:where(.group\/number):has(:is(input:disabled)) *):disabled`)
    expect(ruleOf(selectorLine('group-has-[input:disabled]/number:disabled:opacity-100'))).toBe('opacity: 100%;')
  })

  it('decrease comes after the input in the markup and before it on screen', () => {
    expect(ruleOf(selectorOf('order-first'))).toBe('order: -9999;')
  })

  it('a read-only stepper is dimmed by name and takes no pointer, so no hover is painted on it', () => {
    expect(ruleOf(`${selectorOf('data-readonly:opacity-50')}[data-readonly]`)).toBe('opacity: 50%;')
    expect(ruleOf(`${selectorOf('data-readonly:pointer-events-none')}[data-readonly]`)).toBe('pointer-events: none;')
  })

  it('a disabled input shows not-allowed, which the browser would have made the arrow; the box around it does the dimming', () => {
    expect(NUMBER_FIELD_INPUT.split(' ')).toEqual(expect.arrayContaining(['disabled:cursor-not-allowed', 'aria-disabled:cursor-not-allowed', 'data-disabled:cursor-not-allowed']))
    expect(ruleOf(`${selectorOf('disabled:cursor-not-allowed')}:disabled`)).toBe('cursor: not-allowed;')
    expect(NUMBER_FIELD_INPUT).not.toContain('opacity')
  })
})
