import { describe, expect, it } from 'vitest'

import { iconTypeOf, toSwipeDirections } from '../lib.js'

describe('iconTypeOf', () => {
  it('names the six types that draw an icon', () => {
    expect(['success', 'danger', 'error', 'warning', 'info', 'loading'].map(iconTypeOf))
      .toEqual(['success', 'danger', 'error', 'warning', 'info', 'loading'])
  })

  it('gives null for neutral, primary, a type of the caller and none', () => {
    expect(['neutral', 'primary', 'custom', 'toString', undefined].map(iconTypeOf)).toEqual([null, null, null, null, null])
  })
})

describe('toSwipeDirections (R-5.3-4): toward the block edge, and toward the inline edge the toast sits at', () => {
  it('left to right', () => {
    expect(toSwipeDirections('top-start', 'ltr')).toEqual(['up', 'left'])
    expect(toSwipeDirections('top', 'ltr')).toEqual(['up'])
    expect(toSwipeDirections('top-end', 'ltr')).toEqual(['up', 'right'])
    expect(toSwipeDirections('bottom-start', 'ltr')).toEqual(['down', 'left'])
    expect(toSwipeDirections('bottom', 'ltr')).toEqual(['down'])
    expect(toSwipeDirections('bottom-end', 'ltr')).toEqual(['down', 'right'])
  })

  it('right to left: start and end swap sides, the block edge does not', () => {
    expect(toSwipeDirections('top-start', 'rtl')).toEqual(['up', 'right'])
    expect(toSwipeDirections('top', 'rtl')).toEqual(['up'])
    expect(toSwipeDirections('top-end', 'rtl')).toEqual(['up', 'left'])
    expect(toSwipeDirections('bottom-start', 'rtl')).toEqual(['down', 'right'])
    expect(toSwipeDirections('bottom', 'rtl')).toEqual(['down'])
    expect(toSwipeDirections('bottom-end', 'rtl')).toEqual(['down', 'left'])
  })
})
