/** Two utilities on one property share a specificity, so the emitted order decides.
 * A class-list assertion cannot see that, so the order is pinned here. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry, declarationIndex } from '#test/stylesheet.js'

const CANDIDATES = [
  'disabled:opacity-50', 'data-disabled:opacity-50', 'aria-busy:opacity-100',
  'hover:bg-(--tc-hover)', 'disabled:cursor-not-allowed', 'data-loading:pointer-events-none',
]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(CANDIDATES)
})

const at = (selector: string, property: string) => declarationIndex(css, selector, property)

describe('a loading button keeps its colour', () => {
  it('puts aria-busy:opacity-100 after disabled:opacity-50, so loading wins', () => {
    const busy = at('.aria-busy\\:opacity-100[aria-busy="true"]', 'opacity')
    const off = at('.disabled\\:opacity-50:disabled', 'opacity')
    expect(off, 'disabled:opacity-50 is not emitted').toBeGreaterThan(-1)
    expect(busy, 'aria-busy:opacity-100 is not emitted').toBeGreaterThan(off)
  })

  it('leaves data-disabled:opacity-50 last, so disabled and loading still dims', () => {
    const dim = at('.data-disabled\\:opacity-50[data-disabled]', 'opacity')
    const busy = at('.aria-busy\\:opacity-100[aria-busy="true"]', 'opacity')
    expect(dim).toBeGreaterThan(busy)
  })

  it('never ships a cursor a loading control could not paint', () => {
    expect(css).not.toContain('cursor: progress')
  })
})
