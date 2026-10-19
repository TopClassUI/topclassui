import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Table } from '../index.js'
import type { TableColumn, TableProps } from '../types.js'

interface Member { id: string; name: string; role: string }

const members: Member[] = [
  { id: 'a', name: 'Omar', role: 'Owner' },
  { id: 'b', name: 'Layla', role: 'Editor' },
  { id: 'c', name: 'Sami', role: 'Viewer' },
]

const columns: TableColumn<Member>[] = [
  { key: 'name', header: 'Name', rowHeader: true, cell: (member) => member.name },
  { key: 'role', header: 'Role', cell: (member) => member.role },
]

const html = (props: Partial<TableProps<Member>> = {}) =>
  markup(<Table caption="Members" items={members} getKey={(member) => member.id} columns={columns} {...props} />)

const rows = (source: string) => [...source.slice(source.indexOf('<tbody')).matchAll(/<tr [^>]*>/g)].map((m) => m[0])

describe('selectedKeys', () => {
  it('marks nothing when it is left out', () => {
    expect(html()).not.toMatch(/ (data|aria)-selected=/)
  })

  it('marks exactly the rows whose key it names, with a presence attribute and aria-selected', () => {
    const marked = rows(html({ selectedKeys: ['b'] }))
    expect(marked.map((tr) => attr(tr, 'data-selected'))).toEqual([undefined, '', undefined])
    expect(marked.map((tr) => attr(tr, 'aria-selected'))).toEqual([undefined, 'true', undefined])
  })

  it('ignores a key no row has', () => {
    expect(html({ selectedKeys: ['zzz'] })).not.toMatch(/ (data|aria)-selected=/)
  })

  it('tints the row in primary, and its cells take the primary text, the row header too', () => {
    const source = html({ selectedKeys: ['a'] })
    expect(classList(rows(source)[0] ?? '')).toContain('data-selected:bg-primary-soft')
    const cells = [...source.slice(source.indexOf('<tbody')).matchAll(/<t[hd] [^>]*>/g)].map((m) => classList(m[0]))
    expect(cells.filter((list) => !list.includes('group-data-selected/row:text-primary-on-soft'))).toEqual([])
  })

  it('carries the tint on a stuck cell too, whose own fill would hide the row', () => {
    const source = html({ selectedKeys: ['a'], stickyFirstColumn: true })
    const first = /<tbody[^]*?<th [^>]*>/.exec(source)?.[0] ?? ''
    expect(classList(first.slice(first.lastIndexOf('<th')))).toContain('group-data-selected/row:bg-primary-soft')
  })
})
