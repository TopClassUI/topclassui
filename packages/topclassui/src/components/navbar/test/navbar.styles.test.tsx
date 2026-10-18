import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** The classes of the first element of that name, in the order they are written. */
function classesOf(element: ReactElement, name: string): string[] {
  const found = new RegExp(`<${name}(?: [^>]*?)? class="([^"]*)"`).exec(markup(element))
  return (found?.[1] ?? '').split(' ').filter(Boolean)
}

const RING = [
  'outline-none', 'focus-visible:outline-solid', 'focus-visible:outline-(length:--tc-ring-width)',
  'focus-visible:outline-offset-(length:--tc-ring-offset)', 'focus-visible:outline-ring',
]
const TARGET = [
  'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

/** The bar of either kind, up to the padding of its top edge. */
const BAR = [
  'flex', 'min-h-15', 'w-full', 'flex-wrap', 'items-center', 'gap-x-6', 'gap-y-2', 'pb-1.5',
  'ps-[calc(1.25rem+var(--tc-safe-start))]', 'pe-[calc(1.25rem+var(--tc-safe-end))]',
  'bg-surface-raised', 'border-b-(length:--tc-line-width)', 'border-line',
]

describe('every part carries exactly the classes written here', () => {
  it('NavbarRoot, sticky: the bar, then the three classes that make it stick, the one that lets a bar too tall for the screen go, and its top padding with the safe area', () => {
    expect(classesOf(<NavbarRoot />, 'header')).toEqual([
      ...BAR, 'sticky', 'top-0', 'z-(--tc-z-sticky)', 'data-unstuck:static', 'pt-[calc(0.375rem+var(--tc-safe-top))]',
    ])
  })

  it('NavbarRoot, not sticky: the same bar with a plain top padding and nothing that sticks', () => {
    expect(classesOf(<NavbarRoot sticky={false} />, 'header')).toEqual([...BAR, 'pt-1.5'])
  })

  it('NavbarBrand', () => {
    expect(classesOf(<NavbarBrand href="/">Home</NavbarBrand>, 'a')).toEqual([
      'inline-flex', 'items-center', 'gap-2', 'overflow-hidden', 'rounded-control', 'text-base', 'font-semibold', 'text-body',
      'max-w-full', ...RING, ...TARGET,
    ])
  })

  it('NavbarLinks: the nav is a grid of one column that may shrink to nothing, and grows from 6rem', () => {
    expect(classesOf(<NavbarLinks />, 'nav')).toEqual(['grid', 'min-w-0', 'grow', 'basis-24', 'grid-cols-1'])
  })

  it('the list scrolls sideways, snaps but not under the pointer, and keeps the reach of a ring clear on every side', () => {
    expect(classesOf(<NavbarLinks />, 'ul')).toEqual([
      'flex', 'items-center', 'gap-5', 'snap-x', 'snap-mandatory', 'hover:snap-none',
      '-m-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+1px)]', 'p-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+1px)]',
      'overflow-x-auto', 'overscroll-x-contain', '[scrollbar-width:thin]', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]',
    ])
  })

  it('the list item is never squeezed and never wider than the list', () => {
    expect(classesOf(<NavbarLinks><NavbarLink href="/docs">Docs</NavbarLink></NavbarLinks>, 'li')).toEqual(['flex', 'shrink-0', 'max-w-full'])
  })

  it('NavbarLink', () => {
    expect(classesOf(<NavbarLink href="/docs">Docs</NavbarLink>, 'a')).toEqual([
      'inline-flex', 'items-center', 'justify-center-safe', 'overflow-hidden', 'rounded-control', 'text-sm', 'text-muted',
      'aria-[current=page]:font-semibold', 'aria-[current=page]:text-body', 'forced-colors:aria-[current=page]:underline',
      'aria-[current=page]:[scroll-initial-target:nearest]',
      'focus-visible:snap-center', 'max-w-full', 'hover:underline', ...RING, ...TARGET,
    ])
  })

  it('a current link carries the same classes: the attribute alone changes how it is drawn', () => {
    expect(classesOf(<NavbarLink href="/docs" current>Docs</NavbarLink>, 'a'))
      .toEqual(classesOf(<NavbarLink href="/docs">Docs</NavbarLink>, 'a'))
  })

  it('NavbarActions', () => {
    expect(classesOf(<NavbarActions />, 'div')).toEqual(['ms-auto', 'flex', 'flex-wrap', 'items-center', 'justify-end', 'gap-2', 'max-w-full'])
  })
})

// R-5.2-2: the consumer's className is passed last, so it wins a conflict with the part's own.
describe('a className on a part wins over the part', () => {
  it('NavbarRoot: a surface, a gap and a position of the caller replace ours', () => {
    const classes = classesOf(<NavbarRoot className="bg-surface gap-x-2 static" />, 'header')
    expect(classes).toContain('bg-surface')
    expect(classes).not.toContain('bg-surface-raised')
    expect(classes).toContain('gap-x-2')
    expect(classes).not.toContain('gap-x-6')
    expect(classes).toContain('static')
    expect(classes).not.toContain('sticky')
  })

  it('NavbarBrand: a type size and a weight', () => {
    const classes = classesOf(<NavbarBrand href="/" className="text-sm font-bold">Home</NavbarBrand>, 'a')
    expect(classes).toContain('text-sm')
    expect(classes).not.toContain('text-base')
    expect(classes).toContain('font-bold')
    expect(classes).not.toContain('font-semibold')
  })

  it('NavbarLinks: the className reaches the nav, and the list keeps its own', () => {
    expect(classesOf(<NavbarLinks className="basis-40" />, 'nav')).toEqual(['grid', 'min-w-0', 'grow', 'grid-cols-1', 'basis-40'])
    expect(classesOf(<NavbarLinks className="basis-40" />, 'ul')).not.toContain('basis-40')
  })

  it('NavbarLink: the className reaches the link, not the list item', () => {
    expect(classesOf(<NavbarLink href="/docs" className="text-body">Docs</NavbarLink>, 'a')).toContain('text-body')
    expect(classesOf(<NavbarLink href="/docs" className="text-body">Docs</NavbarLink>, 'a')).not.toContain('text-muted')
    const inList = <NavbarLinks><NavbarLink href="/docs" className="text-body">Docs</NavbarLink></NavbarLinks>
    expect(classesOf(inList, 'li')).toEqual(['flex', 'shrink-0', 'max-w-full'])
  })

  it('NavbarActions: a gap and an alignment', () => {
    const classes = classesOf(<NavbarActions className="gap-4 justify-start" />, 'div')
    expect(classes).toContain('gap-4')
    expect(classes).not.toContain('gap-2')
    expect(classes).toContain('justify-start')
    expect(classes).not.toContain('justify-end')
  })
})

describe('what the classes may not name', () => {
  const html = markup(
    <NavbarRoot>
      <NavbarBrand href="/">Home</NavbarBrand>
      <NavbarLinks><NavbarLink href="/docs" current>Docs</NavbarLink></NavbarLinks>
      <NavbarActions />
    </NavbarRoot>,
  )
  const all = [...html.matchAll(/class="([^"]*)"/g)].flatMap((match) => (match[1] ?? '').split(' '))

  it('found the classes of the seven elements and the two label spans', () => {
    expect([...html.matchAll(/class="/g)]).toHaveLength(9)
    expect(all.length).toBeGreaterThan(60)
  })

  it('no physical side: the bar mirrors with the page (R-5.3-1)', () => {
    expect(all.filter((cls) => /(^|:)-?(pl|pr|ml|mr|left|right|border-l|border-r|rounded-l|rounded-r|text-left|text-right)-/.test(cls))).toEqual([])
  })

  it('no palette colour, no dark: variant and no tracking (R-5.2-1, R-5.3-3)', () => {
    expect(all.filter((cls) => /-(slate|gray|zinc|neutral|stone|red|blue|violet)-\d|^dark:|tracking-/.test(cls))).toEqual([])
  })

  it('no transition and no animation: the bar has nothing that moves', () => {
    expect(all.filter((cls) => /transition|duration-|animate-|ease-/.test(cls))).toEqual([])
  })

  it('a system colour nowhere, and forced-colors: on one class only', () => {
    expect(all.filter((cls) => cls.includes('forced-colors:'))).toEqual(['forced-colors:aria-[current=page]:underline'])
    expect(all.filter((cls) => /\[(Canvas|CanvasText|Highlight|HighlightText|GrayText|LinkText)\]/.test(cls))).toEqual([])
  })
})
