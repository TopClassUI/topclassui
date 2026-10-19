import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  FADE_MOTION, FOCUS_RING_INSET, FOCUS_RING_WITHIN, ICON_BUTTON, LIST_CAP, OVERLAY_SURFACE, POPUP_BOUNDS, POPUP_MAX_H,
  POPUP_MAX_W, POPUP_MOTION, POPUP_PASSIVE, ROW, ROW_HIGHLIGHT, SCRIM, SCROLL_X, SLIDE_MOTION, STICKY_TOP, VIEWPORT_PASSIVE,
} from './classes.js'

// Every list is written out in full and compared whole: an extra class fails as surely as a missing one.
const list = (constant: string) => constant.split(' ')

describe('the layer behind an overlay and the box it sits in', () => {
  it('SCRIM covers the viewport with the overlay token', () => {
    expect(list(SCRIM)).toEqual(['fixed', 'inset-0', 'bg-overlay'])
  })

  it('SCRIM sets no z-index: a dialog and a drawer each bring their own from the scale', () => {
    expect(list(SCRIM).filter((cls) => cls.startsWith('z-'))).toEqual([])
  })

  it('OVERLAY_SURFACE is the raised surface with the box radius, a hairline and a shadow', () => {
    expect(list(OVERLAY_SURFACE)).toEqual([
      'rounded-box', 'bg-surface-raised', 'text-body', 'border-(length:--tc-line-width)', 'border-line', 'shadow-lg',
    ])
  })
})

// A dialog and a drawer centre or dock their popup inside a layer as large as the screen; a popover has no such layer.
describe('an overlay that is not modal leaves the page under its viewport usable', () => {
  it('VIEWPORT_PASSIVE lets every press through the layer that covers the screen', () => {
    expect(list(VIEWPORT_PASSIVE)).toEqual(['pointer-events-none'])
  })

  it('POPUP_PASSIVE takes them back for the popup, which would inherit none from its viewport', () => {
    expect(list(POPUP_PASSIVE)).toEqual(['pointer-events-auto'])
  })
})

describe('motion reads the knob and the two attributes Base UI sets', () => {
  it('FADE_MOTION fades on the way in and on the way out', () => {
    expect(list(FADE_MOTION)).toEqual([
      'transition-opacity', 'duration-(--tc-duration)', 'ease-out',
      'data-starting-style:opacity-0', 'data-ending-style:opacity-0',
    ])
  })

  it('POPUP_MOTION fades and scales from the origin Base UI measures', () => {
    expect(list(POPUP_MOTION)).toEqual([
      'origin-(--transform-origin)', 'transition-[opacity,scale]', 'duration-(--tc-duration)', 'ease-out',
      'data-starting-style:scale-95', 'data-starting-style:opacity-0',
      'data-ending-style:scale-95', 'data-ending-style:opacity-0',
    ])
  })

  it('SLIDE_MOTION is the slow step, on transform, the property Base UI moves a swiped sheet by', () => {
    expect(list(SLIDE_MOTION)).toEqual(['transition-transform', 'duration-(--tc-duration-slow)', 'ease-out'])
  })

  it('never writes a fixed duration, which --tc-motion could not stop', () => {
    for (const motion of [FADE_MOTION, POPUP_MOTION, SLIDE_MOTION]) expect(motion).not.toMatch(/duration-\d/)
  })
})

describe('a row of a menu and its highlight', () => {
  it('ROW is a full-width flex row as tall as the row token, with no outline of its own', () => {
    expect(list(ROW)).toEqual([
      'flex', 'min-h-(--tc-row-height)', 'w-full', 'items-center', 'gap-2', 'rounded-control', 'px-3',
      'text-start', 'text-sm', 'outline-none', 'cursor-pointer', 'disabled:cursor-default', 'aria-disabled:cursor-default',
      'data-disabled:cursor-default', 'data-readonly:cursor-default', 'data-loading:cursor-default',
    ])
  })

  it('ROW_HIGHLIGHT fills and rings the row on the attribute Base UI sets, and takes the system pair under forced colours', () => {
    expect(list(ROW_HIGHLIGHT)).toEqual([
      'data-highlighted:bg-primary-soft', 'data-highlighted:text-primary-on-soft',
      'data-highlighted:outline-solid', 'data-highlighted:outline-(length:--tc-ring-width)',
      'data-highlighted:-outline-offset-(length:--tc-ring-width)', 'data-highlighted:outline-ring',
      'forced-colors:data-highlighted:forced-color-adjust-none', 'forced-colors:data-highlighted:bg-[Highlight]',
      'forced-colors:data-highlighted:text-[HighlightText]', 'forced-colors:data-highlighted:outline-[HighlightText]',
    ])
  })

  // R-5.6-1: the fill is 1.1 to 1.2:1 against the popup, so the ring is the mark the keyboard can see.
  it('draws the ring of the focus inside the row, where the scroll container of a menu cannot cut it', () => {
    expect(list(ROW_HIGHLIGHT)).toContain('data-highlighted:outline-ring')
    expect(list(ROW_HIGHLIGHT)).toContain('data-highlighted:-outline-offset-(length:--tc-ring-width)')
  })

  it('writes a system colour only behind forced-colors', () => {
    const system = list(ROW_HIGHLIGHT).filter((cls) => cls.includes('[Highlight') || cls.includes('forced-color-adjust'))
    expect(system).toHaveLength(4)
    expect(system.filter((cls) => !cls.startsWith('forced-colors:'))).toEqual([])
  })

  it('styles nothing at rest, so a row that is not highlighted is the surface it sits on', () => {
    expect(list(ROW_HIGHLIGHT).filter((cls) => !cls.includes('data-highlighted:'))).toEqual([])
  })
})

describe('lists, bars and sideways scrolling', () => {
  it('POPUP_BOUNDS is the room Base UI measured, the width rounded down to the pixel floating-ui places the popup on', () => {
    expect(list(POPUP_MAX_H)).toEqual(['max-h-(--available-height)'])
    expect(list(POPUP_MAX_W)).toEqual(['max-w-[round(down,var(--available-width),1px)]'])
    expect(list(POPUP_BOUNDS)).toEqual(['max-h-(--available-height)', 'max-w-[round(down,var(--available-width),1px)]'])
  })

  it('POPUP_BOUNDS adds no scroller and no origin: the list inside scrolls, and POPUP_MOTION carries the origin', () => {
    expect(list(POPUP_BOUNDS).filter((cls) => cls.startsWith('overflow') || cls.startsWith('origin'))).toEqual([])
  })

  it('LIST_CAP is the row count times the row height, and never more than the room Base UI measured', () => {
    expect(list(LIST_CAP)).toEqual([
      'max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)))]',
    ])
  })

  it('SCROLL_X scrolls inside itself, keeps the gesture there and wears the shared scrollbar', () => {
    expect(list(SCROLL_X)).toEqual(['overflow-x-auto', 'overscroll-x-contain', '[scrollbar-width:thin]', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]'])
  })

  it('STICKY_TOP sticks at the top on the sticky step of the z-index scale', () => {
    expect(list(STICKY_TOP)).toEqual(['sticky', 'top-0', 'z-(--tc-z-sticky)'])
  })
})

describe('the icon button and the two other rings', () => {
  it('ICON_BUTTON is a centred box with the touch target, the focus ring and the transition', () => {
    expect(list(ICON_BUTTON)).toEqual([
      'inline-flex', 'shrink-0', 'items-center', 'justify-center', 'rounded-control', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      'outline-none', 'focus-visible:outline-solid', 'focus-visible:outline-(length:--tc-ring-width)',
      'focus-visible:outline-offset-(length:--tc-ring-offset)', 'focus-visible:outline-ring',
      'transition-[color,background-color,border-color,outline-color,opacity,translate]',
      'duration-(--tc-duration)', 'ease-out', 'cursor-pointer', 'disabled:cursor-default', 'aria-disabled:cursor-default',
      'data-disabled:cursor-default', 'data-readonly:cursor-default', 'data-loading:cursor-default',
    ])
  })

  it('FOCUS_RING_INSET draws the ring its own width inside the box', () => {
    expect(list(FOCUS_RING_INSET)).toEqual([
      'outline-none', 'focus-visible:outline-solid', 'focus-visible:outline-(length:--tc-ring-width)',
      'focus-visible:-outline-offset-(length:--tc-ring-width)', 'focus-visible:outline-ring',
    ])
  })

  it('FOCUS_RING_WITHIN draws the same ring as FOCUS_RING, on the element that holds the focused one', () => {
    expect(list(FOCUS_RING_WITHIN)).toEqual([
      'outline-none', 'has-focus-visible:outline-solid', 'has-focus-visible:outline-(length:--tc-ring-width)',
      'has-focus-visible:outline-offset-(length:--tc-ring-offset)', 'has-focus-visible:outline-ring',
    ])
  })

  // Tailwind's outline-hidden is a 2px outline under forced colours, on every control at rest.
  it('resets every one of them with outline-none, never outline-hidden', () => {
    for (const ring of [ROW, ICON_BUTTON, FOCUS_RING_INSET, FOCUS_RING_WITHIN]) {
      expect(list(ring).filter((cls) => cls === 'outline-none' || cls === 'outline-hidden')).toEqual(['outline-none'])
    }
  })
})

/** The bounds a classes.ts writes for itself instead of taking POPUP_BOUNDS, POPUP_MAX_H or POPUP_MAX_W (PLAN 10.5). */
const ownBounds = (source: string) => source.match(/max-h-\(--available-height\)|max-w-\(--available-width\)|max-w-\[round\(down,var\(--available-width\),1px\)\]/g) ?? []

describe('R-10.5-1: every anchored popup takes its bounds from src/shared, and none writes its own', () => {
  const components = join(import.meta.dirname, '..', 'components')
  const sources = readdirSync(components).flatMap((slug) => {
    try { return [{ slug, source: readFileSync(join(components, slug, 'classes.ts'), 'utf8') }] } catch { return [] }
  })

  it('finds a written-out bound in a broken sample', () => {
    expect(ownBounds("export const X_POPUP = 'flex max-w-(--available-width) max-h-(--available-height)'")).toHaveLength(2)
    expect(ownBounds("export const X_POPUP = `flex ${POPUP_BOUNDS}`")).toEqual([])
  })

  it('no classes.ts under src/components writes the room as its own bound', () => {
    expect(sources.length).toBeGreaterThan(40)
    expect(sources.filter(({ source }) => ownBounds(source).length > 0).map(({ slug }) => slug)).toEqual([])
  })

  it('Popover, Select, Combobox and DatePicker wear POPUP_BOUNDS', () => {
    const wearers = sources.filter(({ source }) => /\$\{POPUP_BOUNDS\}|^\s*POPUP_BOUNDS,$/m.test(source)).map(({ slug }) => slug)
    expect(wearers).toEqual(['combobox', 'date-picker', 'popover', 'select'])
  })
})
