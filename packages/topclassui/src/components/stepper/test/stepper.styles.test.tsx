import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { STEPPER_CONNECTOR } from '../classes.js'
import { Stepper } from '../index.js'
import type { StepperItem, StepperProps } from '../types.js'

const ITEMS: StepperItem[] = [
  { id: 'a', title: 'Account' },
  { id: 'b', title: 'Profile' },
  { id: 'c', title: 'Team', status: 'error' },
  { id: 'd', title: 'Done' },
]
const html = (props: Partial<StepperProps> = {}) => markup(<Stepper items={ITEMS} value="b" {...props} />)

/** The sorted class list of every element of a kind, step by step. */
const all = (out: string, marker: RegExp) => [...out.matchAll(/<[a-z]+ [^>]*>/g)]
  .map((m) => m[0]).filter((tag) => marker.test(tag)).map((tag) => [...classList(tag)].sort())
const MARK = /class="relative inline-flex/
const TITLE = /dir="auto"/

describe('each part wears exactly the classes the spec names', () => {
  it('the root is a full-width row of equal columns that wraps, 16 px between rows, and sets the size of its circles', () => {
    expect(classList(html())).toEqual(['flex', 'w-full', 'min-w-0', 'flex-wrap', 'items-start', 'gap-y-4', '[--tc-stepper-mark:var(--spacing-control-sm)]'])
  })

  it('a step is a centred column that shrinks to its circle and no further, with 8 px between the circle and the title', () => {
    expect(all(html(), /^<li /)[0]).toEqual(['flex', 'flex-1', 'flex-col', 'gap-2', 'items-center', 'max-w-[calc(var(--tc-stepper-mark)*2.75)]', 'min-w-(--tc-stepper-mark)', 'relative', 'text-center'])
  })

  it('the row holding the circle and the line is as wide as its step', () => {
    expect(all(html(), /^<div /)[0]).toEqual(['flex', 'justify-center', 'relative', 'w-full'])
  })

  it('the line is two halves, centre to column end and column start to centre, a 1 px border level with the circle', () => {
    const half = ['-translate-y-1/2', 'absolute', 'border-line', 'border-t-(length:--tc-line-width)', 'data-done:border-primary-solid', 'top-1/2', 'w-1/2']
    const [after, before] = all(html(), /class="absolute/)
    expect(after).toEqual([...half, 'inset-s-1/2'].sort())
    expect(before).toEqual([...half, 'inset-s-0'].sort())
  })

  it('the circle of each status: a fill for done, current and error, the strong line on the surface for todo', () => {
    const shared = ['font-medium', 'inline-flex', 'items-center', 'justify-center', 'relative', 'rounded-full', 'shrink-0', 'size-(--tc-stepper-mark)', 'tabular-nums', 'text-sm']
    const filled = ['forced-color-adjust-none', 'forced-colors:bg-[CanvasText]', 'forced-colors:text-[Canvas]']
    expect(all(html(), MARK)).toEqual([
      [...shared, ...filled, 'bg-primary-solid', 'text-primary-on-solid'].sort(),
      [...shared, ...filled, 'bg-primary-solid', 'text-primary-on-solid'].sort(),
      [...shared, ...filled, 'bg-danger-solid', 'text-danger-on-solid'].sort(),
      [...shared, 'bg-surface', 'text-muted', 'border-(length:--tc-line-width)', 'border-line-strong'].sort(),
    ])
  })

  it('the title wraps anywhere inside its column; the current one is semibold, a todo one muted', () => {
    expect(all(html(), TITLE)).toEqual([
      ['max-w-full', 'text-body', 'text-xs', 'wrap-anywhere'],
      ['font-semibold', 'max-w-full', 'text-body', 'text-xs', 'wrap-anywhere'],
      ['max-w-full', 'text-body', 'text-xs', 'wrap-anywhere'],
      ['max-w-full', 'text-muted', 'text-xs', 'wrap-anywhere'],
    ])
  })

  it('the status word is visually hidden, and its step is relative so it is placed inside it', () => {
    expect(html()).toContain('<span class="sr-only">Completed</span>')
    expect(all(html(), /^<li /).every((list) => list.includes('relative'))).toBe(true)
  })
})

describe('the five sizes', () => {
  /** The size the list sets, then the type steps of the number and of the title. */
  const at = (size: StepperProps['size']) => [
    classList(html({ size })).filter((c) => c.startsWith('[--tc-stepper-mark')),
    all(html({ size }), MARK)[0]?.filter((c) => /^text-(xs|sm|base)$/.test(c)),
    all(html({ size }), TITLE)[0]?.filter((c) => /^text-(xs|sm|base)$/.test(c)),
  ]

  it('one step under the control scale, md the drawn 32 px', () => {
    expect(at('xs')).toEqual([['[--tc-stepper-mark:calc(1.5rem*var(--tc-density))]'], ['text-xs'], ['text-xs']])
    expect(at('sm')).toEqual([['[--tc-stepper-mark:var(--spacing-control-xs)]'], ['text-xs'], ['text-xs']])
    expect(at('md')).toEqual([['[--tc-stepper-mark:var(--spacing-control-sm)]'], ['text-sm'], ['text-xs']])
    expect(at('lg')).toEqual([['[--tc-stepper-mark:var(--spacing-control-md)]'], ['text-sm'], ['text-sm']])
    expect(at('xl')).toEqual([['[--tc-stepper-mark:var(--spacing-control-lg)]'], ['text-base'], ['text-base']])
  })

  it('custom emits no size class, and every circle reads its size from the one variable', () => {
    expect(at('custom')).toEqual([[], [], []])
    expect(all(html({ size: 'custom' }), MARK).every((list) => list.includes('size-(--tc-stepper-mark)'))).toBe(true)
  })

  it('lets a caller class set the circle of any size, since className is merged last', () => {
    expect(classList(html({ className: '[--tc-stepper-mark:3rem]' })).filter((c) => c.startsWith('[--tc'))).toEqual(['[--tc-stepper-mark:3rem]'])
  })
})

describe('right to left', () => {
  it('starts the connector at the inline start, so it mirrors with the direction alone', () => {
    expect(STEPPER_CONNECTOR.split(' ')).toContain('inset-s-1/2')
  })

  it('uses no physical side anywhere', () => {
    const every = html().match(/class="[^"]*"/g)?.join(' ') ?? ''
    const physical = /^(pl|pr|ml|mr|left|right|start|end|border-l|border-r|text-left|text-right|translate-x|-translate-x)-/
    expect(every.split(/[\s"=]+/).filter((c) => physical.test(c))).toEqual([])
    expect(every).not.toMatch(/flex-row-reverse|rtl:|ltr:/)
  })

  it('reads the line width from the knob, as every border does', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'classes.ts'), 'utf8')
    expect(source).not.toMatch(/border-t(-[0-9])?\b(?!-\()/)
  })
})

describe('a stepper is not interactive', () => {
  it('carries no ring, hover, transition, cursor or disabled style', () => {
    const interactive = /(^|:)(hover|active|focus-visible|disabled|data-disabled):|^(outline-|transition|duration-|cursor-)/
    expect(html().match(/class="[^"]*"/g)?.join(' ').split(/[\s"=]+/).filter((c) => interactive.test(c))).toEqual([])
  })

  it('is not a tab stop of its own and holds no control', () => {
    expect(html()).not.toMatch(/tabindex|<a |<button|<input/)
  })
})

describe('className is merged last, so the consumer wins every conflict', () => {
  it('keeps a consumer utility that conflicts with nothing', () => {
    expect(classList(html({ className: 'mt-4' }))).toEqual(['flex', 'w-full', 'min-w-0', 'flex-wrap', 'items-start', 'gap-y-4', '[--tc-stepper-mark:var(--spacing-control-sm)]', 'mt-4'])
  })

  it('replaces the width of the root', () => {
    expect(classList(html({ className: 'w-96' }))).toEqual(['flex', 'min-w-0', 'flex-wrap', 'items-start', 'gap-y-4', '[--tc-stepper-mark:var(--spacing-control-sm)]', 'w-96'])
  })
})
