import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

// Measured, because a class list cannot see it: every unit test passed while a failed
// picture printed its alt over the initials, and neither could be read.
type Box = { x: number; y: number; width: number; height: number }

/** The control scale in CSS px, written out: what an avatar, its skeleton and a Button all measure. */
const SCALE = [28, 32, 40, 48, 56]

/** Chromium's broken-image mark is 16 px square in the start-top corner; one more for its edge. */
const MARK = 17

const shot = (page: Page, clip: Box) => page.screenshot({ clip, animations: 'disabled' })

/** Runs in the page: width and height of each element, rounded only to drop sub-pixel noise. */
const sizes = (elements: Element[]) => elements.map((el) => {
  const box = el.getBoundingClientRect()
  return [Math.round(box.width * 100) / 100, Math.round(box.height * 100) / 100]
})

for (const direction of DIRECTIONS) {
  test(`sizes ${direction}: an avatar is as tall as the Button of the same size beside it`, async ({ page }) => {
    await page.goto(urlFor('avatar--sizes', 'light', direction))
    expect(await page.locator('#demo span[data-size]').evaluateAll(sizes)).toEqual(SCALE.map((px) => [px, px]))
    const buttons = await page.locator('#demo button').evaluateAll(sizes)
    expect(buttons.map(([, height]) => height)).toEqual(SCALE)

    const rows = await page.locator('#demo span[data-size]').evaluateAll((avatars) => avatars.map((avatar) => {
      const [a, b] = [avatar.getBoundingClientRect(), avatar.nextElementSibling?.getBoundingClientRect()]
      return b ? [a.top - b.top, a.bottom - b.bottom] : null
    }))
    expect(rows, 'an avatar and its Button do not share one top and one bottom').toEqual(SCALE.map(() => [0, 0]))
  })

  test(`skeleton ${direction}: each skeleton holds the box of the avatar it stands in for`, async ({ page }) => {
    await page.goto(urlFor('avatar--skeleton', 'light', direction))
    expect(await page.locator('#demo span.animate-pulse').evaluateAll(sizes)).toEqual(SCALE.map((px) => [px, px]))
    expect(await page.locator('#demo span[data-size]').evaluateAll(sizes)).toEqual(SCALE.map((px) => [px, px]))
  })

  test(`basic ${direction}: a loaded picture covers the circle exactly, over the fallback`, async ({ page }) => {
    await page.goto(urlFor('avatar--basic', 'light', direction))
    const found = await page.locator('#demo img').evaluateAll((images) => images.map((image) => {
      const root = image.parentElement?.getBoundingClientRect() ?? new DOMRect()
      const box = image.getBoundingClientRect()
      return {
        root: [root.width, root.height],
        picture: [box.x - root.x, box.y - root.y, box.width, box.height],
        loaded: (image as HTMLImageElement).naturalWidth > 0,
        onTop: document.elementFromPoint(root.x + root.width / 2, root.y + root.height / 2) === image,
      }
    }))
    expect(found).toEqual([{ root: [48, 48], picture: [0, 0, 48, 48], loaded: true, onTop: true }])
  })
}

/** The two bands of the circle the mark cannot reach: under it, and beside it. A chord 0.6 of the
 * width across sits 0.4 of it from the centre, so both stop 0.9 of the way over, a pixel short of the rim. */
function clearOfMark(box: Box, direction: string): { under: Box; beside: Box } {
  const inset = Math.ceil(box.width / 5)
  const reach = Math.floor(box.width * 0.9) - 1
  const beside = direction === 'rtl' ? box.x + box.width - reach : box.x + MARK
  return {
    under: { x: box.x + inset, y: box.y + MARK, width: box.width - 2 * inset, height: reach - MARK },
    beside: { x: beside, y: box.y + inset, width: reach - MARK, height: MARK - inset },
  }
}

const SETTINGS = [
  { name: 'light', mode: 'light', use: {} },
  { name: 'dark', mode: 'dark', use: {} },
  { name: 'forced colours on the light palette', mode: 'light', use: { forcedColors: 'active', colorScheme: 'light' } },
  { name: 'forced colours on the dark palette', mode: 'light', use: { forcedColors: 'active', colorScheme: 'dark' } },
] as const

for (const setting of SETTINGS) {
  test.describe(`a picture that failed, ${setting.name}`, () => {
    test.use(setting.use)

    for (const direction of DIRECTIONS) {
      test(`${direction}: it prints no alt over the initials, at any size`, async ({ page }) => {
        await page.goto(urlFor('avatar--failed', setting.mode, direction))
        const images = page.locator('#demo img')
        await expect(images).toHaveCount(5)
        const state = await images.evaluateAll((all) => all.map((image) => {
          const img = image as HTMLImageElement
          return { complete: img.complete, natural: img.naturalWidth, color: getComputedStyle(img).color }
        }))
        // Soft, so the pixels below are still read and reported when a class has gone.
        for (const each of state) expect.soft(each).toEqual({ complete: true, natural: 0, color: 'rgba(0, 0, 0, 0)' })

        // The alt is not painted, and it is still the name a screen reader reads.
        await expect(page.getByRole('img', { name: 'Omar Abed' })).toHaveCount(5)

        for (const [index, px] of SCALE.entries()) {
          const root = page.locator('#demo span[data-size]').nth(index)
          const box = await root.boundingBox()
          if (!box) throw new Error('no avatar to measure')
          expect([box.width, box.height]).toEqual([px, px])

          const bands = clearOfMark(box, direction)
          const read = async () => ({
            whole: await shot(page, box),
            under: await shot(page, bands.under),
            beside: await shot(page, bands.beside),
          })
          const withPicture = await read()
          await root.locator('img').evaluate((image) => { (image as HTMLElement).style.visibility = 'hidden' })
          const initialsOnly = await read()

          // The mark is what is left of the picture: were nothing drawn, the two lines below would prove nothing.
          expect(Buffer.compare(withPicture.whole, initialsOnly.whole), `${String(px)} px: no mark is drawn`).not.toBe(0)
          expect.soft(Buffer.compare(withPicture.under, initialsOnly.under), `${String(px)} px: painted over, under the mark`).toBe(0)
          expect.soft(Buffer.compare(withPicture.beside, initialsOnly.beside), `${String(px)} px: painted over, beside the mark`).toBe(0)
        }
      })
    }
  })
}

test('a root named by aria-label alone is an image with that name, and axe passes it', async ({ page }) => {
  await page.goto(urlFor('avatar--icon', 'light', 'ltr'))
  await expect(page.getByRole('img', { name: 'Guest' })).toHaveCount(3)
  const results = await new AxeBuilder({ page }).include('#demo').analyze()
  expect(results.violations.map((v) => `${v.id}: ${String(v.nodes.length)} node(s)`)).toEqual([])
})

/** The fill is all that draws a circle or a placeholder, and forced colours remove it. */
const edges = (elements: Element[]) => elements.map((el) => {
  const style = getComputedStyle(el)
  return {
    style: style.outlineStyle,
    width: style.outlineWidth,
    contrasts: style.outlineColor !== getComputedStyle(document.body).backgroundColor,
  }
})

const SHAPES = '#demo span[data-size], #demo span.animate-pulse'

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('every avatar and every skeleton keeps an edge once the fill is gone', async ({ page }) => {
      await page.goto(urlFor('avatar--skeleton', 'light', 'ltr'))
      const found = await page.locator(SHAPES).evaluateAll(edges)
      expect(found).toHaveLength(10)
      for (const edge of found) expect(edge).toEqual({ style: 'solid', width: '1px', contrasts: true })

      // The pixels too: a skeleton with no edge paints nothing at all here.
      const skeleton = page.locator('#demo span.animate-pulse').first()
      const box = await skeleton.boundingBox()
      if (!box) throw new Error('no skeleton to measure')
      const around = { x: box.x - 2, y: box.y - 2, width: box.width + 4, height: box.height + 4 }
      const drawn = await shot(page, around)
      await skeleton.evaluate((el) => { (el as HTMLElement).style.visibility = 'hidden' })
      expect(Buffer.compare(drawn, await shot(page, around)), 'the skeleton is invisible').not.toBe(0)
    })
  })
}

test('outside forced colours there is no edge: the fill draws the shape', async ({ page }) => {
  await page.goto(urlFor('avatar--skeleton', 'light', 'ltr'))
  const found = await page.locator(SHAPES).evaluateAll(edges)
  expect(found).toHaveLength(10)
  for (const edge of found) expect(edge.style).toBe('none')
})
