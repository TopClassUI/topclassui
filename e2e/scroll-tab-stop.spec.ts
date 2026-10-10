import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { liveErrors, openLive } from './live.js'

// useScrollTabStop on real boxes, with the browser's own ResizeObserver and MutationObserver. No demo
// scrolls yet, so a fixture module is loaded into a live page: the server already serves any source file.
const FIXTURE = '/e2e/fixtures/scroll-tab-stop.tsx'

async function openFixture(page: Page): Promise<void> {
  // A page whose demo holds nothing to tab to, so the fixture owns the whole tab order.
  await openLive(page, 'separator--horizontal')
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await expect(page.locator('#scroll-fixture')).toHaveAttribute('data-ready', '')
}

const tabStop = (page: Page, id: string) => page.locator(`#${id}`)

/** Whether the box really scrolls: the measure the hook must agree with. */
const overflow = (page: Page, id: string) => page.locator(`#${id}`).evaluate((element) => ({
  y: element.scrollHeight - element.clientHeight,
  x: element.scrollWidth - element.clientWidth,
}))

test.beforeEach(async ({ page }) => { await openFixture(page) })

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

test('a box is a tab stop exactly when its content overflows it, on either axis', async ({ page }) => {
  // Twelve rows of 24 px in a box of 120, and one row of 600 px in a box of 240.
  expect(await overflow(page, 'tall')).toEqual({ y: 168, x: 0 })
  expect(await overflow(page, 'short')).toEqual({ y: 0, x: 0 })
  expect((await overflow(page, 'wide')).x).toBeGreaterThan(300)

  await expect(tabStop(page, 'tall')).toHaveAttribute('tabindex', '0')
  await expect(tabStop(page, 'wide')).toHaveAttribute('tabindex', '0')
  for (const id of ['short', 'grows', 'nested', 'text']) await expect(tabStop(page, id)).not.toHaveAttribute('tabindex')
})

test('Tab reaches the boxes that scroll, skips the ones that do not, and the arrow keys then scroll', async ({ page }) => {
  await page.locator('#before').focus()
  await page.keyboard.press('Tab')
  await expect(page.locator('#tall')).toBeFocused()
  await page.keyboard.press('End')
  await expect.poll(() => page.locator('#tall').evaluate((element) => element.scrollTop)).toBe(168)

  await page.keyboard.press('Tab')
  await expect(page.locator('#wide')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('#after')).toBeFocused()
})

test('it follows the content: rows that arrive, rows that leave, a child that grows, and bare text', async ({ page }) => {
  // Rows added straight to the box resize none of the rows already there.
  await page.locator('#grows').evaluate((element) => {
    for (let index = 0; index < 10; index++) element.appendChild(element.lastElementChild?.cloneNode(true) ?? element)
  })
  await expect(tabStop(page, 'grows')).toHaveAttribute('tabindex', '0')
  await page.locator('#grows').evaluate((element) => { while (element.children.length > 2) element.lastElementChild?.remove() })
  await expect(tabStop(page, 'grows')).not.toHaveAttribute('tabindex')

  // A style is no mutation the hook listens for: only the child's new size tells it.
  await page.locator('#inner').evaluate((element) => { element.style.height = '400px' })
  await expect(tabStop(page, 'nested')).toHaveAttribute('tabindex', '0')
  await page.locator('#inner').evaluate((element) => { element.style.height = '24px' })
  await expect(tabStop(page, 'nested')).not.toHaveAttribute('tabindex')

  // Text written on the box itself has no element to resize.
  await page.locator('#text').evaluate((element) => {
    const text = element.firstChild
    if (text) text.nodeValue = 'word '.repeat(400)
  })
  await expect(tabStop(page, 'text')).toHaveAttribute('tabindex', '0')
})

test('it follows the box: one made tall enough for its rows stops being a tab stop', async ({ page }) => {
  await page.locator('#tall').evaluate((element) => { element.style.height = '400px' })
  await expect(tabStop(page, 'tall')).not.toHaveAttribute('tabindex')
  await page.locator('#tall').evaluate((element) => { element.style.height = '120px' })
  await expect(tabStop(page, 'tall')).toHaveAttribute('tabindex', '0')
})

test('the box that has focus keeps its tab stop when it stops scrolling, until the focus leaves', async ({ page }) => {
  await page.locator('#before').focus()
  await page.keyboard.press('Tab')
  await expect(page.locator('#tall')).toBeFocused()

  await page.locator('#tall').evaluate((element) => { while (element.children.length > 2) element.lastElementChild?.remove() })
  expect(await overflow(page, 'tall')).toEqual({ y: 0, x: 0 })
  // Two frames, which is when a ResizeObserver reports: a tab stop that was going to go would be gone by now.
  await page.evaluate(() => new Promise((done) => { requestAnimationFrame(() => { requestAnimationFrame(() => { done(null) }) }) }))
  await expect(tabStop(page, 'tall')).toHaveAttribute('tabindex', '0')
  await expect(page.locator('#tall')).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.locator('#tall')).not.toBeFocused()
  await expect(tabStop(page, 'tall')).not.toHaveAttribute('tabindex')
})

test('axe reports the scrolling box with no hook, and none of the ones that have it', async ({ page }) => {
  const results = await new AxeBuilder({ page }).include('#scroll-fixture').withRules(['scrollable-region-focusable']).analyze()
  const reported = results.violations.flatMap((violation) => violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`))
  expect(reported).toEqual(['scrollable-region-focusable: #bare'])
})
