import { expect, test, type Page } from '@playwright/test'

import { SHELL_CANDIDATES, liveOrigin } from '../scripts/lib/live-harness.js'
import { sourceCandidates } from '../scripts/lib/source-candidates.js'
import { expectNoSidewaysScroll, liveErrors, liveUrl, openLive, pinTo, viewportBox } from './live.js'
import { DEMOS } from './pages.js'

// The live harness itself: every demo hydrates with nothing reported, and a page that should
// fail does fail. Without the second half the first could pass against a trap that catches nothing.

/** What the server compiled its stylesheet from; a class outside it reaches the browser with no rule. */
const COMPILED = new Set([...sourceCandidates(process.cwd()), ...SHELL_CANDIDATES])

const classesOnThePage = (page: Page) => page.evaluate(() => {
  const found = new Set<string>()
  for (const element of document.querySelectorAll('[class]')) {
    for (const name of (element.getAttribute('class') ?? '').split(/\s+/)) if (name) found.add(name)
  }
  return [...found]
})

test('the set holds every demo the static harness wrote, so an empty list cannot pass', () => {
  expect(DEMOS.length).toBeGreaterThan(150)
  expect(DEMOS).toContain('tooltip--basic')
  expect(DEMOS).toContain('table--in-a-layout')
})

test.describe('every demo hydrates', () => {
  for (const demo of DEMOS) {
    test(`${demo}: no console error, no hydration repair, no class the stylesheet lacks`, async ({ page }) => {
      await openLive(page, demo)
      expect(await liveErrors(page)).toEqual([])
      await expect(page.locator('html')).toHaveAttribute('data-harness', 'hydrated')
      expect((await classesOnThePage(page)).filter((name) => !COMPILED.has(name))).toEqual([])
    })
  }
})

test.describe('a page that went wrong says so', () => {
  /** Serves the real page with one piece of its HTML swapped, as a stale or foreign server would. */
  async function tamper(page: Page, demo: string, from: string, to: string) {
    await page.route(liveUrl(demo), async (route) => {
      const response = await route.fetch()
      const html = await response.text()
      if (!html.includes(from)) throw new Error(`the page of ${demo} does not hold ${from}`)
      await route.fulfill({ response, body: html.replace(from, to) })
    })
  }

  test('a server render the client disagrees with is a failure, though React repairs it', async ({ page }) => {
    await tamper(page, 'tooltip--placements', '>top-start</span>', '>from another build</span>')
    await expect(openLive(page, 'tooltip--placements')).rejects.toThrow(/tooltip--placements is failed[\s\S]*hydration: /)
    await expect(page.locator('html')).toHaveAttribute('data-harness', 'failed')
    // The person who opened the page by hand sees the same list in a box.
    await expect(page.locator('#harness-errors')).toBeVisible()
    await expect(page.locator('#harness-errors')).toContainText('hydration: ')
  })

  test('an attribute the client disagrees with is a failure too, though React leaves it as it is', async ({ page }) => {
    // The commoner mismatch: an id or a label that differs, which React only warns about, in development.
    await tamper(page, 'tooltip--basic', 'aria-label="Copy link"', 'aria-label="Copy"')
    await expect(openLive(page, 'tooltip--basic'))
      .rejects.toThrow(/tooltip--basic is failed[\s\S]*console\.error: [\s\S]*hydrated but some attributes/)
  })

  test('a console error after hydration turns the page from hydrated to failed', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    await page.evaluate(() => { console.error('a component complained', 42) })
    expect(await liveErrors(page)).toEqual(['console.error: a component complained 42'])
    await expect(page.locator('html')).toHaveAttribute('data-harness', 'failed')
  })

  test('an uncaught error is reported with its message', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    await page.evaluate(() => { setTimeout(() => { throw new Error('thrown in a timer') }) })
    await expect.poll(() => liveErrors(page)).toHaveLength(1)
    expect((await liveErrors(page))[0]).toContain('uncaught: Error: thrown in a timer')
  })

  test('a module that does not load fails the page at once, instead of a timeout', async ({ page }) => {
    await page.route('**/src/components/tooltip/dummy/basic.tsx', (route) => route.abort())
    const started = Date.now()
    await expect(openLive(page, 'tooltip--basic')).rejects.toThrow(/is failed[\s\S]*load: a script or one of its imports did not load/)
    expect(Date.now() - started).toBeLessThan(10_000)
  })

  test('a page served from another checkout is refused by name', async ({ page }) => {
    await page.route(liveUrl('tooltip--basic'), async (route) => {
      const response = await route.fetch()
      const html = (await response.text()).replace(/root: "[^"]*"/, 'root: "/somewhere/else"')
      await route.fulfill({ response, body: html })
    })
    await expect(openLive(page, 'tooltip--basic')).rejects.toThrow(/serves \/somewhere\/else, not this checkout/)
  })

  test('a misspelt parameter, an unknown edge and an unknown demo are 404s that say why', async ({ page }) => {
    const answer = async (path: string) => {
      const response = await page.goto(`${liveOrigin()}${path}`)
      return `${String(response?.status())} ${await page.locator('pre').innerText()}`
    }
    expect(await answer('/tooltip--basic--light--ltr.html?egde=top'))
      .toBe('404 harness: "egde" is not a parameter; a page takes edge and tall')
    expect(await answer('/tooltip--basic--light--ltr.html?edge=left'))
      .toBe('404 harness: the edge "left" is not one of top, bottom, start, end')
    expect(await answer('/tooltip--nothing--light--ltr.html'))
      .toBe(`404 harness: there is no demo named "tooltip--nothing"; ${liveOrigin()}/ lists them`)
    await expect(openLive(page, 'tooltip--nothing')).rejects.toThrow(/answered 404: harness: there is no demo named/)
  })
})

test.describe('the two parameters', () => {
  const trigger = (page: Page) => page.getByRole('button', { name: 'Copy link' })
  /** The box the demo is pinned inside: the body, which ends where the scrollbar gutter starts. */
  const body = (page: Page) => viewportBox(page.locator('body'))

  for (const direction of ['ltr', 'rtl'] as const) {
    test(`${direction}: edge puts the demo flush against each side, in a page exactly one screen tall`, async ({ page }) => {
      await openLive(page, 'tooltip--basic', { direction, edge: 'top' })
      const frame = await body(page)
      expect(frame.viewport).toEqual({ width: 1280, height: 720 })
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(720)

      const top = await viewportBox(trigger(page))
      expect(top.top).toBe(0)
      // Centred on the other axis, so a popup has the same room on both sides of it.
      expect((top.left + top.right) / 2).toBeCloseTo((frame.left + frame.right) / 2, 0)

      await pinTo(page, 'bottom')
      expect((await viewportBox(trigger(page))).bottom).toBe(720)

      // start is the left side of an English page and the right side of an Arabic one.
      await pinTo(page, 'start')
      const start = await viewportBox(trigger(page))
      if (direction === 'ltr') expect(start.left).toBe(frame.left)
      else expect(start.right).toBe(frame.right)
      expect((start.top + start.bottom) / 2).toBe(360)

      await pinTo(page, 'end')
      const end = await viewportBox(trigger(page))
      if (direction === 'ltr') expect(end.right).toBe(frame.right)
      else expect(end.left).toBe(frame.left)

      await pinTo(page, null)
      const free = await viewportBox(trigger(page))
      // Back in the flow of the page, behind its 32 px of padding.
      expect(free.top).toBe(32)
      expect(await liveErrors(page)).toEqual([])
    })
  }

  test('a page without edge is laid out as the static one, and no page scrolls sideways', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    const box = await viewportBox(trigger(page))
    expect({ left: box.left, top: box.top, inside: box.inside }).toEqual({ left: 32, top: 32, inside: true })
    await expectNoSidewaysScroll(page)
  })

  test('tall makes the page three screens high, so there is something to scroll', async ({ page }) => {
    await openLive(page, 'tooltip--basic', { edge: 'top', tall: true })
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(2160)
    await page.mouse.wheel(0, 500)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(500)
    // The demo scrolled away with the page, which a fixed box would not.
    expect((await viewportBox(trigger(page))).inside).toBe(false)
    await expectNoSidewaysScroll(page)
  })
})
