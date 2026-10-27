import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing } from './keyboard.js'
import { watchSubmits } from './form.js'
import { liveErrors, liveUrl, openLive } from './live.js'

// R-5.6-1 for Form, which has no keys of its own beyond the browser's: Enter in a field and Enter or Space on the
// submit button send it, Enter in a textarea is a new line, and a field the browser refuses takes the focus with its
// ring. form.spec.ts has Enter in a field of FormAction and the focus on the field an action refused.

const textbox = (page: Page, name: string) => page.locator('#demo').getByRole('textbox', { name, exact: true })
const button = (page: Page, name: string) => page.locator('#demo').getByRole('button', { name, exact: true })

test.describe('live: a form by keyboard', () => {
  for (const direction of DIRECTIONS) {
    for (const key of ['Enter', 'Space'] as const) {
      test(`${direction}: ${key} on Subscribe with the email empty sends nothing and puts the focus on the email, ring and all`, async ({ page }) => {
        await openLive(page, 'form--basic', { direction })
        const submits = watchSubmits(page)
        await page.keyboard.press('Tab')
        await expect(textbox(page, 'Email')).toBeFocused()
        await expectRing(page, 'the email')
        await page.keyboard.press('Tab')
        await expect(button(page, 'Subscribe')).toBeFocused()
        await expectRing(page, 'Subscribe')
        await page.keyboard.press(key)
        await expect(textbox(page, 'Email')).toBeFocused()
        await expectRing(page, 'the email the browser refused')
        expect(submits).toEqual([])
        await page.keyboard.type('omar@example.com')
        await page.keyboard.press('Tab')
        const sent = `${liveUrl('form--basic', { direction })}?email=omar%40example.com`
        await Promise.all([page.waitForURL(sent), page.keyboard.press(key)])
        expect(submits).toEqual([{ url: sent, method: 'GET', status: 200 }])
      })
    }

    test(`${direction}: Enter in the message is a new line; Enter in the email sends what both hold`, async ({ page }) => {
      await openLive(page, 'form--server-errors', { direction })
      const submits = watchSubmits(page)
      await textbox(page, 'Message').focus()
      await page.keyboard.press('Control+End')
      await page.keyboard.press('Enter')
      await page.keyboard.type('Thanks for reading it all')
      expect(submits, 'Enter in a textarea sent the form').toEqual([])
      expect(await liveErrors(page)).toEqual([])
      await page.keyboard.press('Shift+Tab')
      await expect(textbox(page, 'Email')).toBeFocused()
      const sent = `${liveUrl('form--server-errors', { direction })}?email=taken%40example.com&message=Hi%2C+see+example.com%0D%0AThanks+for+reading+it+all`
      await Promise.all([page.waitForURL(sent), page.keyboard.press('Enter')])
      expect(submits).toEqual([{ url: sent, method: 'GET', status: 200 }])
    })

    test(`${direction}: Space on the submit button of a FormAction sends it, and the focus goes to the email it refused`, async ({ page }) => {
      await openLive(page, 'form--form-action', { direction })
      await textbox(page, 'Email').fill('taken@example.com')
      await textbox(page, 'Email').press('Tab')
      await expect(button(page, 'Subscribe')).toBeFocused()
      await page.keyboard.press('Space')
      await expect(textbox(page, 'Email')).toHaveAttribute('aria-invalid', 'true')
      await expect(textbox(page, 'Email')).toBeFocused()
      await expectRing(page, 'the email the action refused')
      expect(await liveErrors(page)).toEqual([])
    })
  }
})
