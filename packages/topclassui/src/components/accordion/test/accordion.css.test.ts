import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  ACCORDION_CARET, ACCORDION_CONTENT, ACCORDION_ITEM, ACCORDION_PANEL, ACCORDION_ROOT, ACCORDION_TITLE,
  ACCORDION_TRIGGER,
} from '../classes.js'

// A class list proves nothing about the rule behind it: each class is compiled with the installed Tailwind.
const DECLARATION: Record<string, string> = {
  // POINTER: the hand, and the arrow back on a control that cannot be pressed.
  'disabled:cursor-default': 'cursor: default;',
  'aria-disabled:cursor-default': 'cursor: default;',
  'data-disabled:cursor-default': 'cursor: default;',
  'data-readonly:cursor-default': 'cursor: default;',
  'data-loading:cursor-default': 'cursor: default;',
  // The box.
  'grid': 'display: grid;',
  'grid-cols-1': 'grid-template-columns: repeat(1, minmax(0, 1fr));',
  'overflow-hidden': 'overflow: hidden;',
  'rounded-box': 'border-radius: min(calc(var(--tc-radius) * 1.5), 1.5rem);',
  'bg-surface-raised': 'background-color: var(--tc-surface-raised);',
  'text-body': 'color: var(--tc-body);',
  'wrap-anywhere': 'overflow-wrap: anywhere;',
  'border-(length:--tc-line-width)': 'border-width: var(--tc-line-width);',
  'border-line': 'border-color: var(--tc-line);',
  // The line between two items.
  'border-t-(length:--tc-line-width)': 'border-top-width: var(--tc-line-width);',
  'first:border-t-0': 'border-top-width: 0px;',
  // The trigger.
  'group': '',
  'flex': 'display: flex;',
  'flex-wrap': 'flex-wrap: wrap;',
  'w-full': 'width: 100%;',
  'items-center': 'align-items: center;',
  'cursor-pointer': 'cursor: pointer;',
  'gap-2.5': 'gap: calc(var(--spacing) * 2.5);',
  'px-3.5': 'padding-inline: calc(var(--spacing) * 3.5);',
  'py-3': 'padding-block: calc(var(--spacing) * 3);',
  'text-start': 'text-align: start;',
  'text-sm': 'font-size: var(--text-sm);',
  'font-medium': 'font-weight: var(--font-weight-medium);',
  'tone-neutral': '--tc-soft: var(--tc-neutral-soft);',
  'hover:bg-(--tc-soft)': 'background-color: var(--tc-soft);',
  'active:bg-(--tc-soft-hover)': 'background-color: var(--tc-soft-hover);',
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
  'disabled:pointer-events-none': 'pointer-events: none;',
  'disabled:opacity-50': 'opacity: 50%;',
  'data-disabled:pointer-events-none': 'pointer-events: none;',
  'data-disabled:opacity-50': 'opacity: 50%;',
  '[:first-child>*>&]:rounded-t-box': 'border-top-left-radius: min(calc(var(--tc-radius) * 1.5), 1.5rem);',
  '[:last-child>*>&]:not-data-panel-open:rounded-b-box': 'border-bottom-right-radius: min(calc(var(--tc-radius) * 1.5), 1.5rem);',
  'forced-colors:data-disabled:text-[GrayText]': 'color: GrayText;',
  'forced-colors:data-disabled:opacity-100': 'opacity: 100%;',
  // The title and the caret.
  'min-w-0': 'min-width: 0px;',
  'grow': 'flex-grow: 1;',
  'basis-[6ch]': 'flex-basis: 6ch;',
  'ms-auto': 'margin-inline-start: auto;',
  'shrink-0': 'flex-shrink: 0;',
  'text-muted': 'color: var(--tc-muted);',
  'transition-[rotate]': 'transition-property: rotate;',
  'group-data-panel-open:rotate-180': 'rotate: 180deg;',
  'forced-colors:group-data-disabled:text-[GrayText]': 'color: GrayText;',
  // The panel and what it holds.
  'transition-opacity': 'transition-property: opacity;',
  'data-starting-style:opacity-0': 'opacity: 0%;',
  'data-ending-style:opacity-0': 'opacity: 0%;',
  'pt-1': 'padding-top: var(--spacing);',
  'pb-3.5': 'padding-bottom: calc(var(--spacing) * 3.5);',
  'overflow-x-auto': 'overflow-x: auto;',
  'overscroll-x-contain': 'overscroll-behavior-x: contain;',
  '[scrollbar-width:thin]': 'scrollbar-width: thin;',
  '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]': 'scrollbar-color: var(--tc-scrollbar-thumb) var(--tc-scrollbar-track);',
  '[:last-child>*>&]:rounded-b-box': 'border-bottom-left-radius: min(calc(var(--tc-radius) * 1.5), 1.5rem);',
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

describe('every class an Accordion wears compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of the seven strings in classes.ts', () => {
    const all = written([
      ACCORDION_ROOT, ACCORDION_ITEM, ACCORDION_TRIGGER, ACCORDION_TITLE, ACCORDION_CARET, ACCORDION_PANEL, ACCORDION_CONTENT,
    ])
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(70)
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    // group is a marker with no rule of its own: the caret's variant reads it.
    if (declaration === '') continue
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }

  it('the rule scan reads a nested block whole, and nothing for a class that has no rule', async () => {
    expect(ruleFor('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } } .b { top: 0; }', 'a'))
      .toBe('.a { color: red; @media (hover: hover) { &:hover { color: blue; } } }')
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})
