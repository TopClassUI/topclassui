import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { SELECT_PLACEMENTS } from '../constants.js'
import { Select } from '../index.js'
import type { SelectPlacement } from '../types.js'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.style.direction = ''
})

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }]

/** Every cell of the mapping, written out: side, then align, as Base UI writes them. */
const SIDE_ALIGN: Record<SelectPlacement, [string, string]> = {
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

/** happy-dom lays nothing out, so the viewport, the trigger box and the popup size are given: 200 by 100. */
function layout(trigger: DOMRect, popup = { width: 200, height: 100 }) {
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024)
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return this.getAttribute('role') === 'combobox' ? trigger : box(0, 0, 0, 0)
  })
  const isPositioner = (el: HTMLElement) => el.getAttribute('role') === 'presentation' && el.querySelector('[data-placement]') !== null
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.width : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return isPositioner(this) ? popup.height : 0
  })
}

/** Opens a Select inside the provider the app mounts, and waits for Floating UI to place its list. */
async function open(placement: SelectPlacement | undefined, direction: 'ltr' | 'rtl' = 'ltr') {
  render(
    <TopClassProvider direction={direction} locale="en">
      <Select aria-label="Country" items={ITEMS} defaultOpen {...(placement === undefined ? {} : { placement })} />
    </TopClassProvider>,
  )
  const popup = (await screen.findByRole('listbox')).closest('[data-placement]') as HTMLElement
  const positioner = popup.parentElement
  await waitFor(() => { expect(positioner?.style.transform).toMatch(/^translate\(/) })
  return { popup, side: popup.getAttribute('data-side'), align: popup.getAttribute('data-align'), transform: positioner?.style.transform }
}

describe('placement maps to side and align (R-5.3-4)', () => {
  it('names every placement in the table, so adding one cannot skip coverage', () => {
    expect([...SELECT_PLACEMENTS].sort()).toEqual(Object.keys(SIDE_ALIGN).sort())
  })

  for (const [placement, [side, align]] of Object.entries(SIDE_ALIGN)) {
    it(`${placement} opens on ${side}, aligned ${align}`, async () => {
      layout(box(500, 300, 200, 40))
      const opened = await open(placement as SelectPlacement)
      expect([opened.side, opened.align]).toEqual([side, align])
      expect(opened.popup.getAttribute('data-placement')).toBe(placement)
    })
  }

  it('defaults to bottom-start, the shared default of a list', async () => {
    layout(box(500, 300, 200, 40))
    const opened = await open(undefined)
    expect([opened.side, opened.align]).toEqual(['bottom', 'start'])
    expect(opened.popup.getAttribute('data-placement')).toBe('bottom-start')
  })
})

describe('the distance and the edges: the shared bounds, not the item aligned over the trigger', () => {
  it('sits 6 px under the trigger, its start edge on the trigger\'s', async () => {
    layout(box(500, 300, 200, 40))
    expect((await open('bottom-start')).transform).toBe('translate(500px, 346px)')
  })

  it('keeps the same 6 px above the trigger', async () => {
    layout(box(500, 300, 200, 40))
    expect((await open('top-start')).transform).toBe('translate(500px, 194px)')
  })

  it('stays 8 px inside the viewport, the shared collision padding', async () => {
    layout(box(900, 300, 200, 40))
    // At its own start it would end at 1100, past 1024: it shifts to 1024 - 8 - 200.
    expect((await open('bottom-start')).transform).toBe('translate(816px, 346px)')
  })

  it('flips to the top when the bottom has no room', async () => {
    layout(box(500, 700, 200, 40))
    const opened = await open('bottom-start')
    expect(opened.side).toBe('top')
    expect(opened.transform).toBe('translate(500px, 594px)')
  })

  it('opens below a trigger as wide as the screen when a side placement has room on neither side', async () => {
    layout(box(16, 300, 992, 40))
    expect((await open('end-top')).side).toBe('bottom')
  })

  it('never falls to a side when neither the bottom nor the top has room: a list squeezed beside it is no list', async () => {
    layout(box(500, 8, 200, 752))
    expect(['bottom', 'top']).toContain((await open('bottom-start')).side)
  })

  it('aligns bottom-start to the right edge when the page runs right to left', async () => {
    document.body.style.direction = 'rtl'
    layout(box(500, 300, 240, 40))
    // 740 - 200: the right edges line up.
    expect((await open('bottom-start', 'rtl')).transform).toBe('translate(540px, 346px)')
  })
})
