import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1: a tag is text, never a stop; its x is a button that Tab reaches and Enter or Space presses, and a
// linked tag is a link. Where the focus goes after a removal is the caller's (the demo moves it to the next x).

const TOPICS = ['Design systems', 'Accessibility', 'React', 'Tailwind', 'Right to left', 'Server Components']
/** The tag whose x has the focus, read from the list item around it. */
const focusedTag = (page: Page) => page.evaluate(() => document.activeElement?.closest('li')?.textContent.trim() ?? null)
const topics = (page: Page) => page.locator('#demo ul li').evaluateAll((all) => all.map((item) => item.textContent.trim()))

async function tabTo(page: Page, topic: string): Promise<void> {
  await page.keyboard.press('Tab')
  await expect.poll(() => focusedTag(page)).toBe(topic)
}

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab and Shift+Tab go from x to x, never stopping on a tag, with a ring on each', async ({ page }) => {
      await openLive(page, 'tag--removable', { direction })
      for (const topic of TOPICS) {
        await tabTo(page, topic)
        expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BUTTON')
        await expectRing(page, `the x of ${topic}`)
      }
      await page.keyboard.press('Shift+Tab')
      await expect.poll(() => focusedTag(page)).toBe('Right to left')
    })

    for (const key of ['Enter', 'Space'] as const) {
      test(`${key} on an x removes its tag, and the demo puts the focus on the x that took its place`, async ({ page }) => {
        await openLive(page, 'tag--removable', { direction })
        for (const topic of TOPICS.slice(0, 3)) await tabTo(page, topic)
        await page.keyboard.press(key)
        await expect.poll(() => topics(page)).toEqual(['Design systems', 'Accessibility', 'Tailwind', 'Right to left', 'Server Components'])
        await expect.poll(() => focusedTag(page)).toBe('Tailwind')
        await expectRing(page, 'the x that took its place')
      })
    }

    test('a linked tag is a link: Tab reaches it with its ring and Enter follows it', async ({ page }) => {
      await openLive(page, 'tag--link', { direction })
      await page.keyboard.press('Tab')
      await expect.poll(() => focused(page)).toBe('Design systems')
      await expectRing(page, 'the linked tag')
      await page.keyboard.press('Enter')
      await expect.poll(() => page.evaluate(() => location.hash)).toBe('#design-systems')
    })

    test('a plain tag is no tab stop', async ({ page }) => {
      await openLive(page, 'tag--tones', { direction })
      await page.keyboard.press('Tab')
      expect(await focused(page)).toBe('(nothing)')
    })
  })
}
