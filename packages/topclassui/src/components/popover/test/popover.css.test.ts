import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { POPOVER_CLOSE, POPOVER_DESCRIPTION, POPOVER_POPUP, POPOVER_POSITIONER, POPOVER_TITLE } from '../classes.js'

// The static harness never opens a popup, so none of these classes reaches Tailwind there.
const DECLARATION: Record<string, string> = {
  // POINTER: the hand, and the arrow back on a control that cannot be pressed.
  'cursor-pointer': 'cursor: pointer;',
  'disabled:cursor-default': 'cursor: default;',
  'aria-disabled:cursor-default': 'cursor: default;',
  'data-disabled:cursor-default': 'cursor: default;',
  'data-readonly:cursor-default': 'cursor: default;',
  'data-loading:cursor-default': 'cursor: default;',
  // The positioner: the popup layer, and hidden with its trigger.
  'z-(--tc-z-popup)': 'z-index: var(--tc-z-popup);',
  'data-anchor-hidden:invisible': 'visibility: hidden;',
  // The popup: a column of one width that fits the room Base UI measured, and scrolls inside it.
  'flex': 'display: flex;',
  'flex-col': 'flex-direction: column;',
  'w-70': 'width: calc(var(--spacing) * 70);',
  'max-w-[round(down,var(--available-width),1px)]': 'max-width: round(down, var(--available-width), 1px);',
  'max-h-(--available-height)': 'max-height: var(--available-height);',
  'gap-3': 'gap: calc(var(--spacing) * 3);',
  'p-4': 'padding: calc(var(--spacing) * 4);',
  'text-sm': 'font-size: var(--text-sm);',
  'wrap-anywhere': 'overflow-wrap: anywhere;',
  '*:shrink-0': 'flex-shrink: 0;',
  'overflow-y-auto': 'overflow-y: auto;',
  'overscroll-contain': 'overscroll-behavior: contain;',
  '[scrollbar-width:thin]': 'scrollbar-width: thin;',
  '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]': 'scrollbar-color: var(--tc-scrollbar-thumb) var(--tc-scrollbar-track);',
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
  // The ring, inside the popup and outside the x.
  'outline-none': 'outline-style: none;',
  'focus-visible:outline-solid': 'outline-style: solid;',
  'focus-visible:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': 'outline-offset: calc(var(--tc-ring-width) * -1);',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': 'outline-offset: var(--tc-ring-offset);',
  'focus-visible:outline-ring': 'outline-color: var(--tc-ring);',
  // The title and the description.
  'font-semibold': 'font-weight: var(--font-weight-semibold);',
  'text-muted': 'color: var(--tc-muted);',
  // The x.
  'inline-flex': 'display: inline-flex;',
  'shrink-0': 'flex-shrink: 0;',
  'items-center': 'align-items: center;',
  'justify-center': 'justify-content: center;',
  'rounded-control': 'border-radius: var(--tc-radius);',
  'min-h-[var(--tc-target-min,24px)]': 'min-height: var(--tc-target-min,24px);',
  'min-w-[var(--tc-target-min,24px)]': 'min-width: var(--tc-target-min,24px);',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': 'min-height: var(--tc-target-coarse,44px);',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]': 'min-width: var(--tc-target-coarse,44px);',
  'transition-[color,background-color,border-color,outline-color,opacity,translate]':
    'transition-property: color,background-color,border-color,outline-color,opacity,translate;',
  'tone-neutral': '--tc-soft: var(--tc-neutral-soft);',
  'hover:bg-(--tc-soft)': 'background-color: var(--tc-soft);',
  'active:bg-(--tc-soft-hover)': 'background-color: var(--tc-soft-hover);',
}

/** The attribute or the state each variant class must be scoped to, or it would paint at rest. */
const SCOPE: Record<string, string> = {
  'data-anchor-hidden:invisible': '[data-anchor-hidden] {',
  'data-starting-style:opacity-0': '[data-starting-style] {',
  'data-ending-style:opacity-0': '[data-ending-style] {',
  'data-starting-style:scale-95': '[data-starting-style] {',
  'data-ending-style:scale-95': '[data-ending-style] {',
  'focus-visible:outline-solid': ':focus-visible {',
  'focus-visible:outline-(length:--tc-ring-width)': ':focus-visible {',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': ':focus-visible {',
  'hover:bg-(--tc-soft)': ':hover {',
  'active:bg-(--tc-soft-hover)': ':active {',
}

/** The two that Tailwind wraps from outside: the query opens just before the selector. */
const WRAPPED = [
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The rule Tailwind emits for one class: from its selector to the brace that closes its outermost block. */
function ruleFor(css: string, cls: string): string {
  const at = css.indexOf(`.${escape(cls)}`)
  if (at === -1) return ''
  let depth = 0
  for (let index = css.indexOf('{', at); index < css.length; index++) {
    if (css[index] === '{') depth += 1
    else if (css[index] === '}' && --depth === 0) return css.slice(at, index + 1)
  }
  return ''
}

const written = (strings: readonly string[]) => [...new Set(strings.join(' ').split(' '))].sort()

describe('every class an open Popover wears compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of the five strings in classes.ts', () => {
    const all = written([POPOVER_POSITIONER, POPOVER_POPUP, POPOVER_TITLE, POPOVER_DESCRIPTION, POPOVER_CLOSE])
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(58)
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

  for (const cls of WRAPPED) {
    it(`${cls} sits inside the coarse-pointer query, so a mouse keeps the 24 px floor`, async () => {
      const sheet = await css
      const at = sheet.indexOf(`.${escape(cls)}`)
      const before = sheet.slice(sheet.lastIndexOf('@', at), at).replace(/\s+/g, ' ')
      expect(before.slice(0, 27)).toBe('@media (pointer: coarse) { ')
      // Still inside that block: one more brace opened than closed between the query and the selector.
      expect(before.split('{').length - before.split('}').length).toBe(1)
    })
  }

  // The popup is a flex column, and a flex item gives up its height before its container scrolls.
  it('*:shrink-0 reaches every child of the popup and nothing deeper', async () => {
    expect((await css).replace(/\s+/g, ' ')).toContain(':is(.\\*\\:shrink-0 > *) { flex-shrink: 0; }')
  })

  it('the rule scan reads a nested block whole, and nothing for a class that has no rule', async () => {
    expect(ruleFor('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } } .b { top: 0; }', 'a'))
      .toBe('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } }')
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})

describe('the tokens the popup reads are the ones the plan names', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('--tc-z-popup is the one overlay layer, 60: a dialog and a drawer take it too, and a toast at 70 stays above', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-z-drawer: var(--tc-z-popup);')
    expect(sheet).toContain('--tc-z-dialog: var(--tc-z-popup);')
    expect(sheet).toContain('--tc-z-popup: 60;')
    expect(sheet).toContain('--tc-z-toast: 70;')
  })

  it('the spacing step is 4 px, so w-70 is 280 px, the drawn width', async () => {
    expect(await css).toContain('--spacing: 0.25rem;')
  })

  it('--tc-duration is 150 ms times --tc-motion, which reduced motion sets to 0', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-duration-base: calc(150ms * var(--tc-motion));')
    expect(sheet).toContain('--tc-duration: var(--tc-duration-base);')
    expect(sheet.replace(/\s+/g, ' ')).toContain('@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0; } }')
  })
})
