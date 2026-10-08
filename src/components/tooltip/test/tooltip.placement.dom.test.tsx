import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { TOOLTIP_PLACEMENTS } from '../constants.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipPlacement } from '../types.js'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.style.direction = ''
})

/** Every cell of the mapping, written out: side, then align, as Base UI writes them. */
const SIDE_ALIGN: Record<TooltipPlacement, [string, string]> = {
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

/** happy-dom lays nothing out, so the viewport, the trigger box and the popup size are given. */
function layout(trigger: DOMRect, popup = { width: 100, height: 24 }) {
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024)
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return this.hasAttribute('data-base-ui-tooltip-trigger') ? trigger : box(0, 0, 0, 0)
  })
  const isPositioner = (el: HTMLElement) => el.getAttribute('role') === 'presentation'
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.width : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.height : 0
  })
}

/** Opens a tooltip inside the provider the app mounts, and waits for Floating UI to place it. */
async function open(placement: TooltipPlacement | undefined, direction: 'ltr' | 'rtl' = 'ltr') {
  render(
    <TopClassProvider direction={direction} locale="en">
      <TooltipRoot defaultOpen>
        <TooltipTrigger render={<Button aria-label="Copy link" />}>C</TooltipTrigger>
        <TooltipPopup placement={placement}>Copy link</TooltipPopup>
      </TooltipRoot>
    </TopClassProvider>,
  )
  const popup = screen.getByText('Copy link', { selector: '[data-placement]' })
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

describe('placement maps to side and align', () => {
  it('names every placement in the table, so adding one cannot skip coverage', () => {
    expect([...TOOLTIP_PLACEMENTS].sort()).toEqual(Object.keys(SIDE_ALIGN).sort())
  })

  for (const [placement, [side, align]] of Object.entries(SIDE_ALIGN)) {
    it(`${placement} opens on ${side}, aligned ${align}`, async () => {
      layout(box(500, 300, 40, 40))
      const opened = await open(placement as TooltipPlacement)
      expect([opened.side, opened.align]).toEqual([side, align])
      expect(opened.popup.getAttribute('data-placement')).toBe(placement)
    })
  }

  it('defaults to top, centred, not the bottom-start the shared default gives menus', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open(undefined)
    expect([opened.side, opened.align]).toEqual(['top', 'center'])
    expect(opened.popup.getAttribute('data-placement')).toBe('top')
  })
})

describe('the distance and the edges', () => {
  it('sits 11 px off the trigger: the shared 6 plus the 5 px arrow', async () => {
    layout(box(500, 300, 40, 40))
    // 300 - 11 - 24 on the block axis; 520 - 50 centres the 100 px popup.
    expect((await open('top')).transform).toBe('translate(470px, 265px)')
  })

  it('keeps the same 11 px below the trigger', async () => {
    layout(box(500, 300, 40, 40))
    expect((await open('bottom')).transform).toBe('translate(470px, 351px)')
  })

  it('stays 8 px inside the viewport, the shared collision padding', async () => {
    layout(box(0, 300, 40, 40))
    // Centred it would start at -30, so it shifts to the padding, not to Base UI's 5.
    expect((await open('top')).transform).toBe('translate(8px, 265px)')
  })

  it('flips a top tooltip to the bottom when the top has no room', async () => {
    layout(box(500, 4, 40, 40))
    expect((await open('top')).side).toBe('bottom')
  })

  it('never moves beside the trigger, where no arrow class matches, even with no room above or below', async () => {
    layout(box(500, 0, 40, 768))
    const opened = await open('top')
    expect(['top', 'bottom']).toContain(opened.side)
    expect(opened.positioner?.getAttribute('data-side')).toBe(opened.side)
  })

  it('marks the positioner that carries the hiding class once its trigger scrolls out of view', async () => {
    layout(box(500, -200, 40, 40))
    const opened = await open('top')
    expect(opened.positioner?.hasAttribute('data-anchor-hidden')).toBe(true)
    expect(opened.positioner?.className).toContain('data-anchor-hidden:invisible')
  })

  it('leaves the anchor-hidden flag off while the trigger is in view', async () => {
    layout(box(500, 300, 40, 40))
    expect((await open('top')).positioner?.hasAttribute('data-anchor-hidden')).toBe(false)
  })
})

describe('right to left', () => {
  // Base UI reads the inline sides from its own direction context, which TopClassProvider sets.
  it('opens start on the left of the trigger in English', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open('start')
    expect(opened.side).toBe('inline-start')
    expect(opened.transform).toBe('translate(389px, 308px)')
  })

  it('opens start on the right of the trigger in Arabic', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open('start', 'rtl')
    expect(opened.side).toBe('inline-start')
    expect(opened.transform).toBe('translate(551px, 308px)')
  })

  it('opens end on the left of the trigger in Arabic', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open('end', 'rtl')
    expect(opened.side).toBe('inline-end')
    expect(opened.transform).toBe('translate(389px, 308px)')
  })

  it('aligns top-start to the right edge when the page runs right to left', async () => {
    // Floating UI reads the align axis from the CSS direction, which the html dir sets in an app.
    document.body.style.direction = 'rtl'
    layout(box(500, 300, 40, 40))
    expect((await open('top-start', 'rtl')).transform).toBe('translate(440px, 265px)')
  })

  it('aligns top-start to the left edge when the page runs left to right', async () => {
    layout(box(500, 300, 40, 40))
    expect((await open('top-start')).transform).toBe('translate(500px, 265px)')
  })
})
