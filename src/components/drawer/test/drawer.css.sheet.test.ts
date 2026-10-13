import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { DRAWER_EDGE, DRAWER_GRABBER, DRAWER_WIDTH, DRAWER_X } from '../classes.js'

const FIRST = ' > *):first-child:not(:last-child) {'
const SECOND = ' > *):nth-child(2):not(:last-child) {'

/** What changes with the edge a sheet stands on: its box, its line, its safe areas, its slide, the corner of its x. */
const DECLARATION: Record<string, string> = {
  // The box and the one line that faces the page.
  'h-dvh': 'height: 100dvh;',
  'w-full': 'width: 100%;',
  'max-h-[90dvh]': 'max-height: 90dvh;',
  'border-line': 'border-color: var(--tc-line);',
  'border-s-(length:--tc-line-width)': 'border-inline-start-width: var(--tc-line-width);',
  'border-e-(length:--tc-line-width)': 'border-inline-end-width: var(--tc-line-width);',
  'border-t-(length:--tc-line-width)': 'border-top-width: var(--tc-line-width);',
  'border-b-(length:--tc-line-width)': 'border-bottom-width: var(--tc-line-width);',
  'max-w-64': 'max-width: calc(var(--spacing) * 64);',
  'max-w-72': 'max-width: calc(var(--spacing) * 72);',
  'max-w-80': 'max-width: calc(var(--spacing) * 80);',
  'max-w-96': 'max-width: calc(var(--spacing) * 96);',
  'max-w-120': 'max-width: calc(var(--spacing) * 120);',
  // The safe areas, each a token that src/tokens.css reads from env().
  'pt-safe': 'padding-top: var(--tc-safe-top);',
  'pb-safe': 'padding-bottom: var(--tc-safe-bottom);',
  'ps-safe': 'padding-inline-start: var(--tc-safe-start);',
  'pe-safe': 'padding-inline-end: var(--tc-safe-end);',
  // Where each sheet waits before it opens and goes when it closes: off its own edge. The inline two multiply by --tc-dir.
  'data-starting-style:transform-[translateX(calc(100%*var(--tc-dir)))]': 'transform: translateX(calc(100% * var(--tc-dir)));',
  'data-ending-style:transform-[translateX(calc(100%*var(--tc-dir)))]': 'transform: translateX(calc(100% * var(--tc-dir)));',
  'data-starting-style:transform-[translateX(calc(-100%*var(--tc-dir)))]': 'transform: translateX(calc(-100% * var(--tc-dir)));',
  'data-ending-style:transform-[translateX(calc(-100%*var(--tc-dir)))]': 'transform: translateX(calc(-100% * var(--tc-dir)));',
  'data-starting-style:transform-[translateY(100%)]': 'transform: translateY(100%);',
  'data-ending-style:transform-[translateY(100%)]': 'transform: translateY(100%);',
  'data-starting-style:transform-[translateY(-100%)]': 'transform: translateY(-100%);',
  'data-ending-style:transform-[translateY(-100%)]': 'transform: translateY(-100%);',
  // The corner the first row keeps for the x.
  '*:first:not-last:pe-16': 'padding-inline-end: calc(var(--spacing) * 16);',
  '*:first:not-last:min-h-[calc(0.75rem+var(--tc-target-min,24px))]': 'min-height: calc(0.75rem + var(--tc-target-min,24px));',
  'pointer-coarse:*:first:not-last:min-h-[calc(0.75rem+var(--tc-target-coarse,44px))]': 'min-height: calc(0.75rem + var(--tc-target-coarse,44px));',
  '*:nth-2:not-last:pe-16': 'padding-inline-end: calc(var(--spacing) * 16);',
  '*:nth-2:not-last:min-h-[calc(var(--tc-target-min,24px)-0.375rem)]': 'min-height: calc(var(--tc-target-min,24px) - 0.375rem);',
  'pointer-coarse:*:nth-2:not-last:min-h-[calc(var(--tc-target-coarse,44px)-0.375rem)]': 'min-height: calc(var(--tc-target-coarse,44px) - 0.375rem);',
  // The x of the sheet.
  'absolute': 'position: absolute;',
  'top-3': 'top: calc(var(--spacing) * 3);',
  'top-[calc(0.75rem+var(--tc-safe-top))]': 'top: calc(0.75rem + var(--tc-safe-top));',
  'inset-e-3': 'inset-inline-end: calc(var(--spacing) * 3);',
  'inset-e-[calc(0.75rem+var(--tc-safe-end))]': 'inset-inline-end: calc(0.75rem + var(--tc-safe-end));',
  // The grabber.
  'mx-auto': 'margin-inline: auto;',
  'mt-2.5': 'margin-top: calc(var(--spacing) * 2.5);',
  'mb-1': 'margin-bottom: var(--spacing);',
  'h-1': 'height: var(--spacing);',
  'w-9': 'width: calc(var(--spacing) * 9);',
  'shrink-0': 'flex-shrink: 0;',
  'rounded-full': 'border-radius: calc(infinity * 1px);',
  'bg-line-strong': 'background-color: var(--tc-line-strong);',
  'forced-colors:outline-(length:--tc-line-width)': 'outline-width: var(--tc-line-width);',
}

/** The element or the state each variant class must reach, or it would paint at rest, or on the wrong child. */
const SCOPE: Record<string, string> = {
  'data-starting-style:transform-[translateX(calc(100%*var(--tc-dir)))]': '[data-starting-style] {',
  'data-ending-style:transform-[translateX(calc(100%*var(--tc-dir)))]': '[data-ending-style] {',
  'data-starting-style:transform-[translateY(100%)]': '[data-starting-style] {',
  'data-ending-style:transform-[translateY(-100%)]': '[data-ending-style] {',
  '*:first:not-last:pe-16': FIRST,
  '*:first:not-last:min-h-[calc(0.75rem+var(--tc-target-min,24px))]': FIRST,
  'pointer-coarse:*:first:not-last:min-h-[calc(0.75rem+var(--tc-target-coarse,44px))]': FIRST,
  '*:nth-2:not-last:pe-16': SECOND,
  '*:nth-2:not-last:min-h-[calc(var(--tc-target-min,24px)-0.375rem)]': SECOND,
  'pointer-coarse:*:nth-2:not-last:min-h-[calc(var(--tc-target-coarse,44px)-0.375rem)]': SECOND,
}

/** The classes Tailwind wraps from outside, and the query that must open just before each selector. */
const WRAPPED: Record<string, string> = {
  'pointer-coarse:*:first:not-last:min-h-[calc(0.75rem+var(--tc-target-coarse,44px))]': '@media (pointer: coarse) { ',
  'pointer-coarse:*:nth-2:not-last:min-h-[calc(var(--tc-target-coarse,44px)-0.375rem)]': '@media (pointer: coarse) { ',
  'forced-colors:outline-(length:--tc-line-width)': '@media (forced-colors: active) { ',
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
const compiled = compileEntry().then((entry) => entry.build(Object.keys(DECLARATION)))

describe('every class that changes with the edge of a sheet compiles with the installed Tailwind', () => {
  it('the table names exactly the classes of the four edges, the five widths, the four places of the x and the grabber', () => {
    const all = written([
      ...Object.values(DRAWER_EDGE), ...Object.values(DRAWER_WIDTH), ...Object.values(DRAWER_X), DRAWER_GRABBER,
    ]).filter((cls) => cls !== '')
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(45)
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await compiled, cls), cls).toContain(declaration)
    })
  }

  for (const [cls, scope] of Object.entries(SCOPE)) {
    it(`${cls} reaches ${scope.slice(0, -2).trim()}`, async () => {
      expect(ruleFor(await compiled, cls), cls).toContain(scope)
    })
  }

  for (const [cls, query] of Object.entries(WRAPPED)) {
    it(`${cls} sits inside ${query.trim()}`, async () => {
      const sheet = await compiled
      const at = sheet.indexOf(`.${escape(cls)}`)
      const before = sheet.slice(sheet.lastIndexOf('@media (', at), at).replace(/\s+/g, ' ')
      expect(before.slice(0, query.length)).toBe(query)
      expect(before.split('{').length - before.split('}').length).toBe(1)
    })
  }
})

// Two rules on one element: the popup reaches its first row with three conditions, the row itself with one class.
describe('the corner kept for the x outranks the padding a row gives itself', () => {
  it('the rule on the first row carries a child, a first-child and a not-last-child, against the single class of px-4', async () => {
    const rule = ruleFor(await compiled, '*:first:not-last:pe-16')
    expect(rule.slice(rule.indexOf(' > *)'), rule.indexOf('{')).trim()).toBe('> *):first-child:not(:last-child)')
    expect(rule).toContain('padding-inline-end')
    expect(rule).not.toContain('padding-inline-start')
  })

  it('a bottom sheet reaches its second child, the row after the grabber, and never its first', () => {
    expect(DRAWER_EDGE.bottom).toContain('*:nth-2:not-last:pe-16')
    expect(DRAWER_EDGE.bottom).not.toContain('*:first:')
    for (const edge of ['start', 'end', 'top'] as const) {
      expect(DRAWER_EDGE[edge], edge).toContain('*:first:not-last:pe-16')
      expect(DRAWER_EDGE[edge], edge).not.toContain('*:nth-2:')
    }
  })
})
