/** A class list cannot show that a class compiles or what it does, so this compiles the real entry and reads what the
 * browser gets for each class Field renders, stacked and inline. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { compileEntry } from '#test/stylesheet.js'
import { Field } from '../index.js'

/** Every class of every element in the markup, not only the first. */
const allClasses = (html: string) => [...html.matchAll(/class="([^"]*)"/g)].flatMap(([, list]) => (list ?? '').split(/\s+/)).filter(Boolean)
const render = (inline: boolean) => markup(createElement(Field, {
  name: 'n', label: 'L', hint: 'H', error: 'E', required: true, inline, children: () => null,
}))

const RENDERED = [...new Set([...allClasses(render(false)), ...allClasses(render(true))])]

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

describe('every class Field renders paints something', () => {
  it('rendered the classes at all, so an empty list cannot pass', () => {
    expect(RENDERED.length).toBeGreaterThan(25)
    for (const cls of ['grid-cols-[auto_minmax(0,1fr)]', 'wrap-anywhere', 'text-danger-on-soft', 'col-start-2', 'h-5']) expect(RENDERED, cls).toContain(cls)
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => ruleAt(cls) === -1)).toEqual([])
  })
})

describe('the layout', () => {
  it('inline is a column at the control width and one that takes the rest and may shrink to nothing', () => {
    expect(blockOf('grid-cols-[auto_minmax(0,1fr)]')).toContain('grid-template-columns: auto minmax(0,1fr)')
  })

  it('the label and the notes go to the second column, the label and the control to the first row', () => {
    expect(blockOf('col-start-2')).toContain('grid-column-start: 2')
    expect(blockOf('row-start-1')).toContain('grid-row-start: 1')
    expect(blockOf('col-start-1')).toContain('grid-column-start: 1')
  })

  it('a long word breaks anywhere, and min-w-0 lets the root shrink below its longest word', () => {
    expect(blockOf('wrap-anywhere')).toContain('overflow-wrap: anywhere')
    expect(blockOf('min-w-0')).toContain('min-width: 0px')
  })
})

describe('the colours are tokens', () => {
  it('the error and the asterisk are danger on soft; the hint is muted; the label the body colour', () => {
    expect(blockOf('text-danger-on-soft')).toContain('color: var(--tc-danger-on-soft)')
    expect(blockOf('text-muted')).toContain('color: var(--tc-muted)')
    expect(blockOf('text-body')).toContain('color: var(--tc-body)')
  })
})
