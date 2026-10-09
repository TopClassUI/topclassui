import { describe, expect, it } from 'vitest'

import { BANNER_TONES } from '../constants.js'
import { bannerVariants } from '../variants.js'

describe('bannerVariants is a cache, so it has to behave like a pure function', () => {
  it('returns the same string for the same props, every time', () => {
    const once = bannerVariants({ tone: 'danger' })
    expect(bannerVariants({ tone: 'danger' })).toBe(once)
  })

  it('keeps the tone in the key, so no two tones collide', () => {
    const seen = new Map<string, string>()
    for (const tone of BANNER_TONES) {
      const classes = bannerVariants({ tone })
      const clash = seen.get(classes)
      expect(clash, `${tone} paints the same as ${String(clash)}`).toBeUndefined()
      seen.set(classes, tone)
    }
    expect(seen.size).toBe(6)
  })

  it('fills the default when the tone is left out', () => {
    expect(bannerVariants({})).toBe(bannerVariants({ tone: 'primary' }))
    expect(bannerVariants().split(' ')).toContain('bg-primary-soft')
  })

  it('still answers a value no list contains, which a JS caller can pass', () => {
    expect(bannerVariants({ tone: 'nope' as never })).toContain('wrap-anywhere')
  })

  it('does not let that answer leak into a real key', () => {
    const before = bannerVariants({})
    bannerVariants({ tone: 'enormous' as never })
    expect(bannerVariants({})).toBe(before)
  })

  it('appends the consumer classes last, which is what lets them win', () => {
    expect(bannerVariants({ className: 'mt-4' }).endsWith('mt-4')).toBe(true)
    expect(bannerVariants({ class: 'mt-4' }).endsWith('mt-4')).toBe(true)
  })
})
