import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** Page 6 of 12: nine links, none of them at an edge, one of them current. */
const HTML = markup(<Pagination value={6} pageCount={12} getHref={blog} />)

const classesOf = (opening: RegExp) =>
  [...HTML.matchAll(opening)].map((match) => (attr(match[0], 'class') ?? '').split(' '))

const links = classesOf(/<a [^>]*>/g)
const current = classesOf(/<a [^>]*aria-current[^>]*>/g)
const others = links.filter((list) => !list.includes('bg-primary-solid'))

const missing = (wanted: readonly string[], list: readonly string[]) => wanted.filter((cls) => !list.includes(cls))

// pagination.css.test proves the order in the stylesheet; this proves each link carries the classes.
describe('under a pointer', () => {
  it('found the nine links, one of them current, so an empty list cannot pass', () => {
    expect(links).toHaveLength(9)
    expect(current).toHaveLength(1)
    expect(others).toHaveLength(8)
  })

  it('tints every other link with the neutral soft step, and its next step while pressed', () => {
    for (const list of others) {
      expect(missing(['tone-neutral', 'hover:bg-(--tc-soft)', 'active:bg-(--tc-soft-hover)'], list)).toEqual([])
      expect(list).not.toContain('tone-primary')
    }
  })

  it('darkens the current page along the primary ramp', () => {
    expect(missing(['tone-primary', 'hover:bg-(--tc-hover)', 'active:bg-(--tc-active)'], current[0] ?? [])).toEqual([])
    expect(current[0]).not.toContain('tone-neutral')
  })

  it('moves between the two through the shared transition, which the motion knob can stop', () => {
    for (const list of links) {
      expect(missing([
        'transition-[color,background-color,border-color,outline-color,opacity,translate]',
        'duration-(--tc-duration)',
        'ease-out',
      ], list)).toEqual([])
    }
  })

  it('leaves a gap alone: it is text, so nothing about it answers a pointer', () => {
    const gaps = classesOf(/<li aria-hidden[^>]*>/g)
    expect(gaps).toHaveLength(2)
    for (const list of gaps) expect(list.filter((cls) => /^(hover:|active:|tone-|transition)/.test(cls))).toEqual([])
  })
})
