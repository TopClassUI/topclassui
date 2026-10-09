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
  ...classList(markup(createElement(InputSkeleton))),
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
