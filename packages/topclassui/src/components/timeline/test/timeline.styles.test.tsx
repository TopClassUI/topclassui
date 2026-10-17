import { describe, expect, it } from 'vitest'

import { plus } from '#icons/data/plus.js'
import { Svg } from '#components/svg/index.js'
import { classList, markup } from '#test/markup.js'
import { Timeline } from '../index.js'
import type { TimelineItem, TimelineProps } from '../types.js'

type Event = TimelineItem & { id: string }
const key = (event: Event) => event.id
const html = (items: Event[], props: Partial<TimelineProps<Event>> = {}) =>
  markup(<Timeline items={items} getKey={key} {...props} />)

/** The sorted class list of the nth element opened inside the first item. */
const nth = (out: string, n: number) =>
  [...classList([...out.slice(out.indexOf('<li ')).matchAll(/<[a-z]+ [^>]*>/g)][n]?.[0] ?? '')].sort()

const TWO: Event[] = [{ id: 'a', title: 'Created', time: 'Monday' }, { id: 'b', title: 'Launch' }]
const [LI, RAIL, MARKER, DOT, CONNECTOR, BODY, TITLE, TIME] = [0, 1, 2, 3, 4, 5, 6, 7] as const

describe('each part wears exactly the classes the spec names', () => {
  it('the root is a column with no gap, so each connector reaches the next marker', () => {
    expect(classList(html(TWO))).toEqual(['flex', 'flex-col'])
  })

  it('the item is a row with 12 px between the rail and the body', () => {
    expect(nth(html(TWO), LI)).toEqual(['flex', 'gap-3'])
  })

  it('the rail is a centred column', () => {
    expect(nth(html(TWO), RAIL)).toEqual(['flex', 'flex-col', 'items-center'])
  })

  it('the marker box is one title line tall, so the dot centres on the first line', () => {
    expect(nth(html(TWO), MARKER)).toEqual(['flex', 'items-center', 'min-h-5', 'shrink-0'])
  })

  it('the dot is a 12 px circle filled with the solid of its tone, inside the strong stroke', () => {
    expect(nth(html(TWO), DOT)).toEqual([
      'bg-primary-solid', 'block', 'border-(length:--tc-line-width)', 'border-line-strong', 'forced-color-adjust-none',
      'forced-colors:bg-[CanvasText]', 'forced-colors:border-[CanvasText]', 'rounded-full', 'size-3',
    ])
  })

  it('the current dot is the same circle with its fill clipped 2 px inside the stroke', () => {
    expect(nth(html([{ id: 'a', title: 'Now', status: 'current' }]), DOT)).toEqual([
      'bg-clip-content', 'bg-primary-solid', 'block', 'border-(length:--tc-line-width)', 'border-line-strong',
      'forced-color-adjust-none', 'forced-colors:bg-[CanvasText]', 'forced-colors:border-[CanvasText]', 'p-0.5',
      'rounded-full', 'size-3',
    ])
  })

  it('a done dot is filled to the stroke, so it is not the shape of the current one', () => {
    const list = nth(html([{ id: 'a', title: 'Created', status: 'done' }]), DOT)
    expect(list).toContain('bg-success-solid')
    expect(list).not.toContain('bg-clip-content')
    expect(list).not.toContain('p-0.5')
  })

  it('the connector is the 2 px line that fills the rest of the rail', () => {
    expect(nth(html(TWO), CONNECTOR)).toEqual([
      'bg-line', 'block', 'border-s-(length:--tc-line-width)', 'border-transparent', 'flex-1', 'w-0.5',
    ])
  })

  it('the body may shrink, breaks a word that has no space, and keeps 16 px before the next item', () => {
    expect(nth(html(TWO), BODY)).toEqual(['flex', 'flex-1', 'flex-col', 'gap-0.5', 'min-w-0', 'pb-4', 'wrap-anywhere'])
  })

  it('the title is the small step in medium and one line tall even when empty, the time the muted extra-small step', () => {
    expect(nth(html(TWO), TITLE)).toEqual(['font-medium', 'min-h-5', 'text-body', 'text-sm'])
    expect(nth(html(TWO), TIME)).toEqual(['text-muted', 'text-xs'])
  })
})

describe('every tone paints its own marker and no other', () => {
  const FILL: Record<string, string> = {
    primary: 'bg-primary-solid',
    neutral: 'bg-neutral-solid',
    success: 'bg-success-solid',
    warning: 'bg-warning-solid',
    danger: 'bg-danger-solid',
    info: 'bg-info-solid',
  }
  const TEXT: Record<string, string> = {
    primary: 'text-primary-on-soft',
    neutral: 'text-neutral-on-soft',
    success: 'text-success-on-soft',
    warning: 'text-warning-on-soft',
    danger: 'text-danger-on-soft',
    info: 'text-info-on-soft',
  }

  for (const [tone, fill] of Object.entries(FILL)) {
    it(`${tone} fills the dot with its own solid`, () => {
      const list = nth(html([{ id: 'a', title: 'x', tone: tone as TimelineItem['tone'] }]), DOT)
      expect(list.filter((c) => c.startsWith('bg-'))).toEqual([fill])
      expect(list).toContain('border-line-strong')
    })

    it(`${tone} keeps its own solid and the stroke as the current step`, () => {
      const list = nth(html([{ id: 'a', title: 'x', status: 'current', tone: tone as TimelineItem['tone'] }]), DOT)
      expect(list.filter((c) => c.startsWith('bg-'))).toEqual(['bg-clip-content', fill])
      expect(list).toContain('border-line-strong')
    })
  }

  for (const [tone, text] of Object.entries(TEXT)) {
    it(`${tone} colours an icon with its own text colour, and draws no dot behind it`, () => {
      const out = html([{ id: 'a', title: 'x', tone: tone as TimelineItem['tone'], icon: <Svg icon={plus} size="xs" /> }])
      expect(nth(out, DOT)).toEqual(['flex', text])
      expect(out).not.toContain('rounded-full')
      expect(out).toContain('<svg')
    })
  }
})

describe('a todo item', () => {
  it('draws a hollow dot: the strong stroke and no fill', () => {
    expect(nth(html([{ id: 'a', title: 'Later', status: 'todo' }]), DOT))
      .toEqual(['block', 'border-(length:--tc-line-width)', 'border-line-strong', 'rounded-full', 'size-3'])
  })

  it('mutes its icon instead of toning it', () => {
    const out = html([{ id: 'a', title: 'Later', status: 'todo', tone: 'danger', icon: <Svg icon={plus} size="xs" /> }])
    expect(nth(out, DOT)).toEqual(['flex', 'text-muted'])
  })
})

describe('forced colours', () => {
  it('keeps the connector as a real border, because a background alone is repainted to nothing', () => {
    const list = nth(html(TWO), CONNECTOR)
    expect(list).toContain('border-s-(length:--tc-line-width)')
    expect(list).toContain('border-transparent')
  })

  it('keeps the fill of a toned dot, and leaves the hollow one to its border', () => {
    expect(nth(html(TWO), DOT)).toContain('forced-color-adjust-none')
    expect(nth(html([{ id: 'a', title: 'Later', status: 'todo' }]), DOT)).not.toContain('forced-color-adjust-none')
  })

  it('paints a filled dot in the system text colour, because a kept theme fill can match a forced canvas', () => {
    for (const status of [undefined, 'done', 'current'] as const) {
      const list = nth(html([{ id: 'a', title: 'x', tone: 'neutral', status }]), DOT)
      expect(list, String(status)).toContain('forced-colors:bg-[CanvasText]')
      expect(list, String(status)).toContain('forced-colors:border-[CanvasText]')
    }
    expect(html([{ id: 'a', title: 'Later', status: 'todo' }])).not.toContain('CanvasText')
  })
})

describe('right to left', () => {
  it('uses no physical side anywhere, so the rail mirrors with the direction alone', () => {
    const all = html([...TWO, { id: 'c', title: 'x', status: 'todo' }]).match(/class="[^"]*"/g)?.join(' ') ?? ''
    const physical = /^(pl|pr|ml|mr|left|right|border-l|border-r|text-left|text-right)-/
    expect(all.split(/[\s"=]+/).filter((c) => physical.test(c))).toEqual([])
    expect(all).not.toMatch(/flex-row-reverse|rtl:|ltr:/)
  })
})

describe('a timeline is not interactive', () => {
  it('carries no ring, hover, transition, touch target or disabled style', () => {
    const interactive = /(^|:)(hover|active|focus-visible|disabled|data-disabled):|^(outline-|transition|duration-|min-w-\[|cursor-)/
    expect(html(TWO).match(/class="[^"]*"/g)?.join(' ').split(/[\s"=]+/).filter((c) => interactive.test(c))).toEqual([])
  })

  it('is not a tab stop of its own', () => {
    expect(html(TWO)).not.toContain('tabindex')
  })
})

describe('className is merged last, so the consumer wins every conflict', () => {
  it('keeps a consumer utility that conflicts with nothing', () => {
    expect(classList(html(TWO, { className: 'mt-4' }))).toEqual(['flex', 'flex-col', 'mt-4'])
  })

  it('replaces the direction of the root', () => {
    expect(classList(html(TWO, { className: 'flex-col-reverse' }))).toEqual(['flex', 'flex-col-reverse'])
  })
})
