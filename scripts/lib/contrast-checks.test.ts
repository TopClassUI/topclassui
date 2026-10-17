import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { contrast, contrastRange, parseOklch } from './color.js'
import { MARGIN, STATE_STEP, VISIBLE_STEP, checkTokens, MODES } from './contrast-checks.js'
import { readPalette } from './tokens.js'

const palette = readPalette()
const css = readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8')
const run = (text: string) => checkTokens(text, palette)
const failures = (text: string) => run(text).failures.join('|')

/** Replace a declaration inside one mode's block, leaving the other modes alone. */
function mutateMode(mode: string, from: string, to: string): string {
  const at = css.indexOf(`[data-theme='${mode}']`)
  if (at < 0) throw new Error(`no ${mode} block`)
  const head = css.slice(0, at)
  const tail = css.slice(at)
  if (!tail.includes(from)) throw new Error(`${from} not found after the ${mode} block`)
  return head + tail.replace(from, to)
}

describe('checkTokens', () => {
  it('passes on the shipped tokens', () => {
    expect(run(css).failures).toEqual([])
  })

  it('measures the number of pairs it claims; change this only on purpose', () => {
    expect(run(css).pairs).toBe(378)
  })

  it('reports how many readings are distinct, since light and ocean share most tokens', () => {
    const report = run(css)
    expect(report.distinct).toBe(230)
    expect(report.distinct).toBeLessThan(report.pairs)
  })
})

describe('every mode is really read', () => {
  it('fails on a change made only inside the dark block', () => {
    const dark = mutateMode('dark', '--tc-muted: var(--color-neutral-400);', '--tc-muted: var(--color-neutral-700);')
    expect(failures(dark)).toMatch(/dark: muted on page/)
  })

  it('fails on a change made only inside the ocean block', () => {
    const ocean = mutateMode('ocean', '--tc-primary-on-soft: var(--color-cyan-800);', '--tc-primary-on-soft: var(--color-cyan-300);')
    expect(failures(ocean)).toMatch(/ocean: primary text on its tint/)
  })

  it('reads a mode block whatever its quoting, so a rewrite cannot blind the sweep', () => {
    const dark = mutateMode('dark', '--tc-muted: var(--color-neutral-400);', '--tc-muted: var(--color-neutral-700);')
    const requoted = dark.replace(/\[data-theme='dark'\]/g, '[data-theme="dark"]')
    expect(failures(requoted)).toMatch(/dark: muted on page/)
    expect(run(requoted).pairs).toBe(run(dark).pairs)
  })

  it('says so when a mode has no block of its own, instead of measuring it as light', () => {
    const renamed = css.replace(/\[data-theme='dark'\]/g, "[data-theme='darkk']")
    expect(failures(renamed)).toMatch(/dark: no block declares/)
  })

  it('names every mode it sweeps', () => {
    expect([...MODES]).toEqual(['light', 'dark', 'ocean'])
  })
})

describe('the thresholds bite', () => {
  it('catches text too pale to read, so the check is not vacuous', () => {
    const pale = css.replace('--tc-muted: var(--color-neutral-600);', '--tc-muted: var(--color-neutral-300);')
    expect(failures(pale)).toMatch(/muted on page/)
  })

  it('catches a tint that is invisible against the surface it sits on', () => {
    expect(failures(css.replace('--tc-primary-mix: 12%;', '--tc-primary-mix: 0.2%;')))
      .toMatch(/primary-soft is invisible/)
  })

  it('catches a hover tint that does not move', () => {
    const still = css.replace(
      'var(--tc-primary-solid) calc(var(--tc-primary-mix) + 8%)',
      'var(--tc-primary-solid) calc(var(--tc-primary-mix) + 0%)',
    )
    expect(failures(still)).toMatch(/soft-hover does not step away/)
  })

  it('reports a token it cannot resolve rather than passing it over', () => {
    expect(failures(css.replace('--tc-ring: var(--tc-primary-on-soft);', '--tc-ring: spaghetti;')))
      .toMatch(/ring on page: could not be resolved/)
  })

  it('still examines the active tint when the hover tint is broken', () => {
    const broken = css.replace(
      'var(--tc-primary-solid) calc(var(--tc-primary-mix) + 8%), var(--tc-page))',
      'spaghetti)',
    )
    const text = failures(broken)
    expect(text).toMatch(/--tc-soft-hover could not be resolved/)
    expect(text).not.toMatch(/--tc-soft-active could not be resolved/)
  })

  it('names a missing surface instead of crashing', () => {
    expect(failures(css.replace('--tc-surface-raised: var(--color-white);', '')))
      .toMatch(/--tc-surface-raised missing/)
  })
})

describe('the gamut bracket', () => {
  it('judges the worse reading, so a token near the threshold cannot pass on one of them', () => {
    const wild = parseOklch('oklch(60% 0.9 150)')
    const white = parseOklch('oklch(100% 0 0)')
    if (!wild || !white) throw new Error('unparsed')
    const range = contrastRange(wild, white)
    expect(range.min).toBeLessThan(range.max)
    expect(range.min).toBeLessThanOrEqual(contrast(wild, white))
  })

  it('brackets the shipped tokens by less than the margin that sits on top of it', () => {
    const emerald = parseOklch('oklch(50.8% 0.118 165.612)')
    const tint = parseOklch('oklch(31% 0.055 165.5)')
    if (!emerald || !tint) throw new Error('unparsed')
    const range = contrastRange(emerald, tint)
    expect(range.max - range.min).toBeGreaterThan(0)
    expect(range.max - range.min).toBeLessThan(1)
  })

  it('brackets nothing for a colour already inside the gamut', () => {
    const grey = parseOklch('oklch(50% 0 none)')
    const white = parseOklch('oklch(100% 0 0)')
    if (!grey || !white) throw new Error('unparsed')
    const range = contrastRange(grey, white)
    expect(range.min).toBeCloseTo(range.max, 10)
  })
})

describe('the per-tone interaction ramp', () => {
  it('catches a hover fill its own label cannot be read on', () => {
    const blind = css.replace('--tc-danger-hover: var(--color-red-700);', '--tc-danger-hover: var(--color-red-300);')
    expect(failures(blind)).toMatch(/danger label on its hover fill/)
  })

  it('catches a tone whose soft hover does not move', () => {
    const still = css.replace(
      'var(--tc-info-solid) calc(var(--tc-info-mix) + 8%)',
      'var(--tc-info-solid) calc(var(--tc-info-mix) + 0%)',
    )
    expect(failures(still)).toMatch(/info-soft-hover does not step away/)
  })

  it('catches a global that stops being the primary tone', () => {
    const off = css.replace('--tc-hover: var(--tc-primary-hover);', '--tc-hover: var(--tc-danger-hover);')
    expect(failures(off)).toMatch(/--tc-hover is not the primary tone/)
  })

  it('measures all six tones, not just the three Button needs', () => {
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info']) {
      const broken = css.replace(`--tc-${tone}-hover:`, `--tc-${tone}-hover-unused:`)
      expect(failures(broken), tone).toMatch(new RegExp(`--tc-${tone}-hover could not be resolved`))
    }
  })

  it('rejects a solid hover or press that paints the resting fill', () => {
    for (const state of ['hover', 'active'] as const) {
      const before = state === 'hover' ? '--tc-danger-solid' : '--tc-danger-hover'
      const dead = css.replace(
        new RegExp(`--tc-danger-${state}: [^;]+;`),
        `--tc-danger-${state}: var(${before});`,
      )
      expect(failures(dead), state).toMatch(
        new RegExp(`danger-${state} does not step away from the resting fill`),
      )
    }
  })
})

describe('the label on the hovered and pressed tint', () => {
  it('is measured, not just the resting tint', () => {
    const pale = css.replace('--tc-danger-on-soft: var(--color-red-800);', '--tc-danger-on-soft: var(--color-red-500);')
    const text = failures(pale)
    expect(text).toMatch(/danger text on its soft-hover tint/)
    expect(text).toMatch(/danger text on its soft-active tint/)
  })

  it('covers every tone, so no tone can hide a failing ramp', () => {
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info']) {
      const broken = css.replace(
        new RegExp(`--tc-${tone}-soft-active: [^;]+;`),
        `--tc-${tone}-soft-active: var(--tc-${tone}-solid);`,
      )
      expect(failures(broken), tone).toMatch(new RegExp(`${tone} text on its soft-active tint`))
    }
  })
})

describe('the ring on a tint', () => {
  // A highlighted row of a menu is a tint with the ring drawn inside its edge.
  it('is measured on the tint of every tone, in every mode', () => {
    const faint = css.replace('--tc-ring: var(--tc-primary-on-soft);', '--tc-ring: var(--tc-primary-soft);')
    expect(faint, 'the ring declaration moved').not.toBe(css)
    const text = failures(faint)
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info']) {
      expect(text, tone).toMatch(new RegExp(`light: ring on the ${tone} tint`))
    }
  })
})

describe('each threshold is the number R-5.6-4 names, and each one bites', () => {
  it('keeps the margin that absorbs browser differences', () => {
    expect(MARGIN).toBe(0.15)
    expect(VISIBLE_STEP).toBe(1.06)
    expect(STATE_STEP).toBe(1.02)
  })

  // Seeded between 3 and 4.5, so lowering a 4.5 threshold to 3 stops being invisible.
  it('fails body text that reads 4.0 on the page, which clears 3 but not 4.5', () => {
    // Measured at 3.95 on the light page: clears 3, misses 4.5.
    const dim = css.replace('--tc-body: var(--color-neutral-950);', '--tc-body: oklch(60% 0 0);')
    expect(dim, 'the body declaration moved').not.toBe(css)
    expect(failures(dim)).toMatch(/light: body on page/)
  })

  it('fails a tone label that reads 4.0 on its own fill', () => {
    // Measured at 4.00 on the danger fill.
    const dim = css.replace('--tc-danger-on-solid: var(--color-white);', '--tc-danger-on-solid: oklch(94% 0 0);')
    expect(dim, 'the label declaration moved').not.toBe(css)
    expect(failures(dim)).toMatch(/danger label on its fill/)
  })

  // Seeded between 1 and 3, which is the half of R-5.6-4 nothing used to cover.
  it('fails a control boundary that reads 2.0, keeping the 3:1 half alive', () => {
    // Measured at 2.23 on the light page: clears 1, misses 3.
    const faint = css.replace(
      '--tc-line-strong: var(--color-neutral-500);',
      '--tc-line-strong: oklch(75% 0 0);',
    )
    expect(faint, 'the line-strong declaration moved').not.toBe(css)
    expect(failures(faint)).toMatch(/light: line-strong on page/)
  })

  it('judges the worse gamut reading, measured through checkTokens itself', () => {
    // Measured against success-soft: min 4.15, max 5.68. The clipped reading would
    // pass the 4.65 floor, so this fails only while checkTokens takes the low end.
    const wide = css.replace('--tc-success-on-soft: var(--color-emerald-800);',
      '--tc-success-on-soft: oklch(46% 0.4 150);')
    expect(wide, 'the on-soft declaration moved').not.toBe(css)
    expect(failures(wide)).toMatch(/light: success text on its tint/)
  })
})
