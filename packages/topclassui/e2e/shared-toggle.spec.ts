import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { FORCED_CANVAS, inkOn, pixelsOf, rgbOf, ringRow } from './pixels.js'

// What the shared toggle classes promise and only a browser can show, on the stand-in of e2e/fixtures/shared-toggle.tsx:
// the target is a floor whatever the box, it never stretches in a grid, and the ring and the states are drawn on the box.

// No transition: a colour read mid-way would be neither the old nor the new one.
test.use({ reducedMotion: 'reduce' })

const SCOPE = '#toggles'

/** The toggle step of each size, and the target around it: the floor, or the box where the box is larger. */
const FINE = {
  xs: { box: 14, target: 24 }, sm: { box: 16, target: 24 }, md: { box: 20, target: 24 },
  lg: { box: 24, target: 24 }, xl: { box: 28, target: 28 },
} as const

async function fixture(page: Page, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'separator--horizontal', options)
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/shared-toggle.tsx' })
  await expect(page.locator(`${SCOPE} button`).first()).toBeVisible()
}

const target = (page: Page, id: string) => page.locator(`#${id}`)
const box = (page: Page, id: string) => page.locator(`#${id} [data-box]`)
const css = (element: Locator, property: string) =>
  element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)

/** A colour as this page resolves it, from a probe that carries nothing of the toggle classes. */
const resolved = (page: Page, property: 'color' | 'background-color', value: string) => page.evaluate(([name, colour]) => {
  const probe = document.createElement('span')
  probe.style.setProperty('forced-color-adjust', 'none')
  probe.style.setProperty(name, colour)
  document.body.appendChild(probe)
  const found = getComputedStyle(probe).getPropertyValue(name)
  probe.remove()
  return found
}, [property, value] as const)

async function sizes(page: Page) {
  const found: Record<string, { box: [number, number], target: [number, number] }> = {}
  for (const size of Object.keys(FINE)) {
    const [outer, inner] = [await boxOf(target(page, `size-${size}`)), await boxOf(box(page, `size-${size}`))]
    found[size] = { box: [inner.width, inner.height], target: [outer.width, outer.height] }
  }
  return found
}

test('fine pointer: the target is 24 x 24 px around a smaller box, and as large as a larger one', async ({ page }) => {
  await fixture(page)
  expect(await sizes(page)).toEqual({
    xs: { box: [14, 14], target: [24, 24] }, sm: { box: [16, 16], target: [24, 24] },
    md: { box: [20, 20], target: [24, 24] }, lg: { box: [24, 24], target: [24, 24] },
    xl: { box: [28, 28], target: [28, 28] },
  })
})

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  test('the target is 44 x 44 px at every size, and the box keeps its own step', async ({ page }) => {
    await fixture(page)
    expect(await sizes(page)).toEqual({
      xs: { box: [14, 14], target: [44, 44] }, sm: { box: [16, 16], target: [44, 44] },
      md: { box: [20, 20], target: [44, 44] }, lg: { box: [24, 24], target: [44, 44] },
      xl: { box: [28, 28], target: [44, 44] },
    })
  })

  test('the ring is drawn on the 20 px box, 28 px across, and not on the 44 px target', async ({ page }) => {
    await fixture(page)
    await target(page, 'size-md').focus()
    expect(await target(page, 'size-md').evaluate((el) => el.matches(':focus-visible'))).toBe(true)
    expect(await css(target(page, 'size-md'), 'outline-style')).toBe('none')
    expect(await css(box(page, 'size-md'), 'outline-style')).toBe('solid')
    const [ring, offset] = [await css(box(page, 'size-md'), 'outline-width'), await css(box(page, 'size-md'), 'outline-offset')]
    expect([ring, offset]).toEqual(['2px', '2px'])
    expect((await boxOf(box(page, 'size-md'))).width + 2 * (2 + 2)).toBe(28)
  })
})

for (const direction of DIRECTIONS) {
  test(`1280 px, ${direction}: laid straight into a grid the target keeps the 35 x 24 px of its track, at the start`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await fixture(page, { direction })
    const [grid, outer, inner] = [await boxOf(page.locator('#grid')), await boxOf(target(page, 'in-grid')), await boxOf(box(page, 'in-grid'))]
    expect([outer.width, outer.height]).toEqual([35, 24])
    expect([inner.width, inner.height]).toEqual([35, 20])
    if (direction === 'ltr') expect(outer.left).toBe(grid.left)
    else expect(outer.right).toBe(grid.right)
    await expectNoSidewaysScroll(page)
  })
}

test.describe('the ring and the states are on the box', () => {
  test('a focused target rings its box in the ring colour, and has no outline itself', async ({ page }) => {
    await fixture(page)
    await target(page, 'size-md').focus()
    expect(await target(page, 'size-md').evaluate((el) => el.matches(':focus-visible'))).toBe(true)
    expect(await css(target(page, 'size-md'), 'outline-style')).toBe('none')
    expect(await css(box(page, 'size-md'), 'outline-style')).toBe('solid')
    expect(await css(box(page, 'size-md'), 'outline-color')).toBe(await resolved(page, 'color', 'var(--tc-ring)'))
    expect(await css(box(page, 'size-sm'), 'outline-style')).toBe('none')
  })

  test('a focused accordion trigger around a toggle does not ring the box: the group is named', async ({ page }) => {
    await fixture(page)
    await page.locator('#trigger').focus()
    expect(await page.locator('#trigger').evaluate((el) => el.matches(':focus-visible'))).toBe(true)
    expect(await css(box(page, 'in-trigger'), 'outline-style')).toBe('none')
  })

  test('checked fills the box; invalid turns its line red and thicker; invalid wins over checked', async ({ page }) => {
    await fixture(page)
    const [primary, danger] = [await resolved(page, 'color', 'var(--tc-primary-solid)'), await resolved(page, 'color', 'var(--tc-danger-solid)')]
    expect(await css(box(page, 'checked'), 'background-color')).toBe(primary)
    expect(await css(box(page, 'checked'), 'border-top-color')).toBe(primary)
    expect(await css(box(page, 'invalid'), 'border-top-color')).toBe(danger)
    // A 1 px inset ring inside the 1 px line: 2 px of red, the ring width.
    expect(await css(box(page, 'invalid'), 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    expect(await css(box(page, 'checked'), 'box-shadow')).not.toContain('inset')
    expect(await css(box(page, 'checked-invalid'), 'border-top-color')).toBe(danger)
    expect(await css(box(page, 'checked-invalid'), 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    expect(await css(box(page, 'checked-invalid'), 'background-color')).toBe(primary)
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('a checked box is painted Highlight, an invalid line is 2 px, and no target has an outline at rest', async ({ page }) => {
      await fixture(page)
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const highlight = await resolved(page, 'background-color', 'Highlight')
      expect(await css(box(page, 'checked'), 'background-color')).toBe(highlight)
      expect(await css(box(page, 'checked'), 'border-top-color')).toBe(highlight)
      const inside = await boxOf(box(page, 'checked'))
      const [middle] = await pixelsOf(page, { x: Math.round(inside.left + inside.width / 2), y: Math.round(inside.top + inside.height / 2), width: 1, height: 1 })
      expect(middle).toEqual(rgbOf(highlight))
      expect(middle).not.toEqual(FORCED_CANVAS[scheme])
      expect(await css(box(page, 'invalid'), 'border-top-width')).toBe('2px')
      expect(await css(box(page, 'size-md'), 'border-top-width')).toBe('1px')
      const outlines = await page.locator(`${SCOPE} button`).evaluateAll((all) => all.map((el) => getComputedStyle(el).outlineStyle))
      expect(new Set(outlines)).toEqual(new Set(['none']))
    })

    test('the focused box keeps its ring', async ({ page }) => {
      await fixture(page)
      await target(page, 'size-md').focus()
      expect(await css(box(page, 'size-md'), 'outline-style')).toBe('solid')
      expect(await css(target(page, 'size-md'), 'outline-style')).toBe('none')
    })

    test('a checked box that is invalid has a CanvasText line and no author red; one that is disabled is GrayText', async ({ page }) => {
      await fixture(page)
      const [canvasText, grayText] = [await resolved(page, 'color', 'CanvasText'), await resolved(page, 'color', 'GrayText')]
      expect(await css(box(page, 'checked-invalid'), 'border-top-color')).toBe(canvasText)
      expect(await css(box(page, 'checked-invalid'), 'border-top-width')).toBe('2px')
      // The red inset ring is zero wide: no author colour is painted.
      expect(await css(box(page, 'checked-invalid'), 'box-shadow')).not.toMatch(/[1-9]px inset/)
      expect(await css(box(page, 'checked-disabled'), 'background-color')).toBe(grayText)
      expect(await css(box(page, 'checked-disabled'), 'border-top-color')).toBe(grayText)
      expect(await css(box(page, 'checked'), 'background-color')).toBe(await resolved(page, 'background-color', 'Highlight'))
    })

    test('on a page in the other theme, a filled box rings in CanvasText, not the author ring that opting out would keep', async ({ page }) => {
      await fixture(page, { mode: scheme === 'light' ? 'dark' : 'light' })
      const canvasText = await resolved(page, 'color', 'CanvasText')
      for (const id of ['size-md', 'checked', 'checked-invalid']) {
        await target(page, id).focus()
        expect(await css(box(page, id), 'outline-color'), id).toBe(canvasText)
        const row = await ringRow(page, await boxOf(box(page, id)))
        expect(inkOn(row, FORCED_CANVAS[scheme]), id).toBe(row.length)
      }
    })
  })
}
