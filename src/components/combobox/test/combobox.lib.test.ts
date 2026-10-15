import { describe, expect, it } from 'vitest'

import { isAppended, keyOfOption, optionAccessors, revealTop } from '../lib.js'

const A = { value: 'a', label: 'Alpha' }
const B = { value: 'b', label: 'Bravo' }
const C = { value: 'c', label: 'Charlie' }

describe('revealTop: a mounted row brought whole into a list of 280 px, 6 px inside its edge', () => {
  it('a row in view moves nothing', () => {
    expect(revealTop(1006, 40, 972, 280, 6)).toBe(972)
  })

  it('a row cut by the top edge goes to the top, 6 px in', () => {
    expect(revealTop(726, 40, 972, 280, 6)).toBe(720)
  })

  it('a row cut by the bottom edge goes to the bottom, 6 px in', () => {
    expect(revealTop(1206, 40, 972, 280, 6)).toBe(972)
    expect(revealTop(1246, 40, 972, 280, 6)).toBe(1012)
  })

  it('the first row lands at 0, never below it', () => {
    expect(revealTop(6, 40, 400, 280, 6)).toBe(0)
    expect(revealTop(2, 40, 400, 280, 6)).toBe(0)
  })
})

describe('isAppended: a page arrived, or the query changed', () => {
  it('options added at the end, the rest the same objects', () => {
    expect(isAppended([A, B], [A, B, C])).toBe(true)
  })

  it('the same list, a shorter one, or one with another first option', () => {
    expect(isAppended([A, B], [A, B])).toBe(false)
    expect(isAppended([A, B], [A])).toBe(false)
    expect(isAppended([A, B], [B, A, C])).toBe(false)
    expect(isAppended([A, B], [{ ...A }, B, C])).toBe(false)
  })
})

describe('how an option is read', () => {
  it('its value is its key and what is chosen, its label what is shown', () => {
    expect(keyOfOption(B)).toBe('b')
    expect(optionAccessors.getValue(C)).toBe('c')
    expect(optionAccessors.getLabel(C)).toBe('Charlie')
  })
})
