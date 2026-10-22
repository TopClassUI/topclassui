// R-4-1, R-4-2, R-5.2-4: the stylesheet has to compile and emit what we promise.
import { describe, expect, it, beforeAll } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { FOCUS_RING } from './shared/classes.js'
import { BUTTON_SIZES, BUTTON_TONES, BUTTON_VARIANTS } from './components/button/constants.js'
import { buttonVariants } from './components/button/variants.js'
import { TONES } from './shared/contracts/tone.js'

const CANDIDATES = [
  'bg-page', 'bg-surface', 'bg-surface-raised', 'text-body', 'text-muted',
  'border-line', 'border-line-strong', 'bg-overlay', 'outline-ring',
  'bg-primary-solid', 'text-primary-on-solid', 'bg-primary-soft', 'text-primary-on-soft',
  'bg-danger-solid', 'bg-warning-soft', 'text-info-on-soft', 'bg-neutral-solid',
  'h-control-xs', 'h-control-md', 'h-control-xl', 'size-toggle-md', 'size-knob-md', 'size-icon-lg',
  'px-pad-x-md', 'py-pad-y-xs', 'py-pad-y-sm',
  'rounded-control', 'rounded-box', 'rounded-chip',
  'font-sans', 'font-mono',
  'pt-safe', 'pb-safe', 'ps-safe', 'pe-safe',
  'hover:bg-primary-soft', 'focus-visible:outline-ring', 'active:bg-primary-solid', 'transition-colors',
  'dark:bg-surface',
]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(CANDIDATES)
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

describe('the focus ring actually paints', () => {
  it('restores outline-style on focus-visible, which the reset zeroes', async () => {
    const compiled = await compileEntry()
    const ring = compiled.build(FOCUS_RING.split(' '))

    // The reset sets --tw-outline-style: none, so without this the width substitutes none.
    expect(ring).toMatch(/outline-solid[^{]*:focus-visible\s*\{[^}]*outline-style:\s*solid/)
    expect(ring).toMatch(/--tw-outline-style:\s*solid/)
  })

  it('resets with outline-none, which declares no outline of its own in any mode', async () => {
    const ring = (await compileEntry()).build(FOCUS_RING.split(' '))

    expect(FOCUS_RING.split(' ')).toContain('outline-none')
    expect(ring).toMatch(/\.outline-none\s*\{\s*--tw-outline-style:\s*none;\s*outline-style:\s*none;\s*\}/)
    expect(ring).not.toContain('solid transparent')
    expect(ring).not.toContain('forced-colors')
  })

  // The reason, pinned: e2e/focus-ring.spec measured that outline as 2px on every control at rest.
  it('never resets with outline-hidden, which Tailwind turns into an outline under forced colours', async () => {
    const hidden = (await compileEntry()).build(['outline-hidden'])

    expect(FOCUS_RING.split(' ')).not.toContain('outline-hidden')
    expect(hidden).toMatch(/@media \(forced-colors: active\)\s*\{\s*outline:\s*2px solid transparent/)
  })

  it('reads the ring width, offset and colour from the knobs', () => {
    expect(FOCUS_RING).toContain('--tc-ring-width')
    expect(FOCUS_RING).toContain('--tc-ring-offset')
    expect(FOCUS_RING).toContain('outline-ring')
  })
})

describe('the tone utilities', () => {
  let toneCss = ''

  beforeAll(async () => {
    const compiled = await compileEntry()
    toneCss = compiled.build(TONES.map((t) => `tone-${t}`))
  })

  for (const tone of TONES) {
    it(`tone-${tone} swaps all five interaction variables`, () => {
      const start = toneCss.indexOf(`.tone-${tone} {`)
      const block = start < 0 ? '' : toneCss.slice(start, toneCss.indexOf('}', start))
      for (const name of ['soft', 'hover', 'active', 'soft-hover', 'soft-active']) {
        expect(block, `${tone}/${name}`).toContain(`--tc-${name}: var(--tc-${tone}-${name})`)
      }
    })
  }

  it('emits one utility per tone and nothing else', () => {
    expect([...toneCss.matchAll(/\.tone-[a-z]+\s*\{/g)]).toHaveLength(TONES.length)
  })
})

describe('every class Button emits resolves to real CSS', () => {
  it('leaves no class without a rule, in any variant and tone combination', async () => {
    const wanted = new Set<string>()
    for (const variant of BUTTON_VARIANTS) {
      for (const tone of BUTTON_TONES) {
        for (const size of BUTTON_SIZES) {
          for (const cls of buttonVariants({ variant, tone, size, fullWidth: true }).split(/\s+/)) {
            if (cls) wanted.add(cls)
          }
        }
      }
    }

    const compiled = await compileEntry()
    const out = compiled.build([...wanted])
    /** Tailwind escapes every character a CSS identifier may not carry. */
    const selector = (cls: string) => `.${cls.replace(/[^\w-]/g, (ch) => `\\${ch}`)}`

    const missing = [...wanted].filter((c) => !out.includes(selector(c)))
    expect(missing).toEqual([])
  })
})
