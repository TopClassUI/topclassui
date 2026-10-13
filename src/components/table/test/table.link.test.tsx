import type { ComponentProps } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Table } from '../index.js'
import type { TableColumn, TableProps } from '../types.js'

interface Invoice { id: string; number: string; status: string; amount: number }

const invoices: Invoice[] = [
  { id: 'a', number: 'INV-1', status: 'Paid', amount: 120 },
  { id: 'b', number: 'INV-2', status: 'Due', amount: 80 },
]

/** Two sortable columns around one that is not, so each case has a neighbour to leak into. */
const columns: TableColumn<Invoice>[] = [
  { key: 'number', header: 'Invoice', sortHref: '/invoices?sort=number&dir=asc', cell: (invoice) => invoice.number },
  { key: 'status', header: 'Status', cell: (invoice) => invoice.status },
  { key: 'amount', header: 'Amount', align: 'end', sortHref: '/invoices?sort=amount&dir=asc', cell: (invoice) => invoice.amount },
]

const html = (props: Partial<TableProps<Invoice>> = {}) =>
  markup(<Table caption="Invoices" items={invoices} getKey={(invoice) => invoice.id} columns={columns} {...props} />)

/** Each header cell whole: its opening tag and everything inside it. */
const headers = (source: string) => [...source.matchAll(/<th [^>]*>.*?<\/th>/g)].map((m) => m[0])

/** The class list of every opening tag of one element, in document order. */
const classesOf = (source: string, tag: string) =>
  [...source.matchAll(new RegExp(`<${tag}(?: [^>]*)?>`, 'g'))].map((m) => classList(m[0]))

const RING = [
  'focus-visible:outline-(length:--tc-ring-width)', 'focus-visible:outline-offset-(length:--tc-ring-offset)',
  'focus-visible:outline-ring', 'focus-visible:outline-solid', 'outline-none',
]

describe('a sortable header is a real link', () => {
  it('wraps the header in an anchor to sortHref, and only where one is given', () => {
    const cells = headers(html())
    expect(cells.map((th) => /<a [^>]*href="([^"]*)"/.exec(th)?.[1]))
      .toEqual(['/invoices?sort=number&amp;dir=asc', undefined, '/invoices?sort=amount&amp;dir=asc'])
  })

  it('leaves a header with no sortHref as plain text in its cell', () => {
    expect(headers(html())[1]).toMatch(/^<th [^>]*>Status<\/th>$/)
  })

  it('says what the link does before the header, in text only a screen reader gets', () => {
    expect(headers(html())[0]).toMatch(/<a [^>]*><span class="sr-only">Sort by <\/span><span id="[^"]+" class="[^"]*">Invoice<\/span><\/a><\/th>$/)
  })

  it('keeps the caret inside the link, so the whole header is one target', () => {
    const th = headers(html({ sort: { key: 'amount', direction: 'descending' } }))[2] ?? ''
    expect(th).toMatch(/<span class="sr-only">Sort by <\/span><span id="[^"]+" class="[^"]*">Amount<\/span><svg [^>]*>.*<\/svg><\/a><\/th>$/)
  })

  it('has no role, no tabindex and no handler: the browser already knows an anchor', () => {
    const anchor = /<a [^>]*>/.exec(html())?.[0] ?? ''
    expect(anchor).not.toMatch(/ (role|tabindex|onclick|aria-disabled)=/)
  })

  it('is a link whether or not its column is the sorted one', () => {
    const cells = headers(html({ sort: { key: 'number', direction: 'ascending' } }))
    expect(cells.map((th) => /<a [^>]*href=/.test(th))).toEqual([true, false, true])
  })
})

describe('the link prop: one element every sort link is cloned from (R-5.7-4)', () => {
  /** What a framework link looks like from here: a component that takes href and renders an anchor. */
  function Link({ prefetch, ...rest }: ComponentProps<'a'> & { prefetch?: boolean }) {
    return <a data-prefetch={String(prefetch ?? true)} {...rest} />
  }

  const anchors = (source: string) => [...source.matchAll(/<a [^>]*>/g)].map((m) => m[0])

  it('is a plain anchor when none is given', () => {
    expect(anchors(html()).map((a) => a.includes('data-prefetch'))).toEqual([false, false])
  })

  it('renders every sort link through the caller element, with its own props kept', () => {
    const links = anchors(html({ link: <Link href="" prefetch={false} /> }))
    expect(links.map((a) => attr(a, 'data-prefetch'))).toEqual(['false', 'false'])
  })

  it('replaces the stand-in href with the sortHref of each column', () => {
    const links = anchors(html({ link: <Link href="/nowhere" /> }))
    expect(links.map((a) => attr(a, 'href'))).toEqual(['/invoices?sort=number&amp;dir=asc', '/invoices?sort=amount&amp;dir=asc'])
    expect(html({ link: <Link href="/nowhere" /> })).not.toContain('/nowhere')
  })

  it('keeps the look and the words of the sort link, and merges the caller class last', () => {
    const html_ = html({ link: <Link href="" className="no-underline justify-center" />, sort: { key: 'amount', direction: 'descending' } })
    const [first] = anchors(html_)
    expect(classList(first ?? '')).toEqual(expect.arrayContaining(['inline-flex', '-my-1', 'max-w-full', 'outline-none', 'no-underline', 'justify-center']))
    expect(classList(first ?? '')).not.toContain('justify-start')
    expect(html_).toContain('<span class="sr-only">Sort by </span>')
    expect(html_.split('<svg').length - 1).toBe(1)
  })

  it('takes an intrinsic element as well, such as an anchor with a rel', () => {
    expect(anchors(html({ link: <a rel="nofollow" /> })).map((a) => attr(a, 'rel'))).toEqual(['nofollow', 'nofollow'])
  })

  it('refuses something that is not an element, by name, before React fails on it', () => {
    const notAnElement = 'a' as unknown as TableProps<Invoice>['link']
    expect(() => html({ link: notAnElement })).toThrow(TypeError)
    expect(() => html({ link: notAnElement })).toThrow('link must be an element')
    expect(() => html({ link: notAnElement })).toThrow('Table: link must be an element, such as link={<Link href="" />}')
  })
})

describe('the sort link is the only interactive part', () => {
  const link = () => classesOf(html(), 'a')

  it('carries the shared focus ring and the shared touch target, 24 px and 44 under a coarse pointer', () => {
    for (const list of link()) {
      expect(list).toEqual(expect.arrayContaining(RING))
      expect(list).toEqual(expect.arrayContaining([
        'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
        'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      ]))
    }
    expect(link()).toHaveLength(2)
  })

  it('is a row as wide as its label, pulled back 4 px each way so the header row is no taller for it', () => {
    for (const list of link()) {
      expect(list).toEqual(expect.arrayContaining(['inline-flex', 'items-center', '-my-1', 'rounded-chip', 'hover:underline']))
    }
  })

  it('sits on the top of its line, not on the baseline, where a header that wraps made its row 4 px taller', () => {
    for (const list of link()) expect(list).toContain('align-top')
  })

  it('never fills its cell: a link as wide as its column has a ring the box cuts and a label that can lie out of view', () => {
    for (const list of link()) {
      expect(list.filter((c) => c === 'flex' || c === 'block' || c === 'grid' || c === 'w-full' || c === 'flex-1')).toEqual([])
    }
  })

  it('never outgrows its cell, and its label is an element that can be cut with an ellipsis (R-5.2-7)', () => {
    for (const list of link()) expect(list).toContain('max-w-full')
    const labels = [...html().matchAll(/<span id="[^"]*" class="([^"]*)">/g)].map((m) => m[1])
    expect(labels).toEqual(['min-w-0 overflow-hidden text-ellipsis', 'min-w-0 overflow-hidden text-ellipsis'])
  })

  it('leaves the wrapping of its label to the cell: a column that asks to wrap still can', () => {
    expect(html()).not.toMatch(/<span id="[^"]*" class="[^"]*(truncate|whitespace-nowrap)/)
  })

  it('follows the alignment of its column inside the 24 and 44 px floors, where text-align moves nothing', () => {
    const [number, amount] = link()
    expect(number).toContain('justify-start')
    expect(number).not.toContain('justify-end')
    expect(amount).toContain('justify-end')
    expect(amount).not.toContain('justify-start')
  })

  it('puts no ring, hover or target on a cell or a row: none of them can be activated', () => {
    const interactive = /(^|:)(hover|active|focus-visible):|^(min-h-|cursor-|transition)/
    for (const tag of ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption']) {
      expect(classesOf(html({ striped: true }), tag).flat().filter((c) => interactive.test(c)), tag).toEqual([])
    }
  })
})
