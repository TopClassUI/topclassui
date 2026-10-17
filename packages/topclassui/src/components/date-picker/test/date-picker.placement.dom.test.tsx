import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DATE_PICKER_PLACEMENTS } from '../constants.js'
import { DatePicker } from '../index.js'
import type { DatePickerPlacement } from '../types.js'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.style.direction = ''
})

/** Every cell of the mapping, written out: side, then align, as Base UI writes them. */
const SIDE_ALIGN: Record<DatePickerPlacement, [string, string]> = {
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

/** happy-dom lays nothing out, so the viewport, the trigger box and the popup size are given: 280 by 300. */
function layout(trigger: DOMRect, popup = { width: 280, height: 300 }) {
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024)
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return this.getAttribute('aria-haspopup') === 'dialog' ? trigger : box(0, 0, 0, 0)
  })
  const isPositioner = (el: HTMLElement) => el.getAttribute('role') === 'presentation' && el.querySelector('[data-placement]') !== null
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.width : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.height : 0
  })
}

/** Opens a DatePicker inside the provider the app mounts, and waits for Floating UI to place its popup. */
async function open(placement: DatePickerPlacement | undefined, direction: 'ltr' | 'rtl' = 'ltr') {
  render(
    <TopClassProvider direction={direction} locale="en">
      <DatePicker aria-label="Check-in" defaultOpen {...(placement === undefined ? {} : { placement })} />
    </TopClassProvider>,
  )
  const popup = (await screen.findByRole('dialog')).closest('[data-placement]') as HTMLElement
  const positioner = popup.parentElement
  await waitFor(() => { expect(positioner?.style.transform).toMatch(/^translate\(/) })
  return { popup, side: popup.getAttribute('data-side'), align: popup.getAttribute('data-align'), transform: positioner?.style.transform }
}

describe('placement maps to side and align (R-5.3-4)', () => {
  it('names every placement in the table, so adding one cannot skip coverage', () => {
    expect([...DATE_PICKER_PLACEMENTS].sort()).toEqual(Object.keys(SIDE_ALIGN).sort())
  })

  for (const [placement, [side, align]] of Object.entries(SIDE_ALIGN)) {
    it(`${placement} opens on ${side}, aligned ${align}`, async () => {
      // Room for the whole popup on every side: 360 above, 328 below, 400 at either end.
      layout(box(400, 360, 200, 40))
      const opened = await open(placement as DatePickerPlacement)
      expect([opened.side, opened.align]).toEqual([side, align])
      expect(opened.popup.getAttribute('data-placement')).toBe(placement)
    })
  }

  it('defaults to bottom-start, as drawn on the playground', async () => {
    layout(box(400, 300, 200, 40))
    const opened = await open(undefined)
    expect([opened.side, opened.align]).toEqual(['bottom', 'start'])
  })
})

describe('the distance and the edges: the shared bounds', () => {
  it('sits 6 px under the trigger, its start edge on the trigger\'s', async () => {
    layout(box(400, 300, 200, 40))
    expect((await open('bottom-start')).transform).toBe('translate(400px, 346px)')
  })

  it('stays 8 px inside the viewport, the shared collision padding', async () => {
    layout(box(900, 100, 200, 40))
    // At its own start it would end at 1180, past 1024: it shifts to 1024 - 8 - 280.
    expect((await open('bottom-start')).transform).toBe('translate(736px, 146px)')
  })

  it('flips to the top when the bottom has no room', async () => {
    layout(box(400, 600, 200, 40))
    const opened = await open('bottom-start')
    expect(opened.side).toBe('top')
    expect(opened.transform).toBe('translate(400px, 294px)')
  })

  it('aligns bottom-start to the right edge when the page runs right to left', async () => {
    document.body.style.direction = 'rtl'
    layout(box(400, 300, 200, 40))
    // 600 - 280: the right edges line up.
    expect((await open('bottom-start', 'rtl')).transform).toBe('translate(320px, 346px)')
  })
})
