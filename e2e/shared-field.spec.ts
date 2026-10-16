import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS, type Direction } from '../scripts/lib/harness.js'
import { expectNoSidewaysScroll, openLive } from './live.js'
import { boxOf } from './overlay.js'

// What the shared field classes promise and only a browser can show, on the stand-in of e2e/fixtures/shared-field.tsx:
// a box the browser gives no width is as wide as an Input wherever an Input would be, and never wider than its room.

async function fixture(page: Page, direction: Direction = 'ltr'): Promise<void> {
  await openLive(page, 'separator--horizontal', { direction })
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/shared-field.tsx' })
  await expect(page.locator('#invalid input')).toBeVisible()
}

/** Width and height to a tenth of a pixel: 13.8em of 14 px is 193.2. */
const sizeOf = async (page: Page, selector: string) => {
  const { width, height } = await boxOf(page.locator(selector))
  return [Math.round(width * 10) / 10, Math.round(height * 10) / 10]
}

const widths = (page: Page, ids: readonly string[]) => Promise.all(ids.map(async (id) => (await sizeOf(page, `#${id}`))[0]))

/** A colour as this page resolves it, from a probe that carries none of the field classes. */
const resolved = (page: Page, value: string) => page.evaluate((colour) => {
  const probe = document.createElement('span')
  probe.style.setProperty('color', colour)
  document.body.appendChild(probe)
  const found = getComputedStyle(probe).color
  probe.remove()
  return found
}, value)

const style = (page: Page, selector: string, property: string) =>
  page.locator(selector).evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)

test.describe('1280 px, a fine pointer', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('at each size the box is the width and the height of an Input of that size', async ({ page }) => {
    await fixture(page)
    expect(await Promise.all(['xs', 'sm', 'md', 'lg', 'xl'].map((size) => sizeOf(page, `#size-${size}`)))).toEqual([
      [165.6, 28], [193.2, 32], [193.2, 40], [220.8, 48], [220.8, 56],
    ])
    expect(await sizeOf(page, '#input-a')).toEqual([193.2, 40])
  })

  test('in a parent that sizes to its content it is an Input wide, whether its text is a name or a 300-character word', async ({ page }) => {
    await fixture(page)
    expect(await widths(page, ['fit-short', 'fit-long', 'alone'])).toEqual([193.2, 193.2, 193.2])
    await expectNoSidewaysScroll(page)
  })

  test('with fullWidth it fills its parent', async ({ page }) => {
    await fixture(page)
    expect((await boxOf(page.locator('#full'))).width).toBe((await boxOf(page.locator('#full-parent'))).width)
    expect((await boxOf(page.locator('#full'))).width).toBeGreaterThan(1000)
  })

  test('a box whose field is invalid turns its line red and draws a ring inside it; a valid one does neither', async ({ page }) => {
    await fixture(page)
    const danger = await resolved(page, 'var(--tc-danger-solid)')
    expect(await style(page, '#invalid [data-box]', 'border-top-color')).toBe(danger)
    // A 1 px inset ring inside the 1 px line: 2 px of red, the ring width.
    expect(await style(page, '#invalid [data-box]', 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    expect(await style(page, '#alone [data-box]', 'border-top-color')).not.toBe(danger)
    expect(await style(page, '#alone [data-box]', 'box-shadow')).not.toContain('inset')
  })
})

for (const [width, pair, label] of [[320, 140, 133.5], [390, 175, 203.5]] as const) {
  for (const direction of DIRECTIONS) {
    test.describe(`${String(width)} px, a coarse pointer, ${direction}`, () => {
      test.use({ viewport: { width, height: 800 }, hasTouch: true, isMobile: true })

      test('two side by side are as wide as two Inputs, in a grid of 1fr 1fr and in a flex row, and the page stays put', async ({ page }) => {
        await fixture(page, direction)
        expect(await widths(page, ['input-a', 'input-b'])).toEqual([pair, pair])
        expect(await widths(page, ['pair-a', 'pair-b', 'row-a', 'row-b'])).toEqual([pair, pair, pair, pair])
        expect(await widths(page, ['beside-label'])).toEqual([label])
        await expectNoSidewaysScroll(page)
      })

      test('alone it is an Input wide at 16 px text, 44 px tall, in a block and in a parent that sizes to its content', async ({ page }) => {
        await fixture(page, direction)
        for (const id of ['alone', 'size-xs', 'fit-short', 'fit-long']) expect(await sizeOf(page, `#${id}`), id).toEqual([220.8, 44])
        await expectNoSidewaysScroll(page)
      })
    })
  }
}

test.describe('390 px, a coarse pointer, a root of 10 px', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('at every size the type step is 16 px and the box is an Input wide, so typed text never zooms the page', async ({ page }) => {
    await fixture(page)
    await page.evaluate(() => { document.documentElement.style.fontSize = '10px' })
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'].map((size) => `#size-${size}`)
    expect(await Promise.all(sizes.map((id) => style(page, id, 'font-size')))).toEqual(Array(5).fill('16px'))
    expect(await Promise.all(sizes.map(async (id) => (await sizeOf(page, id))[0]))).toEqual(Array(5).fill(220.8))
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('the line of a box whose field is invalid grows to the ring width, since the inset ring is not painted', async ({ page }) => {
      await fixture(page)
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      expect(await style(page, '#invalid [data-box]', 'border-top-width')).toBe('2px')
      expect(await style(page, '#alone [data-box]', 'border-top-width')).toBe('1px')
    })
  })
}
