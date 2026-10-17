import { expect, test } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focused, pressTo } from './keyboard.js'
import { openLive } from './live.js'

// R-5.6-1: a navigation landmark of plain links. The Authoring Practices give it no keys of its own: Tab and
// Shift+Tab go through the brand, the links and the actions in the order they are read, each with its ring,
// no arrow key moves the focus, and Enter follows the focused link.

const BAR = ['TopClass UI', 'Docs', 'Components', 'Icons', 'Theming', 'Sign in']

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('Tab and Shift+Tab go through the brand, every link and the action in reading order, each with its ring', async ({ page }) => {
      await openLive(page, 'navbar--basic', { direction })
      for (const name of BAR) {
        await pressTo(page, 'Tab', name)
        await expectRing(page, name)
      }
      for (const name of [...BAR].reverse().slice(1)) await pressTo(page, 'Shift+Tab', name)
    })

    test('no arrow key, Home or End moves the focus off a link', async ({ page }) => {
      await openLive(page, 'navbar--basic', { direction })
      await pressTo(page, 'Tab', 'TopClass UI')
      await pressTo(page, 'Tab', 'Docs')
      for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']) {
        await page.keyboard.press(key)
        expect(await focused(page), key).toBe('Docs')
      }
    })

    test('Enter follows the focused link, and the link of the page being read says so', async ({ page }) => {
      await openLive(page, 'navbar--basic', { direction })
      await pressTo(page, 'Tab', 'TopClass UI')
      await pressTo(page, 'Tab', 'Docs')
      expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-current'))).toBe('page')
      await pressTo(page, 'Tab', 'Components')
      const request = page.waitForRequest((sent) => new URL(sent.url()).pathname === '/components')
      await page.keyboard.press('Enter')
      await request
    })

    test('with a search field: Tab reaches it after the links, and the avatar is no stop', async ({ page }) => {
      await openLive(page, 'navbar--with-search', { direction })
      for (const name of ['TopClass UI', 'Docs', 'Components', 'Icons', 'Search the docs']) await pressTo(page, 'Tab', name)
      await expectRing(page, 'the search field')
      await page.keyboard.press('Tab')
      expect(await focused(page)).not.toBe('Omar Abed')
    })
  })
}
