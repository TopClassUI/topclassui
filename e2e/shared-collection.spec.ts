import { expect, test, type Page } from '@playwright/test'

import { liveErrors, openLive } from './live.js'

// useCollection in Chromium, in a list shaped as Combobox's: see e2e/fixtures/shared-collection.tsx.
// Rows are 40 px, the list pads 6 px, SCROLL_AREA keeps 4 px of scroll padding, and the list is 290 px inside.
const FIXTURE = '/e2e/fixtures/shared-collection.tsx'
const DIRECTIONS = ['ltr', 'rtl'] as const

const list = (page: Page) => page.locator('#collection-list')
const row = (page: Page, index: number) => page.locator(`#collection-list [data-row="${String(index)}"]`)

async function open(page: Page, direction: (typeof DIRECTIONS)[number] = 'ltr'): Promise<void> {
  await openLive(page, 'separator--horizontal', { direction })
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await page.waitForFunction(() => window.collectionFixture !== undefined)
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

/** Scrolls the list itself and waits until the window has caught up with it. */
async function scrollListTo(page: Page, top: number, mounted: number): Promise<void> {
  await list(page).evaluate((node, to) => { node.scrollTop = to }, top)
  await expect(row(page, mounted)).toBeAttached()
}

const scrollTop = (page: Page) => list(page).evaluate((node) => node.scrollTop)

/** A row's top and bottom against the inside of the list's border, in px. */
const placeOf = (page: Page, index: number) => row(page, index).evaluate((node) => {
  const box = node.getBoundingClientRect()
  const frame = node.parentElement?.getBoundingClientRect()
  const inner = (frame?.top ?? 0) + (node.parentElement?.clientTop ?? 0)
  return { top: box.top - inner, bottom: box.bottom - inner, height: node.parentElement?.clientHeight ?? 0 }
})

/** Where the browser's own nearest puts the row from here: a row already placed as it would place it does not move. */
const browserMoves = (page: Page, index: number) => row(page, index).evaluate((node) => {
  const before = node.parentElement?.scrollTop ?? 0
  node.scrollIntoView({ block: 'nearest' })
  return (node.parentElement?.scrollTop ?? 0) - before
})

test('the two spacer tokens are 0px on a page where no list sets them', async ({ page }) => {
  await open(page)
  const values = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return [style.getPropertyValue('--tc-list-pad-start').trim(), style.getPropertyValue('--tc-list-pad-end').trim()]
  })
  expect(values).toEqual(['0px', '0px'])
})

test('a windowed list that sets them inline holds ten thousand rows at their own places, top, middle and end', async ({ page }) => {
  await open(page)
  // 6 + 10,000 x 40 + 6.
  expect(await list(page).evaluate((node) => node.scrollHeight)).toBe(400_012)
  for (const [top, index] of [[0, 0], [200_000, 5_002], [400_000, 9_999]] as const) {
    await scrollListTo(page, top, index)
    const rows = await list(page).evaluate((node) => {
      const frame = node.getBoundingClientRect().top + node.clientTop - node.scrollTop
      return [...node.querySelectorAll('[data-row]')].map((option) => [Number(option.getAttribute('data-row')), option.getBoundingClientRect().top - frame])
    })
    expect(rows.length, `rows mounted at ${String(top)}`).toBeLessThan(40)
    for (const [at, offset] of rows) expect(offset, `row ${String(at)} at ${String(top)}`).toBe(6 + 40 * (at ?? 0))
  }
})

for (const direction of DIRECTIONS) {
  test.describe(`${direction}: scrollToIndex, block nearest`, () => {
    test('a row below the view lands whole on the bottom edge, where scrollIntoView would put it', async ({ page }) => {
      await open(page, direction)
      await page.evaluate(() => { window.collectionFixture?.scrollToIndex(5_000) })
      await expect(row(page, 5_000)).toBeAttached()
      expect(await placeOf(page, 5_000)).toEqual({ top: 246, bottom: 286, height: 290 })
      expect(await browserMoves(page, 5_000)).toBe(0)
    })

    test('a row above the view lands whole on the top edge, where scrollIntoView would put it', async ({ page }) => {
      await open(page, direction)
      await scrollListTo(page, 200_000, 5_002)
      await page.evaluate(() => { window.collectionFixture?.scrollToIndex(1_000) })
      await expect(row(page, 1_000)).toBeAttached()
      expect(await placeOf(page, 1_000)).toEqual({ top: 4, bottom: 44, height: 290 })
      expect(await browserMoves(page, 1_000)).toBe(0)
    })

    test('a row already in view moves nothing', async ({ page }) => {
      await open(page, direction)
      await scrollListTo(page, 200_000, 5_002)
      const before = await placeOf(page, 5_002)
      await page.evaluate(() => { window.collectionFixture?.scrollToIndex(5_002) })
      expect(await scrollTop(page)).toBe(200_000)
      expect(await placeOf(page, 5_002)).toEqual(before)
    })
  })
}
