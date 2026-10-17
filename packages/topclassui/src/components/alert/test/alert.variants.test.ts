import { describe, expect, it } from 'vitest'

import { ALERT_TONES, ALERT_VARIANTS } from '../constants.js'
import { alertVariants } from '../variants.js'

describe('alertVariants is a cache, so it has to behave like a pure function', () => {
  it('returns the same string for the same props, every time', () => {
    const once = alertVariants({ variant: 'outline', tone: 'danger' })
    expect(alertVariants({ variant: 'outline', tone: 'danger' })).toBe(once)
  })

  it('keeps both props in the key, so no two combinations collide', () => {
    const seen = new Map<string, string>()
    for (const variant of ALERT_VARIANTS) {
      for (const tone of ALERT_TONES) {
        const classes = alertVariants({ variant, tone })
        const label = `${variant}/${tone}`
        const clash = seen.get(classes)
        expect(clash, `${label} paints the same as ${String(clash)}`).toBeUndefined()
        seen.set(classes, label)
      }
    }
    expect(seen.size).toBe(18)
  })

  it('fills the defaults when a prop is left out', () => {
    expect(alertVariants({})).toBe(alertVariants({ variant: 'soft', tone: 'info' }))
    expect(alertVariants({}).split(' ')).toContain('bg-info-soft')
  })

  it('still answers a value no list contains, which a JS caller can pass', () => {
    const odd = alertVariants({ variant: 'nope' as never, tone: 'nope' as never })
    expect(odd).toContain('rounded-box')
  })

  it('does not let that answer leak into a real key', () => {
    const before = alertVariants({})
    alertVariants({ variant: 'nope' as never })
    alertVariants({ tone: 'enormous' as never })
    expect(alertVariants({})).toBe(before)
  })

  it('appends the consumer classes last, which is what lets them win', () => {
    expect(alertVariants({ className: 'mt-4' }).endsWith('mt-4')).toBe(true)
    expect(alertVariants({ class: 'mt-4' }).endsWith('mt-4')).toBe(true)
  })
})
