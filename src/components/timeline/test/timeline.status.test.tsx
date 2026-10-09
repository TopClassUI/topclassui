import { describe, expect, it } from 'vitest'

import { plus } from '#icons/data/plus.js'
import { Svg } from '#components/svg/index.js'
import { getLabels } from '#shared/labels/get-labels.js'
import { markup } from '#test/markup.js'
import { Timeline } from '../index.js'
import type { TimelineItem } from '../types.js'

type Event = TimelineItem & { id: string }
const key = (event: Event) => event.id

const EVENTS: Event[] = [
  { id: 'a', title: 'Created', time: 'Monday', status: 'done' },
  { id: 'b', title: 'In review', time: 'Today', status: 'current' },
  { id: 'c', title: 'Launch', status: 'todo' },
  { id: 'd', title: 'Note' },
]

const rows = (out: string) => out.split('<li ').slice(1)
/** The hidden text of each item, or null where the item holds none. */
const spoken = (out: string) =>
  rows(out).map((row) => /<span class="sr-only">([^<]*)<\/span>/.exec(row)?.[1] ?? null)

// The marker is a shape and a colour. A screen reader reads neither, so the status is text too.
describe('the status in words', () => {
  it('is said for done, current and todo, and not for an item with no status', () => {
    expect(spoken(markup(<Timeline items={EVENTS} getKey={key} />))).toEqual(['Done', 'Current', 'Not started', null])
  })

  it('comes before the title, so it is heard first', () => {
    const [first = ''] = rows(markup(<Timeline items={EVENTS} getKey={key} />))
    expect(first).toContain('<span class="sr-only">Done</span><div class="min-h-5 text-sm font-medium text-body">Created</div>')
  })

  it('is said in Arabic with the Arabic labels', () => {
    const out = markup(<Timeline items={EVENTS} getKey={key} labels={getLabels('ar').labels} />)
    expect(spoken(out)).toEqual(['مكتمل', 'الحالي', 'لم يبدأ', null])
  })

  it('takes a reworded status from the labels', () => {
    const { labels } = getLabels('en', { timeline: { todo: 'Upcoming' } })
    expect(spoken(markup(<Timeline items={EVENTS} getKey={key} labels={labels} />)))
      .toEqual(['Done', 'Current', 'Upcoming', null])
  })

  it('is said beside an icon too, which is the shape of the caller and names no status', () => {
    const out = markup(<Timeline items={[{ id: 'a', title: 'Paid', status: 'done', icon: <Svg icon={plus} size="xs" /> }]} getKey={key} />)
    expect(spoken(out)).toEqual(['Done'])
  })

  it('never reaches the DOM as an attribute a caller did not write', () => {
    expect(markup(<Timeline items={EVENTS} getKey={key} />)).not.toContain('labels')
  })

  it('says nothing for a status no list holds, an Object.prototype member included', () => {
    const stray = [{ id: 'a', title: 'x', status: 'error' }, { id: 'b', title: 'y', status: 'toString' }] as unknown as Event[]
    expect(spoken(markup(<Timeline items={stray} getKey={key} />))).toEqual([null, null])
  })
})

describe('a time that is blank', () => {
  const time = (value: TimelineItem['time']) => markup(<Timeline items={[{ id: 'a', title: 'Launch', time: value }]} getKey={key} />)

  it('renders no element for an empty string, null, undefined or a boolean', () => {
    for (const blank of ['', null, undefined, false, true]) {
      expect(time(blank), String(blank)).toContain('Launch</div></div></li>')
      expect(time(blank), String(blank)).not.toContain('text-xs text-muted')
    }
  })

  it('still renders a zero, which is a value and not a missing one', () => {
    expect(time(0)).toContain('<div class="text-xs text-muted">0</div>')
  })
})

describe('a title that is empty', () => {
  it('keeps its element, which holds one line of height for the connector beside it', () => {
    const [first = ''] = rows(markup(<Timeline items={[{ id: 'a', title: '' }, { id: 'b', title: 'Next' }]} getKey={key} />))
    expect(first).toContain('<div class="min-h-5 text-sm font-medium text-body"></div>')
  })
})
