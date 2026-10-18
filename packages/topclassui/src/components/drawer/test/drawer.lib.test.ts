import { describe, expect, it } from 'vitest'

import { firstFocusOf, isSideSheet, toSwipeDirection } from '../lib.js'

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

describe('firstFocusOf', () => {
  /** A stand-in sheet with the two heights firstFocusOf reads. */
  const sheetOf = (scrollHeight: number, clientHeight: number) => ({ scrollHeight, clientHeight }) as HTMLElement

  it('is true, the first control, for a keyboard, a mouse or a pen on a sheet that does not scroll', () => {
    const sheet = sheetOf(400, 400)
    expect([firstFocusOf(sheet, 'keyboard'), firstFocusOf(sheet, 'mouse'), firstFocusOf(sheet, 'pen'), firstFocusOf(sheet, '')]).toEqual([true, true, true, true])
  })

  it('is the sheet itself after a touch, so no virtual keyboard rises', () => {
    const sheet = sheetOf(400, 400)
    expect(firstFocusOf(sheet, 'touch')).toBe(sheet)
  })

  it('is the sheet itself while the sheet scrolls, so its top stays in view, and true within the one pixel of rounding', () => {
    const tall = sheetOf(2400, 256)
    expect(firstFocusOf(tall, 'keyboard')).toBe(tall)
    expect(firstFocusOf(sheetOf(401, 400), 'keyboard')).toBe(true)
    expect(firstFocusOf(sheetOf(402, 400), 'keyboard')).not.toBe(true)
  })

  it('is true with no sheet yet, and null after a touch with none', () => {
    expect(firstFocusOf(null, 'keyboard')).toBe(true)
    expect(firstFocusOf(null, 'touch')).toBeNull()
  })
})
