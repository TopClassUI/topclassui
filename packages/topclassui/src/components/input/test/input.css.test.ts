/** A class list cannot show that a variant compiles or which border colour wins, so this
 * compiles the real entry and reads what the browser would get. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { compileEntry } from '#test/stylesheet.js'
import { Input } from '../index.js'
import { InputSkeleton } from '../skeleton.js'

const RENDERED = [...new Set([
  ...classList(markup(createElement(Input, { 'aria-label': 'Email', fullWidth: true }))),
  ...classList(markup(createElement(Input, { 'aria-label': 'Email', size: 'xs' }))),
  ...classList(markup(createElement(Input, { 'aria-label': 'Email', type: 'email', readOnly: true }))),
  ...classList(markup(createElement(InputSkeleton))),
  ...classList(markup(createElement(InputSkeleton, { size: 'lg', fullWidth: true }))),
])]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(RENDERED)
})

/** Tailwind's selector for a class: every character outside a plain name is escaped. */
const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

/** Where the rule for a class starts: its selector, then a pseudo, an attribute or the block. */
const ruleAt = (cls: string) => {
  const selector = selectorOf(cls)
  let at = css.indexOf(selector)
  while (at !== -1 && !' :['.includes(css.charAt(at + selector.length))) at = css.indexOf(selector, at + 1)
  return at
}

/** The rule for a class, from its selector to the end of its first declaration block. */
const blockOf = (cls: string) => {
  const at = ruleAt(cls)
  return at === -1 ? '' : css.slice(at, css.indexOf('}', at))
}

/** The at-rule a class's rule sits inside, or '' when it sits in none. */
const mediaOf = (cls: string) => {
  const at = ruleAt(cls)
  const media = css.lastIndexOf('@media', at)
  if (at === -1 || media === -1) return ''
  const between = css.slice(media, at)
  const open = between.split('{').length - between.split('}').length
  return open === 1 ? between.slice(0, between.indexOf('{')).trim() : ''
}

describe('every class the component renders paints something', () => {
  it('rendered the classes at all, so an empty list cannot pass', () => {
    expect(RENDERED.length).toBeGreaterThan(25)
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => ruleAt(cls) === -1)).toEqual([])
  })
})

describe('the invalid border', () => {
  it('is the danger colour, switched on by aria-invalid="true"', () => {
    const block = blockOf('aria-invalid:border-danger-solid')
    expect(block).toContain('[aria-invalid="true"]')
    expect(block).toContain('border-color: var(--tc-danger-solid)')
  })

  it('comes after the resting border in the sheet, as well as outranking it', () => {
    const resting = ruleAt('border-line-strong')
    const invalid = ruleAt('aria-invalid:border-danger-solid')
    expect(resting).toBeGreaterThan(-1)
    expect(invalid).toBeGreaterThan(resting)
  })
})

describe('the placeholder', () => {
  it('is painted on the ::placeholder pseudo-element in the muted colour', () => {
    const block = blockOf('placeholder:text-muted')
    expect(block).toContain('::placeholder')
    expect(block).toContain('color: var(--tc-muted)')
  })
})

describe('the invalid line is thicker as well as red', () => {
  it('draws a ring inside the line, as wide as the ring knob is wider than the line', () => {
    const block = blockOf('aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]')
    expect(block).toContain('[aria-invalid="true"]')
    expect(block).toContain('inset 0 0 0 calc(var(--tc-ring-width) - var(--tc-line-width))')
  })

  it('paints that ring in the danger colour', () => {
    const block = blockOf('aria-invalid:inset-ring-danger-solid')
    expect(block).toContain('[aria-invalid="true"]')
    expect(block).toContain('--tw-inset-ring-color: var(--tc-danger-solid)')
  })

  it('widens the border itself under forced colours only, after the resting width in the sheet', () => {
    const cls = 'forced-colors:aria-invalid:border-(length:--tc-ring-width)'
    expect(mediaOf(cls)).toBe('@media (forced-colors: active)')
    expect(blockOf(cls)).toContain('[aria-invalid="true"]')
    expect(blockOf(cls)).toContain('border-width: var(--tc-ring-width)')
    expect(ruleAt(cls)).toBeGreaterThan(ruleAt('border-(length:--tc-line-width)'))
  })
})

describe('the own width', () => {
  it('is the smaller of the container and the token, and sits in no media query', () => {
    const cls = 'w-[min(100%,var(--tc-input-width))]'
    expect(blockOf(cls)).toContain('width: min(100%, var(--tc-input-width))')
    expect(mediaOf(cls)).toBe('')
  })

  it('reads a token the sheet declares in em, so the width follows the size scale', () => {
    expect(css).toContain('--tc-input-width: 13.8em;')
  })
})

describe('a value forced left-to-right', () => {
  it('takes the side of its parent, with the prefixed value Chromium needs first', () => {
    const block = blockOf('data-ltr:text-match-parent')
    expect(block).toContain('[data-ltr]')
    expect(block).toMatch(/text-align: -webkit-match-parent;\s+text-align: match-parent/)
  })

  it('orders its placeholder by the script the placeholder is written in', () => {
    const block = blockOf('data-ltr:placeholder:[unicode-bidi:plaintext]')
    expect(block).toContain('[data-ltr]::placeholder')
    expect(block).toContain('unicode-bidi: plaintext')
  })
})

describe('the touch floor for the text', () => {
  it('is 16 CSS px at least, under a coarse pointer only, after the type step in the sheet', () => {
    const cls = 'pointer-coarse:text-[max(1rem,16px)]'
    expect(mediaOf(cls)).toBe('@media (pointer: coarse)')
    expect(blockOf(cls)).toContain('font-size: max(1rem, 16px)')
    expect(ruleAt(cls)).toBeGreaterThan(ruleAt('text-xs'))
  })
})

describe('the disabled surface', () => {
  it('is the surface under the raised fill, on the disabled field only', () => {
    expect(blockOf('disabled:bg-surface')).toContain(':disabled')
    expect(blockOf('disabled:bg-surface')).toContain('background-color: var(--tc-surface)')
  })
})
