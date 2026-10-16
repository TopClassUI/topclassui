/** A class list cannot show that a class compiles or what it resolves to, so this compiles the real entry with
 * every class of the segmented control's own strings and reads the rule of each one. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  SEGMENTED_FULL, SEGMENTED_HOLDER, SEGMENTED_HOLDER_FULL, SEGMENTED_ICON, SEGMENTED_ITEM, SEGMENTED_ITEM_SIZE,
  SEGMENTED_ROOT, SEGMENTED_ROOT_SIZE,
} from '../classes.js'

const OWN = [
  SEGMENTED_HOLDER, SEGMENTED_HOLDER_FULL, SEGMENTED_ROOT, SEGMENTED_FULL, SEGMENTED_ITEM, SEGMENTED_ICON,
  ...Object.values(SEGMENTED_ROOT_SIZE), ...Object.values(SEGMENTED_ITEM_SIZE),
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

/** The at-rule a selector sits in, so a forced-colours class is proven to apply under forced colours alone. */
const mediaOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim()
}

const CHECKED = '[data-checked]'

describe('every class of the segmented control paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(50)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the holder and the track', () => {
  it('the holder is one column that may shrink to nothing, so a long track never widens its parent', () => {
    expect(SEGMENTED_HOLDER).toBe('grid grid-cols-1')
    expect(ruleOf(selectorOf('grid-cols-1'))).toBe('grid-template-columns: repeat(1, minmax(0, 1fr));')
    expect(ruleOf(selectorOf('grid'))).toBe('display: grid;')
  })

  it('the track is as wide as its segments, never wider than its holder, and scrolls sideways inside itself', () => {
    expect(ruleOf(selectorOf('w-fit'))).toBe('width: fit-content;')
    expect(ruleOf(selectorOf('max-w-full'))).toBe('max-width: 100%;')
    expect(ruleOf(selectorOf('overflow-x-auto'))).toBe('overflow-x: auto;')
    expect(ruleOf(selectorOf('overscroll-x-contain'))).toBe('overscroll-behavior-x: contain;')
    expect(ruleOf(selectorOf('scroll-px-px'))).toBe('scroll-padding-inline: 1px;')
    expect(ruleOf(selectorOf('relative'))).toBe('position: relative;')
  })

  it('the track: a tinted surface, a decorative line, the control radius, and segments stretched to its height', () => {
    expect(ruleOf(selectorOf('bg-surface'))).toBe('background-color: var(--tc-surface);')
    expect(ruleOf(selectorOf('border-line'))).toBe('border-color: var(--tc-line);')
    expect(ruleOf(selectorOf('rounded-control'))).toBe('border-radius: var(--tc-radius);')
    expect(ruleOf(selectorOf('items-stretch'))).toBe('align-items: stretch;')
    expect(ruleOf(selectorOf('p-0.75'))).toBe('padding: calc(var(--spacing) * 0.75);')
  })

  it('the height of the track at each size is the control scale, and custom draws none', () => {
    const sizes = Object.fromEntries(Object.entries(SEGMENTED_ROOT_SIZE).filter(([size]) => size !== 'custom')
      .map(([size, cls]) => [size, ruleOf(selectorOf(cls))]))
    const height = (rem: string) => `min-height: calc(${rem}rem * var(--tc-density));`
    expect(sizes).toEqual({ xs: height('1.75'), sm: height('2'), md: height('2.5'), lg: height('3'), xl: height('3.5') })
    expect(SEGMENTED_ROOT_SIZE.custom).toBe('')
  })

  it('invalid: the line of the track turns to danger and thickens, and under forced colours the border itself grows', () => {
    expect(ruleOf(`${selectorOf('aria-invalid:border-danger-solid')}[aria-invalid="true"]`)).toBe('border-color: var(--tc-danger-solid);')
    expect(ruleOf(`${selectorOf('aria-invalid:inset-ring-danger-solid')}[aria-invalid="true"]`)).toBe('--tw-inset-ring-color: var(--tc-danger-solid);')
    const forced = `${selectorOf('forced-colors:aria-invalid:border-(length:--tc-ring-width)')}[aria-invalid="true"]`
    expect(ruleOf(forced)).toBe('border-style: var(--tw-border-style); border-width: var(--tc-ring-width);')
    expect(mediaOf(forced)).toBe('@media (forced-colors: active)')
  })

  it('fullWidth: the track fills its holder and each child shares the width', () => {
    expect(ruleOf(selectorOf('w-full'))).toBe('width: 100%;')
    expect(ruleOf(`:is(${selectorOf('*:flex-1')} > *)`)).toBe('flex: 1;')
  })
})

describe('a segment', () => {
  it('holds one line, clips what does not fit and centres what does, from the start edge when it does not', () => {
    for (const [cls, rule] of [
      ['overflow-hidden', 'overflow: hidden;'], ['whitespace-nowrap', 'white-space: nowrap;'], ['shrink-0', 'flex-shrink: 0;'],
      ['justify-center-safe', 'justify-content: safe center;'], ['inline-flex', 'display: inline-flex;'],
    ]) expect(ruleOf(selectorOf(cls ?? '')), cls).toBe(rule)
  })

  it('selected: raised, shadowed, heavier and darker; not selected it is muted and medium', () => {
    expect(ruleOf(`${selectorOf('data-checked:bg-surface-raised')}${CHECKED}`)).toBe('background-color: var(--tc-surface-raised);')
    expect(ruleOf(`${selectorOf('data-checked:font-semibold')}${CHECKED}`)).toBe('--tw-font-weight: var(--font-weight-semibold); font-weight: var(--font-weight-semibold);')
    expect(ruleOf(`${selectorOf('data-checked:text-body')}${CHECKED}`)).toBe('color: var(--tc-body);')
    expect(ruleOf(`${selectorOf('data-checked:shadow-sm')}${CHECKED}`)).toContain('--tw-shadow: 0 1px 3px 0')
    expect(ruleOf(selectorOf('font-medium'))).toBe('--tw-font-weight: var(--font-weight-medium); font-weight: var(--font-weight-medium);')
    expect(ruleOf(selectorOf('text-muted'))).toBe('color: var(--tc-muted);')
  })

  it('selected under forced colours takes the system pair and paints it itself, with a ring that shows on it', () => {
    const rules = {
      'forced-colors:data-checked:forced-color-adjust-none': 'forced-color-adjust: none;',
      'forced-colors:data-checked:bg-[Highlight]': 'background-color: Highlight;',
      'forced-colors:data-checked:text-[HighlightText]': 'color: HighlightText;',
      'forced-colors:data-checked:[--tc-ring:HighlightText]': '--tc-ring: HighlightText;',
    }
    for (const [cls, rule] of Object.entries(rules)) {
      expect(ruleOf(`${selectorOf(cls)}${CHECKED}`), cls).toBe(rule)
      expect(mediaOf(`${selectorOf(cls)}${CHECKED}`), cls).toBe('@media (forced-colors: active)')
    }
  })

  // SEGMENTED-1: the system pair opts it out of forced colours, so the browser's GrayText never reaches it.
  it('selected and disabled under forced colours takes GrayText, as every other disabled segment does', () => {
    const both = '[data-checked][data-disabled]'
    expect(ruleOf(`${selectorOf('forced-colors:data-checked:data-disabled:bg-[GrayText]')}${both}`)).toBe('background-color: GrayText;')
    expect(ruleOf(`${selectorOf('forced-colors:data-checked:data-disabled:text-[Canvas]')}${both}`)).toBe('color: Canvas;')
    expect(mediaOf(`${selectorOf('forced-colors:data-checked:data-disabled:bg-[GrayText]')}${both}`)).toBe('@media (forced-colors: active)')
    expect(css.indexOf(selectorOf('forced-colors:data-checked:data-disabled:bg-[GrayText]')))
      .toBeGreaterThan(css.indexOf(selectorOf('forced-colors:data-checked:bg-[Highlight]')))
  })

  it('the ring is drawn inside the segment, since the track clips', () => {
    expect(ruleOf(`${selectorOf('focus-visible:-outline-offset-(length:--tc-ring-width)')}:focus-visible`)).toBe('outline-offset: calc(var(--tc-ring-width) * -1);')
  })

  it('a target of 24 px, 44 under a coarse pointer, and a disabled segment at half', () => {
    expect(ruleOf(selectorOf('min-h-[var(--tc-target-min,24px)]'))).toBe('min-height: var(--tc-target-min,24px);')
    expect(ruleOf(selectorOf('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'))).toBe('min-height: var(--tc-target-coarse,44px);')
    expect(ruleOf(`${selectorOf('disabled:opacity-50')}:disabled`)).toBe('opacity: 50%;')
  })

  it('the padding and the type step of each size, and custom draws none', () => {
    expect(SEGMENTED_ITEM_SIZE).toEqual({ xs: 'px-2 text-xs', sm: 'px-2.5 text-sm', md: 'px-3 text-sm', lg: 'px-4 text-base', xl: 'px-5 text-base', custom: '' })
    expect(ruleOf(selectorOf('px-2.5'))).toBe('padding-inline: calc(var(--spacing) * 2.5);')
  })

  it('the icon keeps its size when the label is cut', () => {
    expect(SEGMENTED_ICON).toBe('flex shrink-0')
  })
})
