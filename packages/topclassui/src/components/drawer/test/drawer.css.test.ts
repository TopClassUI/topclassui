import { describe, expect, it } from 'vitest'

import { ACTIONS_WRAP, SLIDE_MOTION } from '#shared/classes.js'
import { compileEntry } from '#test/stylesheet.js'
import {
  DRAWER_BACKDROP, DRAWER_BODY, DRAWER_BODY_SHORT, DRAWER_CLOSE, DRAWER_DESCRIPTION, DRAWER_FOLLOW, DRAWER_FOOTER,
  DRAWER_HEADER, DRAWER_POPUP, DRAWER_TITLE, DRAWER_VIEWPORT, DRAWER_VIEWPORT_EDGE,
} from '../classes.js'

// The static harness never opens a popup, so none of these classes reaches Tailwind there.
const DECLARATION: Record<string, string> = {
  // POINTER: the hand, not-allowed on a disabled control, and the arrow on read-only and loading.
  'cursor-pointer': 'cursor: pointer;',
  'disabled:cursor-not-allowed': 'cursor: not-allowed;',
  'aria-disabled:cursor-not-allowed': 'cursor: not-allowed;',
  'data-disabled:cursor-not-allowed': 'cursor: not-allowed;',
  'data-readonly:cursor-default': 'cursor: default;',
  'data-loading:cursor-default': 'cursor: default;',
  // The scrim and the viewport.
  'fixed': 'position: fixed;',
  'inset-0': 'inset: 0px;',
  'bg-overlay': 'background-color: var(--tc-overlay);',
  'z-(--tc-z-drawer)': 'z-index: var(--tc-z-drawer);',
  'transition-opacity': 'transition-property: opacity;',
  'duration-(--tc-duration)': 'transition-duration: var(--tc-duration);',
  'data-starting-style:opacity-0': 'opacity: 0%;',
  'data-ending-style:opacity-0': 'opacity: 0%;',
  'justify-start': 'justify-content: flex-start;',
  'justify-end': 'justify-content: flex-end;',
  'items-start': 'align-items: flex-start;',
  'items-end': 'align-items: flex-end;',
  // The sheet: a column on the raised surface, moved by a transform, which is what slides.
  'relative': 'position: relative;',
  'flex': 'display: flex;',
  'flex-col': 'flex-direction: column;',
  'bg-surface-raised': 'background-color: var(--tc-surface-raised);',
  'text-body': 'color: var(--tc-body);',
  'shadow-(--tc-shadow-overlay)': 'box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);',
  'wrap-anywhere': 'overflow-wrap: anywhere;',
  'transform-[translate(var(--drawer-swipe-movement-x,0px),var(--drawer-swipe-movement-y,0px))]':
    'transform: translate(var(--drawer-swipe-movement-x,0px),var(--drawer-swipe-movement-y,0px));',
  'data-swiping:select-none': 'user-select: none;',
  'transition-transform': 'transition-property: transform, translate, scale, rotate;',
  'duration-(--tc-duration-slow)': 'transition-duration: var(--tc-duration-slow);',
  'ease-out': 'transition-timing-function: var(--ease-out);',
  'overflow-y-auto': 'overflow-y: auto;',
  'overscroll-contain': 'overscroll-behavior: contain;',
  '[scrollbar-width:thin]': 'scrollbar-width: thin;',
  '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]': 'scrollbar-color: var(--tc-scrollbar-thumb) var(--tc-scrollbar-track);',
  'scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]': 'scroll-padding-block: calc(var(--tc-ring-width) + var(--tc-ring-offset));',
  // The ring, outside the x and inside the sheet and the body.
  'outline-none': 'outline-style: none;',
  'focus-visible:outline-solid': 'outline-style: solid;',
  'focus-visible:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': 'outline-offset: var(--tc-ring-offset);',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': 'outline-offset: calc(var(--tc-ring-width) * -1);',
  'focus-visible:outline-ring': 'outline-color: var(--tc-ring);',
  // The header, the body and the footer.
  'shrink-0': 'flex-shrink: 0;',
  'border-b-(length:--tc-line-width)': 'border-bottom-width: var(--tc-line-width);',
  'border-t-(length:--tc-line-width)': 'border-top-width: var(--tc-line-width);',
  'border-line': 'border-color: var(--tc-line);',
  'py-3.5': 'padding-block: calc(var(--spacing) * 3.5);',
  'py-4': 'padding-block: calc(var(--spacing) * 4);',
  'px-4': 'padding-inline: calc(var(--spacing) * 4);',
  'ps-4': 'padding-inline-start: calc(var(--spacing) * 4);',
  'pe-16': 'padding-inline-end: calc(var(--spacing) * 16);',
  'min-h-13': 'min-height: calc(var(--spacing) * 13);',
  'flex-1': 'flex: 1;',
  'text-base': 'font-size: var(--text-base);',
  'text-sm': 'font-size: var(--text-sm);',
  'font-semibold': 'font-weight: var(--font-weight-semibold);',
  'text-muted': 'color: var(--tc-muted);',
  'flex-wrap': 'flex-wrap: wrap;',
  'items-center': 'align-items: center;',
  'gap-2': 'gap: calc(var(--spacing) * 2);',
  '[@media(height<17rem)]:flex-none': 'flex: none;',
  '[@media(height<17rem)]:overflow-y-visible': 'overflow-y: visible;',
  // The x.
  'inline-flex': 'display: inline-flex;',
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
  'data-starting-style:opacity-0': '[data-starting-style] {',
  'data-ending-style:opacity-0': '[data-ending-style] {',
  'data-swiping:select-none': '[data-swiping] {',
  'focus-visible:outline-solid': ':focus-visible {',
  'focus-visible:outline-(length:--tc-ring-width)': ':focus-visible {',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': ':focus-visible {',
  'hover:bg-(--tc-soft)': ':hover:not(:where(:disabled, [aria-disabled="true"], [data-disabled])) {',
  'active:bg-(--tc-soft-hover)': ':active:not(:where(:disabled, [aria-disabled="true"], [data-disabled])) {',
}

/** The classes Tailwind wraps from outside, and the query that must open just before each selector. */
const WRAPPED: Record<string, string> = {
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': '@media (pointer: coarse) { ',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]': '@media (pointer: coarse) { ',
  '[@media(height<17rem)]:flex-none': '@media (height<17rem) { ',
  '[@media(height<17rem)]:overflow-y-visible': '@media (height<17rem) { ',
}

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

describe('every class a sheet wears at any edge compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  // What changes with the edge, the x and its corner, and the grabber have a file of their own: drawer.css.sheet.test.ts.
  it('the table names exactly the classes of the twelve strings every sheet shares, less the action wrap the shared tests hold', () => {
    const elsewhere = new Set(written([ACTIONS_WRAP]))
    const all = written([
      DRAWER_BACKDROP, DRAWER_VIEWPORT, ...Object.values(DRAWER_VIEWPORT_EDGE), DRAWER_FOLLOW, SLIDE_MOTION, DRAWER_POPUP,
      DRAWER_HEADER, DRAWER_TITLE, DRAWER_DESCRIPTION, DRAWER_BODY_SHORT, DRAWER_BODY, DRAWER_FOOTER, DRAWER_CLOSE,
    ]).filter((cls) => cls !== '' && !elsewhere.has(cls))
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(72)
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
      const at = sheet.indexOf(`.${escape(cls)}`)
      // '@media (', with its space: one of the class names itself holds an escaped @media.
      const before = sheet.slice(sheet.lastIndexOf('@media (', at), at).replace(/\s+/g, ' ')
      expect(before.slice(0, query.length)).toBe(query)
      // Still inside that block: one more brace opened than closed between the query and the selector.
      expect(before.split('{').length - before.split('}').length).toBe(1)
    })
  }

  it('the rule scan reads a nested block whole, and nothing for a class that has no rule', async () => {
    expect(ruleFor('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } } .b { top: 0; }', 'a'))
      .toBe('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } }')
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})

describe('the tokens the sheet reads are the ones the plan names', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('--tc-z-drawer is the one overlay layer, 60: above a sticky bar at 10, level with a dialog and a popup, below a toast at 70', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-z-sticky: 10;')
    expect(sheet).toContain('--tc-z-drawer: var(--tc-z-popup);')
    expect(sheet).toContain('--tc-z-dialog: var(--tc-z-popup);')
    expect(sheet).toContain('--tc-z-popup: 60;')
    expect(sheet).toContain('--tc-z-toast: 70;')
  })

  it('--tc-duration-slow is 300 ms times --tc-motion, which reduced motion sets to 0', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-duration-slow: calc(300ms * var(--tc-motion));')
    expect(sheet.replace(/\s+/g, ' ')).toContain('@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0; } }')
  })

  // Two rules of equal weight on one element: the later one in the sheet is the one the browser takes.
  it('on a short screen the body takes the height of its content and stops scrolling after flex-1 and overflow-y-auto said otherwise', async () => {
    const sheet = await css
    const at = (cls: string) => sheet.indexOf(`.${escape(cls)}`)
    expect(at('flex-1')).toBeGreaterThan(-1)
    expect(at('[@media(height<17rem)]:flex-none')).toBeGreaterThan(at('flex-1'))
    expect(at('[@media(height<17rem)]:overflow-y-visible')).toBeGreaterThan(at('overflow-y-auto'))
  })

  it('the header ends 4rem short of the edge after ps-4 and py-3.5 gave it its own padding: neither sets the inline end', async () => {
    const sheet = await css
    expect(ruleFor(sheet, 'ps-4')).not.toContain('padding-inline-end')
    expect(ruleFor(sheet, 'py-3.5')).not.toContain('padding-inline')
  })
})
