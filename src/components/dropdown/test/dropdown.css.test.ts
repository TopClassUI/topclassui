import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  DROPDOWN_GROUP, DROPDOWN_GROUP_LABEL, DROPDOWN_ICON, DROPDOWN_ITEM, DROPDOWN_ITEM_TONE, DROPDOWN_POPUP, DROPDOWN_POSITIONER,
  DROPDOWN_SEPARATOR, DROPDOWN_SHORTCUT,
} from '../classes.js'

// The static harness never opens a menu, so none of these classes reaches Tailwind there.
const DECLARATION: Record<string, string> = {
  // The positioner: the popup layer, and hidden with its trigger.
  'z-(--tc-z-popup)': 'z-index: var(--tc-z-popup);',
  'data-anchor-hidden:invisible': 'visibility: hidden;',
  // The menu: a column between two widths that fits the room Base UI measured, shows seven rows and scrolls inside.
  'flex': 'display: flex;',
  'flex-col': 'flex-direction: column;',
  'gap-0.5': 'gap: calc(var(--spacing) * 0.5);',
  'p-1.5': 'padding: calc(var(--spacing) * 1.5);',
  'wrap-anywhere': 'overflow-wrap: anywhere;',
  'min-w-[min(calc(var(--spacing)*48),var(--available-width))]': 'min-width: min(calc(var(--spacing) * 48), var(--available-width));',
  'max-w-[min(calc(var(--spacing)*80),var(--available-width))]': 'max-width: min(calc(var(--spacing) * 80), var(--available-width));',
  'max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)))]':
    'max-height: min(var(--available-height,100dvh), calc(var(--tc-list-rows) * var(--tc-row-height)));',
  'overflow-y-auto': 'overflow-y: auto;',
  'overscroll-contain': 'overscroll-behavior: contain;',
  'scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]': 'scroll-padding-block: calc(var(--tc-ring-width) + var(--tc-ring-offset));',
  'rounded-box': 'border-radius: min(calc(var(--tc-radius) * 1.5), 1.5rem);',
  'bg-surface-raised': 'background-color: var(--tc-surface-raised);',
  'text-body': 'color: var(--tc-body);',
  'border-(length:--tc-line-width)': 'border-width: var(--tc-line-width);',
  'border-line': 'border-color: var(--tc-line);',
  'shadow-lg': 'box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);',
  // The motion, which reads the duration that --tc-motion scales, and grows from the side of the trigger.
  'origin-(--transform-origin)': 'transform-origin: var(--transform-origin);',
  'transition-[opacity,scale]': 'transition-property: opacity,scale;',
  'duration-(--tc-duration)': 'transition-duration: var(--tc-duration);',
  'ease-out': 'transition-timing-function: var(--ease-out);',
  'data-starting-style:opacity-0': 'opacity: 0%;',
  'data-ending-style:opacity-0': 'opacity: 0%;',
  'data-starting-style:scale-95': 'scale: var(--tw-scale-x) var(--tw-scale-y);',
  'data-ending-style:scale-95': 'scale: var(--tw-scale-x) var(--tw-scale-y);',
  // The ring of a menu that holds the focus itself, inside its box.
  'outline-none': 'outline-style: none;',
  'focus-visible:outline-solid': 'outline-style: solid;',
  'focus-visible:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': 'outline-offset: calc(var(--tc-ring-width) * -1);',
  'focus-visible:outline-ring': 'outline-color: var(--tc-ring);',
  // A row: the shared one, its highlight, and what Dropdown adds.
  'min-h-(--tc-row-height)': 'min-height: var(--tc-row-height);',
  'w-full': 'width: 100%;',
  'max-w-full': 'max-width: 100%;',
  'items-center': 'align-items: center;',
  'gap-2': 'gap: calc(var(--spacing) * 2);',
  'rounded-control': 'border-radius: var(--tc-radius);',
  'px-3': 'padding-inline: calc(var(--spacing) * 3);',
  'text-start': 'text-align: start;',
  'text-sm': 'font-size: var(--text-sm);',
  'shrink-0': 'flex-shrink: 0;',
  'cursor-default': 'cursor: default;',
  'select-none': 'user-select: none;',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': 'min-height: var(--tc-target-coarse,44px);',
  'data-highlighted:bg-primary-soft': 'background-color: var(--tc-primary-soft);',
  'data-highlighted:text-primary-on-soft': 'color: var(--tc-primary-on-soft);',
  // The ring of the highlighted row, inside its edge: the fill alone is under 3:1 against the menu.
  'data-highlighted:outline-solid': 'outline-style: solid;',
  'data-highlighted:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'data-highlighted:-outline-offset-(length:--tc-ring-width)': 'outline-offset: calc(var(--tc-ring-width) * -1);',
  'data-highlighted:outline-ring': 'outline-color: var(--tc-ring);',
  'forced-colors:data-highlighted:forced-color-adjust-none': 'forced-color-adjust: none;',
  'forced-colors:data-highlighted:bg-[Highlight]': 'background-color: Highlight;',
  'forced-colors:data-highlighted:text-[HighlightText]': 'color: HighlightText;',
  'forced-colors:data-highlighted:outline-[HighlightText]': 'outline-color: HighlightText;',
  // A disabled row: what it holds is dimmed, and forced colours take the grey of the system.
  'data-disabled:pointer-events-none': 'pointer-events: none;',
  'data-disabled:*:opacity-50': 'opacity: 50%;',
  'forced-colors:data-disabled:*:opacity-100': 'opacity: 100%;',
  'forced-colors:data-disabled:not-data-highlighted:text-[GrayText]': 'color: GrayText;',
  // The danger tone.
  'text-danger-on-soft': 'color: var(--tc-danger-on-soft);',
  'data-highlighted:bg-danger-soft': 'background-color: var(--tc-danger-soft);',
  'data-highlighted:text-danger-on-soft': 'color: var(--tc-danger-on-soft);',
  // The icon and the shortcut.
  'inline-flex': 'display: inline-flex;',
  'ms-auto': 'margin-inline-start: auto;',
  'shrink-10000': 'flex-shrink: 10000;',
  'max-w-[min(calc(var(--spacing)*40),calc(var(--available-width)/2))]': 'max-width: min(calc(var(--spacing) * 40), calc(var(--available-width) / 2));',
  'truncate': 'text-overflow: ellipsis;',
  'ps-4': 'padding-inline-start: calc(var(--spacing) * 4);',
  'font-mono': 'font-family: var(--tc-font-mono);',
  'text-xs': 'font-size: var(--text-xs);',
  'text-muted': 'color: var(--tc-muted);',
  'group-data-highlighted:text-inherit': 'color: inherit;',
  // The group label and the separator.
  'py-1.5': 'padding-block: calc(var(--spacing) * 1.5);',
  'font-medium': 'font-weight: var(--font-weight-medium);',
  'my-1': 'margin-block: var(--spacing);',
  'border-t-(length:--tc-line-width)': 'border-top-width: var(--tc-line-width);',
}

/** The attribute or the state each variant class must be scoped to, or it would paint at rest. */
const SCOPE: Record<string, string> = {
  'data-anchor-hidden:invisible': '[data-anchor-hidden] {',
  'data-starting-style:opacity-0': '[data-starting-style] {',
  'data-ending-style:scale-95': '[data-ending-style] {',
  'focus-visible:outline-solid': ':focus-visible {',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': ':focus-visible {',
  'data-highlighted:bg-primary-soft': '[data-highlighted] {',
  'data-highlighted:bg-danger-soft': '[data-highlighted] {',
  'data-highlighted:text-danger-on-soft': '[data-highlighted] {',
  'data-disabled:pointer-events-none': '[data-disabled] {',
  'forced-colors:data-highlighted:bg-[Highlight]': '[data-highlighted] {',
  'data-highlighted:outline-solid': '[data-highlighted] {',
  'data-highlighted:outline-ring': '[data-highlighted] {',
  'forced-colors:data-highlighted:outline-[HighlightText]': '[data-highlighted] {',
  'forced-colors:data-disabled:not-data-highlighted:text-[GrayText]': '[data-disabled]:not([data-highlighted]) {',
}

/** The classes Tailwind wraps from outside, and the query that must open just before the selector. */
const WRAPPED: Record<string, string> = {
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': '@media (pointer: coarse) { ',
  'forced-colors:data-highlighted:forced-color-adjust-none': '@media (forced-colors: active) { ',
  'forced-colors:data-highlighted:bg-[Highlight]': '@media (forced-colors: active) { ',
  'forced-colors:data-highlighted:text-[HighlightText]': '@media (forced-colors: active) { ',
  'forced-colors:data-highlighted:outline-[HighlightText]': '@media (forced-colors: active) { ',
  'forced-colors:data-disabled:not-data-highlighted:text-[GrayText]': '@media (forced-colors: active) { ',
}

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** Where the rule of one class opens: its escaped name followed by what can follow a class in a selector. */
function ruleStart(css: string, cls: string): number {
  const name = `.${escape(cls)}`
  for (let at = css.indexOf(name); at !== -1; at = css.indexOf(name, at + 1)) {
    if (/[\s{:[>]/.test(css[at + name.length] ?? '')) return at
  }
  return -1
}

/** The rule Tailwind emits for one class: from its selector to the brace that closes its outermost block. */
function ruleFor(css: string, cls: string): string {
  const at = ruleStart(css, cls)
  if (at === -1) return ''
  let depth = 0
  for (let index = css.indexOf('{', at); index < css.length; index++) {
    if (css[index] === '{') depth += 1
    else if (css[index] === '}' && --depth === 0) return css.slice(at, index + 1)
  }
  return ''
}

const written = (strings: readonly string[]) => [...new Set(strings.join(' ').split(' ').filter(Boolean))].sort()

describe('every class an open Dropdown wears compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build([...Object.keys(DECLARATION), 'group']))

  it('the table names exactly the classes of the nine strings in classes.ts, and group, which is a marker with no rule', () => {
    const all = written([
      DROPDOWN_POSITIONER, DROPDOWN_POPUP, DROPDOWN_ITEM, DROPDOWN_ITEM_TONE.neutral, DROPDOWN_ITEM_TONE.danger, DROPDOWN_ICON,
      DROPDOWN_SHORTCUT, DROPDOWN_GROUP, DROPDOWN_GROUP_LABEL, DROPDOWN_SEPARATOR,
    ])
    expect(all).toEqual([...Object.keys(DECLARATION), 'group'].sort())
    expect(all).toHaveLength(77)
  })

  it('group emits nothing of its own: it only marks the row for the shortcut inside it', async () => {
    expect(ruleFor(await css, 'group')).toBe('')
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

  for (const [cls, query] of Object.entries(WRAPPED)) {
    it(`${cls} sits inside ${query.trim()}`, async () => {
      const sheet = await css
      const at = ruleStart(sheet, cls)
      const before = sheet.slice(sheet.lastIndexOf('@', at), at).replace(/\s+/g, ' ')
      expect(before.slice(0, query.length)).toBe(query)
      // Still inside that block: one more brace opened than closed between the query and the selector.
      expect(before.split('{').length - before.split('}').length).toBe(1)
    })
  }

  it('the rule scan reads a nested block whole, tells group from group-data, and finds nothing for a class with no rule', async () => {
    expect(ruleFor('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } } .b { top: 0; }', 'a'))
      .toBe('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } }')
    expect(ruleFor('.group-x { top: 0; }', 'group')).toBe('')
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})
