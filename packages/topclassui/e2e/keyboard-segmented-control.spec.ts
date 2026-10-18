import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectNoRing, expectRing, focusedName, tabIndexes, walk } from './keyboard.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1, a segmented control is the Authoring Practices radio group, in Chromium: one tab stop that roves, every
// arrow moves, selects and wraps, the side arrows follow reading order. segmented-control.keyboard.dom.test.tsx in happy-dom.

const segmentOf = (page: Page, name: string) => page.getByRole('radio', { name, exact: true })
const checked = (page: Page) => page.locator('#demo [role="radio"][aria-checked="true"]').evaluateAll((all) => all.map((el) => el.textContent))

async function press(page: Page, key: string) {
  await page.keyboard.press(key)
  return { focus: await focusedName(page), checked: await checked(page) }
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

for (const direction of DIRECTIONS) {
  const [forward, back] = direction === 'ltr' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight']

  test.describe(direction, () => {
    test('Tab enters on the selected segment, the only stop of each track, and skips a disabled track', async ({ page }) => {
      await openLive(page, 'segmented-control--states', { direction })
      expect(await walk(page, 3)).toEqual(['Invalid, selected', 'Live, selected', 'Read-only, selected'])
      expect(await walk(page, 1, 'Shift+Tab')).toEqual(['Live, selected'])
      expect(await tabIndexes(page.getByRole('radiogroup', { name: 'One disabled' }).getByRole('radio'))).toEqual(['0', '-1', '-1'])
    })

    test('the focused segment paints the ring inside its own edge', async ({ page }) => {
      await openLive(page, 'segmented-control--basic', { direction })
      const board = segmentOf(page, 'Board')
      await expectNoRing(board, 'the segment at rest')
      await page.keyboard.press('Tab')
      await expect(board).toBeFocused()
      await expectRing(board, 'the segment')
      expect(await board.evaluate((el) => getComputedStyle(el).outlineOffset)).toBe('-2px')
    })

    test(`${forward} is the next segment in reading order and ${back} the one before; both select and wrap`, async ({ page }) => {
      await openLive(page, 'segmented-control--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await press(page, forward)).toEqual({ focus: 'Table', checked: ['Table'] })
      expect(await press(page, forward)).toEqual({ focus: 'Calendar', checked: ['Calendar'] })
      expect(await press(page, forward)).toEqual({ focus: 'Board', checked: ['Board'] })
      expect(await press(page, back)).toEqual({ focus: 'Calendar', checked: ['Calendar'] })
      expect(await tabIndexes(page.getByRole('radio'))).toEqual(['-1', '-1', '0'])
      await expectRing(segmentOf(page, 'Calendar'), 'the segment the arrows landed on')
    })

    test('ArrowDown and ArrowUp move as the next and the one before', async ({ page }) => {
      await openLive(page, 'segmented-control--basic', { direction })
      await page.keyboard.press('Tab')
      expect(await press(page, 'ArrowDown')).toEqual({ focus: 'Table', checked: ['Table'] })
      expect(await press(page, 'ArrowUp')).toEqual({ focus: 'Board', checked: ['Board'] })
      expect(await press(page, 'ArrowUp')).toEqual({ focus: 'Calendar', checked: ['Calendar'] })
    })

    test('the arrows pass over a disabled segment', async ({ page }) => {
      await openLive(page, 'segmented-control--states', { direction })
      await walk(page, 2)
      const others = ['Invalid, selected', 'Disabled, selected']
      expect(await press(page, forward)).toEqual({ focus: 'Live', checked: [...others, 'Live', 'Read-only, selected'] })
      expect(await press(page, back)).toEqual({ focus: 'Live, selected', checked: [...others, 'Live, selected', 'Read-only, selected'] })
    })

    // The track is Base UI's RadioGroup, whose RadioRoot.js:138 keeps a focus in a read-only group from selecting.
    test('in a read-only track the arrows move the focus, wrapping, and select nothing; Space selects nothing either', async ({ page }) => {
      await openLive(page, 'segmented-control--states', { direction })
      await walk(page, 3)
      const others = ['Invalid, selected', 'Disabled, selected', 'Live, selected']
      expect(await press(page, forward)).toEqual({ focus: 'Read-only', checked: [...others, 'Read-only, selected'] })
      expect(await press(page, 'Space')).toEqual({ focus: 'Read-only', checked: [...others, 'Read-only, selected'] })
      expect(await press(page, forward)).toEqual({ focus: 'Read-only, selected', checked: [...others, 'Read-only, selected'] })
      expect(await press(page, back)).toEqual({ focus: 'Read-only', checked: [...others, 'Read-only, selected'] })
      expect(await press(page, 'ArrowDown')).toEqual({ focus: 'Read-only, selected', checked: [...others, 'Read-only, selected'] })
      expect(await press(page, 'ArrowUp')).toEqual({ focus: 'Read-only', checked: [...others, 'Read-only, selected'] })
      await expectRing(segmentOf(page, 'Read-only'), 'the read-only segment the arrows landed on')
    })

    test('Space selects the focused segment; Enter, Home and End change nothing', async ({ page }) => {
      await openLive(page, 'segmented-control--basic', { direction })
      await page.keyboard.press('Tab')
      await segmentOf(page, 'Table').focus()
      expect(await press(page, 'Enter')).toEqual({ focus: 'Table', checked: ['Board'] })
      expect(await press(page, 'Home')).toEqual({ focus: 'Table', checked: ['Board'] })
      expect(await press(page, 'End')).toEqual({ focus: 'Table', checked: ['Board'] })
      expect(await press(page, 'Space')).toEqual({ focus: 'Table', checked: ['Table'] })
    })
  })
}
