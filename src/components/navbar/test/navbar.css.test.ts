import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import {
  NAVBAR_ACTIONS, NAVBAR_BRAND, NAVBAR_ITEM, NAVBAR_LINK, NAVBAR_LINKS, NAVBAR_LIST, NAVBAR_ROOT, NAVBAR_TOP,
} from '../classes.js'

const REACH = 'calc(var(--tc-ring-width) + var(--tc-ring-offset) + 1px)'

/** What each class Navbar writes must emit, written out: a class Tailwind does not know emits nothing at all. */
const DECLARATION: Record<string, string> = {
  // The bar.
  'flex': 'display: flex;',
  'min-h-15': 'min-height: calc(var(--spacing) * 15);',
  'w-full': 'width: 100%;',
  'flex-wrap': 'flex-wrap: wrap;',
  'items-center': 'align-items: center;',
  'gap-x-6': 'column-gap: calc(var(--spacing) * 6);',
  'gap-y-2': 'row-gap: calc(var(--spacing) * 2);',
  'pb-1.5': 'padding-bottom: calc(var(--spacing) * 1.5);',
  'ps-[calc(1.25rem+var(--tc-safe-start))]': 'padding-inline-start: calc(1.25rem + var(--tc-safe-start));',
  'pe-[calc(1.25rem+var(--tc-safe-end))]': 'padding-inline-end: calc(1.25rem + var(--tc-safe-end));',
  'bg-surface-raised': 'background-color: var(--tc-surface-raised);',
  'border-b-(length:--tc-line-width)': 'border-bottom-width: var(--tc-line-width);',
  'border-line': 'border-color: var(--tc-line);',
  // Its top edge, sticky or in the flow.
  'sticky': 'position: sticky;',
  'top-0': 'top: 0px;',
  'z-(--tc-z-sticky)': 'z-index: var(--tc-z-sticky);',
  'data-unstuck:static': 'position: static;',
  'pt-[calc(0.375rem+var(--tc-safe-top))]': 'padding-top: calc(0.375rem + var(--tc-safe-top));',
  'pt-1.5': 'padding-top: calc(var(--spacing) * 1.5);',
  // The brand and a link.
  'inline-flex': 'display: inline-flex;',
  'gap-2': 'gap: calc(var(--spacing) * 2);',
  'overflow-hidden': 'overflow: hidden;',
  'rounded-control': 'border-radius: var(--tc-radius);',
  'text-base': 'font-size: var(--text-base);',
  'font-semibold': 'font-weight: var(--font-weight-semibold);',
  'text-body': 'color: var(--tc-body);',
  'max-w-full': 'max-width: 100%;',
  'justify-center-safe': 'justify-content: safe center;',
  'text-sm': 'font-size: var(--text-sm);',
  'text-muted': 'color: var(--tc-muted);',
  'aria-[current=page]:font-semibold': 'font-weight: var(--font-weight-semibold);',
  'aria-[current=page]:text-body': 'color: var(--tc-body);',
  'forced-colors:aria-[current=page]:underline': 'text-decoration-line: underline;',
  'aria-[current=page]:[scroll-initial-target:nearest]': 'scroll-initial-target: nearest;',
  'focus-visible:snap-center': 'scroll-snap-align: center;',
  'hover:underline': 'text-decoration-line: underline;',
  'outline-none': 'outline-style: none;',
  'focus-visible:outline-solid': 'outline-style: solid;',
  'focus-visible:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': 'outline-offset: var(--tc-ring-offset);',
  'focus-visible:outline-ring': 'outline-color: var(--tc-ring);',
  'min-h-[var(--tc-target-min,24px)]': 'min-height: var(--tc-target-min,24px);',
  'min-w-[var(--tc-target-min,24px)]': 'min-width: var(--tc-target-min,24px);',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': 'min-height: var(--tc-target-coarse,44px);',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]': 'min-width: var(--tc-target-coarse,44px);',
  // The nav, its list and a list item.
  'grid': 'display: grid;',
  'min-w-0': 'min-width: 0px;',
  'grow': 'flex-grow: 1;',
  'basis-24': 'flex-basis: calc(var(--spacing) * 24);',
  'grid-cols-1': 'grid-template-columns: repeat(1, minmax(0, 1fr));',
  'gap-5': 'gap: calc(var(--spacing) * 5);',
  'snap-x': 'scroll-snap-type: x var(--tw-scroll-snap-strictness);',
  'snap-mandatory': '--tw-scroll-snap-strictness: mandatory;',
  'hover:snap-none': 'scroll-snap-type: none;',
  '-m-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+1px)]': `margin: calc(${REACH} * -1);`,
  'p-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+1px)]': `padding: ${REACH};`,
  'overflow-x-auto': 'overflow-x: auto;',
  'overscroll-x-contain': 'overscroll-behavior-x: contain;',
  'shrink-0': 'flex-shrink: 0;',
  // The actions.
  'ms-auto': 'margin-inline-start: auto;',
  'justify-end': 'justify-content: flex-end;',
}

/** The attribute, the state or the mode each variant class must be scoped to, or it would paint on every link. */
const SCOPE: Record<string, string> = {
  'aria-[current=page]:font-semibold': '[aria-current="page"] {',
  'aria-[current=page]:text-body': '[aria-current="page"] {',
  'forced-colors:aria-[current=page]:underline': '[aria-current="page"] {',
  'aria-[current=page]:[scroll-initial-target:nearest]': '[aria-current="page"] {',
  'data-unstuck:static': '[data-unstuck] {',
  'focus-visible:snap-center': ':focus-visible {',
  'hover:snap-none': ':hover {',
  'focus-visible:outline-solid': ':focus-visible {',
  'focus-visible:outline-(length:--tc-ring-width)': ':focus-visible {',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': ':focus-visible {',
  'focus-visible:outline-ring': ':focus-visible {',
}

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** Where the selector of a class starts in the sheet, which is the order the cascade reads it in. */
const at = (css: string, cls: string) => css.indexOf(`.${escape(cls)}`)

/** The rule Tailwind emits for one class: from its selector to the closing brace of its innermost block. */
function ruleFor(css: string, cls: string): string {
  const from = at(css, cls)
  return from === -1 ? '' : css.slice(from, css.indexOf('}', from) + 1)
}

/** The at-rule a class sits in: what lies between the last @media before its rule and the rule, with no block closed in between. */
function mediaOf(css: string, cls: string): string {
  const rule = at(css, cls)
  const wrap = css.slice(css.lastIndexOf('@media', rule), rule)
  return wrap.includes('}') ? '' : wrap
}

const written = (strings: readonly string[]) => [...new Set(strings.join(' ').split(' '))].filter(Boolean).sort()

describe('every class Navbar writes compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of the bar, the brand, the nav, its list, a link and the actions', () => {
    const all = written([
      NAVBAR_ROOT, ...Object.values(NAVBAR_TOP), NAVBAR_BRAND, NAVBAR_LINKS, NAVBAR_LIST, NAVBAR_ITEM, NAVBAR_LINK, NAVBAR_ACTIONS,
    ])
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(61)
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

  it('the underline of the current link exists only under forced colours', async () => {
    expect(mediaOf(await css, 'forced-colors:aria-[current=page]:underline')).toContain('@media (forced-colors: active)')
    expect(mediaOf(await css, 'aria-[current=page]:font-semibold')).toBe('')
  })

  it('the 44 px floor exists only under a coarse pointer', async () => {
    expect(mediaOf(await css, 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')).toContain('@media (pointer: coarse)')
    expect(mediaOf(await css, 'min-h-[var(--tc-target-min,24px)]')).toBe('')
  })

  it('the rule scan reads nothing for a class that has no rule', async () => {
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})

// The plan wrote px-5 beside ps-safe and pe-safe on one element: the two set the same property.
describe('the side padding is the drawn 20 px plus the safe area, in one declaration', () => {
  it('the bar wears neither px-5 nor a bare safe utility at its sides', () => {
    const bar = NAVBAR_ROOT.split(' ')
    expect(bar).not.toContain('px-5')
    expect(bar).not.toContain('ps-safe')
    expect(bar).not.toContain('pe-safe')
    expect(Object.values(NAVBAR_TOP).join(' ').split(' ')).not.toContain('pt-safe')
  })

  it('ps-safe would have replaced the 20 px: it is emitted after px-5 and sets the start padding alone', async () => {
    const sheet = (await compileEntry()).build(['px-5', 'ps-safe'])
    expect(ruleFor(sheet, 'ps-safe')).toContain('padding-inline-start: var(--tc-safe-start);')
    expect(at(sheet, 'ps-safe')).toBeGreaterThan(at(sheet, 'px-5'))
  })

  it('the tokens file gives the three safe areas the bar adds, from env()', async () => {
    const sheet = (await compileEntry()).build(['flex'])
    expect(sheet).toContain('--tc-safe-top: env(safe-area-inset-top);')
    expect(sheet).toContain('--tc-safe-start: env(safe-area-inset-left);')
    expect(sheet).toContain('--tc-safe-end: env(safe-area-inset-right);')
  })
})

// R-10.5-3: the bar writes --tc-sticky-top, and this is the rule that reads it.
describe('the page reads the height of the bar', () => {
  it('html keeps that much clear at the top of every scroll', async () => {
    const sheet = (await compileEntry()).build(['flex'])
    expect(sheet).toContain('scroll-padding-block: var(--tc-sticky-top) var(--tc-sticky-bottom);')
    expect(sheet).toContain('--tc-sticky-top: 0px;')
  })
})
