/** A class list cannot show that a class compiles or what it sets, so this compiles the real entry
 * and reads what the browser would get, for every element the block renders. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { compileEntry } from '#test/stylesheet.js'
import { CodeBlock } from '../index.js'

/** Every class of every element in the markup, not only the first. */
const allClasses = (html: string) => [...html.matchAll(/class="([^"]*)"/g)].flatMap(([, list]) => (list ?? '').split(/\s+/)).filter(Boolean)

const RENDERED = [...new Set([
  ...allClasses(markup(createElement(CodeBlock, { title: 'page.tsx', children: 'a' }))),
  ...allClasses(markup(createElement(CodeBlock, { showCopy: false, wrap: true, children: 'a' }))),
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
    for (const cls of ['tab-2', 'wrap-anywhere', 'sr-only', 'whitespace-pre-wrap', 'rounded-box']) expect(RENDERED, cls).toContain(cls)
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => ruleAt(cls) === -1)).toEqual([])
  })
})

describe('what the rules set', () => {
  it('the root sets --tc-ring to the block text, which the outline-ring of both rings reads', () => {
    expect(blockOf('[--tc-ring:var(--tc-neutral-on-solid)]')).toContain('--tc-ring: var(--tc-neutral-on-solid)')
    expect(blockOf('bg-neutral-solid')).toContain('var(--tc-neutral-solid)')
  })

  it('a classic scrollbar on the pre takes the block colours: the halfway thumb on the block fill, never the page scheme', () => {
    expect(blockOf('[--tc-scrollbar-thumb:var(--tc-neutral-solid-thumb)]')).toContain('--tc-scrollbar-thumb: var(--tc-neutral-solid-thumb)')
    expect(blockOf('[--tc-scrollbar-track:var(--tc-neutral-solid)]')).toContain('--tc-scrollbar-track: var(--tc-neutral-solid)')
  })

  it('the pre that sets the two tokens is the one that draws the shared bar from them', () => {
    const pre = /<pre[^>]*class="([^"]*)"/.exec(markup(createElement(CodeBlock, { children: 'a' })))?.[1]?.split(' ') ?? []
    expect(pre).toEqual(expect.arrayContaining([
      '[--tc-scrollbar-thumb:var(--tc-neutral-solid-thumb)]', '[--tc-scrollbar-track:var(--tc-neutral-solid)]',
      '[scrollbar-width:thin]', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]',
    ]))
    expect(blockOf('[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]'))
      .toContain('scrollbar-color: var(--tc-scrollbar-thumb) var(--tc-scrollbar-track)')
  })

  it('the code keeps its spaces, a tab is two columns, and it scrolls sideways', () => {
    expect(blockOf('whitespace-pre')).toContain('white-space: pre')
    expect(blockOf('tab-2')).toContain('tab-size: 2')
    expect(blockOf('overflow-x-auto')).toContain('overflow-x: auto')
  })

  it('wrap breaks anywhere, so one 300-character word breaks too', () => {
    expect(blockOf('whitespace-pre-wrap')).toContain('white-space: pre-wrap')
    expect(blockOf('wrap-anywhere')).toContain('overflow-wrap: anywhere')
  })

  it('the hover tint is one tenth of the text colour, and the header text seven tenths', () => {
    expect(blockOf('hover:bg-neutral-on-solid/10')).toContain('10%')
    expect(blockOf('text-neutral-on-solid/70')).toContain('70%')
  })
})
