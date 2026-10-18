import { describe, expect, it } from 'vitest'

import { GUIDES, KIND_COUNTS, knobDefault, tokenFact, tokenNameOf } from './guides.js'

describe('tokenNameOf', () => {
  it('reads a variable, or a tone role written with a slash', () => {
    expect(tokenNameOf('--tc-surface-raised')).toBe('--tc-surface-raised')
    expect(tokenNameOf('primary/on-soft')).toBe('--tc-primary-on-soft')
    expect(tokenNameOf('bg-page')).toBeNull()
  })
})

describe('the generated facts', () => {
  it('count the kinds across the 52 component imports', () => {
    expect(KIND_COUNTS).toEqual({ server: 20, split: 12, client: 20, total: 52 })
  })

  it('fail a token or a knob the library does not declare', () => {
    expect(() => tokenFact('--tc-nope')).toThrow('--tc-nope')
    expect(() => knobDefault('--tc-nope')).toThrow('--tc-nope')
    expect(knobDefault('--tc-radius')).toBe('0.5rem')
  })

  it('hold the icons the Icons page draws', () => {
    expect(GUIDES.icons.all.length).toBe(84)
  })
})
