/** Compiles the real entry with every class of the TreeView's own strings and reads the rule of the ones that carry a
 * guarantee: the unit height, the indent, the spacers, the two rings and the forced-colours pair. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  TREE_VIEW_CARET, TREE_VIEW_ICON, TREE_VIEW_LABEL, TREE_VIEW_NOTE, TREE_VIEW_ROOT, TREE_VIEW_ROW, TREE_VIEW_ROW_ACTIVE,
  TREE_VIEW_ROW_DISABLED, TREE_VIEW_ROW_SELECTED, TREE_VIEW_TREE,
} from '../classes.js'

const OWN = [
  TREE_VIEW_CARET, TREE_VIEW_ICON, TREE_VIEW_LABEL, TREE_VIEW_NOTE, TREE_VIEW_ROOT, TREE_VIEW_ROW, TREE_VIEW_ROW_ACTIVE,
  TREE_VIEW_ROW_DISABLED, TREE_VIEW_ROW_SELECTED, TREE_VIEW_TREE,
]
const CLASSES = [...new Set(OWN.join(' ').split(' ').filter(Boolean))]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(CLASSES)
})

/** Tailwind's selector for a class: every character outside a plain name is escaped. */
const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

/** The declarations of the first rule that starts with a selector, without the braces, on one line. */
const ruleOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).replace(/\s+/g, ' ').trim()
}

/** The at-rule a class's rule sits in, read back from the rule. */
const mediaOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim()
}

describe('every class of the TreeView paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(60)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the tree', () => {
  it('draws the two spacers as pseudo-elements from the two tokens, never as its padding, and takes no gap', () => {
    expect(ruleOf(`${selectorOf('before:h-(--tc-list-pad-start)')}::before`)).toContain('height: var(--tc-list-pad-start);')
    expect(ruleOf(`${selectorOf('after:h-(--tc-list-pad-end)')}::after`)).toContain('height: var(--tc-list-pad-end);')
    expect(TREE_VIEW_TREE.split(' ').filter((cls) => cls.startsWith('gap') || /^p[ty]-\(/.test(cls))).toEqual([])
  })

  it('is capped at the row count, 44 px rows under a finger, and scrolls inside itself without moving the page', () => {
    expect(ruleOf(selectorOf('max-h-[calc(var(--tc-list-rows)*var(--tc-row-height))]'))).toBe('max-height: calc(var(--tc-list-rows) * var(--tc-row-height));')
    const coarse = 'pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)))]'
    expect(mediaOf(selectorOf(coarse))).toBe('@media (pointer: coarse)')
    expect(ruleOf(selectorOf('overscroll-contain'))).toBe('overscroll-behavior: contain;')
  })

  it('draws its own ring inside its edge only while it has the keyboard and no row holds the highlight', () => {
    const tree = selectorOf('focus-visible:not-has-data-highlighted:outline-solid')
    expect(ruleOf(`${tree}:focus-visible:not(:has([data-highlighted]))`)).toContain('outline-style: solid;')
    expect(ruleOf(`${selectorOf('focus-visible:not-has-data-highlighted:-outline-offset-(length:--tc-ring-width)')}:focus-visible:not(:has([data-highlighted]))`))
      .toBe('outline-offset: calc(var(--tc-ring-width) * -1);')
  })

  it('draws its own ring too while the row holding the highlight is mounted but scrolled out of sight', () => {
    const at = (cls: string) => ruleOf(`${selectorOf(`focus-visible:data-highlight-hidden:${cls}`)}:focus-visible[data-highlight-hidden]`)
    expect(at('outline-solid')).toContain('outline-style: solid;')
    expect(at('outline-(length:--tc-ring-width)')).toContain('outline-width: var(--tc-ring-width);')
    expect(at('-outline-offset-(length:--tc-ring-width)')).toBe('outline-offset: calc(var(--tc-ring-width) * -1);')
    expect(at('outline-ring')).toBe('outline-color: var(--tc-ring);')
  })

  it('with no row it is not drawn', () => {
    expect(ruleOf(`${selectorOf('empty:hidden')}:empty`)).toBe('display: none;')
  })
})

describe('a row', () => {
  it('is exactly one unit tall, and 44 px under a finger, so the spacers stand for whole rows', () => {
    expect(ruleOf(selectorOf('h-(--tc-row-height)'))).toBe('height: var(--tc-row-height);')
    const coarse = 'pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'
    expect(mediaOf(selectorOf(coarse))).toBe('@media (pointer: coarse)')
    expect(ruleOf(selectorOf(coarse))).toBe('height: max(var(--tc-row-height), var(--tc-target-coarse,44px));')
  })

  it('starts one indent further in per level, on the inline start', () => {
    expect(ruleOf(selectorOf('ps-[calc(0.5rem+var(--tc-tree-level)*var(--tc-tree-indent))]')))
      .toBe('padding-inline-start: calc(0.5rem + var(--tc-tree-level) * var(--tc-tree-indent));')
  })

  it('the active row draws the ring inside its edge only while the tree has the keyboard', () => {
    const active = selectorOf('group-focus-visible/tree:data-highlighted:outline-solid')
    expect(ruleOf(`${active}:is(:where(.group\\/tree):focus-visible *)[data-highlighted]`)).toContain('outline-style: solid;')
  })

  it('selected: a tint and a heavier weight; under forced colours the system pair, the ring and the marks in HighlightText', () => {
    expect(ruleOf(`${selectorOf('aria-selected:font-medium')}[aria-selected="true"]`)).toContain('font-weight: var(--font-weight-medium);')
    expect(ruleOf(`${selectorOf('forced-colors:aria-selected:bg-[Highlight]')}[aria-selected="true"]`)).toBe('background-color: Highlight;')
    // Written with the ring's own condition, or the ring's colour wins on specificity (measured: the token's violet on Highlight).
    expect(ruleOf(`${selectorOf('forced-colors:aria-selected:group-focus-visible/tree:data-highlighted:outline-[HighlightText]')}[aria-selected="true"]:is(:where(.group\\/tree):focus-visible *)[data-highlighted]`))
      .toBe('outline-color: HighlightText;')
    expect(ruleOf(`${selectorOf('forced-colors:group-aria-selected/row:text-[HighlightText]')}:is(:where(.group\\/row)[aria-selected="true"] *)`))
      .toBe('color: HighlightText;')
    expect(mediaOf(`${selectorOf('forced-colors:aria-selected:bg-[Highlight]')}[aria-selected="true"]`)).toBe('@media (forced-colors: active)')
  })

  it('a disabled row dims to half and takes no pointer', () => {
    expect(ruleOf(`${selectorOf('aria-disabled:opacity-50')}[aria-disabled="true"]`)).toBe('opacity: 50%;')
    expect(ruleOf(`${selectorOf('aria-disabled:pointer-events-none')}[aria-disabled="true"]`)).toBe('pointer-events: none;')
  })

  it('the caret slot is 14 px wide on every row, and the label ends in an ellipsis', () => {
    expect(ruleOf(selectorOf('size-3.5'))).toBe('width: calc(var(--spacing) * 3.5); height: calc(var(--spacing) * 3.5);')
    expect(TREE_VIEW_LABEL.split(' ')).toEqual(['truncate', 'min-w-0', 'flex-1'])
  })
})

describe('the note', () => {
  it('a live region with nothing to say takes no room, and stays in the page so it can announce', () => {
    expect(ruleOf(`${selectorOf('empty:p-0')}:empty`)).toBe('padding: 0px;')
    expect(TREE_VIEW_NOTE).not.toContain('hidden')
  })
})
