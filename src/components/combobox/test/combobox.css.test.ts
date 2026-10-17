/** A closed listbox renders none of its classes, so the static stylesheet never holds them (unit-4.md, "A popup's
 * classes never reach the static stylesheet"): this compiles the real entry with every class of the Combobox's own
 * strings and reads the rule of the ones that carry a guarantee. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  COMBOBOX_ACTIVE, COMBOBOX_ICON, COMBOBOX_INPUT, COMBOBOX_INPUT_END, COMBOBOX_ITEM, COMBOBOX_ITEM_TEXT, COMBOBOX_ITEM_TICK,
  COMBOBOX_LIST, COMBOBOX_NOTE, COMBOBOX_POPUP, COMBOBOX_POSITIONER, COMBOBOX_ROOT, COMBOBOX_SPIN, COMBOBOX_UNIT,
  COMBOBOX_WIDTH,
} from '../classes.js'

const OWN = [
  COMBOBOX_ACTIVE, COMBOBOX_ICON, COMBOBOX_INPUT, COMBOBOX_INPUT_END, COMBOBOX_ITEM, COMBOBOX_ITEM_TEXT, COMBOBOX_ITEM_TICK,
  COMBOBOX_LIST, COMBOBOX_NOTE, COMBOBOX_POPUP, COMBOBOX_POSITIONER, COMBOBOX_ROOT, COMBOBOX_SPIN, COMBOBOX_UNIT,
  COMBOBOX_WIDTH.own, COMBOBOX_WIDTH.full,
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

describe('every class of the Combobox paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(70)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the box and the input', () => {
  it('the box is an Input wide, or its parent wide with fullWidth, and the caret sits over the end of the input', () => {
    expect(ruleOf(selectorOf('w-[min(100%,var(--tc-input-width))]'))).toBe('width: min(100%, var(--tc-input-width));')
    expect(ruleOf(selectorOf('inset-e-3'))).toBe('inset-inline-end: calc(var(--spacing) * 3);')
    expect(ruleOf(selectorOf('pe-9'))).toBe('padding-inline-end: calc(var(--spacing) * 9);')
  })

  it('a read-only input takes the soft fill, and the spinner stands still under reduced motion', () => {
    expect(ruleOf(`${selectorOf('data-readonly:bg-neutral-soft')}[data-readonly]`)).toBe('background-color: var(--tc-neutral-soft);')
    expect(mediaOf(selectorOf('motion-reduce:animate-none'))).toBe('@media (prefers-reduced-motion: reduce)')
  })
})

describe('the popup', () => {
  it('sits on the popup layer and hides with its input', () => {
    expect(ruleOf(selectorOf('z-(--tc-z-popup)'))).toBe('z-index: var(--tc-z-popup);')
    expect(ruleOf(`${selectorOf('data-anchor-hidden:invisible')}[data-anchor-hidden]`)).toBe('visibility: hidden;')
  })

  it('is as wide as the input, and never wider or taller than the room Base UI measured', () => {
    expect(ruleOf(selectorOf('w-(--anchor-width)'))).toBe('width: var(--anchor-width);')
    expect(ruleOf(selectorOf('max-w-(--available-width)'))).toBe('max-width: var(--available-width);')
    expect(ruleOf(selectorOf('max-h-(--available-height)'))).toBe('max-height: var(--available-height);')
  })
})

describe('the list', () => {
  it('draws the two spacers as pseudo-elements from the two tokens, never as its padding', () => {
    expect(css).toMatch(/\.before\\:h-\\\(--tc-list-pad-start\\\)::before \{[^}]*height: var\(--tc-list-pad-start\);/)
    expect(css).toMatch(/\.after\\:h-\\\(--tc-list-pad-end\\\)::after \{[^}]*height: var\(--tc-list-pad-end\);/)
    expect(COMBOBOX_LIST).not.toMatch(/\bp[ty]-\(/)
  })

  it('takes no gap between its rows: the window counts rows only', () => {
    expect(COMBOBOX_LIST.split(' ').filter((cls) => cls.startsWith('gap'))).toEqual([])
  })

  it('is capped at the row count, scrolls inside itself without moving the page, and goes when nothing matches', () => {
    expect(ruleOf(selectorOf('max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)))]')))
      .toBe('max-height: min(var(--available-height,100dvh), calc(var(--tc-list-rows) * var(--tc-row-height)));')
    expect(ruleOf(selectorOf('overscroll-contain'))).toBe('overscroll-behavior: contain;')
    expect(ruleOf(`${selectorOf('empty:hidden')}:empty`)).toBe('display: none;')
  })
})

describe('a row', () => {
  it('is exactly one unit tall, and 44 px under a finger, so the spacers stand for whole rows', () => {
    expect(ruleOf(selectorOf('h-(--tc-row-height)'))).toBe('height: var(--tc-row-height);')
    const coarse = 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'
    expect(mediaOf(selectorOf(coarse))).toBe('@media (pointer: coarse)')
    expect(COMBOBOX_ITEM.split(' ')).toEqual(expect.arrayContaining(['h-(--tc-row-height)', coarse, 'shrink-0']))
  })

  it('the active row carries a line inside its edge as well as its fill, HighlightText under forced colours', () => {
    expect(ruleOf(`${selectorOf('data-highlighted:outline-solid')}[data-highlighted]`)).toContain('outline-style: solid;')
    expect(ruleOf(`${selectorOf('forced-colors:data-highlighted:outline-[HighlightText]')}[data-highlighted]`)).toBe('outline-color: HighlightText;')
    expect(ruleOf(`${selectorOf('forced-colors:data-highlighted:bg-[Highlight]')}[data-highlighted]`)).toBe('background-color: Highlight;')
  })

  it('the chosen row is heavier as well as ticked, and a disabled one dims to half', () => {
    expect(ruleOf(`${selectorOf('data-selected:font-medium')}[data-selected]`)).toBe('--tw-font-weight: var(--font-weight-medium); font-weight: var(--font-weight-medium);')
    expect(ruleOf(`${selectorOf('data-disabled:opacity-50')}[data-disabled]`)).toBe('opacity: 50%;')
  })

  it('the label ends in an ellipsis, and the tick sits at the inline end', () => {
    expect(COMBOBOX_ITEM_TEXT.split(' ')).toEqual(expect.arrayContaining(['truncate', 'min-w-0', 'flex-1']))
    expect(ruleOf(selectorOf('ms-auto'))).toBe('margin-inline-start: auto;')
  })
})

describe('the notes', () => {
  it('a live region with nothing to say takes no room, and stays in the page so it can announce', () => {
    expect(ruleOf(`${selectorOf('empty:p-0')}:empty`)).toBe('padding: 0px;')
    expect(COMBOBOX_NOTE).not.toContain('hidden')
  })
})
