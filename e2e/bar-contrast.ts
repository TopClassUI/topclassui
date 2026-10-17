// WCAG 1.4.11 for a track with a bar in it (Meter, Progress): read from the painted pixels, in every mode and palette.
import { expect, test, type Page } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'
import { contrast, FORCED_CANVAS, pixelsOf, type Rgb } from './pixels.js'

/** One painted pixel. */
async function pixel(page: Page, x: number, y: number): Promise<Rgb> {
  const [found] = await pixelsOf(page, { x: Math.floor(x), y: Math.floor(y), width: 1, height: 1 })
  if (!found) throw new Error('no pixel')
  return found
}

/** Per track: the bar at a fifth, the empty track at nine tenths, and the row just above the track, where its edge is. */
async function readings(page: Page, role: string) {
  const found = []
  for (const track of await page.locator(`#demo [role="${role}"]`).all()) {
    const box = await track.boundingBox()
    if (!box) throw new Error('a track has no box')
    const middle = box.y + box.height / 2
    const at = (share: number) => box.x + box.width * share
    found.push({
      bar: await pixel(page, at(0.2), middle),
      track: await pixel(page, at(0.9), middle),
      edge: await pixel(page, at(0.9), Math.floor(box.y) - 1),
    })
  }
  return found
}

/** Light over light and dark over dark are the pairs where a theme colour kept under forced colours meets its own backdrop. */
const FORCED = [
  { theme: 'light', palette: 'light' },
  { theme: 'light', palette: 'dark' },
  { theme: 'dark', palette: 'light' },
  { theme: 'dark', palette: 'dark' },
] as const

/** Six tones on `<slug>--tones`: each bar 3:1 on its track and on the page, and the track's edge 3:1 on the page. */
export function describeBarContrast(slug: string, role: string) {
  test.describe('the bar and the edge of the track reach 3:1 (WCAG 1.4.11, R-5.6-4)', () => {
    for (const mode of MODES) {
      test(`${mode}: every tone`, async ({ page }) => {
        await page.goto(urlFor(`${slug}--tones`, mode, 'ltr'))
        const backdrop = await pixel(page, 1, 1)
        const found = await readings(page, role)
        expect(found).toHaveLength(6)
        for (const [index, { bar, track, edge }] of found.entries()) {
          expect.soft(contrast(bar, track), `bar on track, tone ${String(index)}`).toBeGreaterThanOrEqual(3)
          expect.soft(contrast(bar, backdrop), `bar on page, tone ${String(index)}`).toBeGreaterThanOrEqual(3)
          expect.soft(contrast(edge, backdrop), `edge on page, tone ${String(index)}`).toBeGreaterThanOrEqual(3)
        }
      })
    }

    for (const { theme, palette } of FORCED) {
      test(`forced colours, a ${palette} palette over the ${theme} theme: the system colours, whatever the theme`, async ({ page }) => {
        await page.emulateMedia({ forcedColors: 'active', colorScheme: palette })
        await page.goto(urlFor(`${slug}--tones`, theme, 'ltr'))
        const canvas = FORCED_CANVAS[palette]
        // The palette's canvas and not the theme's page, or this measures nothing new.
        expect(await pixel(page, 1, 1)).toEqual(canvas)
        const found = await readings(page, role)
        expect(found).toHaveLength(6)
        for (const [index, { bar, track, edge }] of found.entries()) {
          expect.soft(contrast(bar, track), `bar on track, tone ${String(index)}`).toBeGreaterThanOrEqual(3)
          expect.soft(contrast(edge, canvas), `edge on canvas, tone ${String(index)}`).toBeGreaterThanOrEqual(3)
        }
      })
    }
  })
}
