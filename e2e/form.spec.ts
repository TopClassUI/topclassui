import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page, type Request } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { CLIENT_ENTRY } from '../scripts/lib/live-harness.js'
import { serverEntries } from './form.js'
import { expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'

// What happy-dom cannot do: post a form with no script and read what the browser sent, React's reset in a real
// browser, the focus after an answer, a submit replayed after a late script, and where the fields land on a screen.

const DEMOS = ['basic', 'form-action', 'server-errors'].map((name) => `form--${name}`)
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const

const field = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true })
/** The text of every element a control names as its description, in order, read in the page. */
const described = (page: Page, name: string) => field(page, name).evaluate((el) => (el.getAttribute('aria-describedby') ?? '')
  .split(' ').filter(Boolean).map((id) => document.getElementById(id)?.textContent ?? `(missing ${id})`))
const invalid = (page: Page) => page.locator('#demo [aria-invalid="true"]').evaluateAll((all) => all.map((el) => el.getAttribute('name')))

/** Answers every post to `path` with a page of its own, and keeps each request, so a test reads what the browser sent. */
async function catchPosts(page: Page, path: string): Promise<Request[]> {
  const posts: Request[] = []
  await page.route(`**${path}`, async (route) => {
    posts.push(route.request())
    await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Sent</title><p>Sent</p>' })
  })
  return posts
}

test.describe('with no script: the server HTML posts by itself', () => {
  test.use({ javaScriptEnabled: false })

  test('basic: an empty required email sends nothing; a filled one posts email= to /subscribe', async ({ page }) => {
    const posts = await catchPosts(page, '/subscribe')
    await page.goto(liveUrl('form--basic'))
    expect(await serverEntries(page)).toEqual([['email', '']])
    await page.getByRole('button', { name: 'Subscribe' }).click()
    expect(await field(page, 'Email').evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).toBe(true)
    await field(page, 'Email').fill('omar@example.com')
    await Promise.all([page.waitForURL('**/subscribe'), page.getByRole('button', { name: 'Subscribe' }).click()])
    expect(posts.map((post) => [post.method(), post.postData()])).toEqual([['POST', 'email=omar%40example.com']])
  })

  test('server-errors: an Input and a Textarea in server Fields post what is in them to /contact', async ({ page }) => {
    const posts = await catchPosts(page, '/contact')
    await page.goto(liveUrl('form--server-errors'))
    await field(page, 'Message').fill('A message long enough to pass')
    await Promise.all([page.waitForURL('**/contact'), page.getByRole('button', { name: 'Send' }).click()])
    expect(posts.map((post) => post.postData())).toEqual(['email=taken%40example.com&message=A+message+long+enough+to+pass'])
  })
})

test.describe('server-errors, the static page', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: each error is on its own field, read after its hint, and axe finds nothing`, async ({ page }) => {
      await page.goto(urlFor('form--server-errors', 'light', direction))
      expect(await invalid(page)).toEqual(['email', 'message'])
      expect(await described(page, 'Email')).toEqual(['This email is already subscribed'])
      expect(await described(page, 'Message')).toEqual(['What can we help with?', 'Write at least 20 charactersLeave out the links'])
      const results = await new AxeBuilder({ page }).include('#demo').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }
})

test.describe('live: form-action', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: Enter submits; the URL stays, the error lands on the email, the focus moves there, and typing clears it`, async ({ page }) => {
      await openLive(page, 'form--form-action', { direction })
      const url = page.url()
      await field(page, 'Name').fill('Omar')
      await field(page, 'Email').fill('taken@example.com')
      await field(page, 'Name').press('Enter')
      await expect(page.locator('#demo form')).toHaveAttribute('aria-busy', 'true')
      await expect.poll(() => invalid(page)).toEqual(['email'])
      await expect(page.locator('#demo form')).not.toHaveAttribute('aria-busy', /.*/)
      expect(page.url()).toBe(url)
      await expect(field(page, 'Email')).toBeFocused()
      expect(await described(page, 'Email')).toEqual(['Try taken@example.com', 'This email is already subscribed'])
      await page.keyboard.type('x')
      await expect.poll(() => invalid(page)).toEqual([])
      expect(await described(page, 'Email')).toEqual(['Try taken@example.com'])
    })
  }

  test('what was typed survives React\'s reset after the answer: on screen and in the form data', async ({ page }) => {
    await openLive(page, 'form--form-action')
    await field(page, 'Name').fill('Omar')
    await field(page, 'Email').fill('taken@example.com')
    await page.getByRole('button', { name: 'Subscribe' }).click()
    await expect.poll(() => invalid(page)).toEqual(['email'])
    expect([await field(page, 'Name').inputValue(), await field(page, 'Email').inputValue()]).toEqual(['Omar', 'taken@example.com'])
    expect(await serverEntries(page, '#demo form')).toEqual([['name', 'Omar'], ['email', 'taken@example.com']])
  })

  test('a second answer with no errors: the message, no invalid field, and the fields empty again', async ({ page }) => {
    await openLive(page, 'form--form-action')
    await field(page, 'Email').fill('new@example.com')
    await page.getByRole('button', { name: 'Subscribe' }).click()
    await expect(page.getByRole('status')).toHaveText('Subscribed new@example.com')
    expect([await invalid(page), await field(page, 'Email').inputValue()]).toEqual([[], ''])
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: axe finds nothing once the error is showing`, async ({ page }) => {
      await openLive(page, 'form--form-action', { direction })
      await field(page, 'Email').fill('taken@example.com')
      await page.getByRole('button', { name: 'Subscribe' }).click()
      await expect.poll(() => invalid(page)).toEqual(['email'])
      const results = await new AxeBuilder({ page }).include('#demo').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }

  test('submitted before a late script: React replays the submit once it hydrates, and the answer lands', async ({ page }) => {
    let release: () => void = () => undefined
    const held = new Promise<void>((done) => { release = done })
    await page.route(`**${CLIENT_ENTRY}*`, async (route) => { await held; await route.continue() })
    // Not 'load' nor DOMContentLoaded: both wait for the module script this route holds back.
    await page.goto(liveUrl('form--form-action'), { waitUntil: 'commit' })
    const url = page.url()
    await field(page, 'Email').fill('taken@example.com')
    await page.getByRole('button', { name: 'Subscribe' }).click()
    release()
    await page.waitForFunction(() => document.documentElement.dataset['harness'] === 'hydrated')
    await expect.poll(() => invalid(page)).toEqual(['email'])
    expect([page.url(), await field(page, 'Email').inputValue()]).toEqual([url, 'taken@example.com'])
  })
})

for (const direction of DIRECTIONS) {
  test.describe(`screens, ${direction}`, () => {
    for (const screen of SCREENS) {
      test(`${String(screen.width)} x ${String(screen.height)}: no demo scrolls the page sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of DEMOS) {
          await page.goto(urlFor(demo, 'light', direction))
          await expectNoSidewaysScroll(page)
        }
      })
    }
  })
}

test.describe('text', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: at a root of 32 px on a 320 px screen the fields fill the form, each error sits under its field, nothing scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor('form--server-errors', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      const form = await boxOf(page.locator('#demo form'))
      for (const name of ['Email', 'Message']) {
        const box = await boxOf(field(page, name))
        expect([box.left, box.right], name).toEqual([form.left, form.right])
      }
      const error = await boxOf(page.getByText('This email is already subscribed'))
      expect(error.top).toBeGreaterThanOrEqual((await boxOf(field(page, 'Email'))).bottom)
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: the hint and the errors stay clear of their fields and of each other', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('form--server-errors', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    const message = await boxOf(field(page, 'Message'))
    const hint = await boxOf(page.getByText('What can we help with?'))
    const first = await boxOf(page.getByText('Write at least 20 characters'))
    const send = await boxOf(page.getByRole('button', { name: 'Send' }))
    expect([hint.top >= message.bottom, first.top >= hint.bottom, send.top >= first.bottom]).toEqual([true, true, true])
    await expectNoSidewaysScroll(page)
  })
})
