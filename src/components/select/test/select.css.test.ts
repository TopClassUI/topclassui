/** A closed listbox renders none of its classes, so the static stylesheet never holds them (unit-4.md, "A popup's
 * classes never reach the static stylesheet"): this compiles the real entry with every class of the Select's own
 * strings and reads the rule of the ones that carry a guarantee. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  SELECT_ICON, SELECT_ITEM, SELECT_ITEM_TEXT, SELECT_ITEM_TICK, SELECT_LIST, SELECT_POPUP, SELECT_POSITIONER, SELECT_ROOT,
  SELECT_TRIGGER, SELECT_VALUE,
} from '../classes.js'

const OWN = [SELECT_ICON, SELECT_ITEM, SELECT_ITEM_TEXT, SELECT_ITEM_TICK, SELECT_LIST, SELECT_POPUP, SELECT_POSITIONER, SELECT_ROOT, SELECT_TRIGGER, SELECT_VALUE]
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

describe('every class of the Select paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(60)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the box and the trigger', () => {
  it('the box is one column that may shrink to nothing and grows to an Input', () => {
    expect(ruleOf(selectorOf('grid-cols-[minmax(0,var(--tc-input-width))]'))).toBe('grid-template-columns: minmax(0,var(--tc-input-width));')
    expect(ruleOf(selectorOf('w-fit'))).toBe('width: fit-content;')
    expect(ruleOf(selectorOf('inline-grid'))).toBe('display: inline-grid;')
  })

  it('the placeholder is muted, a read-only trigger takes the soft fill', () => {
    expect(ruleOf(`${selectorOf('data-placeholder:text-muted')}[data-placeholder]`)).toBe('color: var(--tc-muted);')
    expect(ruleOf(`${selectorOf('data-readonly:bg-neutral-soft')}[data-readonly]`)).toBe('background-color: var(--tc-neutral-soft);')
  })
})

describe('the popup', () => {
  it('sits on the popup layer and hides with its trigger', () => {
    expect(ruleOf(selectorOf('z-(--tc-z-popup)'))).toBe('z-index: var(--tc-z-popup);')
    expect(ruleOf(`${selectorOf('data-anchor-hidden:invisible')}[data-anchor-hidden]`)).toBe('visibility: hidden;')
  })

  it('is at least as wide as its trigger, and never wider than the room Base UI measured', () => {
    expect(ruleOf(selectorOf('min-w-(--anchor-width)'))).toBe('min-width: var(--anchor-width);')
    expect(ruleOf(selectorOf('max-w-(--available-width)'))).toBe('max-width: var(--available-width);')
  })

  it('is never taller than the room either, its line included, so it stays 8 px from the screen\'s edge', () => {
    expect(SELECT_POPUP.split(' ')).toContain('max-h-(--available-height)')
    expect(ruleOf(selectorOf('max-h-(--available-height)'))).toBe('max-height: var(--available-height);')
  })
})

describe('the list (R-10.5-1)', () => {
  it('is capped at the row count and at the room there is, and scrolls inside itself without moving the page', () => {
    expect(ruleOf(selectorOf('max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)))]')))
      .toBe('max-height: min(var(--available-height,100dvh), calc(var(--tc-list-rows) * var(--tc-row-height)));')
    expect(ruleOf(selectorOf('overflow-y-auto'))).toBe('overflow-y: auto;')
    expect(ruleOf(selectorOf('overscroll-contain'))).toBe('overscroll-behavior: contain;')
  })
})

describe('a row', () => {
  it('is 44 px under a finger', () => {
    const cls = 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'
    expect(ruleOf(selectorOf(cls))).toBe('min-height: var(--tc-target-coarse,44px);')
    expect(mediaOf(selectorOf(cls))).toBe('@media (pointer: coarse)')
    expect(SELECT_ITEM.split(' ')).toContain(cls)
  })

  it('the chosen row is heavier as well as ticked, and the highlighted one takes the Highlight pair under forced colours', () => {
    expect(ruleOf(`${selectorOf('data-selected:font-medium')}[data-selected]`)).toBe('--tw-font-weight: var(--font-weight-medium); font-weight: var(--font-weight-medium);')
    expect(ruleOf(`${selectorOf('forced-colors:data-highlighted:bg-[Highlight]')}[data-highlighted]`)).toBe('background-color: Highlight;')
  })

  it('a disabled option dims to half', () => {
    expect(ruleOf(`${selectorOf('data-disabled:opacity-50')}[data-disabled]`)).toBe('opacity: 50%;')
  })

  it('the label ends in an ellipsis, and the tick sits at the inline end', () => {
    expect(SELECT_ITEM_TEXT.split(' ')).toEqual(expect.arrayContaining(['truncate', 'min-w-0', 'flex-1']))
    expect(ruleOf(selectorOf('ms-auto'))).toBe('margin-inline-start: auto;')
  })
})
