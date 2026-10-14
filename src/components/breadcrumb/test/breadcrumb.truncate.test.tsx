import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { BREADCRUMB_BOUNDARIES } from '../boundaries.js'
import { Breadcrumb } from '../index.js'

const LONG = 'A step-by-step guide to moving every component to logical properties'

const classesBefore = (out: string, text: string) =>
  new RegExp(`class="([^"]*)">${text}<`).exec(out)?.[1]?.split(' ') ?? []

describe('a long crumb truncates instead of pushing the page apart', () => {
  it('puts a linked label on an element of its own that truncates', () => {
    const out = markup(<Breadcrumb items={[{ href: '/guide', label: LONG }, { label: 'Now' }]} />)
    expect(out).toContain(`<span dir="auto" class="truncate min-w-0">${LONG}</span></a>`)
  })

  it('never lets the link or its list item outgrow the container', () => {
    const out = markup(<Breadcrumb items={[{ href: '/guide', label: LONG }, { label: 'Now' }]} />)
    expect((/<a [^>]*class="([^"]*)"/.exec(out)?.[1] ?? '').split(' ')).toContain('max-w-full')
    expect((/<li class="([^"]*)"/.exec(out)?.[1] ?? '').split(' ')).toContain('max-w-full')
    expect((/<li class="([^"]*)"/.exec(out)?.[1] ?? '').split(' ')).toContain('min-w-0')
  })

  it('truncates the current page on the span that holds it', () => {
    const out = markup(<Breadcrumb items={[{ href: '/', label: 'Home' }, { label: LONG }]} />)
    expect(classesBefore(out, LONG)).toContain('truncate')
    expect(classesBefore(out, LONG)).toContain('min-w-0')
  })

  it('wraps the list, so many short crumbs grow down the page rather than across it', () => {
    const out = markup(<Breadcrumb items={[{ href: '/', label: 'Home' }, { label: 'Now' }]} />)
    expect((/<ol [^>]*class="([^"]*)"/.exec(out)?.[1] ?? '').split(' ')).toContain('flex-wrap')
  })
})

describe('the label bound stops a megabyte reaching the visible trail', () => {
  it('is 200 characters, written out here so a change to it is a decision', () => {
    expect(BREADCRUMB_BOUNDARIES).toEqual({ labelMaxLength: 200 })
  })

  it('cuts a linked label at the boundary, not at the width', () => {
    const out = markup(<Breadcrumb items={[{ href: '/x', label: 'x'.repeat(10_000) }, { label: 'Now' }]} />)
    expect(out).toContain(`<span dir="auto" class="truncate min-w-0">${'x'.repeat(200)}</span>`)
  })

  it('cuts the current page at the same boundary', () => {
    const out = markup(<Breadcrumb items={[{ href: '/', label: 'Home' }, { label: 'y'.repeat(10_000) }]} />)
    expect(out).toContain(`>${'y'.repeat(200)}</span></li>`)
    expect(out).not.toContain('y'.repeat(201))
  })

  it('leaves every real label untouched, which is what makes it a guard rail', () => {
    expect(LONG.length).toBe(68)
    const out = markup(<Breadcrumb items={[{ href: '/guide', label: LONG }, { label: LONG }]} />)
    expect(out.split(`>${LONG}</span>`)).toHaveLength(3)
  })

  it('keeps a label of exactly 200 characters whole', () => {
    const out = markup(<Breadcrumb items={[{ label: 'z'.repeat(200) }]} />)
    expect(out).toContain(`>${'z'.repeat(200)}</span>`)
  })
})

describe('the bound cuts between graphemes, with the shared cut every truncating label uses', () => {
  it('never splits a skin tone from its hand in a linked label', () => {
    const out = markup(<Breadcrumb items={[{ href: '/x', label: `${'x'.repeat(198)}👍🏽` }, { label: 'Now' }]} />)
    expect(out).toContain(`<span dir="auto" class="truncate min-w-0">${'x'.repeat(198)}</span></a>`)
  })

  it('never splits an Arabic letter from its harakat in the current page', () => {
    const out = markup(<Breadcrumb items={[{ href: '/', label: 'Home' }, { label: `${'x'.repeat(198)}مَّ` }]} />)
    expect(out).toContain(`>${'x'.repeat(198)}</span></li>`)
  })
})
