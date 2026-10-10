import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  DIALOG_ACTION_WRAP, DIALOG_BACKDROP, DIALOG_BODY, DIALOG_BODY_SHORT, DIALOG_CLOSE, DIALOG_DESCRIPTION, DIALOG_FOOTER,
  DIALOG_HEADER, DIALOG_HEADING, DIALOG_POPUP, DIALOG_POPUP_PASSIVE, DIALOG_TITLE, DIALOG_VIEWPORT,
  DIALOG_VIEWPORT_PASSIVE, DIALOG_WIDTH,
} from '../classes.js'

// The static harness never opens a popup, so none of these classes reaches Tailwind there.
const DECLARATION: Record<string, string> = {
  // The scrim and the viewport.
  'fixed': 'position: fixed;',
  'inset-0': 'inset: 0px;',
  'bg-overlay': 'background-color: var(--tc-overlay);',
  'z-(--tc-z-dialog)': 'z-index: var(--tc-z-dialog);',
  'grid': 'display: grid;',
  'place-items-center': 'place-items: center;',
  'p-(--tc-overlay-inset)': 'padding: var(--tc-overlay-inset);',
  // The two motions, which read the duration that --tc-motion scales.
  'transition-opacity': 'transition-property: opacity;',
  'transition-[opacity,scale]': 'transition-property: opacity,scale;',
  'duration-(--tc-duration)': 'transition-duration: var(--tc-duration);',
  'ease-out': 'transition-timing-function: var(--ease-out);',
  'origin-(--transform-origin)': 'transform-origin: var(--transform-origin);',
  'data-starting-style:opacity-0': 'opacity: 0%;',
  'data-ending-style:opacity-0': 'opacity: 0%;',
  'data-starting-style:scale-95': 'scale: var(--tw-scale-x) var(--tw-scale-y);',
  'data-ending-style:scale-95': 'scale: var(--tw-scale-x) var(--tw-scale-y);',
  // The popup: a column that fits the screen, on the raised surface.
  'flex': 'display: flex;',
  'flex-col': 'flex-direction: column;',
  'w-full': 'width: 100%;',
  'max-h-[calc(100dvh-2*var(--tc-overlay-inset))]': 'max-height: calc(100dvh - 2 * var(--tc-overlay-inset));',
  'wrap-anywhere': 'overflow-wrap: anywhere;',
  'overflow-y-auto': 'overflow-y: auto;',
  'overscroll-contain': 'overscroll-behavior: contain;',
  'rounded-box': 'border-radius: min(calc(var(--tc-radius) * 1.5), 1.5rem);',
  'bg-surface-raised': 'background-color: var(--tc-surface-raised);',
  'text-body': 'color: var(--tc-body);',
  'border-(length:--tc-line-width)': 'border-width: var(--tc-line-width);',
  'border-line': 'border-color: var(--tc-line);',
  'shadow-lg': 'box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);',
  'max-w-80': 'max-width: calc(var(--spacing) * 80);',
  'max-w-90': 'max-width: calc(var(--spacing) * 90);',
  'max-w-100': 'max-width: calc(var(--spacing) * 100);',
  'max-w-128': 'max-width: calc(var(--spacing) * 128);',
  'max-w-160': 'max-width: calc(var(--spacing) * 160);',
  // The ring, outside the x and inside the popup and the body.
  'outline-none': 'outline-style: none;',
  'focus-visible:outline-solid': 'outline-style: solid;',
  'focus-visible:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': 'outline-offset: var(--tc-ring-offset);',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': 'outline-offset: calc(var(--tc-ring-width) * -1);',
  'focus-visible:outline-ring': 'outline-color: var(--tc-ring);',
  // The header, the body and the footer.
  'shrink-0': 'flex-shrink: 0;',
  'items-start': 'align-items: flex-start;',
  'gap-3': 'gap: calc(var(--spacing) * 3);',
  'border-b-(length:--tc-line-width)': 'border-bottom-width: var(--tc-line-width);',
  'border-t-(length:--tc-line-width)': 'border-top-width: var(--tc-line-width);',
  'px-5': 'padding-inline: calc(var(--spacing) * 5);',
  'py-4': 'padding-block: calc(var(--spacing) * 4);',
  'py-5': 'padding-block: calc(var(--spacing) * 5);',
  'min-w-0': 'min-width: 0px;',
  'flex-1': 'flex: 1;',
  'min-h-15': 'min-height: calc(var(--spacing) * 15);',
  'text-base': 'font-size: var(--text-base);',
  'text-sm': 'font-size: var(--text-sm);',
  'font-semibold': 'font-weight: var(--font-weight-semibold);',
  'text-muted': 'color: var(--tc-muted);',
  'flex-wrap': 'flex-wrap: wrap;',
  'items-center': 'align-items: center;',
  'justify-end': 'justify-content: flex-end;',
  'gap-2': 'gap: calc(var(--spacing) * 2);',
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

describe('every class an open Dialog wears compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  // The classes that only act on a short screen, in a footer action or in a dialog that is not modal have a file of their own.
  it('the table names exactly the classes of the eleven strings in classes.ts, less those dialog.css.layout.test.ts holds', () => {
    const elsewhere = new Set(written([DIALOG_BODY_SHORT, DIALOG_ACTION_WRAP, DIALOG_VIEWPORT_PASSIVE, DIALOG_POPUP_PASSIVE]))
    const all = written([
      DIALOG_BACKDROP, DIALOG_VIEWPORT, DIALOG_POPUP, ...Object.values(DIALOG_WIDTH), DIALOG_HEADER, DIALOG_HEADING,
      DIALOG_TITLE, DIALOG_DESCRIPTION, DIALOG_BODY, DIALOG_FOOTER, DIALOG_CLOSE,
    ]).filter((cls) => cls !== '' && !elsewhere.has(cls))
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(70)
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

  it('the rule scan reads a nested block whole, and nothing for a class that has no rule', async () => {
    expect(ruleFor('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } } .b { top: 0; }', 'a'))
      .toBe('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } }')
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})

describe('the tokens the popup reads are the ones the plan names', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('--tc-z-dialog is 50, above a drawer at 40 and below a popup at 60', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-z-drawer: 40;')
    expect(sheet).toContain('--tc-z-dialog: 50;')
    expect(sheet).toContain('--tc-z-popup: 60;')
  })

  it('--tc-overlay-inset is 1rem, the room the popup leaves on every side', async () => {
    expect(await css).toContain('--tc-overlay-inset: 1rem;')
  })

  it('--tc-duration is 150 ms times --tc-motion, which reduced motion sets to 0', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-duration-base: calc(150ms * var(--tc-motion));')
    expect(sheet).toContain('--tc-duration: var(--tc-duration-base);')
    expect(sheet.replace(/\s+/g, ' ')).toContain('@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0; } }')
  })
})
