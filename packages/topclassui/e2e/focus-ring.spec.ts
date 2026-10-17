import { expect, test } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { DEMOS, urlFor } from './pages.js'
import { type Clip, FORCED_CANVAS, inkOn, pixelsOf, strayOn } from './pixels.js'

// R-5.6-1. A class-name assertion cannot see this: FOCUS_RING once paired
// outline-none with an outline width and painted nothing at all, with every
// unit test green. So it compares the pixels around the button before and after a Tab.
for (const mode of MODES) {
  test(`${mode}: tabbing to a button paints a visible ring`, async ({ page }) => {
    await page.goto(urlFor('button--variants', mode, 'ltr'))

    const first = page.locator('button').first()
    const box = await first.boundingBox()
    if (!box) throw new Error('no button to measure')

    // Clipped to the button and the 8px around it, so a changed pixel can only be the
    // ring; a full-page shot would also differ on a caret or a scrollbar.
    const clip = {
      x: Math.max(0, box.x - 8),
      y: Math.max(0, box.y - 8),
      width: box.width + 16,
      height: box.height + 16,
    }
    const before = await page.screenshot({ clip })
    await page.keyboard.press('Tab')
    await expect(first).toBeFocused()
    const after = await page.screenshot({ clip })

    // A ring changes pixels. Identical crops mean nothing was painted.
    expect(Buffer.compare(before, after), 'the focused button looks identical').not.toBe(0)

    const outline = await page.locator('button').first().evaluate((el) => {
      const style = getComputedStyle(el)
      return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor }
    })
    expect(outline.style, 'outline-style resolves to none under the reset').not.toBe('none')
    expect(Number.parseFloat(outline.width), 'outline-width').toBeGreaterThan(0)
  })
}

const INTERACTIVE = 'button, a[href], [role="button"], [role="link"], input, select, textarea, [tabindex]'

/** Where a ring sits over a box: the five rows that end one pixel above its top edge. */
const bandOver = (box: Clip): Clip => ({ x: box.x - 6, y: box.y - 6, width: box.width + 12, height: 5 })

// Forced colours paint a transparent outline. FOCUS_RING once reset with Tailwind's
// outline-hidden, which is `outline: 2px solid transparent` there: every control of the
// library wore a 2 px ring at rest, and the focused one could not be told from the others.
for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('a button at rest has no outline, and the focused one a ring at 3:1 or more', async ({ page }) => {
      await page.goto(urlFor('button--variants', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)

      const buttons = page.locator('#demo button')
      const styles = () => buttons.evaluateAll((all) => all.map((el) => getComputedStyle(el).outlineStyle))
      expect(await styles()).toEqual(['none', 'none', 'none', 'none', 'none'])

      const box = await buttons.first().boundingBox()
      if (!box) throw new Error('no button to measure')
      const canvas = FORCED_CANVAS[scheme]
      const atRest = await pixelsOf(page, bandOver(box))
      expect(atRest.length).toBeGreaterThan(200)
      expect(strayOn(atRest, canvas), 'pixels painted around a button at rest').toBe(0)

      await page.keyboard.press('Tab')
      await expect(buttons.first()).toBeFocused()
      expect(await styles()).toEqual(['solid', 'none', 'none', 'none', 'none'])
      // A whole row as wide as the button, or it is a corner and not a ring.
      const ring = inkOn(await pixelsOf(page, bandOver(box)), canvas)
      expect(ring, 'pixels of ring at 3:1 over the focused button').toBeGreaterThanOrEqual(Math.floor(box.width))
    })

    test('no control of any demo has an outline at rest', async ({ page }) => {
      test.slow()
      const outlined: string[] = []
      let controls = 0
      for (const demo of DEMOS) {
        await page.goto(urlFor(demo, 'light', 'ltr'))
        const styles = await page.locator(INTERACTIVE).evaluateAll((all) => all.map((el) => getComputedStyle(el).outlineStyle))
        controls += styles.length
        if (styles.some((style) => style !== 'none')) outlined.push(demo)
      }
      // The selector found the controls, or a set with none in it would pass.
      expect(controls).toBeGreaterThan(100)
      expect(outlined).toEqual([])
    })
  })
}
