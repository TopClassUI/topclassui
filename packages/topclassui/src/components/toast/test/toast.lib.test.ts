import { describe, expect, it } from 'vitest'

import { clampDuration, iconTypeOf, toBaseOptions, toSwipeDirections } from '../lib.js'

describe('clampDuration (R-5.7-7)', () => {
  it('keeps a duration inside the bounds as it is', () => {
    expect(clampDuration(0)).toBe(0)
    expect(clampDuration(1200)).toBe(1200)
    expect(clampDuration(600000)).toBe(600000)
  })

  it('clamps above ten minutes and below zero', () => {
    expect(clampDuration(9_000_000_000)).toBe(600000)
    expect(clampDuration(Infinity)).toBe(600000)
    expect(clampDuration(-5)).toBe(0)
  })

  it('drops a duration that is no number, so the provider duration applies rather than 0, which never closes', () => {
    expect(clampDuration(Number.NaN)).toBeUndefined()
  })
})

describe('toBaseOptions: our names to Base UI\'s', () => {
  it('maps tone to type, duration to timeout, and action to actionProps', () => {
    const onClick = () => undefined
    expect(toBaseOptions({ tone: 'success', title: 'Saved', description: 'Done.', duration: 1200, priority: 'high', action: { label: 'Undo', onClick } }))
      .toEqual({ type: 'success', title: 'Saved', description: 'Done.', timeout: 1200, priority: 'high', actionProps: { children: 'Undo', onClick } })
  })

  it('leaves out every key that was left out, so an update changes only what it names', () => {
    expect(toBaseOptions({})).toEqual({})
    expect(toBaseOptions({ title: 'Uploaded' })).toEqual({ title: 'Uploaded' })
    expect(Object.keys(toBaseOptions({ title: 'Uploaded' }))).toEqual(['title'])
  })

  it('clamps the duration on its way to the timeout', () => {
    expect(toBaseOptions({ duration: 9_000_000_000 })).toEqual({ timeout: 600000 })
    expect(toBaseOptions({ duration: -1 })).toEqual({ timeout: 0 })
    expect(toBaseOptions({ duration: Number.NaN })).toEqual({})
  })
})

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
