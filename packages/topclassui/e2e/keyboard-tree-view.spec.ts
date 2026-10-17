import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, pageScroll } from './keys.js'
import { liveErrors, openLive } from './live.js'
import { urlFor } from './pages.js'

// R-5.6-1, the Authoring Practices tree view, beside tree-view.spec.ts, which measures what each arrow, Home, End,
// Enter and a letter do: here Space and Enter on leaves, that no key the tree handles also scrolls a tall page, the
// one tab stop of the aria-activedescendant pattern from either side, and the ring on the row the keys are on.

const tree = (page: Page) => page.locator('#demo [role="tree"]').first()
/** The selected rows among those shown: a closed branch hides its rows. */
const selected = (page: Page) => page.locator('#demo [role="treeitem"][aria-selected="true"]').evaluateAll((rows) => rows.map((row) => row.textContent))
const highlighted = (page: Page) => page.locator('#demo [data-highlighted]').textContent()
const rows = (page: Page) => page.locator('#demo [role="treeitem"]').count()

test.describe('live: the tree view by keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    const [inward, outward] = direction === 'ltr' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight']

    test(`${direction}: Space selects a leaf, Enter selects the next; each draws the ring and no key scrolls the tall page`, async ({ page }) => {
      await openLive(page, 'tree-view--basic', { direction, tall: true })
      await page.keyboard.press('Tab')
      await expect(tree(page)).toBeFocused()
      const at: string[] = []
      for (const key of ['ArrowDown', 'ArrowDown', 'Space', 'ArrowDown', 'Enter', 'End', 'Home', inward, outward, 'ArrowUp']) {
        await page.keyboard.press(key)
        expect(await pageScroll(page), `${key} scrolled the page`).toBe(0)
        await expectRing(page, key)
        at.push(`${key}: ${String(await highlighted(page))} [${(await selected(page)).join()}]`)
      }
      expect(at).toEqual([
        'ArrowDown: app []',
        'ArrowDown: layout.tsx []',
        'Space: layout.tsx [layout.tsx]',
        'ArrowDown: page.tsx [layout.tsx]',
        'Enter: page.tsx [page.tsx]',
        'End: README.md [page.tsx]',
        'Home: src [page.tsx]',
        `${inward}: app [page.tsx]`,
        `${outward}: app []`,
        'ArrowUp: src []',
      ])
      expect(await rows(page), 'the outward key closed app; Space and Enter on a leaf opened or closed nothing').toBe(6)
    })

    test(`${direction}: Space on a branch selects it and leaves it as it was; Enter selects it and toggles it`, async ({ page }) => {
      await openLive(page, 'tree-view--basic', { direction })
      await page.keyboard.press('Tab')
      for (let step = 0; step < 4; step++) await page.keyboard.press('ArrowDown')
      expect(await highlighted(page)).toBe('components')
      await page.keyboard.press('Space')
      expect([await selected(page), await rows(page)]).toEqual([['components'], 8])
      await page.keyboard.press('Enter')
      expect([await selected(page), await rows(page)]).toEqual([['components'], 9])
      await page.keyboard.press('Enter')
      expect(await rows(page)).toBe(8)
    })
  }

  test('the tree is the one tab stop, from either side: Shift+Tab comes back to the selected row, with the ring', async ({ page }) => {
    await openLive(page, 'tree-view--selected')
    const focusable = await page.locator('#demo [role="treeitem"]').evaluateAll((all) => all.filter((row) => (row as HTMLElement).tabIndex >= 0).length)
    expect(focusable, 'a row that takes a tab stop of its own').toBe(0)
    await page.keyboard.press('Tab')
    await expect(tree(page)).toBeFocused()
    expect(await highlighted(page)).toBe('page.tsx')
    await expectRing(page, 'Tab in')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Tab')
    await expect(tree(page)).not.toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(tree(page)).toBeFocused()
    expect(await highlighted(page)).toBe('page.tsx')
    await expectRing(page, 'Shift+Tab back')
  })

  test('a tree with nothing in it, loading or empty, is no tab stop at all', async ({ page }) => {
    await page.goto(urlFor('tree-view--status', 'light', 'ltr'))
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement?.closest('#demo') ?? null)).toBeNull()
  })
})
