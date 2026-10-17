import { describe, expect, it } from 'vitest'

import { house } from '#icons/data/house.js'
import { Svg } from '#components/svg/index.js'
import { markup } from '#test/markup.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

const html = markup(
  <SidebarRoot>
    <SidebarHeader>Workspace</SidebarHeader>
    <SidebarBody>
      <SidebarGroup label="Group">
        <SidebarLink href="/a" icon={<Svg icon={house} />} current>Home</SidebarLink>
        <SidebarLink href="/b" icon={<Svg icon={house} />}>Projects</SidebarLink>
      </SidebarGroup>
    </SidebarBody>
  </SidebarRoot>,
)

/** The class list of every element that has one, in document order, each with its tag. */
const PARTS = [...html.matchAll(/<([a-z]+)[^>]*class="([^"]*)"/g)].map((match) => ({ tag: match[1] ?? '', classes: (match[2] ?? '').split(' ') }))
const [nav, header, toggle, , title, body, group, label, list, current, currentIcon, , currentLabel, rest, restIcon, , restLabel] = PARTS.map((part) => part.classes)

const RING = ['outline-none', 'focus-visible:outline-solid', 'focus-visible:outline-(length:--tc-ring-width)', 'focus-visible:outline-offset-(length:--tc-ring-offset)', 'focus-visible:outline-ring']
const MOTION = ['transition-[color,background-color,border-color,outline-color,opacity,translate]', 'duration-(--tc-duration)', 'ease-out']
const COARSE = ['pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]']

describe('the parts are where the scan expects them', () => {
  it('reads seventeen elements with a class: the nav, the header and its two, the body, the group and its two, and two rows of four', () => {
    expect(PARTS.map((part) => part.tag)).toEqual([
      'nav', 'div', 'button', 'svg', 'span', 'div', 'div', 'p', 'ul', 'a', 'span', 'svg', 'span', 'a', 'span', 'svg', 'span',
    ])
  })
})

describe('the rail', () => {
  it('is the group its server parts read, a column as tall as its parent that a flex row cannot squeeze', () => {
    expect(nav?.slice(0, 10)).toEqual(['group/sidebar', 'relative', 'flex', 'h-full', 'shrink-0', 'flex-col', 'gap-1', 'bg-surface', 'p-2.5', 'text-body'])
  })

  // A rail with no SidebarBody, inside a box of the page that scrolls: its hidden labels need a box of their own to stay in.
  it('is positioned, so it holds the hidden labels a collapsed rail has outside its body', () => {
    expect(nav?.[1]).toBe('relative')
  })

  it('draws its line on the inline end, so it faces the page in either direction', () => {
    expect(nav?.slice(10, 12)).toEqual(['border-e-(length:--tc-line-width)', 'border-line'])
    expect(nav?.filter((cls) => /^border-[lrse]-/.test(cls))).toEqual(['border-e-(length:--tc-line-width)'])
  })

  it('is 220 px expanded and 60 collapsed, by the attribute it sets itself', () => {
    expect(nav?.slice(12, 14)).toEqual(['data-open:w-55', 'data-closed:w-15'])
  })

  it('under a finger a collapsed rail is as wide as a 44 px target, its padding and its line; and never wider than its parent', () => {
    expect(nav?.slice(14)).toEqual(['pointer-coarse:data-closed:min-w-[calc(var(--tc-target-coarse,44px)+1.25rem+var(--tc-line-width))]', 'max-w-full'])
  })

  it('animates nothing: no transition class on the rail, so no width animation exists', () => {
    expect(nav?.filter((cls) => cls.includes('transition') || cls.includes('duration') || cls.includes('animate'))).toEqual([])
  })
})

describe('the header', () => {
  it('is a row that never shrinks, and centres the toggle when the title is gone', () => {
    expect(header).toEqual(['flex', 'shrink-0', 'items-center', 'gap-2', 'pb-1.5', 'group-data-closed/sidebar:justify-center'])
  })

  it('the toggle is the shared icon button with its 24 and 44 px floors, its ring and the ghost hover of the neutral ramp', () => {
    expect(toggle).toEqual([
      'inline-flex', 'shrink-0', 'items-center', 'justify-center', 'rounded-control',
      'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]', ...COARSE, ...RING, ...MOTION,
      'text-muted', 'tone-neutral', 'hover:bg-(--tc-soft)', 'active:bg-(--tc-soft-hover)',
    ])
  })

  it('the title truncates, is semibold, and is hidden with sr-only in a collapsed rail: never removed', () => {
    expect(title).toEqual(['truncate', 'min-w-0', 'text-sm', 'font-semibold', 'group-data-closed/sidebar:sr-only'])
  })
})

describe('the body', () => {
  it('is the scroll container: it takes the room that is left, scrolls down, and keeps the scroll to itself', () => {
    expect(body?.slice(0, 7)).toEqual(['relative', 'flex', 'flex-1', 'flex-col', 'gap-1', 'overflow-y-auto', 'overscroll-contain'])
  })

  // Measured: with and without it the body is 370 px in a 416 px rail and scrolls 2302. A box that scrolls has no minimum height.
  it('carries no min-h-0, which would change nothing on a box that scrolls', () => {
    expect(body).not.toContain('min-h-0')
  })

  it('keeps the reach of a ring clear on every side: scroll padding for a row Tab brings in, and padding it takes back as margin', () => {
    expect(body?.slice(7, 8)).toEqual(['scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]'])
    expect(body?.slice(10, 12)).toEqual([
      '-m-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]',
      'p-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]',
    ])
  })

  it('wears the shared thin scrollbar in the theme colours, right after the scroll area', () => {
    expect(body?.slice(8, 10)).toEqual(['[scrollbar-width:thin]', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]'])
  })

  it('draws no scrollbar while the rail is collapsed, and that is the last of its classes', () => {
    expect(body?.slice(12)).toEqual(['group-data-closed/sidebar:[scrollbar-width:none]'])
  })
})

describe('a group', () => {
  it('is a column, and so is its list', () => {
    expect(group).toEqual(['flex', 'flex-col', 'gap-1'])
    expect(list).toEqual(['flex', 'flex-col', 'gap-1'])
  })

  it('its label is one muted line as wide as its text at the start of the rail, that ends in an ellipsis, hidden with sr-only in a collapsed rail', () => {
    expect(label).toEqual(['self-start', 'max-w-full', 'truncate', 'px-3', 'py-1', 'text-xs', 'font-medium', 'text-muted', 'group-data-closed/sidebar:sr-only'])
  })
})

describe('a row', () => {
  const ROW = [
    'relative', 'overflow-hidden', 'min-w-[var(--tc-target-min,24px)]', ...COARSE,
    'flex', 'min-h-(--tc-row-height)', 'w-full', 'items-center', 'gap-2', 'rounded-control', 'px-3', 'text-start', 'text-sm',
    ...RING, ...MOTION, 'group-data-closed/sidebar:justify-center',
  ]

  it('is the shared row with a ring outside it, clipped to its own box, and centred in a collapsed rail', () => {
    expect(rest?.slice(0, ROW.length)).toEqual(ROW)
    expect(current?.slice(0, ROW.length)).toEqual(ROW)
  })

  // cn() keeps the last min-height it is given: after the 24 px floor that is the 40 px of a row, and 44 under a finger.
  it('is 40 px tall at least, not the 24 px of the floor, and 44 under a coarse pointer', () => {
    for (const row of [rest, current]) {
      expect(row).toContain('min-h-(--tc-row-height)')
      expect(row).not.toContain('min-h-[var(--tc-target-min,24px)]')
      expect(row).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
    }
  })

  it('one that is not current is on the neutral ramp in the body colour, and answers the pointer with the ghost tint', () => {
    expect(rest?.slice(ROW.length)).toEqual(['tone-neutral', 'text-body', 'hover:bg-(--tc-soft)', 'active:bg-(--tc-soft-hover)'])
  })

  it('the current one is filled with the soft primary, semibold, and marked with a bar in the colour of its text', () => {
    expect(current?.slice(ROW.length, ROW.length + 8)).toEqual([
      'bg-primary-soft', 'font-semibold', 'text-primary-on-soft',
      'before:absolute', 'before:inset-y-2', 'before:inset-s-1', 'before:w-0.75', 'before:rounded-full',
    ])
    expect(current).toContain('before:bg-current')
    // Semibold, not medium: a font with a regular and a bold face alone paints 500 as regular.
    expect(current).not.toContain('font-medium')
  })

  it('under forced colours the current one paints the highlight itself, text and ring too, and that is the last of its classes', () => {
    expect(current?.slice(-4)).toEqual([
      'forced-colors:forced-color-adjust-none', 'forced-colors:bg-[Highlight]', 'forced-colors:text-[HighlightText]', 'forced-colors:[--tc-ring:CanvasText]',
    ])
  })

  // Under forced colours a hover fill would be an author colour under the text of the highlight.
  it('the current one has no hover and no pressed fill', () => {
    expect(current?.filter((cls) => cls.startsWith('hover:') || cls.startsWith('active:') || cls.startsWith('tone-'))).toEqual([])
  })

  it('no row carries a physical side, a palette colour or a letter spacing', () => {
    for (const cls of [...(rest ?? []), ...(current ?? []), ...(nav ?? []), ...(body ?? [])]) {
      expect(cls).not.toMatch(/(^|:)-?(ml|mr|pl|pr|left|right)-|(^|:)tracking-|-(violet|neutral|red)-\d/)
    }
  })

  it('the icon sits in a wrapper that never shrinks: muted on a row that is not current, the colour of the label on the current one', () => {
    expect(restIcon).toEqual(['inline-flex', 'shrink-0', 'text-muted'])
    expect(currentIcon).toEqual(['inline-flex', 'shrink-0'])
  })

  it('the label truncates in an element of its own, and is hidden with sr-only in a collapsed rail', () => {
    expect(restLabel).toEqual(['truncate', 'min-w-0', 'group-data-closed/sidebar:sr-only'])
    expect(currentLabel).toEqual(['truncate', 'min-w-0', 'group-data-closed/sidebar:sr-only'])
  })
})
