import { describe, expect, it } from 'vitest'

import { CONTROL_SIZE } from '#shared/classes.js'
import { compileEntry } from '#test/stylesheet.js'
import { TABS_LIST, TABS_PANEL, TABS_ROOT, TABS_TAB } from '../classes.js'

const SHADOW = 'box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);'

/** What each class Tabs writes must emit, written out: a class Tailwind does not know emits nothing at all. */
const DECLARATION: Record<string, string> = {
  // The root, and the two lists.
  'grid': 'display: grid;',
  'grid-cols-1': 'grid-template-columns: repeat(1, minmax(0, 1fr));',
  'relative': 'position: relative;',
  'flex': 'display: flex;',
  'items-center': 'align-items: center;',
  'gap-6': 'gap: calc(var(--spacing) * 6);',
  'px-px': 'padding-inline: 1px;',
  'scroll-px-px': 'scroll-padding-inline: 1px;',
  'shadow-[inset_0_calc(var(--tc-line-width)*-1)_var(--tc-line)]':
    '--tw-shadow: inset 0 calc(var(--tc-line-width) * -1) var(--tw-shadow-color, var(--tc-line));',
  'forced-colors:border-b-(length:--tc-line-width)': 'border-bottom-width: var(--tc-line-width);',
  'overflow-x-auto': 'overflow-x: auto;',
  'overscroll-x-contain': 'overscroll-behavior-x: contain;',
  'w-fit': 'width: fit-content;',
  'max-w-full': 'max-width: 100%;',
  'gap-1': 'gap: var(--spacing);',
  'rounded-control': 'border-radius: var(--tc-radius);',
  'bg-surface': 'background-color: var(--tc-surface);',
  'p-1': 'padding: var(--spacing);',
  'forced-colors:outline-(length:--tc-line-width)': 'outline-width: var(--tc-line-width);',
  // A tab of either look.
  'inline-flex': 'display: inline-flex;',
  'shrink-0': 'flex-shrink: 0;',
  'justify-center-safe': 'justify-content: safe center;',
  'gap-2': 'gap: calc(var(--spacing) * 2);',
  'overflow-hidden': 'overflow: hidden;',
  'whitespace-nowrap': 'white-space: nowrap;',
  'font-normal': 'font-weight: var(--font-weight-normal);',
  'text-muted': 'color: var(--tc-muted);',
  'data-active:font-semibold': 'font-weight: var(--font-weight-semibold);',
  'data-active:text-body': 'color: var(--tc-body);',
  'outline-none': 'outline-style: none;',
  'focus-visible:outline-solid': 'outline-style: solid;',
  'focus-visible:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': 'outline-offset: calc(var(--tc-ring-width) * -1);',
  'focus-visible:outline-ring': 'outline-color: var(--tc-ring);',
  'min-h-[var(--tc-target-min,24px)]': 'min-height: var(--tc-target-min,24px);',
  'min-w-[var(--tc-target-min,24px)]': 'min-width: var(--tc-target-min,24px);',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': 'min-height: var(--tc-target-coarse,44px);',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]': 'min-width: var(--tc-target-coarse,44px);',
  'transition-[color,background-color,border-color,outline-color,opacity,translate]':
    'transition-property: color,background-color,border-color,outline-color,opacity,translate;',
  'duration-(--tc-duration)': 'transition-duration: var(--tc-duration);',
  'ease-out': 'transition-timing-function: var(--ease-out);',
  'data-disabled:pointer-events-none': 'pointer-events: none;',
  'data-disabled:*:opacity-50': 'opacity: 50%;',
  'forced-colors:data-disabled:*:opacity-100': 'opacity: 100%;',
  'forced-colors:data-disabled:not-data-active:text-[GrayText]': 'color: GrayText;',
  // The bar of the line look and the raised surface of the enclosed one.
  'border-b-2': 'border-bottom-width: 2px;',
  'border-transparent': 'border-color: transparent;',
  'data-active:border-primary-solid': 'border-color: var(--tc-primary-solid);',
  'forced-colors:border-[Canvas]': 'border-color: Canvas;',
  'forced-colors:data-active:border-[Highlight]': 'border-color: Highlight;',
  'data-active:bg-surface-raised': 'background-color: var(--tc-surface-raised);',
  'data-active:shadow-sm': SHADOW,
  'not-forced-colors:data-active:inset-ring-(length:--tc-line-width)': '--tw-inset-ring-shadow: inset 0 0 0 var(--tc-line-width) var(--tw-inset-ring-color, currentcolor);',
  'not-forced-colors:data-active:inset-ring-line-strong': '--tw-inset-ring-color: var(--tc-line-strong);',
  'forced-colors:data-active:forced-color-adjust-none': 'forced-color-adjust: none;',
  'forced-colors:data-active:bg-[Highlight]': 'background-color: Highlight;',
  'forced-colors:data-active:text-[HighlightText]': 'color: HighlightText;',
  'forced-colors:data-active:shadow-none': '--tw-shadow: 0 0 #0000;',
  'forced-colors:data-active:[--tc-ring:HighlightText]': '--tc-ring: HighlightText;',
  // The sizes of the shared scale.
  'h-control-xs': 'height: calc(1.75rem * var(--tc-density));',
  'h-control-sm': 'height: calc(2rem * var(--tc-density));',
  'h-control-md': 'height: calc(2.5rem * var(--tc-density));',
  'h-control-lg': 'height: calc(3rem * var(--tc-density));',
  'h-control-xl': 'height: calc(3.5rem * var(--tc-density));',
  'px-pad-x-xs': 'padding-inline: calc(0.5rem * var(--tc-density));',
  'px-pad-x-sm': 'padding-inline: calc(0.75rem * var(--tc-density));',
  'px-pad-x-md': 'padding-inline: calc(1rem * var(--tc-density));',
  'px-pad-x-lg': 'padding-inline: calc(1.25rem * var(--tc-density));',
  'px-pad-x-xl': 'padding-inline: calc(1.5rem * var(--tc-density));',
  'text-xs': 'font-size: var(--text-xs);',
  'text-sm': 'font-size: var(--text-sm);',
  'text-base': 'font-size: var(--text-base);',
  // The panel.
  'mt-4': 'margin-top: calc(var(--spacing) * 4);',
  'wrap-anywhere': 'overflow-wrap: anywhere;',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': 'outline-offset: var(--tc-ring-offset);',
}

/** The attribute or the state each variant class must be scoped to, or it would paint on every tab. */
const SCOPE: Record<string, string> = {
  'data-active:font-semibold': '[data-active] {',
  'data-active:text-body': '[data-active] {',
  'data-active:border-primary-solid': '[data-active] {',
  'data-active:bg-surface-raised': '[data-active] {',
  'data-active:shadow-sm': '[data-active] {',
  'not-forced-colors:data-active:inset-ring-(length:--tc-line-width)': '[data-active] {',
  'not-forced-colors:data-active:inset-ring-line-strong': '[data-active] {',
  'data-disabled:pointer-events-none': '[data-disabled] {',
  'data-disabled:*:opacity-50': '[data-disabled] > *) {',
  'forced-colors:data-disabled:*:opacity-100': '[data-disabled] > *) {',
  'forced-colors:data-disabled:not-data-active:text-[GrayText]': '[data-disabled]:not([data-active]) {',
  'forced-colors:data-active:border-[Highlight]': '[data-active] {',
  'forced-colors:data-active:forced-color-adjust-none': '[data-active] {',
  'forced-colors:data-active:bg-[Highlight]': '[data-active] {',
  'forced-colors:data-active:text-[HighlightText]': '[data-active] {',
  'forced-colors:data-active:shadow-none': '[data-active] {',
  'forced-colors:data-active:[--tc-ring:HighlightText]': '[data-active] {',
  'focus-visible:outline-solid': ':focus-visible {',
  'focus-visible:outline-(length:--tc-ring-width)': ':focus-visible {',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': ':focus-visible {',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': ':focus-visible {',
  'focus-visible:outline-ring': ':focus-visible {',
}

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** Where the selector of a class starts in the sheet, which is the order the cascade reads it in. */
const at = (css: string, cls: string) => css.indexOf(`.${escape(cls)}`)

/** The rule Tailwind emits for one class: from its selector to the first closing brace. */
function ruleFor(css: string, cls: string): string {
  const from = at(css, cls)
  return from === -1 ? '' : css.slice(from, css.indexOf('}', from) + 1)
}

const written = (strings: readonly string[]) => [...new Set(strings.join(' ').split(' '))].filter(Boolean).sort()

describe('every class Tabs writes compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of the root, the lists, the tabs, the panel and the size scale', () => {
    const all = written([TABS_ROOT, ...Object.values(TABS_LIST), ...Object.values(TABS_TAB), TABS_PANEL, ...Object.values(CONTROL_SIZE)])
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(75)
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }

  for (const [cls, scope] of Object.entries(SCOPE)) {
    it(`${cls} applies only under ${scope.slice(0, -2)}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(scope)
    })
  }

  it('the rule scan reads nothing for a class that has no rule', async () => {
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})
