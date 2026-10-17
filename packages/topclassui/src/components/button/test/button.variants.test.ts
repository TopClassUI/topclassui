import { describe, expect, it } from 'vitest'

import { BUTTON_SIZES, BUTTON_TONES, BUTTON_VARIANTS } from '../constants.js'
import { buttonVariants } from '../variants.js'

describe('buttonVariants is a cache, so it has to behave like a pure function', () => {
  it('returns the same string for the same props, every time', () => {
    const once = buttonVariants({ variant: 'soft', tone: 'danger', size: 'lg' })
    expect(buttonVariants({ variant: 'soft', tone: 'danger', size: 'lg' })).toBe(once)
  })

  it('keeps all four props in the key, so no two combinations collide', () => {
    const seen = new Map<string, string>()
    for (const variant of BUTTON_VARIANTS) {
      for (const tone of BUTTON_TONES) {
        for (const size of BUTTON_SIZES) {
          for (const fullWidth of [true, false]) {
            const classes = buttonVariants({ variant, tone, size, fullWidth })
            const label = `${variant}/${tone}/${size}/${String(fullWidth)}`
            const clash = seen.get(classes)
            expect(clash, `${label} paints the same as ${String(clash)}`).toBeUndefined()
            seen.set(classes, label)
          }
        }
      }
    }
    expect(seen.size).toBe(BUTTON_VARIANTS.length * BUTTON_TONES.length * BUTTON_SIZES.length * 2)
  })

  it('still answers a value no list contains, which a JS caller can pass', () => {
    const odd = buttonVariants({ variant: 'nope' as never, tone: 'nope' as never })
    expect(odd).toContain('inline-flex')
  })

  it('does not let that answer leak into a real key', () => {
    const before = buttonVariants({})
    buttonVariants({ variant: 'nope' as never })
    buttonVariants({ size: 'enormous' as never })
    expect(buttonVariants({})).toBe(before)
  })

  it('appends the consumer classes last, which is what lets them win', () => {
    expect(buttonVariants({ className: 'mt-4' }).endsWith('mt-4')).toBe(true)
    expect(buttonVariants({ class: 'mt-4' }).endsWith('mt-4')).toBe(true)
  })
})
