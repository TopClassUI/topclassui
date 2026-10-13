import { describe, expect, expectTypeOf, it } from 'vitest'
import { z } from 'zod'

import {
  TOAST_BOUNDARIES, TOAST_DEFAULTS, TOAST_PLACEMENTS, resolveToastSettings,
  type ToastPlacement, type ToastSettings, type ToastSettingsInput,
} from './toast.js'
import { type ToastSettingsSchemaInput, toastSettingsSchema } from './toast.schema.js'
import { TONES } from './tone.js'

describe('the toast contract, as docs/figma/unit-3.md writes it', () => {
  it('has six placements: a block edge, then start, the middle or end', () => {
    expect(TOAST_PLACEMENTS).toEqual(['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'])
  })

  it('names no physical side, so every placement mirrors in Arabic (R-5.3-4)', () => {
    expect(TOAST_PLACEMENTS.filter((name) => /left|right/.test(name))).toEqual([])
  })

  it('defaults to the bottom end corner, three toasts, five seconds and the neutral tone', () => {
    expect(TOAST_DEFAULTS).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000, tone: 'neutral' })
    expect(TONES).toContain(TOAST_DEFAULTS.tone)
  })

  it('bounds the limit to 1-10 and the duration to ten minutes, with 0 allowed', () => {
    expect(TOAST_BOUNDARIES).toEqual({ limitMin: 1, limitMax: 10, durationMin: 0, durationMax: 600000 })
  })
})

describe('resolveToastSettings', () => {
  it('returns the three defaults when nothing is passed, and leaves the tone to the component', () => {
    expect(resolveToastSettings()).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000 })
    expect(resolveToastSettings({})).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000 })
  })

  it('keeps the other two defaults when one key is passed', () => {
    expect(resolveToastSettings({ placement: 'top' })).toEqual({ placement: 'top', limit: 3, duration: 5000 })
    expect(resolveToastSettings({ limit: 5 })).toEqual({ placement: 'bottom-end', limit: 5, duration: 5000 })
    expect(resolveToastSettings({ duration: 8000 })).toEqual({ placement: 'bottom-end', limit: 3, duration: 8000 })
  })

  it('takes an explicit undefined for a missing key, which is what a spread of optional props passes', () => {
    expect(resolveToastSettings({ placement: undefined, limit: undefined, duration: undefined }))
      .toEqual({ placement: 'bottom-end', limit: 3, duration: 5000 })
  })

  it('clamps the limit at both ends', () => {
    expect(resolveToastSettings({ limit: 0 }).limit).toBe(1)
    expect(resolveToastSettings({ limit: -4 }).limit).toBe(1)
    expect(resolveToastSettings({ limit: 11 }).limit).toBe(10)
    expect(resolveToastSettings({ limit: 1000 }).limit).toBe(10)
    expect(resolveToastSettings({ limit: Number.POSITIVE_INFINITY }).limit).toBe(10)
  })

  it('keeps both ends of the limit range themselves', () => {
    expect(resolveToastSettings({ limit: 1 }).limit).toBe(1)
    expect(resolveToastSettings({ limit: 10 }).limit).toBe(10)
  })

  it('clamps the duration at both ends', () => {
    expect(resolveToastSettings({ duration: -1 }).duration).toBe(0)
    expect(resolveToastSettings({ duration: 600001 }).duration).toBe(600000)
    expect(resolveToastSettings({ duration: Number.POSITIVE_INFINITY }).duration).toBe(600000)
  })

  it('keeps a duration of 0, which means the toast stays until it is closed', () => {
    expect(resolveToastSettings({ duration: 0 }).duration).toBe(0)
    expect(resolveToastSettings({ duration: 600000 }).duration).toBe(600000)
  })

  it('cuts a fractional limit to a whole number of toasts, where Base UI would show one more', () => {
    expect(resolveToastSettings({ limit: 2.9 }).limit).toBe(2)
    expect(resolveToastSettings({ limit: 10.5 }).limit).toBe(10)
  })

  it('gives a NaN its default: Base UI reads one as no limit, and the minimum duration never closes', () => {
    expect(resolveToastSettings({ limit: Number.NaN, duration: Number.NaN })).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000 })
  })

  it('reads a number a JavaScript caller passed as a string, and gives a word the default', () => {
    const loose = { limit: '4', duration: 'soon' } as unknown as ToastSettingsInput
    expect(resolveToastSettings(loose)).toEqual({ placement: 'bottom-end', limit: 4, duration: 5000 })
  })

  it('gives a null the default, as it gives undefined', () => {
    const loose = { limit: null, duration: null, placement: null } as unknown as ToastSettingsInput
    expect(resolveToastSettings(loose)).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000 })
  })

  it('falls back to the default placement for a name outside the list, such as a physical side', () => {
    const loose = { placement: 'bottom-right' } as unknown as ToastSettingsInput
    expect(resolveToastSettings(loose).placement).toBe('bottom-end')
  })

  it('accepts every placement the list names', () => {
    expect(TOAST_PLACEMENTS.map((placement) => resolveToastSettings({ placement }).placement))
      .toEqual(['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'])
  })
})

describe('the schema says what the resolver does (R-5.7-7)', () => {
  const json = z.toJSONSchema(toastSettingsSchema, { io: 'input' }) as {
    properties?: Record<string, { description?: string; default?: unknown; minimum?: number; maximum?: number; enum?: unknown[]; type?: string }>
  }

  it('covers the three settings and no other', () => {
    expect(Object.keys(toastSettingsSchema.shape).sort()).toEqual(['duration', 'limit', 'placement'])
  })

  it('records the defaults: bottom-end, 3 and 5000', () => {
    expect(toastSettingsSchema.parse({})).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000 })
    expect(json.properties?.['placement']?.default).toBe('bottom-end')
    expect(json.properties?.['limit']?.default).toBe(3)
    expect(json.properties?.['duration']?.default).toBe(5000)
  })

  it('records the bounds the resolver clamps to', () => {
    expect(json.properties?.['limit']?.minimum).toBe(1)
    expect(json.properties?.['limit']?.maximum).toBe(10)
    expect(json.properties?.['duration']?.minimum).toBe(0)
    expect(json.properties?.['duration']?.maximum).toBe(600000)
  })

  it('lists the six placements, and a limit that is a whole number', () => {
    expect(json.properties?.['placement']?.enum).toEqual(['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'])
    expect(json.properties?.['limit']?.type).toBe('integer')
  })

  it('refuses what the resolver would have clamped, cut or replaced', () => {
    expect(toastSettingsSchema.safeParse({ limit: 0 }).success).toBe(false)
    expect(toastSettingsSchema.safeParse({ limit: 11 }).success).toBe(false)
    expect(toastSettingsSchema.safeParse({ limit: 2.5 }).success).toBe(false)
    expect(toastSettingsSchema.safeParse({ duration: -1 }).success).toBe(false)
    expect(toastSettingsSchema.safeParse({ duration: 600001 }).success).toBe(false)
    expect(toastSettingsSchema.safeParse({ placement: 'bottom-right' }).success).toBe(false)
  })

  it('accepts both ends of both ranges', () => {
    expect(toastSettingsSchema.parse({ limit: 1, duration: 0 })).toMatchObject({ limit: 1, duration: 0 })
    expect(toastSettingsSchema.parse({ limit: 10, duration: 600000 })).toMatchObject({ limit: 10, duration: 600000 })
  })

  it('describes each key, naming the prop that takes it', () => {
    for (const key of ['placement', 'limit', 'duration']) {
      expect(json.properties?.[key]?.description, key).toMatch(/^TopClassProvider toast: .{30,}/)
    }
  })
})

describe('the types', () => {
  it('names the six placements and nothing physical', () => {
    expectTypeOf<ToastPlacement>().toEqualTypeOf<'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end'>()
  })

  it('resolves to three required keys', () => {
    expectTypeOf<ToastSettings>().toEqualTypeOf<{ placement: ToastPlacement; limit: number; duration: number }>()
    expectTypeOf(resolveToastSettings).returns.toEqualTypeOf<ToastSettings>()
  })

  it('takes the same three keys, each optional, and the schema reads the same input', () => {
    expectTypeOf<ToastSettingsInput>().toEqualTypeOf<{
      placement?: ToastPlacement | undefined
      limit?: number | undefined
      duration?: number | undefined
    }>()
    expectTypeOf<ToastSettingsSchemaInput>().toEqualTypeOf<ToastSettingsInput>()
  })
})
