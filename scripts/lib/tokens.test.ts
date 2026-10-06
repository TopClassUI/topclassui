import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  declaredModes, readBlocks, readPalette, resolve, resolvePercent, tokensFor, tokensMissingPerMode,
} from './tokens.js'

const CSS = `
/* a comment with a { brace } in it */
:root {
  --tc-page: var(--color-white);
  --tc-mix: 10%;
}
[data-theme='dark'] {
  --tc-page: var(--color-black);
  --tc-mix: 20%;
}
:root,
[data-theme] {
  --tc-soft: color-mix(in oklch, var(--color-red-600) var(--tc-mix), var(--tc-page));
  --tc-soft-hover: color-mix(in oklch, var(--color-red-600) calc(var(--tc-mix) + 8%), var(--tc-page));
}
.no-custom-properties {
  color: red;
}
`

const blocks = readBlocks(CSS)
const palette = readPalette()

describe('readBlocks', () => {
  it('keeps only custom properties, since nothing else can be a token', () => {
    expect(blocks.some((b) => b.decls.has('color'))).toBe(false)
    expect(blocks.map((b) => b.selector)).toEqual([':root', "[data-theme='dark']", ':root, [data-theme]'])
  })

  it('skips a block a condition gates, rather than applying it unconditionally', () => {
    const css = ':root { --tc-motion: 1; }\n@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0; } }'
    expect(tokensFor(readBlocks(css), 'light').get('--tc-motion')).toBe('1')
  })

  it('keeps a block inside @layer, which always applies', () => {
    expect(readBlocks('@layer base { :root { --tc-a: 1; } }')).toHaveLength(1)
  })

  it('reads a declaration that has no trailing semicolon', () => {
    const css = "[data-theme='dark'] { --tc-a: 1; --tc-b: 2 }"
    expect(readBlocks(css)[0]?.decls.get('--tc-b')).toBe('2')
  })
})

describe('tokensFor', () => {
  it('uses :root as the base, so a mode only states what it changes', () => {
    expect(tokensFor(blocks, 'dark').get('--tc-soft')).toContain('color-mix')
  })

  it('lets a later block win, which is what the cascade does', () => {
    expect(tokensFor(blocks, 'light').get('--tc-page')).toBe('var(--color-white)')
    expect(tokensFor(blocks, 'dark').get('--tc-page')).toBe('var(--color-black)')
  })

  it('reads every quoting of the same attribute selector as one selector', () => {
    for (const selector of ['[data-theme="dark"]', '[data-theme=dark]', "[data-theme = 'dark']"]) {
      const css = `:root { --tc-page: a; }\n${selector} { --tc-page: b; }`
      expect(tokensFor(readBlocks(css), 'dark').get('--tc-page'), selector).toBe('b')
      expect(tokensFor(readBlocks(css), 'light').get('--tc-page'), selector).toBe('a')
    }
  })

  it('reads a mode block wrapped in :where(), which is how styles.css writes selectors', () => {
    const css = ":root { --tc-page: a; }\n:where([data-theme='dark'], .night) { --tc-page: b; }"
    expect(tokensFor(readBlocks(css), 'dark').get('--tc-page')).toBe('b')
  })

  it('does not apply one mode to another', () => {
    expect(tokensFor(blocks, 'ocean').get('--tc-page')).toBe('var(--color-white)')
    expect(tokensFor(blocks, 'ocean').get('--tc-mix')).toBe('10%')
  })
})

describe('declaredModes', () => {
  it('names every theme the stylesheet declares, whatever the quoting', () => {
    const css = "[data-theme='dark'] { --tc-a: 1 }\n[data-theme=\"ocean\"] { --tc-a: 2 }"
    expect([...declaredModes(readBlocks(css))].sort()).toEqual(['dark', 'ocean'])
  })

  it('ignores a bare [data-theme], which names no mode of its own', () => {
    expect([...declaredModes(readBlocks(':root, [data-theme] { --tc-a: 1 }'))]).toEqual([])
  })

  it('finds a mode declared inside :where()', () => {
    expect([...declaredModes(readBlocks(":where([data-theme='forest']) { --tc-a: 1 }"))]).toEqual(['forest'])
  })

  it('names all three modes the shipped file declares', () => {
    const real = readBlocks(readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8'))
    expect([...declaredModes(real)].sort()).toEqual(['dark', 'light', 'ocean'])
  })
})

describe('resolvePercent', () => {
  const tokens = tokensFor(blocks, 'light')

  it('reads a plain percentage', () => {
    expect(resolvePercent('12%', tokens)).toBe(12)
  })

  it('follows a var to the percentage behind it', () => {
    expect(resolvePercent('var(--tc-mix)', tokens)).toBe(10)
  })

  it('adds the calc offset on top of the var', () => {
    expect(resolvePercent('calc(var(--tc-mix) + 8%)', tokens)).toBe(18)
  })

  it('returns null rather than looping on a cycle', () => {
    const cyclic = new Map([['--a', 'var(--b)'], ['--b', 'var(--a)']])
    expect(resolvePercent('var(--a)', cyclic)).toBeNull()
  })

  it('returns null for anything it does not understand', () => {
    expect(resolvePercent('clamp(1%, 2%, 3%)', tokens)).toBeNull()
  })
})

describe('resolve', () => {
  const light = tokensFor(blocks, 'light')
  const dark = tokensFor(blocks, 'dark')

  it('follows a var chain into the Tailwind palette', () => {
    expect(resolve('--tc-page', light, palette)?.l).toBeCloseTo(1, 5)
    expect(resolve('--tc-page', dark, palette)?.l).toBeCloseTo(0, 5)
  })

  it('computes a color-mix, and the same token differs per mode', () => {
    expect(resolve('--tc-soft', light, palette)?.l).toBeGreaterThan(0.8)
    expect(resolve('--tc-soft', dark, palette)?.l).toBeLessThan(0.3)
  })

  it('reads the mix percentage through a var, which every soft token uses', () => {
    const soft = resolve('--tc-soft', light, palette)
    expect(resolve('--tc-soft-hover', light, palette)?.l).toBeLessThan(soft?.l ?? 0)
  })

  it('accepts the mix with any spacing or casing of the colour space', () => {
    const odd = new Map([
      ['--tc-page', 'oklch(100% 0 0)'],
      ['--tc-soft', 'color-mix(in  OKLCH, var(--color-red-600) 10%, var(--tc-page))'],
    ])
    expect(resolve('--tc-soft', odd, palette)).not.toBeNull()
  })

  it('refuses a wrapper that merely contains an oklch colour', () => {
    const wrapped = new Map([['--tc-page', 'light-dark(oklch(100% 0 0), oklch(14.5% 0 0))']])
    expect(resolve('--tc-page', wrapped, palette)).toBeNull()
  })

  it('returns null for an undefined token instead of guessing', () => {
    expect(resolve('--tc-nope', light, palette)).toBeNull()
  })

  it('returns null rather than looping on a cycle', () => {
    const cyclic = new Map([['--a', 'var(--b)'], ['--b', 'var(--a)']])
    expect(resolve('--a', cyclic, palette)).toBeNull()
  })
})

describe('the shipped tokens', () => {
  const real = readBlocks(readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8'))
  const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
  const names = [
    'page', 'surface', 'surface-raised', 'body', 'muted', 'line', 'line-strong', 'overlay', 'ring',
    ...TONES.flatMap((t) => [`${t}-solid`, `${t}-on-solid`, `${t}-soft`, `${t}-on-soft`]),
  ]

  for (const mode of ['light', 'dark', 'ocean']) {
    it(`resolves every colour token in ${mode}`, () => {
      const tokens = tokensFor(real, mode)
      expect(names.filter((n) => resolve(`--tc-${n}`, tokens, palette) === null)).toEqual([])
    })
  }

  it('gives the three modes different surfaces, so they are not one mode read three times', () => {
    const pages = ['light', 'dark', 'ocean'].map((m) => resolve('--tc-page', tokensFor(real, m), palette)?.l)
    expect(pages[0]).not.toBeCloseTo(pages[1] ?? 0, 2)
  })

  it('keeps the motion knob at 1, since the reduced-motion block is conditional', () => {
    expect(tokensFor(real, 'light').get('--tc-motion')).toBe('1')
  })
})

describe('a token has to exist in every mode, not only the one it was added for', () => {
  const css = (body: string) => readBlocks(body)

  it('passes when :root declares it, because every mode inherits that', () => {
    expect(tokensMissingPerMode(css(
      ":root { --tc-a: 1px }\n[data-theme='dark'] { --tc-b: 2px }\n[data-theme='light'] { --tc-b: 3px }\n",
    ))).toEqual([])
  })

  it('catches a token only one mode declares, which is undefined in the other', () => {
    const found = tokensMissingPerMode(css(
      ":root { --tc-a: 1px }\n[data-theme='dark'] { --tc-only: 2px }\n[data-theme='light'] { --tc-a: 3px }\n",
    ))
    expect(found).toEqual([{ mode: 'light', token: '--tc-only' }])
  })

  it('reports one row per mode and token, so the message names every hole', () => {
    const found = tokensMissingPerMode(css(
      "[data-theme='dark'] { --tc-only: 2px }\n[data-theme='light'] { --tc-a: 1px }\n[data-theme='ocean'] { --tc-a: 4px }\n",
    ))
    expect(found).toEqual([
      { mode: 'dark', token: '--tc-a' },
      { mode: 'light', token: '--tc-only' },
      { mode: 'ocean', token: '--tc-only' },
    ])
  })

  it('says nothing about the real tokens file, which is symmetric today', () => {
    expect(tokensMissingPerMode(readBlocks(readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8')))).toEqual([])
  })
})
