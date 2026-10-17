import { describe, expect, it } from 'vitest'

import { controlOf, controlsOf } from './controls.js'

describe('controlOf', () => {
  it('makes an enum of three values or fewer a segmented control', () => {
    expect(controlOf('orientation', { type: 'string', enum: ['horizontal', 'vertical'], default: 'horizontal' }))
      .toEqual({ prop: 'orientation', kind: 'segmented', options: ['horizontal', 'vertical'], default: 'horizontal' })
  })

  it('makes a longer enum a select', () => {
    expect(controlOf('tone', { type: 'string', enum: ['neutral', 'primary', 'success', 'warning'], default: 'neutral' }))
      .toEqual({ prop: 'tone', kind: 'select', options: ['neutral', 'primary', 'success', 'warning'], default: 'neutral' })
  })

  it('leaves custom out of the size control only', () => {
    expect(controlOf('size', { type: 'string', enum: ['xs', 'sm', 'md', 'lg', 'xl', 'custom'], default: 'md' }))
      .toEqual({ prop: 'size', kind: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md' })
    expect(controlOf('width', { type: 'string', enum: ['auto', 'custom'], default: 'auto' }))
      .toEqual({ prop: 'width', kind: 'segmented', options: ['auto', 'custom'], default: 'auto' })
  })

  it('makes a boolean a switch, off when the schema has no default', () => {
    expect(controlOf('loading', { type: 'boolean', default: false })).toEqual({ prop: 'loading', kind: 'switch', default: false })
    expect(controlOf('open', { type: 'boolean' })).toEqual({ prop: 'open', kind: 'switch', default: false })
  })

  it('makes a bounded integer a slider with a step of one', () => {
    expect(controlOf('visibleRows', { type: 'integer', minimum: 1, maximum: 50, default: 7 }))
      .toEqual({ prop: 'visibleRows', kind: 'slider', min: 1, max: 50, step: 1, default: 7 })
  })

  it('makes a bounded number a continuous slider, and keeps a missing default as null', () => {
    expect(controlOf('firstDayOfWeek', { type: 'number', minimum: 0, maximum: 6 }))
      .toEqual({ prop: 'firstDayOfWeek', kind: 'slider', min: 0, max: 6, step: null, default: null })
  })

  it('makes a number without both bounds a number field', () => {
    expect(controlOf('duration', { type: 'number', minimum: 0, default: 5000 }))
      .toEqual({ prop: 'duration', kind: 'number', min: 0, max: null, step: null, default: 5000 })
  })

  it('keeps a slider up to a span of 10000, and makes a guard-rail range a bounded number field', () => {
    expect(controlOf('delay', { type: 'number', minimum: 0, maximum: 10000, default: 600 }))
      .toEqual({ prop: 'delay', kind: 'slider', min: 0, max: 10000, step: null, default: 600 })
    expect(controlOf('pageCount', { type: 'integer', minimum: 1, maximum: 9007199254740991 }))
      .toEqual({ prop: 'pageCount', kind: 'number', min: 1, max: 9007199254740991, step: 1, default: null })
  })

  it('offers no control for a free string or a union', () => {
    expect(controlOf('minDate', { type: 'string', default: '' })).toBeNull()
    expect(controlOf('maxLength', {})).toBeNull()
  })
})

describe('controlsOf', () => {
  it('keeps the schema order and drops the props with no control', () => {
    const json = {
      properties: {
        variant: { type: 'string', enum: ['solid', 'soft'], default: 'solid' },
        label: { type: 'string' },
        disabled: { type: 'boolean', default: false },
      },
    }
    expect(controlsOf(json).map((control) => `${control.prop}:${control.kind}`)).toEqual(['variant:segmented', 'disabled:switch'])
  })

  it('returns nothing for a schema with no properties', () => {
    expect(controlsOf({})).toEqual([])
  })
})
