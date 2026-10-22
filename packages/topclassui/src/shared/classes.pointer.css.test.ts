/** POINTER as a list cannot show that each class compiles or which state it is scoped to, so this compiles the real
 * entry with it and reads the sheet: the hand at rest, not-allowed on each mark of a disabled control, the arrow on
 * read-only and loading, and a hover or a press that skips a disabled control. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry, declarationIndex } from '#test/stylesheet.js'
import { DISABLED, ICON_BUTTON, NOT_ALLOWED, POINTER, ROW, TOGGLE_TARGET } from './classes.js'

const OFF = ['disabled:cursor-not-allowed', 'aria-disabled:cursor-not-allowed', 'data-disabled:cursor-not-allowed']
const HAND = ['cursor-pointer', ...OFF, 'data-readonly:cursor-default', 'data-loading:cursor-default']
const PRESS = ['hover:bg-(--tc-soft)', 'active:bg-(--tc-soft-hover)']

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build([...HAND, ...PRESS])
})

const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

const ruleOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim()
}

/** Written out, so a guard dropped from styles.css is a failure here: no specificity, and all three marks. */
const SKIP_DISABLED = ':not(:where(:disabled, [aria-disabled="true"], [data-disabled]))'

describe('the hand on whatever a pointer can press', () => {
  it('is not-allowed on disabled, aria-disabled and data-disabled', () => {
    expect(NOT_ALLOWED.split(' ')).toEqual(OFF)
  })

  it('is the hand, not-allowed on the three disabled marks, then the arrow on data-readonly and data-loading', () => {
    expect(POINTER.split(' ')).toEqual(HAND)
  })

  it('paints the hand at rest', () => {
    expect(ruleOf(selectorOf('cursor-pointer'))).toBe('cursor: pointer;')
  })

  for (const [cls, state, cursor] of [
    ['disabled:cursor-not-allowed', ':disabled', 'not-allowed'],
    ['aria-disabled:cursor-not-allowed', '[aria-disabled="true"]', 'not-allowed'],
    ['data-disabled:cursor-not-allowed', '[data-disabled]', 'not-allowed'],
    ['data-readonly:cursor-default', '[data-readonly]', 'default'],
    ['data-loading:cursor-default', '[data-loading]', 'default'],
  ] as const) {
    it(`paints ${cursor} on ${state} and nowhere else`, () => {
      expect(ruleOf(`${selectorOf(cls)}${state}`)).toBe(`cursor: ${cursor};`)
      expect(ruleOf(selectorOf(cls))).toBe('')
    })
  }

  // A loading Button is a disabled button too: the arrow wins only because its rule is emitted later.
  it('emits the arrow of loading after every not-allowed, so a loading button never shows not-allowed', () => {
    const loading = declarationIndex(css, '.data-loading\\:cursor-default[data-loading]', 'cursor')
    for (const [cls, state] of [
      ['disabled:cursor-not-allowed', ':disabled'],
      ['aria-disabled:cursor-not-allowed', '[aria-disabled="true"]'],
      ['data-disabled:cursor-not-allowed', '[data-disabled]'],
    ] as const) {
      const off = declarationIndex(css, `${selectorOf(cls)}${state}`, 'cursor')
      expect(off, cls).toBeGreaterThan(-1)
      expect(loading, cls).toBeGreaterThan(off)
    }
  })

  it('is worn by the icon button, the row of a menu or a list, and the target of a toggle', () => {
    for (const constant of [ICON_BUTTON, ROW, TOGGLE_TARGET]) {
      expect(HAND.filter((cls) => !constant.split(' ').includes(cls))).toEqual([])
    }
  })

  it('comes with the dimming of every disabled control, and no pointer block that would hide it', () => {
    expect(DISABLED.split(' ')).toEqual(['disabled:opacity-50', 'data-disabled:opacity-50', ...OFF])
  })
})

describe('a disabled control keeps its pointer events, so a hover or a press must skip it', () => {
  it('guards the hover of the media query with all three marks, at no specificity', () => {
    expect(ruleOf(`${selectorOf('hover:bg-(--tc-soft)')}:hover${SKIP_DISABLED}`)).toBe('background-color: var(--tc-soft);')
    expect(css).not.toContain(`${selectorOf('hover:bg-(--tc-soft)')}:hover {`)
  })

  it('guards the press the same way', () => {
    expect(ruleOf(`${selectorOf('active:bg-(--tc-soft-hover)')}:active${SKIP_DISABLED}`)).toBe('background-color: var(--tc-soft-hover);')
    expect(css).not.toContain(`${selectorOf('active:bg-(--tc-soft-hover)')}:active {`)
  })

  it('leaves the forced attributes the docs draw a state with alone', () => {
    expect(ruleOf(`${selectorOf('hover:bg-(--tc-soft)')}[data-hover]`)).toBe('background-color: var(--tc-soft);')
    expect(ruleOf(`${selectorOf('active:bg-(--tc-soft-hover)')}[data-active]`)).toBe('background-color: var(--tc-soft-hover);')
  })
})
