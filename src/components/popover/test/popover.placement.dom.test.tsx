import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { POPOVER_PLACEMENTS } from '../constants.js'
import { PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverPlacement } from '../types.js'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.style.direction = ''
})

/** Every cell of the mapping, written out: side, then align, as Base UI writes them. */
const SIDE_ALIGN: Record<PopoverPlacement, [string, string]> = {
  'top': ['top', 'center'],
  'top-start': ['top', 'start'],
  'top-end': ['top', 'end'],
  'bottom': ['bottom', 'center'],
  'bottom-start': ['bottom', 'start'],
  'bottom-end': ['bottom', 'end'],
  'start': ['inline-start', 'center'],
  'start-top': ['inline-start', 'start'],
  'start-bottom': ['inline-start', 'end'],
  'end': ['inline-end', 'center'],
  'end-top': ['inline-end', 'start'],
  'end-bottom': ['inline-end', 'end'],
}

const box = (x: number, y: number, width: number, height: number) => ({
  x, y, width, height, top: y, left: x, right: x + width, bottom: y + height, toJSON: () => ({}),
}) as DOMRect

/** happy-dom lays nothing out, so the viewport, the trigger box and the popup size are given: 280 by 100. */
function layout(trigger: DOMRect, popup = { width: 280, height: 100 }) {
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024)
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return this.hasAttribute('aria-haspopup') ? trigger : box(0, 0, 0, 0)
  })
  const isPositioner = (el: HTMLElement) => el.getAttribute('role') === 'presentation'
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.width : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.height : 0
  })
}

/** Opens a popover inside the provider the app mounts, and waits for Floating UI to place it. */
async function open(placement: PopoverPlacement | undefined, direction: 'ltr' | 'rtl' = 'ltr') {
  render(
    <TopClassProvider direction={direction} locale="en">
      <PopoverRoot defaultOpen>
        <PopoverTrigger render={<Button>Share</Button>} />
        <PopoverPopup placement={placement}><PopoverTitle>Share this page</PopoverTitle></PopoverPopup>
      </PopoverRoot>
    </TopClassProvider>,
  )
  const popup = await screen.findByRole('dialog')
  const positioner = popup.parentElement
  // Base UI writes the transform once Floating UI has placed it; before that the side is only the request.
  await waitFor(() => { expect(positioner?.style.transform).toMatch(/^translate\(/) })
  return {
    popup,
    positioner,
    side: popup.getAttribute('data-side'),
    align: popup.getAttribute('data-align'),
    transform: positioner?.style.transform,
  }
}

describe('placement maps to side and align (R-5.3-4)', () => {
  it('names every placement in the table, so adding one cannot skip coverage', () => {
    expect([...POPOVER_PLACEMENTS].sort()).toEqual(Object.keys(SIDE_ALIGN).sort())
  })

  for (const [placement, [side, align]] of Object.entries(SIDE_ALIGN)) {
    it(`${placement} opens on ${side}, aligned ${align}`, async () => {
      layout(box(500, 300, 40, 40))
      const opened = await open(placement as PopoverPlacement)
      expect([opened.side, opened.align]).toEqual([side, align])
      expect(opened.popup.getAttribute('data-placement')).toBe(placement)
    })
  }

  it('defaults to bottom, centred, not the bottom-start the shared default gives menus', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open(undefined)
    expect([opened.side, opened.align]).toEqual(['bottom', 'center'])
    expect(opened.popup.getAttribute('data-placement')).toBe('bottom')
  })
})

describe('the distance and the edges', () => {
  it('sits 6 px under the trigger, the shared side offset, centred on it', async () => {
    layout(box(500, 300, 40, 40))
    // 340 + 6 on the block axis; 520 - 140 centres the 280 px popup.
    expect((await open('bottom')).transform).toBe('translate(380px, 346px)')
  })

  it('keeps the same 6 px above the trigger', async () => {
    layout(box(500, 300, 40, 40))
    // 300 - 6 - 100.
    expect((await open('top')).transform).toBe('translate(380px, 194px)')
  })

  it('stays 8 px inside the viewport, the shared collision padding', async () => {
    layout(box(0, 300, 40, 40))
    // Centred it would start at -120, so it shifts to the padding, not to Base UI's 5.
    expect((await open('bottom')).transform).toBe('translate(8px, 346px)')
  })

  it('flips a bottom popover to the top when the bottom has no room', async () => {
    layout(box(500, 700, 40, 40))
    const opened = await open('bottom')
    expect(opened.side).toBe('top')
    expect(opened.transform).toBe('translate(380px, 594px)')
  })

  it('flips a top popover to the bottom when the top has no room', async () => {
    layout(box(500, 4, 40, 40))
    expect((await open('top')).side).toBe('bottom')
  })

  // Base UI's own collision rule for a popover stays: with no room above or below, it moves beside the trigger.
  it('moves beside a trigger as tall as the screen, on its end side', async () => {
    layout(box(500, 0, 40, 768))
    const opened = await open('bottom')
    expect(opened.side).toBe('right')
    // 540 + 6 on the inline axis; 384 - 50 centres the 100 px popup on the trigger.
    expect(opened.transform).toBe('translate(546px, 334px)')
  })

  it('writes the room it has on the positioner, which the two caps of the popup read', async () => {
    layout(box(500, 300, 40, 40))
    const { positioner, popup } = await open('bottom')
    // Under a trigger that ends at 340: 768 - 340 - 6 of offset - 8 of padding; the width less 8 on each side.
    expect(positioner?.style.getPropertyValue('--available-height')).toBe('414px')
    expect(positioner?.style.getPropertyValue('--available-width')).toBe('1008px')
    expect(popup.className).toContain('max-h-(--available-height)')
    expect(popup.className).toContain('max-w-(--available-width)')
  })

  it('marks the positioner that carries the hiding class once its trigger scrolls out of view', async () => {
    layout(box(500, -200, 40, 40))
    const opened = await open('bottom')
    expect(opened.positioner?.hasAttribute('data-anchor-hidden')).toBe(true)
    expect(opened.positioner?.className).toContain('data-anchor-hidden:invisible')
  })

  it('leaves the anchor-hidden flag off while the trigger is in view', async () => {
    layout(box(500, 300, 40, 40))
    expect((await open('bottom')).positioner?.hasAttribute('data-anchor-hidden')).toBe(false)
  })
})

describe('right to left', () => {
  // Base UI reads the inline sides from its own direction context, which TopClassProvider sets.
  it('opens start on the left of the trigger in English', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open('start')
    expect(opened.side).toBe('inline-start')
    // 500 - 6 - 280 on the inline axis; 320 - 50 centres the 100 px popup.
    expect(opened.transform).toBe('translate(214px, 270px)')
  })

  it('opens start on the right of the trigger in Arabic', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open('start', 'rtl')
    expect(opened.side).toBe('inline-start')
    expect(opened.transform).toBe('translate(546px, 270px)')
  })

  it('opens end on the left of the trigger in Arabic', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open('end', 'rtl')
    expect(opened.side).toBe('inline-end')
    expect(opened.transform).toBe('translate(214px, 270px)')
  })

  it('aligns bottom-start to the right edge when the page runs right to left', async () => {
    // Floating UI reads the align axis from the CSS direction, which the dir of the positioner sets in a browser.
    document.body.style.direction = 'rtl'
    layout(box(500, 300, 40, 40))
    // 540 - 280: the right edges line up.
    expect((await open('bottom-start', 'rtl')).transform).toBe('translate(260px, 346px)')
  })

  it('aligns bottom-start to the left edge when the page runs left to right', async () => {
    layout(box(500, 300, 40, 40))
    expect((await open('bottom-start')).transform).toBe('translate(500px, 346px)')
  })
})
