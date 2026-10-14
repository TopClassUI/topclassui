/** A class list cannot show that a variant compiles or which rule wins, so this compiles the real entry
 * and reads what the browser would get, for the field, the holder, the counter and the skeleton. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { compileEntry } from '#test/stylesheet.js'
import { Textarea, TextareaSkeleton } from '../index.js'

/** Every class of every element in the markup, not only the first. */
const allClasses = (html: string) => [...html.matchAll(/class="([^"]*)"/g)].flatMap(([, list]) => (list ?? '').split(/\s+/)).filter(Boolean)

const RENDERED = [...new Set([
  ...allClasses(markup(createElement(Textarea, { 'aria-label': 'Bio' }))),
  ...allClasses(markup(createElement(Textarea, { 'aria-label': 'Bio', size: 'xs', readOnly: true, fullWidth: true }))),
  ...allClasses(markup(createElement(Textarea, { 'aria-label': 'Bio', size: 'lg', autosize: true, showCount: true }))),
  ...allClasses(markup(createElement(Textarea, { 'aria-label': 'Bio', size: 'xl', autosize: true, fullWidth: true }))),
  ...allClasses(markup(createElement(TextareaSkeleton, { size: 'sm' }))),
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
    expect(RENDERED.length).toBeGreaterThan(40)
    for (const cls of ['resize-y', 'resize-none', 'sr-only', 'whitespace-pre', 'empty:hidden']) expect(RENDERED, cls).toContain(cls)
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => ruleAt(cls) === -1)).toEqual([])
  })
})

describe('the field', () => {
  it('is a block, so no baseline gap sits under it', () => {
    expect(blockOf('block')).toContain('display: block')
  })

  it('takes a handle in the block direction only, and none when it grows by itself', () => {
    expect(blockOf('resize-y')).toContain('resize: vertical')
    expect(blockOf('resize-none')).toContain('resize: none')
  })

  it('has the block padding of each size on its own', () => {
    expect(blockOf('py-2.5')).toContain('padding-block: calc(var(--spacing) * 2.5)')
  })
})

describe('the counter', () => {
  it('sits at the inline end of the holder and is hidden while it holds nothing', () => {
    expect(blockOf('justify-self-end')).toContain('justify-self: flex-end')
    expect(blockOf('empty:hidden')).toContain(':empty')
    expect(blockOf('empty:hidden')).toContain('display: none')
  })

  it('turns bold in the body colour at the cap, and bold in danger past it', () => {
    expect(blockOf('data-at-limit:font-semibold')).toContain('[data-at-limit]')
    expect(blockOf('data-at-limit:text-body')).toContain('color: var(--tc-body)')
    expect(blockOf('data-over-limit:text-danger-on-soft')).toContain('[data-over-limit]')
    expect(blockOf('data-over-limit:text-danger-on-soft')).toContain('color: var(--tc-danger-on-soft)')
  })

  it('reads its words to a screen reader only', () => {
    expect(blockOf('sr-only')).toContain('position: absolute')
  })
})

describe('the skeleton', () => {
  it('keeps the line breaks of its rows, so it is one line tall per row', () => {
    expect(blockOf('whitespace-pre')).toContain('white-space: pre')
  })
})
