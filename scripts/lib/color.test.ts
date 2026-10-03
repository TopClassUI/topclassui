import { describe, expect, it } from 'vitest'

import { type Color, contrast, mixOklch, parseOklch, toLinearRgb, toOklch } from './color.js'

/** Parsing has its own tests, so everywhere else a failed parse should throw, not pass `null` on. */
const oklch = (value: string): Color => {
  const parsed = parseOklch(value)
  if (!parsed) throw new Error(`unparseable: ${value}`)
  return parsed
}

const WHITE = oklch('oklch(100% 0 0)')
const BLACK = oklch('oklch(0% 0 0)')
const VIOLET = oklch('oklch(54.1% 0.281 293.009)')

describe('parseOklch', () => {
  it('reads the percent form Tailwind writes', () => {
    expect(parseOklch('oklch(54.1% 0.281 293.009)')).toEqual({
      l: 0.541, c: 0.281, h: 293.009, alpha: 1,
    })
  })

  it('reads the unit form and an alpha', () => {
    expect(parseOklch('oklch(0 0 0 / 0.5)')).toEqual({ l: 0, c: 0, h: 0, alpha: 0.5 })
  })

  it('reads a percentage alpha, which is the common authoring form', () => {
    expect(parseOklch('oklch(0 0 0 / 50%)')).toEqual({ l: 0, c: 0, h: 0, alpha: 0.5 })
  })

  it('reads a hue with an explicit deg unit', () => {
    expect(parseOklch('oklch(50% 0.1 200deg)')).toEqual({ l: 0.5, c: 0.1, h: 200, alpha: 1 })
  })

  it('normalises a negative hue into 0-360', () => {
    expect(parseOklch('oklch(50% 0.1 -20)')).toEqual({ l: 0.5, c: 0.1, h: 340, alpha: 1 })
  })

  it('reads a percentage chroma, where CSS Color 4 pins 100% to 0.4', () => {
    expect(parseOklch('oklch(50% 25% 200)')).toEqual({ l: 0.5, c: 0.1, h: 200, alpha: 1 })
  })

  it('returns null for anything else', () => {
    expect(parseOklch('var(--color-white)')).toBeNull()
    expect(parseOklch('#fff')).toBeNull()
  })

  it('is anchored, so a wrapper is not read as the first colour inside it', () => {
    expect(parseOklch('light-dark(oklch(100% 0 0), oklch(14.5% 0 0))')).toBeNull()
    expect(parseOklch('color-mix(in oklch, oklch(50% 0.1 200) 20%, white)')).toBeNull()
  })
})

describe('contrast', () => {
  it('black on white is 21:1, the maximum', () => {
    expect(contrast(BLACK, WHITE)).toBeCloseTo(21, 1)
  })

  it('a colour against itself is 1:1', () => {
    expect(contrast(WHITE, WHITE)).toBeCloseTo(1, 5)
  })

  it('is symmetric for two opaque colours, where neither order changes what is painted', () => {
    expect(contrast(VIOLET, WHITE)).toBeCloseTo(contrast(WHITE, VIOLET), 10)
  })

  it('agrees with the known ratio for Tailwind violet-600 on white', () => {
    expect(contrast(VIOLET, WHITE)).toBeCloseTo(5.8815, 3)
  })

  it('flattens a translucent colour onto what is behind it, in gamma-encoded sRGB', () => {
    const scrim = oklch('oklch(0 0 0 / 0.5)')
    // 50% black over white is sRGB 0.5, so linear 0.21404 and 1.05 / 0.26404.
    expect(contrast(scrim, WHITE)).toBeCloseTo(3.9767, 4)
    expect(contrast(scrim, WHITE)).toBeLessThan(contrast(BLACK, WHITE))
  })

  it('flattens a translucent background too, instead of treating it as opaque', () => {
    const scrim = oklch('oklch(0 0 0 / 0.5)')
    expect(contrast(WHITE, scrim)).toBeCloseTo(3.9767, 4)
    expect(contrast(BLACK, scrim)).toBeCloseTo(5.2808, 4)
  })

  it('is asymmetric once alpha is involved, because the two orders paint differently', () => {
    const scrim = oklch('oklch(0 0 0 / 0.5)')
    expect(contrast(scrim, BLACK)).toBeCloseTo(1, 10)
    expect(contrast(BLACK, scrim)).toBeCloseTo(5.2808, 4)
  })

  it('maps an out-of-gamut colour instead of clipping it', () => {
    const wild = oklch('oklch(60% 0.9 150)')
    const mapped = toOklch(toLinearRgb(wild))
    // Clipping the raw channels would give l 0.752, h 142.50, c 0.256 and a ratio of 2.028.
    expect(mapped.l).toBeCloseTo(wild.l, 6)
    expect(mapped.h).toBeCloseTo(wild.h, 4)
    expect(mapped.c).toBeLessThan(wild.c)
    expect(mapped.c).toBeCloseTo(0.16525, 4)
    expect(contrast(wild, WHITE)).toBeCloseTo(3.6738, 3)
  })
})

describe('mixOklch', () => {
  it('0% is all of the second colour and 100% all of the first', () => {
    expect(mixOklch(BLACK, WHITE, 0).l).toBeCloseTo(1, 5)
    expect(mixOklch(BLACK, WHITE, 100).l).toBeCloseTo(0, 5)
  })

  it('a tint sits between the two', () => {
    const tint = mixOklch(VIOLET, WHITE, 12)
    expect(tint.l).toBeGreaterThan(VIOLET.l)
    expect(tint.l).toBeLessThan(1)
    expect(tint.c).toBeLessThan(VIOLET.c)
  })

  it('12% into white is a faint tint, which is the whole point of the soft tokens', () => {
    expect(contrast(mixOklch(VIOLET, WHITE, 12), WHITE)).toBeLessThan(1.3)
  })

  it('keeps the chromatic hue when the other colour is achromatic, as powerless hue requires', () => {
    expect(mixOklch(VIOLET, WHITE, 12)).toEqual({
      l: 0.94492, c: 0.03372, h: 293.009, alpha: 1,
    })
  })

  it('interpolates in polar oklch, not rectangular oklab, once the second colour has chroma', () => {
    const slate50 = oklch('oklch(98.4% 0.003 247.858)')
    const tint = mixOklch(VIOLET, slate50, 12)
    // Rectangular oklab would put the hue at 290.00 instead.
    expect(tint.h).toBeCloseTo(253.27612, 4)
    expect(tint.c).toBeCloseTo(0.03636, 6)
    expect(tint.l).toBeCloseTo(0.93084, 6)
  })

  it('takes the shorter hue arc across 0', () => {
    const mixed = mixOklch(oklch('oklch(50% 0.1 350)'), oklch('oklch(50% 0.1 10)'), 50)
    expect(mixed.h).toBeCloseTo(0, 6)
  })
})

describe('the none keyword', () => {
  it('reads an achromatic colour, which is how Tailwind writes every grey', () => {
    expect(parseOklch('oklch(98.5% 0 none)')).toEqual({ l: 0.985, c: 0, h: 0, alpha: 1 })
  })

  it('a grey still measures against white', () => {
    expect(contrast(oklch('oklch(98.5% 0 none)'), WHITE)).toBeCloseTo(1.0441, 3)
  })

  it('near-black grey is close to the maximum against white', () => {
    expect(contrast(oklch('oklch(14.5% 0 none)'), WHITE)).toBeGreaterThan(15)
  })
})
