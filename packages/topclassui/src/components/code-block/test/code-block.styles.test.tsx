import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { CodeBlock } from '../index.js'
import type { CodeBlockProps } from '../types.js'

const html = (props: Partial<CodeBlockProps> = {}) => markup(<CodeBlock title="page.tsx" {...props}>{'const a = 1'}</CodeBlock>)

/** The class list of the first element of a tag name. */
const classesOf = (source: string, tag: string) =>
  (new RegExp(`<${tag} [^>]*class="([^"]*)"`).exec(source)?.[1] ?? '').split(/\s+/).filter(Boolean)

const missing = (list: string[], wanted: readonly string[]) => wanted.filter((cls) => !list.includes(cls))

describe('the root', () => {
  it('is one grid column on the solid neutral surface, so the code scrolls inside it and never widens its parent', () => {
    expect(missing(classesOf(html(), 'div'), [
      'relative', 'grid', 'min-w-0', 'grid-cols-1', 'max-w-full', 'rounded-box', 'bg-neutral-solid', 'text-neutral-on-solid',
    ])).toEqual([])
  })

  it('recolours both rings to the block text, as Pagination and Tabs recolour theirs', () => {
    expect(classesOf(html(), 'div')).toContain('[--tc-ring:var(--tc-neutral-on-solid)]')
  })

  it('draws an edge under forced colours, where the fill is erased', () => {
    expect(classesOf(html(), 'div')).toContain('forced-colors:outline-(length:--tc-line-width)')
  })

  it('names no palette colour and no dark: variant (R-5.2-1)', () => {
    expect(html()).not.toMatch(/(bg|text)-(zinc|gray|slate|neutral)-\d|dark:/)
  })
})

describe('the header', () => {
  it('the title truncates on one line and fills the row; the icon never shrinks', () => {
    const out = html()
    expect(missing((/<span dir="auto" [^>]*class="([^"]*)"/.exec(out)?.[1] ?? '').split(' '), ['truncate', 'min-w-0', 'flex-1', 'font-mono', 'text-xs'])).toEqual([])
    expect(missing(classesOf(out, 'span'), ['flex', 'shrink-0'])).toEqual([])
  })

  it('the button is a 24 px target, 44 under a finger, at the inline end, with the shared ring and its own hover', () => {
    expect(missing(classesOf(html(), 'button'), [
      'ms-auto', 'min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
      'focus-visible:outline-ring', 'focus-visible:outline-offset-(length:--tc-ring-offset)',
      'hover:bg-neutral-on-solid/10', 'hover:text-neutral-on-solid',
    ])).toEqual([])
  })

  it('the status is read and never seen', () => {
    expect(html()).toContain('<span role="status" class="sr-only">')
  })
})

describe('the pre', () => {
  it('scrolls sideways in its own box, keeps the spacing of code, and rings inside its edge', () => {
    expect(missing(classesOf(html(), 'pre'), [
      'overflow-x-auto', 'overscroll-x-contain', 'whitespace-pre', 'font-mono', 'text-start', 'rounded-b-box', 'pb-3', 'px-3',
      'focus-visible:-outline-offset-(length:--tc-ring-width)', 'focus-visible:outline-ring',
    ])).toEqual([])
  })

  it('alone, with no header, takes the top padding back and rounds every corner', () => {
    const list = classesOf(html({ title: undefined, showCopy: false }), 'pre')
    expect(missing(list, ['rounded-box', 'pt-3'])).toEqual([])
    expect(list).not.toContain('rounded-b-box')
    expect(classesOf(html(), 'pre')).not.toContain('pt-3')
  })

  it('wrap breaks the long line instead, and cn drops the whitespace-pre it replaces', () => {
    const list = classesOf(html({ wrap: true }), 'pre')
    expect(missing(list, ['whitespace-pre-wrap', 'wrap-anywhere'])).toEqual([])
    expect(list).not.toContain('whitespace-pre')
  })
})
