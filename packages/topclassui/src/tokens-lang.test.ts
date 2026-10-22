import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { parseCss } from '../scripts/lib/css-parse.js'

const rules = parseCss(readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8')).rules

/** Every selector in src/tokens.css that sets this property, with the layers around it. */
const settersOf = (property: string) => rules
  .filter((rule) => rule.declarations.some((declaration) => declaration.property === property))
  .map((rule) => `${rule.ancestors.join(' ')} ${rule.prelude}`)

// e2e/shared-arabic-font.spec.ts shows what each selector does in a page; this pins which one is written.
describe('an Arabic page or island', () => {
  it('sets its font only on the element that carries lang, so a font-mono element keeps it for its children', () => {
    expect(settersOf('font-family')).toEqual(["@layer base [lang|='ar']"])
  })

  it('points --tc-font-sans at the Arabic stack where lang is written, unlayered so it beats :root', () => {
    expect(settersOf('--tc-font-sans')).toEqual([' :root', " [lang|='ar']"])
  })

  it('resets letter-spacing on every element in Arabic, so a spaced ancestor cannot pull the letters apart (R-5.3-3)', () => {
    expect(settersOf('letter-spacing')).toEqual(['@layer base :lang(ar)'])
  })
})
