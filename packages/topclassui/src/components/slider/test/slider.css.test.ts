/** A class list cannot show that a class compiles or what it resolves to, so this compiles the real entry with
 * every class of the slider's own strings and reads the rule of each one. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  SLIDER_CONTROL, SLIDER_CONTROL_SIZE, SLIDER_FULL, SLIDER_INDICATOR, SLIDER_KNOB, SLIDER_KNOB_SIZE, SLIDER_ROOT, SLIDER_ROW, SLIDER_TEXT, SLIDER_THUMB,
  SLIDER_TRACK, SLIDER_TRACK_SIZE, SLIDER_VALUE,
} from '../classes.js'

const OWN = [
  SLIDER_CONTROL, SLIDER_FULL, SLIDER_INDICATOR, SLIDER_KNOB, SLIDER_ROOT, SLIDER_ROW, SLIDER_THUMB, SLIDER_TRACK, SLIDER_VALUE,
  ...Object.values(SLIDER_CONTROL_SIZE), ...Object.values(SLIDER_KNOB_SIZE), ...Object.values(SLIDER_TEXT), ...Object.values(SLIDER_TRACK_SIZE),
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

/** The nearest media query opened before a rule. */
const mediaOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim()
}

const INVALID = ':is(:where(.group\\/slider)[aria-invalid="true"] *)'
const FOCUSED = ':is(:where(.group\\/thumb):has(:focus-visible) *)'

describe('every class of the slider paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(40)
  })

  it('finds each one in the sheet, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the box that owns the width', () => {
  it('one column, as wide as an Input of its size and no wider than its parent; fullWidth fills it', () => {
    expect(ruleOf(selectorOf('grid-cols-[minmax(0,var(--tc-input-width))]'))).toBe('grid-template-columns: minmax(0,var(--tc-input-width));')
    expect(ruleOf(selectorOf('w-fit'))).toBe('width: fit-content;')
    expect(ruleOf(selectorOf('max-w-full'))).toBe('max-width: 100%;')
    expect(ruleOf(selectorOf('grid-cols-1'))).toBe('grid-template-columns: repeat(1, minmax(0, 1fr));')
  })

  it('a range input disabled by a fieldset, which Base UI does not know, dims the root and shows not-allowed on it', () => {
    expect(ruleOf(`${selectorOf('has-disabled:cursor-not-allowed')}:has(:disabled)`)).toBe('cursor: not-allowed;')
    expect(ruleOf(`${selectorOf('has-disabled:opacity-50')}:has(:disabled)`)).toBe('opacity: 50%;')
    expect(SLIDER_ROOT).not.toContain('pointer-events')
  })

  it('and stops a press on its track at the control, so the root around it keeps the cursor', () => {
    expect(SLIDER_CONTROL.split(' ')).toContain('group-has-disabled/slider:pointer-events-none')
    expect(ruleOf(`${selectorOf('group-has-disabled/slider:pointer-events-none')}:is(:where(.group\\/slider):has(:disabled) *)`))
      .toBe('pointer-events: none;')
  })

  it('the control is padded by half a target, 12 px, and 22 under a finger', () => {
    expect(ruleOf(selectorOf('px-[calc(var(--tc-target-min,24px)/2)]'))).toBe('padding-inline: calc(var(--tc-target-min,24px) / 2);')
    const coarse = 'pointer-coarse:px-[calc(var(--tc-target-coarse,44px)/2)]'
    expect(ruleOf(selectorOf(coarse))).toBe('padding-inline: calc(var(--tc-target-coarse,44px) / 2);')
    expect(mediaOf(selectorOf(coarse))).toBe('@media (pointer: coarse)')
  })

  it('at each size the control pads by half the knob and its focus ring when that is more than half a target', () => {
    const [fine, coarse] = SLIDER_CONTROL_SIZE.md.split(' ')
    expect(ruleOf(selectorOf(fine ?? ''))).toBe(
      'padding-inline: max(calc(var(--tc-target-min,24px) / 2), calc(var(--spacing-knob-md) / 2 + var(--tc-ring-offset) + var(--tc-ring-width)));',
    )
    expect(ruleOf(selectorOf(coarse ?? ''))).toBe(
      'padding-inline: max(calc(var(--tc-target-coarse,44px) / 2), calc(var(--spacing-knob-md) / 2 + var(--tc-ring-offset) + var(--tc-ring-width)));',
    )
    expect(mediaOf(selectorOf(coarse ?? ''))).toBe('@media (pointer: coarse)')
    for (const size of ['xs', 'sm', 'lg', 'xl'] as const) {
      expect(SLIDER_CONTROL_SIZE[size].split(' ').map((cls) => ruleOf(selectorOf(cls)).includes(`var(--spacing-knob-${size}) / 2 + var(--tc-ring-offset)`)), size)
        .toEqual([true, true])
    }
    expect(SLIDER_CONTROL_SIZE.custom).toBe('')
  })

  it('showValue: a value too long for the line moves below the track, which keeps two thirds of the row, and wraps there', () => {
    expect(ruleOf(selectorOf('flex-wrap'))).toBe('flex-wrap: wrap;')
    expect(ruleOf(selectorOf('gap-y-1'))).toBe('row-gap: var(--spacing);')
    expect(ruleOf(selectorOf('min-w-2/3'))).toBe('min-width: calc(2 / 3 * 100%);')
    expect(ruleOf(selectorOf('ms-auto'))).toBe('margin-inline-start: auto;')
    expect(ruleOf(selectorOf('wrap-anywhere'))).toBe('overflow-wrap: anywhere;')
  })

  it('a drag on the control never scrolls the page or selects its text', () => {
    expect(ruleOf(selectorOf('touch-none'))).toBe('touch-action: none;')
    expect(ruleOf(selectorOf('select-none'))).toBe('-webkit-user-select: none; user-select: none;')
  })
})

describe('the track, the fill and the knob', () => {
  it('the track is 4, 6 or 8 px tall; custom draws no height', () => {
    const heights = Object.fromEntries(Object.entries(SLIDER_TRACK_SIZE).filter(([size]) => size !== 'custom')
      .map(([size, cls]) => [size, ruleOf(selectorOf(cls))]))
    expect(heights).toEqual({
      xs: 'height: var(--spacing);', sm: 'height: var(--spacing);', md: 'height: calc(var(--spacing) * 1.5);',
      lg: 'height: calc(var(--spacing) * 2);', xl: 'height: calc(var(--spacing) * 2);',
    })
    expect(SLIDER_TRACK_SIZE.custom).toBe('')
  })

  it('the fill is primary, and under forced colours Highlight, painted as it is', () => {
    expect(ruleOf(selectorOf('bg-primary-solid'))).toBe('background-color: var(--tc-primary-solid);')
    expect(ruleOf(selectorOf('forced-colors:bg-[Highlight]'))).toBe('background-color: Highlight;')
    expect(ruleOf(selectorOf('forced-colors:forced-color-adjust-none'))).toBe('forced-color-adjust: none;')
    expect(mediaOf(selectorOf('forced-colors:bg-[Highlight]'))).toBe('@media (forced-colors: active)')
  })

  it('the track has a line-strong edge at rest, which also keeps it under forced colours, where its fill is erased', () => {
    expect(ruleOf(selectorOf('outline-solid'))).toBe('--tw-outline-style: solid; outline-style: solid;')
    expect(ruleOf(selectorOf('outline-(length:--tc-line-width)'))).toBe('outline-style: var(--tw-outline-style); outline-width: var(--tc-line-width);')
    expect(ruleOf(selectorOf('outline-line-strong'))).toBe('outline-color: var(--tc-line-strong);')
  })

  it('the knob: a 2 px primary line on the raised surface, round', () => {
    expect(ruleOf(selectorOf('border-(length:--tc-ring-width)'))).toBe('border-style: var(--tw-border-style); border-width: var(--tc-ring-width);')
    expect(ruleOf(selectorOf('border-primary-solid'))).toBe('border-color: var(--tc-primary-solid);')
    expect(ruleOf(selectorOf('bg-surface-raised'))).toBe('background-color: var(--tc-surface-raised);')
    expect(ruleOf(selectorOf('rounded-full'))).toBe('border-radius: calc(infinity * 1px);')
  })

  it('the ring is on the knob while the range input inside its thumb has the focus', () => {
    expect(ruleOf(`${selectorOf('group-has-focus-visible/thumb:outline-solid')}${FOCUSED}`)).toBe('--tw-outline-style: solid; outline-style: solid;')
    expect(ruleOf(`${selectorOf('group-has-focus-visible/thumb:outline-(length:--tc-ring-width)')}${FOCUSED}`))
      .toBe('outline-style: var(--tw-outline-style); outline-width: var(--tc-ring-width);')
    expect(ruleOf(`${selectorOf('group-has-focus-visible/thumb:outline-offset-(length:--tc-ring-offset)')}${FOCUSED}`)).toBe('outline-offset: var(--tc-ring-offset);')
    expect(ruleOf(`${selectorOf('group-has-focus-visible/thumb:outline-ring')}${FOCUSED}`)).toBe('outline-color: var(--tc-ring);')
  })
})

describe('invalid sits on the group, and is told by more than hue', () => {
  it('the fill and the knob turn to danger', () => {
    expect(ruleOf(`${selectorOf('group-aria-invalid/slider:bg-danger-solid')}${INVALID}`)).toBe('background-color: var(--tc-danger-solid);')
    expect(ruleOf(`${selectorOf('group-aria-invalid/slider:border-danger-solid')}${INVALID}`)).toBe('border-color: var(--tc-danger-solid);')
  })

  it('under forced colours an invalid fill is Highlight too, never the author red', () => {
    const forced = 'forced-colors:group-aria-invalid/slider:bg-[Highlight]'
    expect(ruleOf(`${selectorOf(forced)}${INVALID}`)).toBe('background-color: Highlight;')
    expect(mediaOf(`${selectorOf(forced)}${INVALID}`)).toBe('@media (forced-colors: active)')
  })

  it('the line around the track turns to danger, and thickens under forced colours', () => {
    expect(ruleOf(`${selectorOf('group-aria-invalid/slider:outline-danger-solid')}${INVALID}`)).toBe('outline-color: var(--tc-danger-solid);')
    const forced = 'forced-colors:group-aria-invalid/slider:outline-(length:--tc-ring-width)'
    expect(ruleOf(`${selectorOf(forced)}${INVALID}`)).toBe('outline-style: var(--tw-outline-style); outline-width: var(--tc-ring-width);')
    expect(mediaOf(`${selectorOf(forced)}${INVALID}`)).toBe('@media (forced-colors: active)')
  })
})
