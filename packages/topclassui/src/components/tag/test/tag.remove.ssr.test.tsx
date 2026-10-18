import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { attr, classList } from '#test/markup.js'
import { Tag, TagRemovable } from '../index.js'
import type { TagProps } from '../types.js'

/** The HTML a server sends for a TagRemovable, the client export, as the server render of its client tree writes it. */
const html = (props: TagProps = {}) => renderToString(<TagRemovable onRemove={() => undefined} {...props}>React</TagRemovable>)
const button = (source: string) => /<button[^>]*>/.exec(source)?.[0] ?? ''
const label = (source: string) => /<span id="[^"]*"[^>]*>/.exec(source)?.[0] ?? ''

/** Each size, written out: the end padding at the block padding, and the reach of the x over padding and border. */
const SIZE = {
  xs: ['pe-pad-y-xs', '-my-[calc(var(--spacing-pad-y-xs)+var(--tc-line-width))]'],
  sm: ['pe-pad-y-sm', '-my-[calc(var(--spacing-pad-y-sm)+var(--tc-line-width))]'],
  md: ['pe-pad-y-md', '-my-[calc(var(--spacing-pad-y-md)+var(--tc-line-width))]'],
  lg: ['pe-pad-y-lg', '-my-[calc(var(--spacing-pad-y-lg)+var(--tc-line-width))]'],
  xl: ['pe-pad-y-xl', '-my-[calc(var(--spacing-pad-y-xl)+var(--tc-line-width))]'],
} as const

describe('a Tag is the server half alone', () => {
  const plain = renderToString(<Tag>React</Tag>)

  it('sends no button, no id and no aria attribute', () => {
    expect(plain).not.toContain('<button')
    expect(plain).not.toContain(' id=')
    expect(plain).not.toContain('aria-')
  })

  it('keeps the chip that clips, as Unit 2 built it', () => {
    expect(classList(plain)).toContain('overflow-hidden')
    expect(classList(plain)).not.toContain('inline-grid')
  })
})

describe('a TagRemovable sends its label and its x in the server HTML', () => {
  it('holds the label in one span with an id and the truncating classes, then the x', () => {
    const sent = html()
    expect(label(sent)).toMatch(/^<span id="[^"]+" class="truncate min-w-0 flex items-center gap-\[inherit\]">/)
    expect(sent.indexOf('<span id=')).toBeLessThan(sent.indexOf('<button'))
    expect(sent).toContain('>React</span></span><button')
  })

  it('names the x by its own id and then the label id, with the word in aria-label', () => {
    const sent = html()
    const [own, of] = (attr(button(sent), 'aria-labelledby') ?? '').split(' ')
    expect(own).toBe(attr(button(sent), 'id'))
    expect(of).toBe(attr(label(sent), 'id'))
    expect(attr(button(sent), 'aria-label')).toBe('Remove')
    expect(attr(button(sent), 'type')).toBe('button')
  })

  it('holds the x as a 1em svg the button names, so the svg itself is hidden', () => {
    expect(html()).toMatch(/<button[^>]*><svg[^>]*width="1em"[^>]*aria-hidden="true"/)
  })

  it('stops clipping at the chip and gives the label a column that starts at 0', () => {
    const list = classList(html())
    for (const cls of ['inline-grid', 'grid-cols-[minmax(0,auto)_auto]', 'overflow-visible']) expect(list, cls).toContain(cls)
    expect(list).not.toContain('overflow-hidden')
    expect(list).not.toContain('inline-flex')
  })

  it('keeps the look and the bound of the server half', () => {
    const sent = html({ tone: 'danger' })
    expect(attr(sent, 'data-tone')).toBe('danger')
    expect(classList(sent)).toContain('bg-danger-soft')
    expect(renderToString(<TagRemovable onRemove={() => undefined}>{'x'.repeat(500)}</TagRemovable>)).not.toContain('x'.repeat(101))
  })

  it('gives the x the shared icon button, the soft hover of the tag tone, and the forced-colours hover', () => {
    const list = classList(button(html({ tone: 'success' })))
    for (const cls of [
      'inline-flex', 'shrink-0', 'rounded-control', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'focus-visible:outline-solid', 'tone-success',
      'hover:bg-(--tc-soft-hover)', 'active:bg-(--tc-soft-active)', 'forced-colors:hover:forced-color-adjust-none',
      'forced-colors:hover:bg-[Highlight]', 'forced-colors:hover:text-[HighlightText]',
    ]) expect(list, cls).toContain(cls)
  })

  for (const [size, [end, reach]] of Object.entries(SIZE)) {
    it(`${size}: the end padding drops to the block padding and the x reaches over it`, () => {
      const sent = html({ size: size as keyof typeof SIZE })
      expect(classList(sent), size).toContain(end)
      expect(classList(button(sent)), size).toContain(reach)
    })
  }

  it('custom: neither, so the caller sizes it', () => {
    const sent = html({ size: 'custom' })
    expect(classList(sent).filter((c) => c.startsWith('pe-') || c.startsWith('-my-'))).toEqual([])
  })

  it('lets the caller className win over the removable classes', () => {
    expect(classList(html({ className: 'pe-4' }))).not.toContain('pe-pad-y-md')
  })
})
