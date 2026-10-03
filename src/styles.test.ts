// Compiles the real stylesheets, because unstyled output throws no error.
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { compile } from 'tailwindcss'
import { beforeAll, describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const ENTRY = '@import "tailwindcss";\n@import "./src/tokens.css";\n@import "./src/styles.css";\n'

/** Tailwind's own resolver needs a bundler; the entry only ever imports three files. */
function loadStylesheet(id: string, base: string) {
  const file = id === 'tailwindcss'
    ? join(ROOT, 'node_modules', 'tailwindcss', 'index.css')
    : resolve(base, id)
  return Promise.resolve({ path: file, base: dirname(file), content: readFileSync(file, 'utf8') })
}

const CANDIDATES = [
  'bg-page', 'bg-surface', 'bg-surface-raised', 'text-body', 'text-muted',
  'border-line', 'border-line-strong', 'bg-overlay', 'outline-ring',
  'bg-primary-solid', 'text-primary-on-solid', 'bg-primary-soft', 'text-primary-on-soft',
  'bg-danger-solid', 'bg-warning-soft', 'text-info-on-soft', 'bg-neutral-solid',
  'h-control-xs', 'h-control-md', 'h-control-xl', 'size-toggle-md', 'size-icon-lg',
  'px-pad-x-md', 'py-pad-y-xs', 'py-pad-y-sm',
  'rounded-control', 'rounded-box', 'rounded-chip',
  'font-sans', 'font-mono',
  'pt-safe', 'pb-safe', 'ps-safe', 'pe-safe',
  'hover:bg-primary-soft', 'focus-visible:outline-ring', 'active:bg-primary-solid', 'transition-colors',
  'dark:bg-surface',
]

let css = ''

beforeAll(async () => {
  const compiled = await compile(ENTRY, { base: ROOT, loadStylesheet })
  css = compiled.build(CANDIDATES)
})

/** Tailwind emits nothing at all for a candidate it cannot resolve. */
const emitted = (candidate: string) => css.includes(`.${candidate.replace(/:/g, '\\:')}`)

describe('the stylesheets compile', () => {
  it('produces CSS rather than throwing', () => {
    expect(css.length).toBeGreaterThan(1000)
  })

  it('resolves every semantic utility the components are written against', () => {
    expect(CANDIDATES.filter((c) => !emitted(c))).toEqual([])
  })

  it('never leaks a --tc-* name into a utility the consumer would have to know', () => {
    expect(css).not.toContain('.bg-tc-')
    expect(css).not.toContain('.text-tc-')
  })
})

describe('the knobs reach the utilities', () => {
  it('scales a control height by the density knob, so one value resizes every control', () => {
    expect(css).toMatch(/\.h-control-md\s*\{\s*height:\s*calc\(2\.5rem \* var\(--tc-density\)\)/)
  })

  it('caps the box and chip radii, or the ocean pill knob gives a card a 15000px radius', () => {
    expect(css).toMatch(/\.rounded-box\s*\{\s*border-radius:\s*min\(calc\(var\(--tc-radius\) \* 1\.5\), 1\.5rem\)/)
    expect(css).toMatch(/\.rounded-chip\s*\{\s*border-radius:\s*min\(calc\(var\(--tc-radius\) \* 0\.5\), 0\.5rem\)/)
  })

  it('keeps the xs control above the 24px touch floor at the compact density', () => {
    expect(css).toMatch(/\.h-control-xs\s*\{\s*height:\s*calc\(1\.75rem \* var\(--tc-density\)\)/)
  })

  it('starts the hug-the-text padding scale at 2px, as the Figma size collection does', () => {
    expect(css).toMatch(/\.py-pad-y-xs\s*\{\s*padding-block:\s*calc\(0\.125rem \* var\(--tc-density\)\)/)
  })

  it('routes the default transition duration through the motion knob', () => {
    expect(css).toMatch(/--default-transition-duration:\s*calc\(150ms \* var\(--tc-motion\)\)/)
  })

  it('maps a colour utility straight to its token, so a mode change needs no rebuild', () => {
    expect(css).toMatch(/\.bg-primary-solid\s*\{\s*background-color:\s*var\(--tc-primary-solid\)/)
  })
})

describe('the forced-state variants', () => {
  it('keeps the hover media guard, or a tap sticks on a touch device', () => {
    const hover = css.slice(0, css.indexOf('.hover\\:bg-primary-soft:hover'))
    expect(hover).toMatch(/@media \(hover: hover\)[^@]*$/)
  })

  it('matches the forced attribute too, so the docs can show every state at once', () => {
    expect(css).toContain('.hover\\:bg-primary-soft[data-hover]')
    expect(css).toContain('.focus-visible\\:outline-ring[data-focus-visible]')
    expect(css).toContain('.active\\:bg-primary-solid[data-active]')
  })

  it('gives consumers a dark variant even though the library never uses it', () => {
    expect(css).toContain('[data-theme="dark"]')
  })
})

describe('the three modes and the direction', () => {
  for (const mode of ['light', 'dark', 'ocean']) {
    it(`ships the ${mode} block`, () => {
      expect(css).toContain(`[data-theme='${mode}']`)
    })
  }

  it('flips the direction multiplier under rtl', () => {
    expect(css).toMatch(/\[dir='rtl'\][^}]*--tc-dir:\s*-1/)
  })

  it('resets the direction in both blocks, since an ltr island would inherit rtl', () => {
    expect(css).toMatch(/\[dir='ltr'\][^}]*--tc-dir:\s*1/)
    expect(css).toMatch(/\[dir='ltr'\][^}]*--tc-safe-start:\s*env\(safe-area-inset-left\)/)
  })

  it('swaps the inline safe-area insets under rtl, which env() cannot do alone', () => {
    const rtl = /\[dir='rtl'\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(rtl).toContain('--tc-safe-start: env(safe-area-inset-right)')
    expect(rtl).toContain('--tc-safe-end: env(safe-area-inset-left)')
  })

  it('reads the safe-area utilities from those tokens, not from env() directly', () => {
    expect(css).toMatch(/\.ps-safe\s*\{\s*padding-inline-start:\s*var\(--tc-safe-start\)/)
  })
})
