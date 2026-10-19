import { describe, expect, it } from 'vitest'

import {
  CONTAIN, DISABLED, FADE_MOTION, FOCUS_RING_INSET, LIST_CAP, OVERLAY_SURFACE, POPUP_MOTION, ROW, ROW_HIGHLIGHT, SCRIM,
  SCROLL_AREA,
} from '#shared/classes.js'
import { compileEntry } from '#test/stylesheet.js'
import {
  COMMAND_BACKDROP, COMMAND_ESCAPE_HINT, COMMAND_GROUP_LABEL, COMMAND_INPUT, COMMAND_ITEM, COMMAND_LIST, COMMAND_POPUP,
  COMMAND_SEARCH, COMMAND_SPACER, COMMAND_STATUS, COMMAND_TITLE, COMMAND_UNIT, COMMAND_VIEWPORT,
} from '../classes.js'

// The static harness never opens the palette; the shared constants are compiled in src/shared.
const DECLARATION: Record<string, string> = {
  // The viewport: the popup hangs from 15% down.
  'z-(--tc-z-dialog)': 'z-index: var(--tc-z-dialog);',
  'items-start': 'align-items: flex-start;',
  'justify-center': 'justify-content: center;',
  'p-(--tc-overlay-inset)': 'padding: var(--tc-overlay-inset);',
  'pt-[15dvh]': 'padding-top: 15dvh;',
  // The popup: a column 400 px wide at most, that ends the inset above the bottom.
  'max-h-[calc(85dvh-var(--tc-overlay-inset))]': 'max-height: calc(85dvh - var(--tc-overlay-inset));',
  'max-w-100': 'max-width: calc(var(--spacing) * 100);',
  'flex-col': 'flex-direction: column;',
  'wrap-anywhere': 'overflow-wrap: anywhere;',
  // The search row and the input.
  'shrink-0': 'flex-shrink: 0;',
  'gap-2.5': 'gap: calc(var(--spacing) * 2.5);',
  'border-b-(length:--tc-line-width)': 'border-bottom-width: var(--tc-line-width);',
  'ps-3.5': 'padding-inline-start: calc(var(--spacing) * 3.5);',
  'pe-3': 'padding-inline-end: calc(var(--spacing) * 3);',
  'px-4': 'padding-inline: calc(var(--spacing) * 4);',
  'text-muted': 'color: var(--tc-muted);',
  'h-control-md': 'height: calc(2.5rem * var(--tc-density));',
  'pointer-coarse:h-control-lg': 'height: calc(3rem * var(--tc-density));',
  'min-w-0': 'min-width: 0px;',
  'flex-1': 'flex: 1;',
  'bg-transparent': 'background-color: transparent;',
  'px-2': 'padding-inline: calc(var(--spacing) * 2);',
  'text-base': 'font-size: var(--text-base);',
  'placeholder:text-muted': 'color: var(--tc-muted);',
  // The list, and its rows of one unit each.
  'min-h-0': 'min-height: 0px;',
  'p-1.5': 'padding: calc(var(--spacing) * 1.5);',
  'data-empty:hidden': 'display: none;',
  'h-(--tc-row-height)': 'height: var(--tc-row-height);',
  'pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]':
    'height: max(var(--tc-row-height), var(--tc-target-coarse,44px));',
  'h-[calc(var(--tc-list-rows)*var(--tc-row-height))]': 'height: calc(var(--tc-list-rows) * var(--tc-row-height));',
  'pointer-coarse:h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)))]':
    'height: calc(var(--tc-list-rows) * max(var(--tc-row-height), var(--tc-target-coarse,44px)));',
  'items-end': 'align-items: flex-end;',
  'pb-0.5': 'padding-bottom: calc(var(--spacing) * 0.5);',
  'text-xs': 'font-size: var(--text-xs);',
  'font-medium': 'font-weight: var(--font-weight-medium);',
  'cursor-default': 'cursor: default;',
  'select-none': 'user-select: none;',
  // The Esc keycap, gone under a finger.
  'pointer-coarse:hidden': 'display: none;',
  // The empty and the loading text, and the title only a reader reads.
  'py-6': 'padding-block: calc(var(--spacing) * 6);',
  'text-center': 'text-align: center;',
  'empty:p-0': 'padding: 0px;',
  'sr-only': 'clip-path: inset(50%);',
}

/** The attribute or the state each variant class must be scoped to, or it would paint at rest. */
const SCOPE: Record<string, string> = {
  'placeholder:text-muted': '::placeholder {',
  'data-empty:hidden': '[data-empty] {',
  'empty:p-0': ':empty {',
}

/** Each sits inside a media query, which Tailwind opens just before the selector. */
const WRAPPED: Record<string, string> = {
  'pointer-coarse:h-control-lg': '@media (pointer: coarse) { ',
  'pointer-coarse:hidden': '@media (pointer: coarse) { ',
  'pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]': '@media (pointer: coarse) { ',
  'pointer-coarse:h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)))]': '@media (pointer: coarse) { ',
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

const written = (strings: readonly string[]) => [...new Set(strings.join(' ').split(' '))].filter((cls) => cls !== '').sort()

describe('every class an open Command wears compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of classes.ts that no shared constant already brings', () => {
    const shared = new Set(written([
      SCRIM, FADE_MOTION, OVERLAY_SURFACE, POPUP_MOTION, FOCUS_RING_INSET, LIST_CAP, SCROLL_AREA, ROW, ROW_HIGHLIGHT,
      DISABLED, CONTAIN,
    ]))
    const own = written([
      COMMAND_BACKDROP, COMMAND_VIEWPORT, COMMAND_POPUP, COMMAND_SEARCH, COMMAND_INPUT, COMMAND_LIST, COMMAND_UNIT,
      COMMAND_SPACER, COMMAND_GROUP_LABEL, COMMAND_ITEM, COMMAND_ESCAPE_HINT, COMMAND_STATUS, COMMAND_TITLE,
    ]).filter((cls) => !shared.has(cls))
    expect(own).toEqual(Object.keys(DECLARATION).sort())
    expect(own).toHaveLength(42)
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
      const before = sheet.slice(sheet.lastIndexOf('@', at), at).replace(/\s+/g, ' ')
      expect(before.startsWith(query)).toBe(true)
      expect(before.split('{').length - before.split('}').length).toBe(1)
    })
  }
})

describe('the guarantees a class carries', () => {
  it('the popup hangs near the top, so it does not jump as the results change (choice 16)', () => {
    expect(COMMAND_VIEWPORT).toBe('fixed inset-0 z-(--tc-z-dialog) flex items-start justify-center p-(--tc-overlay-inset) pt-[15dvh]')
  })

  it('the popup clips nothing, so the ring of the input is never cut', () => {
    expect(COMMAND_POPUP).not.toContain('overflow-hidden')
    expect(COMMAND_POPUP).toContain(FOCUS_RING_INSET)
  })

  it('the input is 40 px tall, 48 under a finger, with 16 px text, so a phone neither misses it nor zooms the page', () => {
    expect(COMMAND_INPUT.split(' ').slice(0, 8)).toEqual(['h-control-md', 'pointer-coarse:h-control-lg', 'min-w-0', 'flex-1', 'rounded-control', 'bg-transparent', 'px-2', 'text-base'])
  })

  it('the list has no gap, so a row is where windowing reckons it, and is gone when nothing matches', () => {
    expect(COMMAND_LIST).toBe(`flex min-h-0 flex-col p-1.5 ${LIST_CAP} ${SCROLL_AREA} data-empty:hidden`)
  })

  it('a row and a heading are one unit tall, and the spacer counts units, under a finger too', () => {
    expect(COMMAND_ITEM).toContain(COMMAND_UNIT)
    expect(COMMAND_GROUP_LABEL).toContain(COMMAND_UNIT)
    expect(COMMAND_SPACER).toContain('shrink-0 h-[calc(var(--tc-list-rows)*var(--tc-row-height))]')
  })

  it('the active row wears the shared highlight, the fill and the ring inside its edge, and no line of its own', () => {
    expect(COMMAND_ITEM).toContain(ROW_HIGHLIGHT)
    expect(COMMAND_ITEM.split(' ').filter((cls) => cls.includes('outline-') && !ROW_HIGHLIGHT.includes(cls) && !ROW.includes(cls))).toEqual([])
  })

  it('the empty text takes no room while Base UI keeps its live region mounted and empty', () => {
    expect(COMMAND_STATUS).toBe('px-4 py-6 text-center text-sm text-muted empty:p-0')
  })
})
