import { expect, test, type Locator, type Page } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

// What a class list cannot show: whether a row of inputs fits a phone, whether the
// text moves when a field turns invalid, and how large the text is under a finger.
type Box = { x: number; y: number; width: number; height: number }

const boxOf = async (locator: Locator): Promise<Box> => {
  const box = await locator.boundingBox()
  if (!box) throw new Error('nothing to measure')
  return box
}

/** The band the text sits in, clear of the line and of anything drawn just inside it. */
const textBand = (box: Box) => ({ x: box.x + 6, y: box.y + 10, width: box.width - 12, height: box.height - 20 })

/** One pixel column just inside the resting line, where only a thicker line can paint. */
const insideLine = (box: Box) => ({ x: box.x + 1, y: box.y + 14, width: 1, height: box.height - 28 })

// animations: disabled jumps the border-colour transition to its end, so no shot is mid-way.
const shot = (page: Page, clip: Box) => page.screenshot({ clip, animations: 'disabled' })

for (const width of [320, 390]) {
  for (const direction of ['ltr', 'rtl'] as const) {
    test(`${String(width)}px ${direction}: two inputs in a row inside a grid form fit the screen`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(urlFor('input--row', 'light', direction))

      const doc = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))
      expect(doc.scroll, 'the page scrolls sideways').toBeLessThanOrEqual(doc.client)

      const form = await boxOf(page.locator('form'))
      const fields = await page.locator('form input').all()
      expect(fields.length).toBe(5)
      for (const field of fields) {
        const box = await boxOf(field)
        // One pixel of tolerance for sub-pixel rounding at a fractional zoom.
        expect(box.x, 'an input starts outside the form').toBeGreaterThanOrEqual(form.x - 1)
        expect(box.x + box.width, 'an input ends outside the form').toBeLessThanOrEqual(form.x + form.width + 1)
      }

      // The pair really shares one line, or fitting the screen proves nothing.
      const [first, second] = await Promise.all((await page.locator('[data-row="own"] input').all()).map(boxOf))
      expect(first?.y).toBe(second?.y)
    })
  }
}

test('1280px: an input with room is 193px wide, as a text field in a block always was, and flex-1 still fills the row', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(urlFor('input--row', 'light', 'ltr'))

  // 193px is the browser's own twenty characters at 14px, which the token stands in for.
  for (const field of await page.locator('[data-row="own"] input, [data-row="alone"] input').all()) {
    expect(Math.round((await boxOf(field)).width)).toBe(193)
  }
  // A max-width cap would hold these at 193px too: together with the 8px gap they are the row.
  const row = await boxOf(page.locator('[data-row="grow"]'))
  const grown = await Promise.all((await page.locator('[data-row="grow"] input').all()).map(boxOf))
  expect(grown.length).toBe(2)
  for (const box of grown) expect(box.width).toBeGreaterThan(500)
  expect(Math.abs(grown.reduce((sum, box) => sum + box.width, 8) - row.width)).toBeLessThan(1)
})

// Light and dark only: under ocean the pill's curve crosses the pixel column this reads.
for (const mode of ['light', 'dark'] as const) {
  for (const direction of ['ltr', 'rtl'] as const) {
    test(`${mode} ${direction}: turning invalid thickens the line and moves nothing`, async ({ page }) => {
      await page.goto(urlFor('input--states', mode, direction))
      const field = page.getByRole('textbox', { name: 'Filled' })

      const box = await boxOf(field)
      const text = await shot(page, textBand(box))
      const line = await shot(page, insideLine(box))

      await field.evaluate((el) => { el.setAttribute('aria-invalid', 'true') })

      expect(await boxOf(field), 'the box changed size or place').toEqual(box)
      expect(Buffer.compare(text, await shot(page, textBand(box))), 'the text moved').toBe(0)
      // Hue alone is no cue (WCAG 1.4.1): the pixel inside the resting line must change too.
      expect(Buffer.compare(line, await shot(page, insideLine(box))), 'the line is no thicker').not.toBe(0)
    })
  }
}

test.describe('under forced colours', () => {
  test.use({ forcedColors: 'active' })

  for (const direction of ['ltr', 'rtl'] as const) {
    test(`${direction}: an invalid input still differs from a valid one, and is the same box`, async ({ page }) => {
      await page.goto(urlFor('input--states', 'light', direction))
      const field = page.getByRole('textbox', { name: 'Filled' })
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)

      const box = await boxOf(field)
      const line = await shot(page, insideLine(box))
      await expect(field).toHaveCSS('border-top-width', '1px')

      await field.evaluate((el) => { el.setAttribute('aria-invalid', 'true') })

      // Both borders are one system colour here and no shadow paints, so only width is left.
      await expect(field).toHaveCSS('border-top-width', '2px')
      await expect(field).toHaveCSS('border-inline-start-width', '2px')
      expect(Buffer.compare(line, await shot(page, insideLine(box))), 'the two states look the same').not.toBe(0)
      expect(await boxOf(field), 'the box changed size or place').toEqual(box)
    })
  }
})

/** Written out: the type step each size has under a mouse, which a touch floor must not change. */
const FINE = [
  ['Extra small', '12px'], ['Small', '14px'], ['Medium', '14px'], ['Large', '16px'], ['Extra large', '16px'],
] as const

test('a fine pointer keeps the type step of every size', async ({ page }) => {
  await page.goto(urlFor('input--sizes', 'light', 'ltr'))
  for (const [name, size] of FINE) {
    await expect(page.getByRole('textbox', { name, exact: true }), name).toHaveCSS('font-size', size)
  }
})

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  // iOS Safari zooms the page when a focused field's text is under 16 CSS px.
  for (const root of ['16px', '14px']) {
    test(`the text of every size is at least 16 CSS px with a ${root} root`, async ({ page }) => {
      await page.goto(urlFor('input--sizes', 'light', 'ltr'))
      await page.addStyleTag({ content: `html { font-size: ${root} }` })
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)

      for (const [name] of FINE) {
        const field = page.getByRole('textbox', { name, exact: true })
        const size = await field.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))
        expect(size, name).toBeGreaterThanOrEqual(16)
      }
    })
  }
})

// PLAN 12: numbers and emails stay left-to-right inside a right-to-left form.
test('rtl: an email and a number read left-to-right, on the side the form starts from', async ({ page }) => {
  await page.goto(urlFor('input--rtl', 'light', 'rtl'))

  for (const field of [page.getByRole('textbox', { name: 'البريد الإلكتروني' }), page.getByRole('spinbutton')]) {
    await expect(field).toHaveCSS('direction', 'ltr')
    await expect(field).toHaveCSS('text-align', 'right')
  }
  // A name may be Arabic, so a plain text field still follows the form.
  await expect(page.getByRole('textbox', { name: 'الاسم' })).toHaveCSS('direction', 'rtl')
})

// e2e/focus-ring.spec measures a button; this is the same ring on the first form control.
for (const mode of MODES) {
  test(`${mode}: tabbing to an input paints a ring outside its box`, async ({ page }) => {
    await page.goto(urlFor('input--states', mode, 'ltr'))
    const first = page.locator('input').first()
    const box = await boxOf(first)

    // The four pixels above the box: the offset, then the ring. The caret cannot reach them.
    const above = { x: box.x + 20, y: box.y - 4, width: box.width - 40, height: 4 }
    const before = await shot(page, above)
    await page.keyboard.press('Tab')
    await expect(first).toBeFocused()

    expect(Buffer.compare(before, await shot(page, above)), 'nothing was painted outside the box').not.toBe(0)
    await expect(first).toHaveCSS('outline-style', 'solid')
    await expect(first).toHaveCSS('outline-width', '2px')
  })
}
