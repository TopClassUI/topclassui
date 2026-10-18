import { describe, expect, it } from 'vitest'

import { clampDuration, toBaseOptions } from './toast.js'

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
