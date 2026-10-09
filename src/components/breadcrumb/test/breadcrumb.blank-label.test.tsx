import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem } from '../types.js'

const of = (items: BreadcrumbItem[]) => markup(<Breadcrumb items={items} />)
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1
const anchors = (out: string) => out.match(/<a [^>]*>/g) ?? []

/** What a JSON-LD reader ends up with. */
const listed = (out: string) => (JSON.parse(/<script[^>]*>(.*?)<\/script>/.exec(out)?.[1] ?? '{}') as {
  itemListElement?: { position: number; name: string; item: string }[]
}).itemListElement

// A CMS page with no title: the type cannot refuse an empty string, so the render does.
describe('a crumb whose label is empty or only whitespace', () => {
  const out = of([
    { href: '/', label: 'Home' },
    { href: '/untitled', label: '' },
    { href: '/spaces', label: '  \n\t ' },
    { label: 'Page' },
  ])

  it('renders no link for it, so no anchor in the trail is without a name', () => {
    expect(anchors(out)).toHaveLength(1)
    expect(attr(anchors(out)[0] ?? '', 'href')).toBe('/')
    expect(out).not.toMatch(/<span class="truncate min-w-0">\s*<\/span>/)
  })

  it('renders no list item and no separator for it either', () => {
    expect(count(out, '<li')).toBe(2)
    expect(count(out, '<svg')).toBe(1)
  })

  it('keeps it out of the JSON-LD, which lists exactly the links that are rendered', () => {
    expect(listed(out)).toEqual([{ '@type': 'ListItem', position: 1, name: 'Home', item: '/' }])
    expect(out).not.toContain('/untitled')
    expect(out).not.toContain('/spaces')
  })

  it('numbers what is left from 1 with no gap', () => {
    const gap = of([{ href: '/a', label: 'A' }, { href: '/x', label: ' ' }, { href: '/b', label: 'B' }, { label: 'C' }])
    expect(listed(gap)).toEqual([
      { '@type': 'ListItem', position: 1, name: 'A', item: '/a' },
      { '@type': 'ListItem', position: 2, name: 'B', item: '/b' },
    ])
  })

  it('drops a label of no-break spaces too, which is just as invisible', () => {
    const nbsp = of([{ href: '/', label: 'Home' }, { href: '/nbsp', label: '  ' }, { label: 'Page' }])
    expect(anchors(nbsp)).toHaveLength(1)
    expect(nbsp).not.toContain('/nbsp')
  })

  it('leaves the current page on the last crumb that has a name', () => {
    const last = of([{ href: '/', label: 'Home' }, { label: 'Settings' }, { label: '' }])
    expect(count(last, '<li')).toBe(2)
    expect(count(last, 'aria-current="page"')).toBe(1)
    expect(last).toMatch(/<span aria-current="page" class="[^"]*">Settings<\/span><\/li><\/ol>/)
  })

  it('renders nothing at all when every label is blank, like an empty trail', () => {
    expect(of([{ href: '/', label: '' }, { label: ' ' }])).toBe('')
  })
})

describe('a label that has text', () => {
  it('is written exactly as given, spaces around it included: only the blank ones are dropped', () => {
    const out = of([{ href: '/', label: ' Home ' }, { label: 'Page' }])
    expect(out).toContain('<span class="truncate min-w-0"> Home </span></a>')
    expect(listed(out)).toEqual([{ '@type': 'ListItem', position: 1, name: ' Home ', item: '/' }])
  })

  it('keeps a one-character label, which is short but not blank', () => {
    expect(anchors(of([{ href: '/', label: '~' }, { label: 'Page' }]))).toHaveLength(1)
  })
})
