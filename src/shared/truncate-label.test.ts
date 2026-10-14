import { describe, expect, it } from 'vitest'

import { cutLabel } from './truncate-label.js'

describe('cutLabel cuts between graphemes, never inside one', () => {
  it('keeps a family emoji whole: its zero-width joiners are inside it', () => {
    expect(cutLabel('ab👩‍👩‍👧', 5)).toBe('ab')
  })

  it('keeps a flag whole: two regional indicators make one', () => {
    expect(cutLabel('🇯🇴🇸🇦', 6)).toBe('🇯🇴')
  })

  it('keeps a skin tone on its hand', () => {
    expect(cutLabel('👍🏽👍🏽', 6)).toBe('👍🏽')
  })

  it('keeps a combining accent on its letter', () => {
    expect(cutLabel('abé', 3)).toBe('ab')
  })

  it('keeps an Arabic letter with its harakat', () => {
    expect(cutLabel('مُحَمَّد', 5)).toBe('مُحَ')
  })

  it('looks past the bound, so a skin tone right after it still counts', () => {
    expect(cutLabel('a👍🏽', 3)).toBe('a')
  })
})

describe('cutLabel is still a bound in UTF-16 units', () => {
  it('returns a label within the bound as it is', () => {
    expect(cutLabel('مُحَمَّد', 8)).toBe('مُحَمَّد')
  })

  it('cuts plain text at the bound itself', () => {
    expect(cutLabel('x'.repeat(10_000), 200)).toBe('x'.repeat(200))
  })

  it('stops a megabyte at the bound', () => {
    expect(cutLabel('y'.repeat(1_000_000), 200)).toHaveLength(200)
  })
})
