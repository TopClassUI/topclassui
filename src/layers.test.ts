/**
 * R-4-1: which rule wins. An unlayered declaration outranks every layer, so a token
 * written outside `@layer base` would beat the utility meant to override it. Nothing
 * in a class list shows that - only the layer a byte lands in does.
 */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { BORDER_WIDTH, TOUCH_TARGET } from './shared/classes.js'

/** Blanked, not removed, so every index still points at the same character. */
function blankNoise(css: string): string {
  const blanks = (match: string) => ' '.repeat(match.length)
  return css
    .replace(/\/\*[\s\S]*?\*\//g, blanks)
    .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, blanks)
}

/** The top-level layer a byte belongs to. A content:"{" would desync a bare brace count. */
function layerOf(css: string, index: number): string {
  const clean = blankNoise(css)
  let depth = 0
  let layer: string | null = null
  let start = 0
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === '{') { depth++; continue }
    if (clean[i] === '}') {
      depth--
      if (depth === 0 && layer !== null) {
        if (index > start && index < i) return layer
        layer = null
      }
      continue
    }
    if (depth === 0 && clean.startsWith('@layer ', i)) {
      const brace = clean.indexOf('{', i)
      const semi = clean.indexOf(';', i)
      // `@layer a, b;` declares an order and opens no block.
      if (brace < 0 || (semi >= 0 && semi < brace)) continue
      const head = clean.slice(i, brace)
      if (head.includes(',')) continue
      layer = head.replace('@layer', '').trim()
      start = i
    }
  }
  return 'unlayered'
}

describe('a tone beats the theme defaults on the same element', () => {
  let toned = ''

  beforeAll(async () => {
    const compiled = await compileEntry()
    toned = compiled.build(['tone-danger', 'tone-primary'])
  })

  it('declares the fallback tone in a layer, not outside every layer', () => {
    const places = [...toned.matchAll(/--tc-soft: var\(--tc-primary-soft\)/g)]
      .map((m) => layerOf(toned, m.index))
    expect(places.length).toBeGreaterThan(1)
    // Unlayered declarations outrank every layer, so [data-theme] would beat the utility.
    expect(places).toContain('base')
    expect(places).not.toContain('unlayered')
  })

  it('emits the tone utility in a layer that outranks it', () => {
    expect(layerOf(toned, toned.indexOf('.tone-danger'))).toBe('utilities')
  })

  it('orders the layers so utilities really is the later one', () => {
    const order = /@layer ([^;{]+);/.exec(toned)?.[1]?.split(',').map((n) => n.trim()) ?? []
    expect(order).toContain('base')
    expect(order).toContain('utilities')
    expect(order.indexOf('utilities')).toBeGreaterThan(order.indexOf('base'))
  })
})

describe('the shared control classes resolve to the knobs they promise', () => {
  it('gives the border a real width from --tc-line-width', async () => {
    const compiled = await compileEntry()
    const out = compiled.build([BORDER_WIDTH, 'border-line-strong'])
    expect(out).toMatch(/border-style:\s*var\(--tw-border-style\)|border-width:\s*var\(--tc-line-width\)/)
    expect(out).toContain('var(--tc-line-width)')
  })

  it('floors the touch target in CSS px on both axes, which SC 2.5.8 is written in', async () => {
    const compiled = await compileEntry()
    for (const cls of TOUCH_TARGET.split(' ')) {
      // One rule per class, or the width classes alone satisfy a whole-output match.
      const property = cls.includes('min-h') ? 'min-height' : 'min-width'
      const token = cls.includes('coarse') ? '--tc-target-coarse,44px' : '--tc-target-min,24px'
      const out = compiled.build([cls])
      expect(out, cls).toContain(`${property}: var(${token})`)
    }
    const base = compiled.build(['bg-page'])
    expect(base).toContain('--tc-target-min: 24px')
    expect(base).toContain('--tc-target-coarse: 44px')
  })
})
