import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, type Direction } from '../scripts/lib/harness.js'
import { liveErrors, openLive } from './live.js'
import { OPENED, atRest, boxOf } from './overlay.js'

// Every overlay opened from inside another, pressed with a mouse: the one opened last is drawn on top and takes the
// pointer, and a modal one dims what it was opened from. Drawer, Dialog and the popups share one z-index, so the
// order their portals open in decides; the toast layer stays above them all.

/** e2e/fixtures/overlay-layers.tsx on a live page, in a direction. */
async function load(page: Page, direction: Direction): Promise<void> {
  await openLive(page, 'separator--horizontal', { direction })
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/overlay-layers.tsx' })
  await expect(page.locator('#layers')).toBeVisible()
}

/** A trigger by its whole label: a button, or a row of a menu. */
const trigger = (page: Page, name: string) =>
  page.locator('button, [role="menuitem"]').filter({ has: page.getByText(name, { exact: true }) })

/** An open popup by its title: a dialog, a sheet or a popover by its h2, a menu by its name, Command by its field. */
function popup(page: Page, name: string): Locator {
  if (name === 'Command') return page.locator(`[role="dialog"]${OPENED}:has(input)`)
  if (name.startsWith('Menu')) return page.locator(`[role="menu"][aria-label="${name}"]${OPENED}`)
  return page.locator(`[role="dialog"]${OPENED}`).filter({ has: page.locator(`h2:text-is("${name}")`) })
}

async function press(page: Page, name: string, opens: string): Promise<Locator> {
  await trigger(page, name).click()
  const opened = popup(page, opens)
  await expect(opened).toBeVisible()
  await atRest(opened)
  return opened
}

/** What is hit at five points of a box, inset by 4 px: its centre and its four corners. */
function hitsIn(target: Locator): Promise<boolean[]> {
  return target.evaluate((element) => {
    const box = element.getBoundingClientRect()
    const points = [
      [box.left + box.width / 2, box.top + box.height / 2], [box.left + 4, box.top + 4], [box.right - 4, box.top + 4],
      [box.left + 4, box.bottom - 4], [box.right - 4, box.bottom - 4],
    ] as const
    return points.map(([x, y]) => element.contains(document.elementFromPoint(x, y)))
  })
}

/** Whether the pointer reaches the centre of a popup, or something drawn over it. */
async function reachesCentre(target: Locator): Promise<boolean> {
  return (await hitsIn(target))[0] ?? false
}

/** [outer trigger, its popup, inner trigger, its popup, whether the inner one is modal]. Written out, never derived. */
const PAIRS = [
  ['Dialog', 'Dialog', 'Sheet from dialog', 'Sheet from dialog', true],
  ['Dialog', 'Dialog', 'Popover from dialog', 'Popover from dialog', false],
  ['Dialog', 'Dialog', 'Menu from dialog', 'Menu from dialog', false],
  ['Sheet', 'Sheet', 'Dialog from sheet', 'Dialog from sheet', true],
  ['Sheet', 'Sheet', 'Popover from sheet', 'Popover from sheet', false],
  ['Sheet', 'Sheet', 'Menu from sheet', 'Menu from sheet', false],
  ['Popover', 'Popover', 'Dialog from popover', 'Dialog from popover', true],
  ['Popover', 'Popover', 'Sheet from popover', 'Sheet from popover', true],
  ['Popover', 'Popover', 'Command from popover', 'Command', true],
  ['Menu', 'Menu', 'Dialog from menu', 'Dialog from menu', true],
] as const

for (const direction of DIRECTIONS) {
  test.describe(`one overlay opened from another, ${direction}`, () => {
    for (const [outerName, outerTitle, innerName, innerTitle, modal] of PAIRS) {
      test(`${innerName}: drawn above ${outerTitle}, its every corner takes the pointer${modal ? `, and ${outerTitle} is under its scrim` : ''}`, async ({ page }) => {
        await load(page, direction)
        const outer = await press(page, outerName, outerTitle)
        const inner = await press(page, innerName, innerTitle)

        expect(await hitsIn(inner), 'centre, then the four corners').toEqual([true, true, true, true, true])
        expect(await reachesCentre(outer), `the centre of ${outerTitle} under an open ${innerTitle}`).toBe(!modal)
        // A press, not a reading: Playwright refuses one that another element would take.
        await inner.locator('button, [role="menuitem"], input').first().click({ trial: true, timeout: 2000 })
        expect(await liveErrors(page)).toEqual([])
      })
    }

    test('Command, opened by Ctrl+K over an open popover, is drawn above it and dims it', async ({ page }) => {
      await load(page, direction)
      const outer = await press(page, 'Popover', 'Popover')
      await page.keyboard.press('Control+k')
      const palette = popup(page, 'Command')
      await expect(palette).toBeVisible()
      await atRest(palette)
      expect(await hitsIn(palette)).toEqual([true, true, true, true, true])
      expect(await reachesCentre(outer)).toBe(false)
      expect(await liveErrors(page)).toEqual([])
    })

    test('a toast added from inside a sheet is drawn above the sheet and its scrim, and its x takes the mouse', async ({ page }) => {
      await load(page, direction)
      await press(page, 'Sheet', 'Sheet')
      await trigger(page, 'Toast from sheet').click()
      const toasts = page.locator('[role="region"] > [role="dialog"]:visible')
      await expect(toasts.first()).toBeVisible()
      await atRest(toasts.first())
      for (const shown of await toasts.all()) expect(await hitsIn(shown)).toEqual([true, true, true, true, true])
      const x = toasts.first().getByRole('button', { name: /^(Dismiss this notification|إغلاق هذا الإشعار)$/ })
      const box = await boxOf(x)
      expect(box.width).toBeGreaterThan(0)
      await x.click({ trial: true, timeout: 2000 })
      expect(await liveErrors(page)).toEqual([])
    })
  })
}
