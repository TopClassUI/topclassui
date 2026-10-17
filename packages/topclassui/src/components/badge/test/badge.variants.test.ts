import { describe, expect, it } from 'vitest'

import { BADGE_SIZES, BADGE_TONES, BADGE_VARIANTS } from '../constants.js'
import { badgeVariants } from '../variants.js'

describe('badgeVariants is a cache, so it has to behave like a pure function', () => {
  it('returns the same string for the same props, every time', () => {
    const once = badgeVariants({ variant: 'outline', tone: 'danger', size: 'lg' })
    expect(badgeVariants({ variant: 'outline', tone: 'danger', size: 'lg' })).toBe(once)
  })

  it('keeps all three props in the key, so no two combinations collide', () => {
    const seen = new Map<string, string>()
    for (const variant of BADGE_VARIANTS) {
      for (const tone of BADGE_TONES) {
        for (const size of BADGE_SIZES) {
          const classes = badgeVariants({ variant, tone, size })
          const label = `${variant}/${tone}/${size}`
          const clash = seen.get(classes)
          expect(clash, `${label} paints the same as ${String(clash)}`).toBeUndefined()
          seen.set(classes, label)
        }
      }
    }
    expect(seen.size).toBe(3 * 6 * 6)
  })

  it('fills the defaults when a prop is left out', () => {
    expect(badgeVariants({})).toBe(badgeVariants({ variant: 'soft', tone: 'primary', size: 'md' }))
  })

  it('still answers a value no list contains, which a JS caller can pass', () => {
    const odd = badgeVariants({ variant: 'nope' as never, tone: 'nope' as never })
    expect(odd).toContain('inline-flex')
  })

  it('does not let that answer leak into a real key', () => {
    const before = badgeVariants({})
    badgeVariants({ variant: 'nope' as never })
    badgeVariants({ size: 'enormous' as never })
    expect(badgeVariants({})).toBe(before)
  })

  it('appends the consumer classes last, which is what lets them win', () => {
    expect(badgeVariants({ className: 'mt-4' }).endsWith('mt-4')).toBe(true)
    expect(badgeVariants({ class: 'mt-4' }).endsWith('mt-4')).toBe(true)
  })
})
