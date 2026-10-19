import { inflateSync } from 'node:zlib'

import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

// The marker is the only thing that tells a sighted reader the tone and the status of an
// item, so it is measured as painted. A class name cannot see a fill that matches the page.
type Rgb = readonly [number, number, number]

/** One painted pixel. A 1 x 1 PNG has no neighbour to filter against, so its bytes are the colour. */
async function pixel(page: Page, x: number, y: number): Promise<Rgb> {
  const png = await page.screenshot({ clip: { x: Math.floor(x), y: Math.floor(y), width: 1, height: 1 } })
  if (png[24] !== 8 || (png[25] !== 2 && png[25] !== 6)) throw new Error('not an 8-bit RGB screenshot')
  const data: Buffer[] = []
  for (let at = 8; at < png.length; at += png.readUInt32BE(at) + 12) {
    if (png.toString('latin1', at + 4, at + 8) === 'IDAT') data.push(png.subarray(at + 8, at + 8 + png.readUInt32BE(at)))
  }
  const [, r = 0, g = 0, b = 0] = inflateSync(Buffer.concat(data))
  return [r, g, b]
}

const linear = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)
const luminance = ([r, g, b]: Rgb) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)

/** WCAG contrast, from 1 to 21. */
function contrast(a: Rgb, b: Rgb): number {
  const [la, lb] = [luminance(a), luminance(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const DOT = '#demo li > :first-child > :first-child > :first-child'

/** Each marker with three pixels of it: the stroke at the top, 2 px under it, and the middle. */
async function markers(page: Page) {
  const found = []
  for (const dot of await page.locator(DOT).all()) {
    const box = await dot.boundingBox()
    if (!box) throw new Error('a marker has no box')
    const middle = box.x + box.width / 2
    found.push({
      box,
      edge: await pixel(page, middle, box.y),
      gap: await pixel(page, middle, box.y + 2),
      centre: await pixel(page, middle, box.y + box.height / 2),
    })
  }
  return found
}

for (const mode of MODES) {
  test(`${mode}: every toned marker holds 3:1 against the page, the amber one included`, async ({ page }) => {
    await page.goto(urlFor('timeline--tones', mode, 'ltr'))
    const canvas = await pixel(page, 1, 1)
    const dots = await markers(page)
    expect(dots).toHaveLength(6)
    for (const [index, dot] of dots.entries()) {
      expect(contrast(dot.edge, canvas), `the edge of marker ${String(index)}`).toBeGreaterThanOrEqual(3)
    }
  })
}

const FORCED = [
  { theme: 'light', palette: 'dark', canvas: [0, 0, 0] },
  { theme: 'dark', palette: 'light', canvas: [255, 255, 255] },
] as const

for (const { theme, palette, canvas } of FORCED) {
  test(`forced colours, a ${palette} palette over the ${theme} theme: no marker matches the canvas`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active', colorScheme: palette })
    await page.goto(urlFor('timeline--tones', theme, 'ltr'))
    // The palette's canvas and not the theme's page, or this measures nothing new.
    expect(await pixel(page, 1, 1)).toEqual(canvas)
    const dots = await markers(page)
    expect(dots).toHaveLength(6)
    for (const [index, dot] of dots.entries()) {
      expect(contrast(dot.centre, canvas), `the fill of marker ${String(index)}`).toBeGreaterThanOrEqual(3)
      expect(contrast(dot.edge, canvas), `the edge of marker ${String(index)}`).toBeGreaterThanOrEqual(3)
    }
  })

  test(`forced colours, a ${palette} palette over the ${theme} theme: done, current and todo keep three shapes`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active', colorScheme: palette })
    await page.goto(urlFor('timeline--basic', theme, 'ltr'))
    const [done, , current, todo] = await markers(page)
    if (!done || !current || !todo) throw new Error('the basic demo lost a status')
    expect(contrast(done.gap, canvas), 'done is filled to its stroke').toBeGreaterThanOrEqual(3)
    expect(contrast(current.gap, canvas), 'current has a gap under its stroke').toBeLessThan(1.2)
    expect(contrast(current.centre, canvas), 'current has a dot in the middle').toBeGreaterThanOrEqual(3)
    expect(contrast(todo.centre, canvas), 'todo is hollow').toBeLessThan(1.2)
    expect(contrast(todo.edge, canvas), 'todo keeps its stroke').toBeGreaterThanOrEqual(3)
  })
}

for (const mode of MODES) {
  test(`${mode}: done and current are filled to the stroke as the previewer draws them, inside the same 12 px box`, async ({ page }) => {
    await page.goto(urlFor('timeline--basic', mode, 'ltr'))
    const canvas = await pixel(page, 1, 1)
    const [done, , current, todo] = await markers(page)
    if (!done || !current || !todo) throw new Error('the basic demo lost a status')
    expect(contrast(done.gap, canvas), 'done is filled to its stroke').toBeGreaterThanOrEqual(3)
    expect(contrast(current.gap, canvas), 'current is filled to its stroke').toBeGreaterThanOrEqual(3)
    expect(contrast(current.centre, canvas), 'current is filled in the middle').toBeGreaterThanOrEqual(3)
    // The raised surface: white on a light page, one step up on a dark one, never a tone.
    expect(contrast(todo.centre, canvas), 'todo is a ring on the raised surface').toBeLessThan(1.5)
    expect(contrast(todo.edge, canvas), 'todo keeps its stroke').toBeGreaterThanOrEqual(3)
    expect([current.box.width, current.box.height]).toEqual([12, 12])
    expect([done.box.width, done.box.height]).toEqual([12, 12])
    // Nothing is drawn outside the box, where a scrolling or clipping parent would cut it.
    const outside = await page.locator(DOT).nth(2).evaluate((el) => {
      const style = getComputedStyle(el)
      return [style.outlineStyle, style.boxShadow]
    })
    expect(outside).toEqual(['none', 'none'])
  })
}

for (const direction of DIRECTIONS) {
  test(`${direction}: the marker centres on the first line and the connector grows with the item`, async ({ page }) => {
    await page.goto(urlFor('timeline--long-text', 'light', direction))
    const rows = await page.locator('#demo li').evaluateAll((items) => items.map((li) => {
      const [rail, body] = li.children
      const dot = rail?.firstElementChild?.firstElementChild?.getBoundingClientRect()
      const connector = rail?.children[1]?.getBoundingClientRect()
      const line = document.createRange()
      // The first thing a reader sees in the body: the hidden status text is not it.
      const title = body?.querySelector(':scope > :not(.sr-only)')
      if (!dot || !title) throw new Error('an item lost its marker or its title')
      line.selectNodeContents(title)
      const first = line.getClientRects()[0]
      const item = li.getBoundingClientRect()
      return {
        height: item.height,
        bottom: item.bottom,
        dotMiddle: dot.y + dot.height / 2,
        dotAxis: dot.x + dot.width / 2,
        lineMiddle: first ? first.y + first.height / 2 : Number.NaN,
        connector: connector ? { height: connector.height, bottom: connector.bottom, axis: connector.x + connector.width / 2 } : null,
      }
    }))

    expect(rows).toHaveLength(3)
    for (const row of rows) expect(Math.abs(row.dotMiddle - row.lineMiddle)).toBeLessThanOrEqual(0.5)

    // A wrapped title and a broken URL make the first two items taller than one line each.
    const [wrapped, url, last] = rows
    expect(wrapped?.height).toBeGreaterThan(100)
    expect(url?.height).toBeGreaterThan(80)
    for (const row of [wrapped, url]) {
      // The marker box is 20 px around a 12 px dot: the connector starts under the dot and ends at the next one, 4 px into it.
      expect(row?.connector?.height).toBe((row?.height ?? 0) - 20 + 8)
      expect(row?.connector?.bottom).toBe((row?.bottom ?? 0) + 4)
      expect(row?.connector?.axis).toBe(row?.dotAxis)
    }
    expect(last?.connector).toBeNull()
  })
}

test('the status of each item is in the accessibility tree, before its title', async ({ page }) => {
  await page.goto(urlFor('timeline--basic', 'light', 'ltr'))
  await expect(page.locator('#demo')).toMatchAriaSnapshot(`
    - list:
      - listitem:
        - text: Done Project created
        - time: 2 October, 09:12
      - listitem:
        - text: Done First deploy
        - time: 4 October, 16:40
      - listitem: Current In review Today
      - listitem: Not started Launch Not scheduled
  `)
})

test('the Arabic labels say the status in Arabic', async ({ page }) => {
  await page.goto(urlFor('timeline--rtl', 'light', 'rtl'))
  await expect(page.locator('#demo')).toMatchAriaSnapshot(`
    - list:
      - listitem: مكتمل أُنشئ المشروع ٢ أكتوبر، ٠٩:١٢
      - listitem: مكتمل وصلت الدفعة ٤ أكتوبر، ١٦:٤٠
      - listitem: الحالي قيد المراجعة اليوم
      - listitem: لم يبدأ الإطلاق لم يُحدَّد موعده
  `)
})
