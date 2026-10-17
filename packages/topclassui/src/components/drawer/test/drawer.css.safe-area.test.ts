import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { DRAWER_EDGE, DRAWER_X } from '../classes.js'

const tokens = readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8')
const compiled = compileEntry().then((entry) => entry.build(['pt-safe', 'pb-safe', 'ps-safe', 'pe-safe']))

/** The rule of one of the four utilities, whole: none of them is nested. */
const ruleFor = (css: string, cls: string) => css.slice(css.indexOf(`.${cls} {`), css.indexOf('}', css.indexOf(`.${cls} {`)) + 1)

/** One block of src/tokens.css, from its selector to its closing brace. */
const block = (selector: string) => tokens.slice(tokens.indexOf(selector), tokens.indexOf('}', tokens.indexOf(selector)))

// PLAN 19, Phase 5: emulation reports no safe area, so the rule is read where the browser would read it.
describe('a bottom sheet keeps clear of the home indicator', () => {
  it('the bottom sheet wears pb-safe, and so does every sheet that reaches the foot of the screen', () => {
    expect(DRAWER_EDGE.bottom.split(' ')).toContain('pb-safe')
    expect(DRAWER_EDGE.start.split(' ')).toContain('pb-safe')
    expect(DRAWER_EDGE.end.split(' ')).toContain('pb-safe')
    // A top sheet does not reach it.
    expect(DRAWER_EDGE.top.split(' ')).not.toContain('pb-safe')
  })

  it('the compiled rule of pb-safe pads the foot by --tc-safe-bottom and by nothing else', async () => {
    expect(ruleFor(await compiled, 'pb-safe')).toBe('.pb-safe {\n    padding-bottom: var(--tc-safe-bottom);\n  }')
  })

  it('src/tokens.css sets --tc-safe-bottom from env(safe-area-inset-bottom), on the root', () => {
    expect(block(':root {')).toContain('--tc-safe-bottom: env(safe-area-inset-bottom);')
    expect(block(':root {')).toContain('--tc-safe-top: env(safe-area-inset-top);')
  })

  it('the compiled sheet carries that token through, so the padding resolves to the inset of the device', async () => {
    expect(await compiled).toContain('--tc-safe-bottom: env(safe-area-inset-bottom);')
  })

  it('the other three utilities read their own token each', async () => {
    const sheet = await compiled
    expect(ruleFor(sheet, 'pt-safe')).toContain('padding-top: var(--tc-safe-top);')
    expect(ruleFor(sheet, 'ps-safe')).toContain('padding-inline-start: var(--tc-safe-start);')
    expect(ruleFor(sheet, 'pe-safe')).toContain('padding-inline-end: var(--tc-safe-end);')
  })

  it('the two inline insets swap with the direction: the end is the right in LTR and the left in RTL', () => {
    expect(block("[dir='ltr'] {")).toContain('--tc-safe-end: env(safe-area-inset-right);')
    expect(block("[dir='rtl'] {")).toContain('--tc-safe-end: env(safe-area-inset-left);')
    expect(block("[dir='rtl'] {")).toContain('--tc-safe-start: env(safe-area-inset-right);')
  })
})

describe('each sheet pads the screen edges it touches, and only those', () => {
  const safe = (edge: keyof typeof DRAWER_EDGE) => DRAWER_EDGE[edge].split(' ').filter((cls) => cls.endsWith('-safe')).sort()

  it('end: the top, the foot and the inline end', () => {
    expect(safe('end')).toEqual(['pb-safe', 'pe-safe', 'pt-safe'])
  })

  it('start: the top, the foot and the inline start', () => {
    expect(safe('start')).toEqual(['pb-safe', 'ps-safe', 'pt-safe'])
  })

  it('bottom: the foot and both sides', () => {
    expect(safe('bottom')).toEqual(['pb-safe', 'pe-safe', 'ps-safe'])
  })

  it('top: the top and both sides', () => {
    expect(safe('top')).toEqual(['pe-safe', 'ps-safe', 'pt-safe'])
  })

  // An absolute box ignores the padding of its parent, so the x adds each inset its corner touches to its own 0.75rem.
  it('the x adds the inset of the top wherever its sheet reaches the top, and of the end wherever it reaches the end', () => {
    expect(DRAWER_X).toEqual({
      start: 'absolute top-[calc(0.75rem+var(--tc-safe-top))] inset-e-3',
      end: 'absolute top-[calc(0.75rem+var(--tc-safe-top))] inset-e-[calc(0.75rem+var(--tc-safe-end))]',
      top: 'absolute top-[calc(0.75rem+var(--tc-safe-top))] inset-e-[calc(0.75rem+var(--tc-safe-end))]',
      bottom: 'absolute top-3 inset-e-[calc(0.75rem+var(--tc-safe-end))]',
    })
  })
})
