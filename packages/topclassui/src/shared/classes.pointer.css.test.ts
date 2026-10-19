/** POINTER as a list cannot show that each class compiles or which state it is scoped to, so this compiles the real
 * entry with it and reads the sheet: the hand at rest, the arrow on each mark of a control that cannot be pressed. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { ICON_BUTTON, POINTER, ROW, TOGGLE_TARGET } from './classes.js'

const HAND = [
  'cursor-pointer', 'disabled:cursor-default', 'aria-disabled:cursor-default', 'data-disabled:cursor-default',
  'data-readonly:cursor-default', 'data-loading:cursor-default',
]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(HAND)
})

const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

const ruleOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim()
}

describe('the hand on whatever a pointer can press', () => {
  it('is the hand, then the arrow on disabled, aria-disabled, data-disabled, data-readonly and data-loading', () => {
    expect(POINTER.split(' ')).toEqual(HAND)
  })

  it('paints the hand at rest', () => {
    expect(ruleOf(selectorOf('cursor-pointer'))).toBe('cursor: pointer;')
  })

  for (const [cls, state] of [
    ['disabled:cursor-default', ':disabled'],
    ['aria-disabled:cursor-default', '[aria-disabled="true"]'],
    ['data-disabled:cursor-default', '[data-disabled]'],
    ['data-readonly:cursor-default', '[data-readonly]'],
    ['data-loading:cursor-default', '[data-loading]'],
  ] as const) {
    it(`gives the arrow back on ${state} and nowhere else`, () => {
      expect(ruleOf(`${selectorOf(cls)}${state}`)).toBe('cursor: default;')
      expect(ruleOf(selectorOf(cls))).toBe('')
    })
  }

  it('is worn by the icon button, the row of a menu or a list, and the target of a toggle', () => {
    for (const constant of [ICON_BUTTON, ROW, TOGGLE_TARGET]) {
      expect(HAND.filter((cls) => !constant.split(' ').includes(cls))).toEqual([])
    }
  })
})
