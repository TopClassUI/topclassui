import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { definedTokens } from '../../../scripts/lib/token-refs.js'
import { DEFAULT_TONE, TONE_CLASS, TONES } from './tone.js'

const ROOT = process.cwd()
const tokensCss = readFileSync(join(ROOT, 'src', 'tokens.css'), 'utf8')
const stylesCss = readFileSync(join(ROOT, 'src', 'styles.css'), 'utf8')
const declared = definedTokens(tokensCss)

/** Everything a tone needs before any component may offer it. */
const PER_TONE = ['solid', 'on-solid', 'soft', 'on-soft', 'hover', 'active', 'soft-hover', 'soft-active']

describe('the tone vocabulary', () => {
  it('is the six R-5.7-1 names, in a stable order', () => {
    expect([...TONES]).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  it('defaults to primary, which is what a toneless component falls back to', () => {
    expect(DEFAULT_TONE).toBe('primary')
  })

  it('has no duplicates', () => {
    expect(new Set(TONES).size).toBe(TONES.length)
  })
})

describe('every tone is fully built, so adding a name alone cannot ship', () => {
  for (const tone of TONES) {
    it(`${tone} declares all eight of its tokens`, () => {
      const missing = PER_TONE.filter((part) => !declared.has(`--tc-${tone}-${part}`))
      expect(missing, tone).toEqual([])
    })

    it(`${tone} has a utility that swaps the interaction variables`, () => {
      expect(stylesCss, tone).toContain(`@utility ${TONE_CLASS[tone]} {`)
    })

    it(`${tone} is mapped to a Tailwind colour, so bg-${tone}-solid exists`, () => {
      for (const part of ['solid', 'on-solid', 'soft', 'on-soft']) {
        expect(stylesCss, `${tone}/${part}`).toContain(`--color-${tone}-${part}: var(--tc-${tone}-${part})`)
      }
    })
  }

  it('names a utility for exactly the tones that exist, and no others', () => {
    const utilities = [...stylesCss.matchAll(/@utility tone-([a-z]+) \{/g)].map((m) => m[1])
    expect(utilities.sort()).toEqual([...TONES].sort())
  })

  it('declares no per-tone token for a tone that is not in the vocabulary', () => {
    const named = new Set(TONES as readonly string[])
    // Only tones carry these suffixes, so a match is a tone name and not a global.
    const orphans = [...declared]
      .map((token) => /^--tc-([a-z]+)-(?:solid|on-solid|on-soft)$/.exec(token)?.[1])
      .filter((name): name is string => name !== undefined && !named.has(name))
    expect([...new Set(orphans)]).toEqual([])
  })
})
