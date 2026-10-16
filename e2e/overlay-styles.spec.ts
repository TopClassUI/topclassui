import { expect, test, type Page } from '@playwright/test'

import { MODES, PAGE_CANDIDATES, candidatesIn, compileCss, pageHtml, type Mode } from '../scripts/lib/harness.js'
import {
  FOCUS_RING, FOCUS_RING_INSET, FOCUS_RING_WITHIN, LIST_CAP, OVERLAY_SURFACE, ROW, ROW_HIGHLIGHT, SCROLL_AREA,
  STICKY_TOP,
} from '../src/shared/classes.js'
import { type Clip, type Rgb, contrast, inkOn, insideRing, paintedIn, pixelsOf, rgbOf, strayOn } from './pixels.js'

// The class constants every overlay of Unit 3 shares, measured before a component wears one:
// a class compiles on its own, and that says nothing of what two of them paint together.

/** A scratch page: the harness's own shell around markup no demo holds, with the stylesheet compiled for it. */
async function scratch(page: Page, body: string, mode: Mode = 'light'): Promise<void> {
  const css = await compileCss(process.cwd(), [...candidatesIn(body), ...PAGE_CANDIDATES])
  await page.setContent(pageHtml({ mode, direction: 'ltr', demo: 'scratch', body }, css))
}

async function boxOf(page: Page, selector: string): Promise<Clip> {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error(`nothing to measure at ${selector}`)
  return box
}

/** The radius of a box's corners, in px. */
const radiusOf = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => Number.parseFloat(getComputedStyle(el).borderTopLeftRadius))

/** One painted pixel. */
async function pixelAt(page: Page, x: number, y: number): Promise<Rgb> {
  const [pixel] = await pixelsOf(page, { x, y, width: 1, height: 1 })
  if (!pixel) throw new Error('no pixel was read')
  return pixel
}

/** The rectangle of an element's own text, which is where forced colours lay a backplate. */
const textOf = (page: Page, selector: string): Promise<Clip> => page.locator(selector).evaluate((el) => {
  const range = document.createRange()
  range.selectNodeContents(el)
  const { x, y, width, height } = range.getBoundingClientRect()
  return { x, y, width, height }
})

/** The palette's own Highlight and HighlightText, asked of the browser and not written here. */
const systemPair = (page: Page) => page.evaluate(() => {
  const probe = document.createElement('i')
  probe.style.backgroundColor = 'Highlight'
  probe.style.color = 'HighlightText'
  document.body.append(probe)
  const style = getComputedStyle(probe)
  const pair = { fill: style.backgroundColor, text: style.color }
  probe.remove()
  return pair
})

const row = (name: string, highlighted = false) =>
  `<div role="menuitem" id="${name.toLowerCase()}"${highlighted ? ' data-highlighted' : ''} class="${ROW} ${ROW_HIGHLIGHT}">${name}</div>`

/** Three rows on the surface a menu sits on; the attribute Base UI sets is on the middle one. */
const MENU = `<div role="menu" class="${OVERLAY_SURFACE} w-64 p-1.5">${row('Rename')}${row('Duplicate', true)}${row('Archive')}</div>`

/** Two controls flush against a box that clips: one with the ring inside its own box, one with it outside. */
const CLIPPED = `<div class="w-48 overflow-hidden">
<button id="inset" type="button" class="${FOCUS_RING_INSET} block h-control-md w-full text-sm">Inset</button>
<button id="outside" type="button" class="${FOCUS_RING} block h-control-md w-full text-sm">Outside</button>
</div>`

/** The two pixels just inside each edge of a box, which is where an inset ring 2 px wide sits. */
const insideEdges = (box: Clip): Record<string, Clip> => ({
  top: { x: box.x, y: box.y, width: box.width, height: 2 },
  bottom: { x: box.x, y: box.y + box.height - 2, width: box.width, height: 2 },
  start: { x: box.x, y: box.y, width: 2, height: box.height },
  end: { x: box.x + box.width - 2, y: box.y, width: 2, height: box.height },
})

/** The four pixels past the three edges that touch the parent: where a ring with an offset would be. */
const outsideEdges = (box: Clip): Record<string, Clip> => ({
  bottom: { x: box.x, y: box.y + box.height, width: box.width, height: 4 },
  start: { x: box.x - 4, y: box.y, width: 4, height: box.height },
  end: { x: box.x + box.width, y: box.y, width: 4, height: box.height },
})

/** Tabs to the inset control and reads its four edges: each is ring from end to end. */
async function expectWholeInsetRing(page: Page): Promise<void> {
  const canvas = await pixelAt(page, 1, 1)
  await page.keyboard.press('Tab')
  await expect(page.locator('#inset')).toBeFocused()
  await expect(page.locator('#inset')).toHaveCSS('outline-style', 'solid')
  await expect(page.locator('#inset')).toHaveCSS('outline-offset', '-2px')
  for (const [side, band] of Object.entries(insideEdges(await boxOf(page, '#inset')))) {
    const pixels = await pixelsOf(page, band)
    expect(inkOn(pixels, canvas), `pixels of ring at 3:1 along the ${side} edge`).toBeGreaterThan(pixels.length * 0.9)
  }
}

for (const mode of MODES) {
  test(`${mode}: a highlighted row is a filled box with its label read on it, and no other row is`, async ({ page }) => {
    await scratch(page, MENU, mode)
    const [plain, lit] = [await boxOf(page, '#rename'), await boxOf(page, '#duplicate')]
    // --tc-row-height at the default density.
    expect([plain.height, lit.height]).toEqual([40, 40])

    // A soft tint on the raised surface: measured 1.19 in light, 1.11 in dark and 1.18 in ocean.
    const surface = await pixelAt(page, plain.x + 2, plain.y + 2)
    const fill = await pixelAt(page, lit.x + lit.width - 12, lit.y + lit.height / 2)
    expect(contrast(fill, surface), 'the fill against the surface of the menu').toBeGreaterThan(1.05)
    expect(paintedIn(await pixelsOf(page, lit), fill), 'pixels of fill in the highlighted row').toBeGreaterThan(lit.width * lit.height * 0.8)
    expect(paintedIn(await pixelsOf(page, plain), fill), 'pixels of fill in another row').toBe(0)

    // The fill is not the only cue: the label changes colour with it, and is read on it.
    const colours = await page.locator('[role="menuitem"]').evaluateAll((all) => all.map((el) => getComputedStyle(el).color))
    expect(colours[0]).toBe(colours[2])
    expect(colours[1]).not.toBe(colours[0])
    const label = await pixelsOf(page, await textOf(page, '#duplicate'))
    expect(inkOn(label, fill, 4.5), 'pixels of label at 4.5:1 on the fill').toBeGreaterThan(40)
  })

  // R-5.6-1: the fill is 1.1 to 1.2:1 against the surface, too faint to be the only mark of the focus.
  test(`${mode}: the highlighted row is ringed inside its edge at 3:1 against the menu, and no other row is`, async ({ page }) => {
    await scratch(page, MENU, mode)
    await expect(page.locator('#duplicate')).toHaveCSS('outline-style', 'solid')
    await expect(page.locator('#duplicate')).toHaveCSS('outline-offset', '-2px')
    await expect(page.locator('#rename')).toHaveCSS('outline-style', 'none')
    const [plain, lit] = [await boxOf(page, '#rename'), await boxOf(page, '#duplicate')]
    const radius = await radiusOf(page, '#duplicate')
    const surface = await pixelAt(page, plain.x + 2, plain.y + 2)
    for (const [side, band] of Object.entries(insideRing(lit, radius))) {
      const pixels = await pixelsOf(page, band)
      expect(inkOn(pixels, surface), `pixels of ring at 3:1 along the ${side} edge`).toBeGreaterThan(pixels.length * 0.9)
    }
    for (const [side, band] of Object.entries(insideRing(plain, radius))) {
      expect(inkOn(await pixelsOf(page, band), surface), `pixels of ring along the ${side} edge of another row`).toBe(0)
    }
  })

  test(`${mode}: the inset ring is whole inside a parent that clips, where the ring with an offset is cut`, async ({ page }) => {
    await scratch(page, CLIPPED, mode)
    const canvas = await pixelAt(page, 1, 1)
    await expectWholeInsetRing(page)

    // The control beside it, or this page would prove nothing: its ring is outside its box, and gone.
    await page.keyboard.press('Tab')
    await expect(page.locator('#outside')).toBeFocused()
    await expect(page.locator('#outside')).toHaveCSS('outline-style', 'solid')
    for (const [side, band] of Object.entries(outsideEdges(await boxOf(page, '#outside')))) {
      expect(strayOn(await pixelsOf(page, band), canvas), `pixels painted past the ${side} edge`).toBe(0)
    }
  })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    // Forced colours erase a fill, and the fill was most of what marked the row.
    test('a highlighted row takes the system pair, with its label painted on the fill', async ({ page }) => {
      await scratch(page, MENU)
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const pair = await systemPair(page)
      await expect(page.locator('#duplicate')).toHaveCSS('background-color', pair.fill)
      await expect(page.locator('#duplicate')).toHaveCSS('color', pair.text)

      const fill = rgbOf(pair.fill)
      const [plain, lit] = [await boxOf(page, '#rename'), await boxOf(page, '#duplicate')]
      expect(paintedIn(await pixelsOf(page, lit), fill), 'pixels of fill in the highlighted row').toBeGreaterThan(lit.width * lit.height * 0.8)
      expect(paintedIn(await pixelsOf(page, plain), fill), 'pixels of fill in another row').toBe(0)

      // A backplate covers every pixel of fill inside the rectangle of the label.
      const label = await pixelsOf(page, await textOf(page, '#duplicate'))
      expect(paintedIn(label, fill), 'pixels of fill around the label').toBeGreaterThan(200)
      expect(inkOn(label, fill, 4.5), 'pixels of label at 4.5:1 on the fill').toBeGreaterThan(40)
    })

    test('the ring of a highlighted row is HighlightText, drawn inside its edge on the Highlight', async ({ page }) => {
      await scratch(page, MENU)
      const pair = await systemPair(page)
      await expect(page.locator('#duplicate')).toHaveCSS('outline-color', pair.text)
      const lit = await boxOf(page, '#duplicate')
      for (const [side, band] of Object.entries(insideRing(lit, await radiusOf(page, '#duplicate')))) {
        const pixels = await pixelsOf(page, band)
        expect(inkOn(pixels, rgbOf(pair.fill)), `pixels of ring at 3:1 along the ${side} edge`).toBeGreaterThan(pixels.length * 0.9)
      }
    })

    test('the inset ring is whole inside a parent that clips', async ({ page }) => {
      await scratch(page, CLIPPED)
      await expectWholeInsetRing(page)
    })
  })
}

/** A bar that sticks, a target a screen and a half below it, and as much again under that. */
const STICKY_PAGE = `<header id="bar" class="${STICKY_TOP} h-16 bg-surface-raised">Bar</header>
<div class="h-[150vh]"></div>
<p id="target" class="relative bg-surface"><a id="link" href="#target">Target</a></p>
<div class="h-[150vh]"></div>`

const topOf = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => Math.round(el.getBoundingClientRect().top))

test('a target scrolled into view lands below a sticky bar that sets --tc-sticky-top', async ({ page }) => {
  await scratch(page, STICKY_PAGE)

  // No bar has said how tall it is, so nothing is kept clear and the target goes under it.
  await page.locator('#target').evaluate((el) => { el.scrollIntoView() })
  expect(await topOf(page, '#bar')).toBe(0)
  expect(await topOf(page, '#target')).toBe(0)

  // As the Navbar will: its own height in px, on the root.
  await page.evaluate(() => {
    scrollTo(0, 0)
    document.documentElement.style.setProperty('--tc-sticky-top', '64px')
  })
  await page.locator('#target').evaluate((el) => { el.scrollIntoView() })
  expect(await topOf(page, '#bar')).toBe(0)
  expect(await topOf(page, '#target')).toBe(64)
  const painted = await page.locator('#link').evaluate((el) => {
    const { x, y } = el.getBoundingClientRect()
    return document.elementFromPoint(x + 2, y + 2)?.id
  })
  expect(painted, 'what is painted where the target begins').toBe('link')

  // Scrolled on, a positioned element passes under the bar and not over it: the z-index of STICKY_TOP.
  await page.evaluate(() => { scrollBy(0, 40) })
  expect(await topOf(page, '#target')).toBe(24)
  const over = await page.locator('#target').evaluate((el) => {
    const { x, y } = el.getBoundingClientRect()
    return document.elementFromPoint(x + 2, y + 2)?.id
  })
  expect(over, 'what is painted where the bar and the target overlap').toBe('bar')
})

test('a link that takes focus under a sticky bar is scrolled clear of it, at the top and at the bottom', async ({ page }) => {
  await scratch(page, STICKY_PAGE)
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--tc-sticky-top', '64px')
    document.documentElement.style.setProperty('--tc-sticky-bottom', '48px')
  })
  const link = page.locator('#link')

  // 10 px from the top: inside the viewport, so with no padding the browser would leave it there.
  await link.evaluate((el) => { scrollBy(0, el.getBoundingClientRect().top - 10) })
  expect(await topOf(page, '#link')).toBe(10)
  await link.focus()
  expect(await topOf(page, '#link'), 'px from the top to the focused link').toBeGreaterThanOrEqual(64)

  // And 10 px from the bottom, where a bar that sets --tc-sticky-bottom would cover it.
  await link.evaluate((el) => {
    (el as HTMLElement).blur()
    scrollBy(0, el.getBoundingClientRect().bottom - innerHeight + 10)
  })
  const room = () => link.evaluate((el) => Math.round(innerHeight - el.getBoundingClientRect().bottom))
  expect(await room()).toBe(10)
  await link.focus()
  expect(await room(), 'px from the focused link to the bottom').toBeGreaterThanOrEqual(48)
})

/** Sixty rows in a list with the padding and the gap a menu gives it. */
const LIST = `<div id="list" class="${LIST_CAP} ${SCROLL_AREA} flex w-64 flex-col gap-0.5 p-1.5">${
  Array.from({ length: 60 }, (_, index) => `<div class="${ROW}">Row ${String(index + 1)}</div>`).join('')
}</div>`

test('the list cap is seven rows tall, cuts the last row it shows, and gives way to the room Base UI measured', async ({ page }) => {
  await scratch(page, LIST)
  const list = page.locator('#list')
  // --tc-list-rows times --tc-row-height: 7 x 40. No row shrinks to fit: each keeps its 40.
  expect((await boxOf(page, '#list')).height).toBe(280)
  expect(await list.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
  expect(await list.locator('> div').evaluateAll((rows) => [...new Set(rows.map((el) => el.getBoundingClientRect().height))])).toEqual([40])

  // Rows only, not the padding or the gaps: a row cut short says there is more.
  const cut = await list.evaluate((el) => {
    const edge = el.getBoundingClientRect().bottom
    return [...el.children].filter((child) => {
      const box = child.getBoundingClientRect()
      return box.top < edge && box.bottom > edge
    }).length
  })
  expect(cut, 'rows that cross the bottom edge of the list').toBe(1)

  await list.evaluate((el) => { el.style.setProperty('--available-height', '120px') })
  expect((await boxOf(page, '#list')).height).toBe(120)

  await list.evaluate((el) => {
    el.style.removeProperty('--available-height')
    el.style.setProperty('--tc-list-rows', '3')
  })
  expect((await boxOf(page, '#list')).height).toBe(120)
})

const WITHIN = `<label id="wrap" class="${FOCUS_RING_WITHIN} inline-flex h-control-md items-center rounded-control px-3 text-sm">
<input type="radio" name="scratch" class="sr-only">One</label>`

test('the ring-within paints around a label once the hidden input inside it has keyboard focus', async ({ page }) => {
  await scratch(page, WITHIN)
  const wrap = page.locator('#wrap')
  const canvas = await pixelAt(page, 1, 1)
  const box = await boxOf(page, '#wrap')
  const band = { x: box.x - 6, y: box.y - 6, width: box.width + 12, height: 5 }
  await expect(wrap).toHaveCSS('outline-style', 'none')
  expect(strayOn(await pixelsOf(page, band), canvas), 'pixels painted over the label at rest').toBe(0)

  await page.keyboard.press('Tab')
  await expect(page.locator('#wrap input')).toBeFocused()
  await expect(wrap).toHaveCSS('outline-style', 'solid')
  await expect(wrap).toHaveCSS('outline-width', '2px')
  await expect(wrap).toHaveCSS('outline-offset', '2px')
  // A whole row as wide as the label, or it is a corner and not a ring.
  expect(inkOn(await pixelsOf(page, band), canvas), 'pixels of ring at 3:1 over the label').toBeGreaterThanOrEqual(Math.floor(box.width))
})
