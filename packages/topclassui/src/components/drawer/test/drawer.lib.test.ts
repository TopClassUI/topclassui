import { describe, expect, it } from 'vitest'

import { isSideSheet, toSwipeDirection } from '../lib.js'

// Base UI's swipeDirection is physical. Each of the eight answers is written out: none is worked out from another.
describe('the swipe that closes a sheet leaves by the edge the sheet came from', () => {
  it('ltr: an end sheet stands at the right, so it closes by a swipe right', () => {
    expect(toSwipeDirection('end', 'ltr')).toBe('right')
  })

  it('rtl: an end sheet stands at the left, so it closes by a swipe left', () => {
    expect(toSwipeDirection('end', 'rtl')).toBe('left')
  })

  it('ltr: a start sheet stands at the left, so it closes by a swipe left', () => {
    expect(toSwipeDirection('start', 'ltr')).toBe('left')
  })

  it('rtl: a start sheet stands at the right, so it closes by a swipe right', () => {
    expect(toSwipeDirection('start', 'rtl')).toBe('right')
  })

  it('a top sheet closes by a swipe up, in either direction', () => {
    expect(toSwipeDirection('top', 'ltr')).toBe('up')
    expect(toSwipeDirection('top', 'rtl')).toBe('up')
  })

  it('a bottom sheet closes by a swipe down, in either direction', () => {
    expect(toSwipeDirection('bottom', 'ltr')).toBe('down')
    expect(toSwipeDirection('bottom', 'rtl')).toBe('down')
  })

  it('the two inline sheets never close the same way on one page', () => {
    expect([toSwipeDirection('start', 'ltr'), toSwipeDirection('end', 'ltr')]).toEqual(['left', 'right'])
    expect([toSwipeDirection('start', 'rtl'), toSwipeDirection('end', 'rtl')]).toEqual(['right', 'left'])
  })
})

describe('size sets the width of the two sheets that stand on an inline edge', () => {
  it('start and end are side sheets', () => {
    expect([isSideSheet('start'), isSideSheet('end')]).toEqual([true, true])
  })

  it('top and bottom are not: they span the screen', () => {
    expect([isSideSheet('top'), isSideSheet('bottom')]).toEqual([false, false])
  })
})
