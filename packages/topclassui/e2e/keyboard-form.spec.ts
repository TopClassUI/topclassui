import { expect, test, type Page, type Request } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing } from './keyboard.js'
import { liveErrors, openLive } from './live.js'

// R-5.6-1 for Form, which has no keys of its own beyond the browser's: Enter in a field and Enter or Space on the
// submit button send it, Enter in a textarea is a new line, and a field the browser refuses takes the focus with its
// ring. form.spec.ts has Enter in a field of FormAction and the focus on the field an action refused.

const textbox = (page: Page, name: string) => page.locator('#demo').getByRole('textbox', { name, exact: true })
const button = (page: Page, name: string) => page.locator('#demo').getByRole('button', { name, exact: true })

/** Answers every post to `path` with a page of its own and keeps each request. */
async function catchPosts(page: Page, url: RegExp): Promise<Request[]> {
  const posts: Request[] = []
  await page.route(url, async (route) => {
    posts.push(route.request())
    await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Sent</title><p>Sent</p>' })
  })
  return posts
}

test.describe('live: a form by keyboard', () => {
  for (const direction of DIRECTIONS) {
    for (const key of ['Enter', 'Space'] as const) {
      test(`${direction}: ${key} on Subscribe with the email empty sends nothing and puts the focus on the email, ring and all`, async ({ page }) => {
        const posts = await catchPosts(page, /\?subscribed$/)
        await openLive(page, 'form--basic', { direction })
        await page.keyboard.press('Tab')
        await expect(textbox(page, 'Email')).toBeFocused()
        await expectRing(page, 'the email')
        await page.keyboard.press('Tab')
        await expect(button(page, 'Subscribe')).toBeFocused()
        await expectRing(page, 'Subscribe')
        await page.keyboard.press(key)
        await expect(textbox(page, 'Email')).toBeFocused()
        await expectRing(page, 'the email the browser refused')
        expect(posts).toHaveLength(0)
        await page.keyboard.type('omar@example.com')
        await page.keyboard.press('Tab')
        await Promise.all([page.waitForURL(/\?subscribed$/), page.keyboard.press(key)])
        expect(posts.map((post) => post.postData())).toEqual(['email=omar%40example.com'])
      })
    }

    test(`${direction}: Enter in the message is a new line; Enter in the email sends what both hold`, async ({ page }) => {
      const posts = await catchPosts(page, /\?sent$/)
      await openLive(page, 'form--server-errors', { direction })
      await textbox(page, 'Message').focus()
      await page.keyboard.press('Control+End')
      await page.keyboard.press('Enter')
      await page.keyboard.type('Thanks for reading it all')
      expect(posts, 'Enter in a textarea sent the form').toHaveLength(0)
      expect(await liveErrors(page)).toEqual([])
      await page.keyboard.press('Shift+Tab')
      await expect(textbox(page, 'Email')).toBeFocused()
      await Promise.all([page.waitForURL(/\?sent$/), page.keyboard.press('Enter')])
      expect(posts.map((post) => post.postData())).toEqual(['email=taken%40example.com&message=Hi%2C+see+example.com%0D%0AThanks+for+reading+it+all'])
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
