import { describe, expect, it } from 'vitest'

import { TOAST_BOUNDARIES } from '../boundaries.js'
import { TOAST_DEFAULTS, TOAST_PRIORITIES, TOAST_TONES } from '../constants.js'
import { toastSchema } from '../schema.js'

describe('the options of toast.add', () => {
  it('default to a neutral toast of low priority, and leave the duration to the provider', () => {
    expect(toastSchema.parse({})).toEqual({ tone: 'neutral', priority: 'low' })
    expect(TOAST_DEFAULTS).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000, tone: 'neutral', priority: 'low' })
  })

  it('take the six shared tones and the two priorities of Base UI', () => {
    expect(TOAST_TONES).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
    expect(TOAST_PRIORITIES).toEqual(['low', 'high'])
  })

  it('bound the duration by the very numbers the provider clamps to: 0 to ten minutes', () => {
    expect(TOAST_BOUNDARIES).toEqual({ limitMin: 1, limitMax: 10, durationMin: 0, durationMax: 600000 })
    expect(toastSchema.safeParse({ duration: 0 }).success).toBe(true)
    expect(toastSchema.safeParse({ duration: 600000 }).success).toBe(true)
    expect(toastSchema.safeParse({ duration: 600001 }).success).toBe(false)
    expect(toastSchema.safeParse({ duration: -1 }).success).toBe(false)
  })
})
