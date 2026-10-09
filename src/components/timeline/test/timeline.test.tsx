import { describe, expect, it, vi } from 'vitest'

import { attr, markup } from '#test/markup.js'
import * as entry from '../index.js'
import { Timeline } from '../index.js'
import type { TimelineItem } from '../types.js'

type Event = TimelineItem & { id: string }
const key = (event: Event) => event.id

const EVENTS: Event[] = [
  { id: 'a', title: 'Created', time: 'Monday', status: 'done' },
  { id: 'b', title: 'In review', time: 'Today', status: 'current' },
  { id: 'c', title: 'Launch', status: 'todo' },
]

const html = (items: Event[] = EVENTS) => markup(<Timeline items={items} getKey={key} />)
/** One string per item, each starting at its own attributes. */
const rows = (out: string) => out.split('<li ').slice(1)
const CONNECTOR = 'w-0.5 flex-1'

describe('the element it renders', () => {
  it('is an ordered list, because the order of the events is the content', () => {
    expect(html()).toMatch(/^<ol class="flex flex-col" role="list">/)
    expect(html()).toMatch(/<\/ol>$/)
  })

  it('renders one list item per event, in the order given', () => {
    expect(rows(html())).toHaveLength(3)
    expect(html().indexOf('Created')).toBeLessThan(html().indexOf('In review'))
    expect(html().indexOf('In review')).toBeLessThan(html().indexOf('Launch'))
  })

  it('spreads the rest onto the root', () => {
    const out = markup(<Timeline items={EVENTS} getKey={key} id="log" data-testid="x" aria-label="Activity" />)
    expect(out).toMatch(/^<ol [^>]*id="log"/)
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'aria-label')).toBe('Activity')
  })

  it('writes the list role itself, which Safari with VoiceOver needs once the list style is gone', () => {
    expect(attr(html(), 'role')).toBe('list')
  })

  it('writes the role after the rest, so a caller cannot replace or remove it', () => {
    const replaced = { role: 'presentation' } as unknown as { id: string }
    const removed = { role: undefined } as unknown as { id: string }
    expect(attr(markup(<Timeline items={EVENTS} getKey={key} {...replaced} />), 'role')).toBe('list')
    expect(attr(markup(<Timeline items={EVENTS} getKey={key} {...removed} />), 'role')).toBe('list')
  })

  it('passes style through to the root', () => {
    expect(markup(<Timeline items={EVENTS} getKey={key} style={{ opacity: 0.5 }} />)).toMatch(/^<ol [^>]*style="opacity:0.5"/)
  })

  it('exports one component and no variants function, because the root has no design prop', () => {
    expect(Object.keys(entry)).toEqual(['Timeline'])
  })

  it('asks getKey once for each item, so the key is the identity the caller gives', () => {
    const getKey = vi.fn(key)
    markup(<Timeline items={EVENTS} getKey={getKey} />)
    expect(getKey.mock.calls.map(([event]) => event.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('each item', () => {
  it('shows the title in a paragraph and the time under it', () => {
    const [first = ''] = rows(html())
    expect(first).toContain('<p class="text-sm font-medium text-body">Created</p><p class="text-xs text-muted">Monday</p>')
  })

  it('renders no time element for an item without one', () => {
    const [, , third = ''] = rows(html())
    expect(third).toContain('Launch</p></div></li>')
    expect(third.match(/<p /g)).toHaveLength(1)
  })

  it('reports its status, and nothing for an item that has none', () => {
    expect(rows(html()).map((row) => attr(row, 'data-status'))).toEqual(['done', 'current', 'todo'])
    expect(html([{ id: 'a', title: 'Plain' }])).not.toContain('data-status')
  })

  it('marks only the current item as the current step', () => {
    expect(rows(html()).map((row) => attr(row, 'aria-current'))).toEqual([undefined, 'step', undefined])
  })

  it('never emits data-state, which R-5.7-6 bans', () => {
    expect(html()).not.toContain('data-state')
  })
})

describe('the tone of an item', () => {
  it('is primary when the item names neither a tone nor a status', () => {
    expect(attr(rows(html([{ id: 'a', title: 'Plain' }]))[0] ?? '', 'data-tone')).toBe('primary')
  })

  it('follows the status as drawn: done is success, current is primary', () => {
    expect(rows(html()).slice(0, 2).map((row) => attr(row, 'data-tone'))).toEqual(['success', 'primary'])
  })

  it('is the tone the item names, over the tone of its status', () => {
    const out = html([
      { id: 'a', title: 'Failed', status: 'done', tone: 'danger' },
      { id: 'b', title: 'Now', status: 'current', tone: 'info' },
    ])
    expect(rows(out).map((row) => attr(row, 'data-tone'))).toEqual(['danger', 'info'])
  })

  it('is not reported on a todo item, whose marker is hollow whatever the tone', () => {
    const [row = ''] = rows(html([{ id: 'a', title: 'Later', status: 'todo', tone: 'danger' }]))
    expect(attr(row, 'data-tone')).toBeUndefined()
    expect(row).not.toContain('danger')
  })

  it('falls back to the default for a tone no list holds, instead of an unpainted marker', () => {
    const stray = { id: 'a', title: 'Stray', tone: 'brand' } as unknown as Event
    const [row = ''] = rows(html([stray]))
    expect(attr(row, 'data-tone')).toBe('primary')
    expect(row).toContain('bg-primary-solid')
    expect(row).not.toContain('undefined')
  })

  it('is not fooled by a tone named after an Object.prototype member', () => {
    const stray = { id: 'a', title: 'Stray', tone: 'toString' } as unknown as Event
    expect(attr(rows(html([stray]))[0] ?? '', 'data-tone')).toBe('primary')
  })
})

describe('the connector', () => {
  it('joins every item to the next and is absent on the last', () => {
    expect(rows(html()).map((row) => row.includes(CONNECTOR))).toEqual([true, true, false])
  })

  it('is absent on a single item, which has nothing to connect to', () => {
    expect(html([{ id: 'a', title: 'Only' }])).not.toContain(CONNECTOR)
  })

  it('leaves the last item without the trailing space the others keep for the next one', () => {
    expect(rows(html()).map((row) => row.includes('pb-4'))).toEqual([true, true, false])
  })
})

describe('no items', () => {
  it('renders nothing at all, not an empty list', () => {
    expect(html([])).toBe('')
  })

  it('renders the fallback in place of the list', () => {
    const out = markup(<Timeline items={[]} getKey={key} emptyFallback={<p>No activity yet.</p>} />)
    expect(out).toBe('<p>No activity yet.</p>')
  })

  it('ignores the fallback as soon as there is one item', () => {
    const out = markup(<Timeline items={EVENTS.slice(0, 1)} getKey={key} emptyFallback={<p>No activity yet.</p>} />)
    expect(out).not.toContain('No activity yet.')
    expect(rows(out)).toHaveLength(1)
  })
})
