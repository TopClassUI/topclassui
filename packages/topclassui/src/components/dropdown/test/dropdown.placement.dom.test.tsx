import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { DROPDOWN_PLACEMENTS } from '../constants.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'
import type { DropdownPlacement } from '../types.js'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.style.direction = ''
})

/** Every cell of the mapping, written out: side, then align, as Base UI writes them. */
const SIDE_ALIGN: Record<DropdownPlacement, [string, string]> = {
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

/** happy-dom lays nothing out, so the viewport, the trigger box and the menu size are given: 200 by 100. */
function layout(trigger: DOMRect, popup = { width: 200, height: 100 }) {
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024)
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return this.hasAttribute('aria-haspopup') ? trigger : box(0, 0, 0, 0)
  })
  const isPositioner = (el: HTMLElement) => el.getAttribute('role') === 'presentation' && el.hasAttribute('data-side')
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.width : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.height : 0
  })
}

/** Opens a menu inside the provider the app mounts, and waits for Floating UI to place it. */
async function open(placement: DropdownPlacement | undefined, direction: 'ltr' | 'rtl' = 'ltr') {
  render(
    <TopClassProvider direction={direction} locale="en">
      <DropdownRoot defaultOpen modal={false}>
        <DropdownTrigger render={<Button>Actions</Button>} />
        <DropdownPopup placement={placement}><DropdownItem>Rename</DropdownItem></DropdownPopup>
      </DropdownRoot>
    </TopClassProvider>,
  )
  const popup = await screen.findByRole('menu')
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
    expect([...DROPDOWN_PLACEMENTS].sort()).toEqual(Object.keys(SIDE_ALIGN).sort())
  })

  for (const [placement, [side, align]] of Object.entries(SIDE_ALIGN)) {
    it(`${placement} opens on ${side}, aligned ${align}`, async () => {
      layout(box(500, 300, 40, 40))
      const opened = await open(placement as DropdownPlacement)
      expect([opened.side, opened.align]).toEqual([side, align])
      expect(opened.popup.getAttribute('data-placement')).toBe(placement)
    })
  }

  it('defaults to bottom-start, the shared placement of a menu, and not the centre Base UI gives one', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open(undefined)
    expect([opened.side, opened.align]).toEqual(['bottom', 'start'])
    expect(opened.popup.getAttribute('data-placement')).toBe('bottom-start')
  })
})

describe('the distance and the edges', () => {
  it('sits 6 px under the trigger, the shared side offset, with its left edge on the trigger', async () => {
    layout(box(500, 300, 40, 40))
    // 340 + 6 on the block axis; the start edges line up at 500.
    expect((await open('bottom-start')).transform).toBe('translate(500px, 346px)')
  })

  it('keeps the same 6 px above the trigger', async () => {
    layout(box(500, 300, 40, 40))
    // 300 - 6 - 100.
    expect((await open('top-start')).transform).toBe('translate(500px, 194px)')
  })

  // Base UI's own collision rule for a menu: where the start edge has no room, it lines up the end edges instead.
  it('near the end of the screen, bottom-start lines its right edge up with the trigger and stays inside', async () => {
    layout(box(900, 300, 40, 40))
    // From 900 it would end at 1100, past 1024 - 8: so 940 - 200.
    const opened = await open('bottom-start')
    expect(opened.transform).toBe('translate(740px, 346px)')
    expect(opened.align).toBe('end')
  })

  it('flips a bottom menu to the top when the bottom has no room', async () => {
    layout(box(500, 700, 40, 40))
    const opened = await open('bottom-start')
    expect(opened.side).toBe('top')
    expect(opened.transform).toBe('translate(500px, 594px)')
  })

  it('flips a top menu to the bottom when the top has no room', async () => {
    layout(box(500, 4, 40, 40))
    expect((await open('top-start')).side).toBe('bottom')
  })

  it('writes the room it has on the positioner, which the caps of the menu and of its shortcuts read', async () => {
    layout(box(500, 300, 40, 40))
    const { positioner, popup } = await open('bottom-start')
    // Under a trigger that ends at 340: 768 - 340 - 6 of offset - 8 of padding; the width less 8 on each side.
    expect(positioner?.style.getPropertyValue('--available-height')).toBe('414px')
    expect(positioner?.style.getPropertyValue('--available-width')).toBe('1008px')
    expect(popup.className).toContain('var(--available-height,100dvh)')
    expect(popup.className).toContain('max-w-[min(calc(var(--spacing)*80),round(down,var(--available-width),1px))]')
  })

  it('marks the positioner that carries the hiding class once its trigger scrolls out of view', async () => {
    layout(box(500, -200, 40, 40))
    const opened = await open('bottom-start')
    expect(opened.positioner?.hasAttribute('data-anchor-hidden')).toBe(true)
    expect(opened.positioner?.className).toContain('data-anchor-hidden:invisible')
  })
})

describe('right to left', () => {
  it('aligns bottom-start to the right edge when the page runs right to left', async () => {
    // Floating UI reads the align axis from the CSS direction, which the dir of the positioner sets in a browser.
    document.body.style.direction = 'rtl'
    layout(box(500, 300, 40, 40))
    // 540 - 200: the right edges line up.
    expect((await open('bottom-start', 'rtl')).transform).toBe('translate(340px, 346px)')
  })

  it('opens start on the left of the trigger in English', async () => {
    layout(box(500, 300, 40, 40))
    // 500 - 6 - 200 on the inline axis; 320 - 50 centres the 100 px menu.
    expect((await open('start')).transform).toBe('translate(294px, 270px)')
  })

  it('opens start on the right of the trigger in Arabic', async () => {
    layout(box(500, 300, 40, 40))
    expect((await open('start', 'rtl')).transform).toBe('translate(546px, 270px)')
  })

  it('opens end on the left of the trigger in Arabic', async () => {
    layout(box(500, 300, 40, 40))
    const opened = await open('end', 'rtl')
    expect(opened.side).toBe('inline-end')
    expect(opened.transform).toBe('translate(294px, 270px)')
  })
})
