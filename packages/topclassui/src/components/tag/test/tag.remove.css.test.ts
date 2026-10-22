import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { REMOVABLE, REMOVABLE_END, REMOVE_SIZE, TAG_LABEL, TAG_REMOVE } from '../classes.js'

/** What each class of the removable tag must emit, written out: a class Tailwind does not know emits nothing at all. */
const DECLARATION: Record<string, string> = {
  // POINTER: the hand, and the arrow back on a control that cannot be pressed.
  'cursor-pointer': 'cursor: pointer;',
  'disabled:cursor-default': 'cursor: default;',
  'aria-disabled:cursor-default': 'cursor: default;',
  'data-disabled:cursor-default': 'cursor: default;',
  'data-readonly:cursor-default': 'cursor: default;',
  'data-loading:cursor-default': 'cursor: default;',
  // The chip.
  'inline-grid': 'display: inline-grid;',
  'grid-cols-[minmax(0,auto)_auto]': 'grid-template-columns: minmax(0,auto) auto;',
  'overflow-visible': 'overflow: visible;',
  // DISABLED: a disabled x fades the whole chip and takes no press.
  'disabled:pointer-events-none': 'pointer-events: none;',
  'disabled:opacity-50': 'opacity: 50%;',
  'data-disabled:pointer-events-none': 'pointer-events: none;',
  'data-disabled:opacity-50': 'opacity: 50%;',
  'pe-pad-y-xs': 'padding-inline-end: calc(0.125rem * var(--tc-density));',
  'pe-pad-y-sm': 'padding-inline-end: calc(0.25rem * var(--tc-density));',
  'pe-pad-y-md': 'padding-inline-end: calc(0.375rem * var(--tc-density));',
  'pe-pad-y-lg': 'padding-inline-end: calc(0.5rem * var(--tc-density));',
  'pe-pad-y-xl': 'padding-inline-end: calc(0.625rem * var(--tc-density));',
  // The label.
  'truncate': 'text-overflow: ellipsis;',
  'min-w-0': 'min-width: 0px;',
  'flex': 'display: flex;',
  'items-center': 'align-items: center;',
  'gap-[inherit]': 'gap: inherit;',
  // The x.
  'inline-flex': 'display: inline-flex;',
  'shrink-0': 'flex-shrink: 0;',
  'justify-center': 'justify-content: center;',
  'rounded-control': 'border-radius: var(--tc-radius);',
  'min-h-[var(--tc-target-min,24px)]': 'min-height: var(--tc-target-min,24px);',
  'min-w-[var(--tc-target-min,24px)]': 'min-width: var(--tc-target-min,24px);',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': 'min-height: var(--tc-target-coarse,44px);',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]': 'min-width: var(--tc-target-coarse,44px);',
  'outline-none': 'outline-style: none;',
  'focus-visible:outline-solid': 'outline-style: solid;',
  'focus-visible:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': 'outline-offset: var(--tc-ring-offset);',
  'focus-visible:outline-ring': 'outline-color: var(--tc-ring);',
  'transition-[color,background-color,border-color,outline-color,opacity,translate]':
    'transition-property: color,background-color,border-color,outline-color,opacity,translate;',
  'duration-(--tc-duration)': 'transition-duration: var(--tc-duration);',
  'ease-out': 'transition-timing-function: var(--ease-out);',
  'hover:bg-(--tc-soft-hover)': 'background-color: var(--tc-soft-hover);',
  'active:bg-(--tc-soft-active)': 'background-color: var(--tc-soft-active);',
  'forced-colors:hover:forced-color-adjust-none': 'forced-color-adjust: none;',
  'forced-colors:hover:bg-[Highlight]': 'background-color: Highlight;',
  'forced-colors:hover:text-[HighlightText]': 'color: HighlightText;',
  '-my-[calc(var(--spacing-pad-y-xs)+var(--tc-line-width))]': 'margin-block: calc(calc(var(--spacing-pad-y-xs) + var(--tc-line-width)) * -1);',
  '-my-[calc(var(--spacing-pad-y-sm)+var(--tc-line-width))]': 'margin-block: calc(calc(var(--spacing-pad-y-sm) + var(--tc-line-width)) * -1);',
  '-my-[calc(var(--spacing-pad-y-md)+var(--tc-line-width))]': 'margin-block: calc(calc(var(--spacing-pad-y-md) + var(--tc-line-width)) * -1);',
  '-my-[calc(var(--spacing-pad-y-lg)+var(--tc-line-width))]': 'margin-block: calc(calc(var(--spacing-pad-y-lg) + var(--tc-line-width)) * -1);',
  '-my-[calc(var(--spacing-pad-y-xl)+var(--tc-line-width))]': 'margin-block: calc(calc(var(--spacing-pad-y-xl) + var(--tc-line-width)) * -1);',
  // The pull back over the chip's gap, one per gap of TAG_SIZE: 4, 6, 8 and 12 px.
  '-ms-1': 'margin-inline-start: calc(var(--spacing) * -1);',
  '-ms-1.5': 'margin-inline-start: calc(var(--spacing) * -1.5);',
  '-ms-2': 'margin-inline-start: calc(var(--spacing) * -2);',
  '-ms-3': 'margin-inline-start: calc(var(--spacing) * -3);',
}

/** The state or the media each variant class must sit under, or it would paint at rest. */
const SCOPE: Record<string, string> = {
  'hover:bg-(--tc-soft-hover)': ':hover',
  'active:bg-(--tc-soft-active)': ':active',
  'forced-colors:hover:forced-color-adjust-none': ':hover',
  'forced-colors:hover:bg-[Highlight]': ':hover',
  'forced-colors:hover:text-[HighlightText]': ':hover',
  'focus-visible:outline-solid': ':focus-visible',
  'disabled:opacity-50': ':disabled',
  'data-disabled:opacity-50': '[data-disabled]',
}

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The rule Tailwind emits for one class: from its selector to the first closing brace. */
function ruleFor(css: string, cls: string): string {
  const from = css.indexOf(`.${escape(cls)}`)
  return from === -1 ? '' : css.slice(from, css.indexOf('}', from) + 1)
}

/** The media block a class sits in, read back from its selector to the start of the sheet. */
const inForcedColors = (css: string, cls: string) => {
  const before = css.slice(0, css.indexOf(`.${escape(cls)}`))
  return before.lastIndexOf('@media (forced-colors: active)') > before.lastIndexOf('}\n  }')
}

const written = (strings: readonly string[]) => [...new Set(strings.join(' ').split(' '))].filter(Boolean).sort()

describe('every class of the removable tag compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of the chip, the label, the x and the two size tables', () => {
    const all = written([REMOVABLE, ...Object.values(REMOVABLE_END), TAG_LABEL, TAG_REMOVE, ...Object.values(REMOVE_SIZE)])
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(53)
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }

  for (const [cls, scope] of Object.entries(SCOPE)) {
    it(`${cls} applies only under ${scope}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(scope)
    })
  }

  it('the forced-colours hover sits inside the forced-colours media query, and the plain hover does not', async () => {
    const sheet = await css
    expect(inForcedColors(sheet, 'forced-colors:hover:bg-[Highlight]')).toBe(true)
    expect(inForcedColors(sheet, 'hover:bg-(--tc-soft-hover)')).toBe(false)
  })

  // The reach reads the theme's padding by name, so the sheet must declare it, or the margin is invalid and drops to 0.
  it('declares the five block paddings the reach of the x reads', async () => {
    const sheet = await css
    for (const [size, rem] of [['xs', '0.125rem'], ['sm', '0.25rem'], ['md', '0.375rem'], ['lg', '0.5rem'], ['xl', '0.625rem']]) {
      expect(sheet, size).toContain(`--spacing-pad-y-${String(size)}: calc(${String(rem)} * var(--tc-density));`)
    }
  })

  it('the rule scan reads nothing for a class that has no rule', async () => {
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})
