import { describe, expect, it, vi } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { attr, classList, markup } from '#test/markup.js'
import { Table } from '../index.js'
import type { TableColumn, TableProps } from '../types.js'

interface Member { id: number; name: string; role: string }

const nobody: Member[] = []
const layla: Member = { id: 7, name: 'Layla', role: 'Owner' }

const columns: TableColumn<Member>[] = [
  { key: 'name', header: 'Name', cell: (member) => member.name },
  { key: 'role', header: 'Role', cell: (member) => member.role },
  { key: 'id', header: 'Number', align: 'end', cell: (member) => member.id },
]

const html = (props: Partial<TableProps<Member>> = {}) =>
  markup(<Table caption="Members" items={nobody} getKey={(member) => String(member.id)} columns={columns} {...props} />)

const body = (source: string) => /<tbody>(.*)<\/tbody>/.exec(source)?.[1] ?? ''

/** What the one cell holds, without the element that keeps it in view. */
const words = (source: string) => /<td [^>]*><div [^>]*>(.*)<\/div><\/td>/.exec(body(source))?.[1]

describe('no items', () => {
  it('renders one row holding one cell, and the words in an element of their own', () => {
    expect(body(html())).toMatch(/^<tr><td [^>]*><div [^>]*>[^<]*<\/div><\/td><\/tr>$/)
  })

  it('spans every column, so the words sit under the whole header', () => {
    expect(attr(body(html()), 'colSpan')).toBe('3')
    const five = [...columns, { ...columns[0], key: 'a' }, { ...columns[0], key: 'b' }] as TableColumn<Member>[]
    expect(attr(body(html({ columns: five })), 'colSpan')).toBe('5')
  })

  it('counts the columns that are there, not the entries', () => {
    expect(attr(body(html({ columns: [...columns, false, null] })), 'colSpan')).toBe('3')
  })

  it('still renders the caption and the header, so the reader knows what is empty', () => {
    const html_ = html()
    expect(html_).toContain('>Members</caption>')
    expect([...html_.matchAll(/<th [^>]*>(.*?)<\/th>/g)].map((m) => m[1])).toEqual(['Name', 'Role', 'Number'])
  })

  it('centres the words in the muted colour, under the same line every row has, and lets them wrap', () => {
    expect(classList(body(html()))).toEqual([
      'border-t-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-center', 'text-sm', 'text-muted',
    ])
  })

  it('keeps the words in the part of the box in view, however wide the table is', () => {
    const inner = /<td [^>]*>(<div [^>]*>)/.exec(body(html()))?.[1] ?? ''
    expect(classList(inner)).toEqual(['sticky', 'inset-s-4', 'inset-e-4', 'mx-auto', 'w-fit'])
  })

  it('reports data-empty on the root, and only when there is nothing', () => {
    expect(attr(html(), 'data-empty')).toBe('')
    expect(html({ items: [layla] })).not.toContain('data-empty')
  })

  it('never calls cell or getKey, because there is no item to hand them', () => {
    const cell = vi.fn(() => 'x')
    const getKey = vi.fn(() => '1')
    html({ getKey, columns: [{ key: 'name', header: 'Name', cell }] })
    expect(cell).not.toHaveBeenCalled()
    expect(getKey).not.toHaveBeenCalled()
  })
})

describe('no columns', () => {
  it('is as empty as no items: one row of words, not a row per item with no cell in it', () => {
    const html_ = html({ items: [layla, { ...layla, id: 8 }], columns: [] })
    expect(body(html_)).toMatch(/^<tr><td [^>]*><div [^>]*>Nothing here yet<\/div><\/td><\/tr>$/)
    expect(attr(html_, 'data-empty')).toBe('')
  })

  it('never spans zero columns, which a browser reads as one anyway', () => {
    expect(attr(body(html({ columns: [] })), 'colSpan')).toBe('1')
    expect(attr(body(html({ columns: [false, undefined] })), 'colSpan')).toBe('1')
  })

  it('renders no header cell and asks for no key', () => {
    const getKey = vi.fn(() => '1')
    const html_ = html({ items: [layla], columns: [], getKey })
    expect(html_).toContain('<thead><tr></tr></thead>')
    expect(getKey).not.toHaveBeenCalled()
  })
})

describe('the words of the empty row', () => {
  it('are "Nothing here yet" from the English labels when nothing is passed', () => {
    expect(words(html())).toBe('Nothing here yet')
  })

  it('come from the labels prop, so Arabic says it in Arabic (R-5.11-1)', () => {
    expect(words(html({ labels: ar }))).toBe('لا يوجد شيء بعد')
    expect(html({ labels: ar })).not.toContain('Nothing here yet')
  })

  it('follow a caller who changes the one string', () => {
    const labels = { ...en, state: { ...en.state, empty: 'No members yet' } }
    expect(words(html({ labels }))).toBe('No members yet')
  })

  it('are replaced by emptyFallback, whatever node it is', () => {
    const html_ = html({ emptyFallback: <a href="/invite">Invite someone</a> })
    expect(words(html_)).toBe('<a href="/invite">Invite someone</a>')
    expect(html_).not.toContain('Nothing here yet')
  })

  it('are the labels for a null fallback too: an empty table always says so', () => {
    expect(words(html({ emptyFallback: null }))).toBe('Nothing here yet')
  })

  it('are never shown beside real rows', () => {
    const html_ = html({ items: [layla], emptyFallback: 'Nobody' })
    expect(html_).not.toContain('Nobody')
    expect(html_).not.toContain('Nothing here yet')
    expect(html_).not.toContain('colSpan')
    expect([...html_.matchAll(/<td [^>]*>(.*?)<\/td>/g)].map((m) => m[1])).toEqual(['Layla', 'Owner', '7'])
  })
})
