import { describe, expect, it } from 'vitest'

import {
  FADE_MOTION, FOCUS_RING_INSET, FOCUS_RING_WITHIN, ICON_BUTTON, LIST_CAP, OVERLAY_SURFACE, POPUP_MOTION,
  ROW, ROW_HIGHLIGHT, SCRIM, SCROLL_X, SLIDE_MOTION, STICKY_TOP,
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

  it('SLIDE_MOTION is the slow step, and stops while a swipe holds the panel', () => {
    expect(list(SLIDE_MOTION)).toEqual([
      'transition-[translate,opacity]', 'duration-(--tc-duration-slow)', 'ease-out', 'data-swiping:transition-none',
    ])
  })

  it('never writes a fixed duration, which --tc-motion could not stop', () => {
    for (const motion of [FADE_MOTION, POPUP_MOTION, SLIDE_MOTION]) expect(motion).not.toMatch(/duration-\d/)
  })
})

describe('a row of a menu and its highlight', () => {
  it('ROW is a full-width flex row as tall as the row token, with no outline of its own', () => {
    expect(list(ROW)).toEqual([
      'flex', 'min-h-(--tc-row-height)', 'w-full', 'items-center', 'gap-2', 'rounded-control', 'px-3',
      'text-start', 'text-sm', 'outline-none',
    ])
  })

  it('ROW_HIGHLIGHT fills on the attribute Base UI sets, and takes the system pair under forced colours', () => {
    expect(list(ROW_HIGHLIGHT)).toEqual([
      'data-highlighted:bg-primary-soft', 'data-highlighted:text-primary-on-soft',
      'forced-colors:data-highlighted:forced-color-adjust-none',
      'forced-colors:data-highlighted:bg-[Highlight]', 'forced-colors:data-highlighted:text-[HighlightText]',
    ])
  })

  it('writes a system colour only behind forced-colors', () => {
    const system = list(ROW_HIGHLIGHT).filter((cls) => cls.includes('[Highlight') || cls.includes('forced-color-adjust'))
    expect(system).toHaveLength(3)
    expect(system.filter((cls) => !cls.startsWith('forced-colors:'))).toEqual([])
  })

  it('styles nothing at rest, so a row that is not highlighted is the surface it sits on', () => {
    expect(list(ROW_HIGHLIGHT).filter((cls) => !cls.includes('data-highlighted:'))).toEqual([])
  })
})

describe('lists, bars and sideways scrolling', () => {
  it('LIST_CAP is the row count times the row height, and never more than the room Base UI measured', () => {
    expect(list(LIST_CAP)).toEqual([
      'max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)))]',
    ])
  })

  it('SCROLL_X scrolls inside itself and keeps the gesture there', () => {
    expect(list(SCROLL_X)).toEqual(['overflow-x-auto', 'overscroll-x-contain'])
  })

  it('STICKY_TOP sticks at the top on the sticky step of the z-index scale', () => {
    expect(list(STICKY_TOP)).toEqual(['sticky', 'top-0', 'z-(--tc-z-sticky)'])
  })
})

describe('the icon button and the two other rings', () => {
  it('ICON_BUTTON is a centred box with the touch target, the focus ring and the transition', () => {
    expect(list(ICON_BUTTON)).toEqual([
      'inline-flex', 'shrink-0', 'items-center', 'justify-center', 'rounded-control',
      'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      'outline-none', 'focus-visible:outline-solid', 'focus-visible:outline-(length:--tc-ring-width)',
      'focus-visible:outline-offset-(length:--tc-ring-offset)', 'focus-visible:outline-ring',
      'transition-[color,background-color,border-color,outline-color,opacity,translate]',
      'duration-(--tc-duration)', 'ease-out',
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
