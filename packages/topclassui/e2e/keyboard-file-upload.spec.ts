import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing, focusName, ringOfFocus } from './keyboard.js'
import { liveErrors, openLive } from './live.js'
import { urlFor } from './pages.js'

// R-5.6-1 for FileUpload, beside file-upload.spec.ts, which has the tab order, Space opening the picker and the focus
// after a remove: here Enter and Space activating the input, the ring on every stop, kept through a removal by Enter
// and by Space, and Tab passing over a disabled upload. The drop has its keyboard path in the picker.

const DEMO = { ltr: 'file-upload--multiple', rtl: 'file-upload--rtl' } as const
const REMOVE = { ltr: 'Remove', rtl: 'إزالة' } as const

const input = (page: Page) => page.locator('#demo input[type="file"]').first()
const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.alloc(4, 37) })

test.describe('live: the file upload by keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    const remove = (name: string) => `${REMOVE[direction]} ${name}`

    for (const key of ['Enter', 'Space'] as const) {
      test(`${direction}: ${key} on the input activates it as a click does, the click that opens the picker`, async ({ page }) => {
        await openLive(page, DEMO[direction], { direction })
        // The click is cancelled, so the activation is read without a native dialog the run would have to dismiss.
        await input(page).evaluate((field) => {
          field.addEventListener('click', (event) => {
            event.preventDefault()
            field.setAttribute('data-activated', `${field.getAttribute('data-activated') ?? ''}${event.isTrusted ? 'trusted' : 'synthetic'};`)
          })
        })
        await input(page).focus()
        await page.keyboard.press(key)
        await expect(input(page)).toHaveAttribute('data-activated', 'trusted;')
        await expect(input(page)).toBeFocused()
        await expectRing(page, `the input after ${key}`)
      })
    }

    test(`${direction}: the input and each remove draw the ring; Enter and Space remove and the ring follows the focus`, async ({ page }) => {
      await openLive(page, DEMO[direction], { direction })
      await input(page).setInputFiles([pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')])
      await page.locator('body').click({ position: { x: 1, y: 1 } })
      await page.keyboard.press('Tab')
      await expect(input(page)).toBeFocused()
      await expectRing(page, 'the input')
      expect((await ringOfFocus(page))?.on, 'the zone around the input draws its ring').toBe('div')
      for (const name of ['a.pdf', 'b.pdf', 'c.pdf']) {
        await page.keyboard.press('Tab')
        expect(await focusName(page)).toBe(remove(name))
        await expectRing(page, remove(name))
      }
      await page.keyboard.press('Shift+Tab')
      expect(await focusName(page)).toBe(remove('b.pdf'))
      await page.keyboard.press('Enter')
      expect(await focusName(page)).toBe(remove('c.pdf'))
      await expectRing(page, 'after Enter')
      await page.keyboard.press('Space')
      expect(await focusName(page)).toBe(remove('a.pdf'))
      await expectRing(page, 'after Space')
      await page.keyboard.press('Enter')
      await expect(input(page)).toBeFocused()
      await expectRing(page, 'the input, after the last remove')
      await expect(page.locator('#demo li')).toHaveCount(0)
    })
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab stops on the idle and the invalid upload and passes over the disabled one`, async ({ page }) => {
      await page.goto(urlFor('file-upload--states', 'light', direction))
      await page.keyboard.press('Tab')
      await expect(page.locator('#file-upload-idle')).toBeFocused()
      await expectRing(page, 'the idle upload')
      await page.keyboard.press('Tab')
      await expect(page.locator('#file-upload-invalid')).toBeFocused()
      await expectRing(page, 'the invalid upload')
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.closest('#demo')?.tagName ?? null)).toBeNull()
    })
  }
})
