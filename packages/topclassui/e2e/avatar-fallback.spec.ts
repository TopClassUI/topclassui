import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES, type Direction } from '../scripts/lib/harness.js'
import { expectNoSidewaysScroll, openLive } from './live.js'
import { urlFor } from './pages.js'

// The client half of Avatar, on the live harness: a picture that fails, before or after the script
// runs, turns transparent and stays in the tree, so the fallback shows and the alt still names it.

const FIXTURE = '/e2e/fixtures/avatar.tsx'

/** A picture the spec serves: 40 x 40 with a size of its own, in a colour no fallback has. */
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#7c2d12"/></svg>'

/** The control scale in CSS px at a 16 px root, written out: the five avatars of the failed demo. */
const SCALE = [28, 32, 40, 48, 56]

/** A promise the spec opens when it is ready, so a request waits for the spec and never for a clock. */
function gate() {
  let open: () => void = () => undefined
  const opened = new Promise<void>((resolve) => { open = resolve })
  return { open, opened }
}

/** ok.svg paints; slow.svg waits for its gate; broken-*.png answers 404 once its gate is open. */
async function serveImages(page: Page, gates: { slow?: Promise<void>, broken?: Promise<void> } = {}) {
  await page.route('**/__avatar/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/broken')) {
      await gates.broken
      await route.fulfill({ status: 404, contentType: 'text/plain', body: 'gone' })
      return
    }
    if (url.endsWith('/slow.svg')) await gates.slow
    await route.fulfill({ status: 200, contentType: 'image/svg+xml', body: SVG })
  })
}

async function openFixture(page: Page, direction: Direction = 'ltr') {
  await openLive(page, 'avatar--basic', { direction })
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await expect(page.locator('#avatar-fixture')).toHaveAttribute('data-ready', '')
}

/** What the circle shows: the picture if hiding the img changes the pixels, the fallback if hiding it does. */
async function painted(page: Page, root: Locator): Promise<{ image: boolean, fallback: boolean }> {
  await root.scrollIntoViewIfNeeded()
  const box = await root.boundingBox()
  if (!box) throw new Error('no avatar to measure')
  const shot = () => page.screenshot({ clip: box, animations: 'disabled' })
  const hide = (part: Locator, value: string) => part.evaluate((el, to) => { (el as HTMLElement).style.visibility = to }, value)
  const [img, fallback] = [root.locator(':scope > img'), root.locator(':scope > span')]

  const asIs = await shot()
  await hide(img, 'hidden')
  const noImage = await shot()
  await hide(img, '')
  await hide(fallback, 'hidden')
  const noFallback = await shot()
  await hide(fallback, '')
  return { image: !asIs.equals(noImage), fallback: !asIs.equals(noFallback) }
}

const FALLBACK_ONLY = { image: false, fallback: true }
const PICTURE_ONLY = { image: true, fallback: false }

/** Opens the failed demo with its script held back until all five pictures have failed. */
async function openFailedBeforeHydration(page: Page, mode: string, direction: Direction) {
  await page.addInitScript(() => {
    const seen: string[] = []
    Object.assign(window, { __failedWhile: seen })
    document.addEventListener('error', (event) => {
      if (event.target instanceof HTMLImageElement) seen.push(document.documentElement.dataset['harness'] ?? 'unset')
    }, true)
  })
  const script = gate()
  await page.route('**/scripts/lib/live-client.tsx*', async (route) => { await script.opened; await route.continue() })
  const opening = openLive(page, 'avatar--failed', { mode: mode as never, direction })
  const failedWhile = () => page.evaluate(() => (window as unknown as { __failedWhile?: string[] }).__failedWhile ?? []).catch(() => [])
  await expect.poll(async () => (await failedWhile()).length, { message: 'the five pictures never failed' }).toBe(5)
  expect(await failedWhile(), 'a picture failed after the page hydrated, so this measured nothing').toEqual(Array(5).fill('pending'))
  script.open()
  await opening
}

const images = (page: Page) => page.locator('#demo img')

for (const direction of DIRECTIONS) {
  test(`failed ${direction}: a picture that failed before hydration is caught on mount, at every size`, async ({ page }) => {
    await openFailedBeforeHydration(page, 'light', direction)
    await expect(page.locator('#demo img[data-error]')).toHaveCount(5)
    // In the tree, with its alt: the accessible name is the alt, as it was before it failed.
    await expect(page.getByRole('img', { name: 'Omar Abed' })).toHaveCount(5)
    expect(await images(page).evaluateAll((all) => all.map((img) => getComputedStyle(img).opacity))).toEqual(Array(5).fill('0'))

    const roots = page.locator('#demo span[data-size]')
    for (const [index, px] of SCALE.entries()) {
      const root = roots.nth(index)
      const box = await root.boundingBox()
      expect([box?.width, box?.height]).toEqual([px, px])
      expect(await painted(page, root), `${String(px)} px`).toEqual(FALLBACK_ONLY)
    }
  })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    for (const direction of DIRECTIONS) {
      test(`failed ${direction}: the initials show and the broken mark does not`, async ({ page }) => {
        await openFailedBeforeHydration(page, 'light', direction)
        await expect(page.locator('#demo img[data-error]')).toHaveCount(5)
        for (const index of SCALE.keys()) {
          expect(await painted(page, page.locator('#demo span[data-size]').nth(index))).toEqual(FALLBACK_ONLY)
        }
      })
    }
  })
}

test('text zoom: at a 32 px root every avatar doubles and still shows its initials', async ({ page }) => {
  await openFailedBeforeHydration(page, 'light', 'ltr')
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
  const roots = page.locator('#demo span[data-size]')
  for (const [index, px] of SCALE.entries()) {
    const box = await roots.nth(index).boundingBox()
    expect([box?.width, box?.height]).toEqual([px * 2, px * 2])
    expect(await painted(page, roots.nth(index))).toEqual(FALLBACK_ONLY)
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('a failed picture is hidden at once, with nothing animating', async ({ page }) => {
    await openFailedBeforeHydration(page, 'light', 'rtl')
    await expect(page.locator('#demo img[data-error]')).toHaveCount(5)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
    expect(await painted(page, page.locator('#demo span[data-size]').first())).toEqual(FALLBACK_ONLY)
  })
})

for (const direction of DIRECTIONS) {
  test(`switch ${direction}: a new src starts again, from good to bad and from bad to good`, async ({ page }) => {
    await serveImages(page)
    await openFixture(page, direction)
    const root = page.locator('#switch')
    const img = root.locator('img')
    const setSrc = (src: string) => page.evaluate((to) => { window.__avatarSrc?.(to) }, src)
    const loaded = () => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)

    await expect.poll(loaded).toBe(true)
    expect(await painted(page, root), 'the first picture').toEqual(PICTURE_ONLY)

    await setSrc('/__avatar/broken-a.png')
    await expect(img).toHaveAttribute('data-error', '')
    expect(await painted(page, root), 'good to bad').toEqual(FALLBACK_ONLY)
    await expect(root.getByRole('img', { name: 'Omar Abed' })).toHaveCount(1)

    await setSrc('/__avatar/ok.svg')
    await expect(img).not.toHaveAttribute('data-error')
    await expect.poll(loaded).toBe(true)
    expect(await painted(page, root), 'bad to good').toEqual(PICTURE_ONLY)

    await setSrc('/__avatar/broken-a.png')
    await expect(img).toHaveAttribute('data-error', '')
    expect(await painted(page, root), 'good to bad again').toEqual(FALLBACK_ONLY)
  })

  test(`srcSet ${direction}: a picture given by srcSet alone starts again when its srcSet changes`, async ({ page }) => {
    await serveImages(page)
    await openFixture(page, direction)
    const root = page.locator('#srcset')
    const img = root.locator('img')
    const setSrcSet = (srcSet: string) => page.evaluate((to) => { window.__avatarSrcSet?.(to) }, srcSet)
    const loaded = () => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)

    await expect.poll(loaded).toBe(true)
    expect(await img.getAttribute('src'), 'the picture has a srcSet and no src').toBeNull()

    await setSrcSet('/__avatar/broken-srcset.png 1x')
    await expect(img).toHaveAttribute('data-error', '')
    expect(await painted(page, root), 'good to bad').toEqual(FALLBACK_ONLY)

    await setSrcSet('/__avatar/ok.svg 1x')
    await expect(img).not.toHaveAttribute('data-error')
    await expect.poll(loaded).toBe(true)
    expect(await painted(page, root), 'bad to good').toEqual(PICTURE_ONLY)
  })
}

test('slow: the fallback shows while the picture loads, then the picture', async ({ page }) => {
  const slow = gate()
  await serveImages(page, { slow: slow.opened })
  await openFixture(page)
  const root = page.locator('#slow')
  const img = root.locator('img')

  expect(await img.evaluate((el) => (el as HTMLImageElement).complete), 'the picture loaded before the test held it').toBe(false)
  expect(await painted(page, root), 'while it loads').toEqual(FALLBACK_ONLY)
  await expect(img).not.toHaveAttribute('data-error')

  slow.open()
  await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await expect(img).not.toHaveAttribute('data-error')
  expect(await painted(page, root), 'once it has loaded').toEqual(PICTURE_ONLY)
})

/** Every avatar in the group and the table, by its box, in document order. */
const boxes = (page: Page) => page.locator('#group span[data-size], #table span[data-size]').evaluateAll((all) => all.map((el) => {
  const { x, y, width, height } = el.getBoundingClientRect()
  return [x, y, width, height].map((n) => Math.round(n * 100) / 100)
}))

const VIEWPORTS = [
  { width: 320, height: 640 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 },
]

for (const viewport of VIEWPORTS) {
  test.describe(`fifty avatars, ${String(viewport.width)}x${String(viewport.height)}`, () => {
    test.use({ viewport })

    for (const direction of DIRECTIONS) {
      test(`${direction}: pictures that fail move nothing, and the page never scrolls sideways`, async ({ page }) => {
        const broken = gate()
        await serveImages(page, { broken: broken.opened })
        await openFixture(page, direction)
        const good = page.locator('#avatar-fixture img[src$="ok.svg"]')
        await expect.poll(() => good.evaluateAll((all) => all.every((el) => (el as HTMLImageElement).naturalWidth > 0))).toBe(true)
        // Twenty in the group and its +30 counter, and fifty in the table; a third of the pictures fail.
        expect(await page.locator('#group span[data-size], #table span[data-size]').count()).toBe(72)
        await expect(page.locator('#avatar-fixture img[data-error]')).toHaveCount(0)
        const before = await boxes(page)
        await expectNoSidewaysScroll(page)

        broken.open()
        await expect(page.locator('#avatar-fixture img[data-error]')).toHaveCount(7 + 17)
        expect(await boxes(page), 'an avatar moved or changed size when its picture failed').toEqual(before)
        await expectNoSidewaysScroll(page)
      })
    }
  })
}

const axe = async (page: Page, scope: string) => (await new AxeBuilder({ page }).include(scope).analyze())
  .violations.map((v) => `${v.id}: ${String(v.nodes.length)} node(s)`)

for (const mode of MODES) {
  for (const direction of DIRECTIONS) {
    test(`axe ${mode} ${direction}: the failed demo, live and as server HTML`, async ({ page }) => {
      await openFailedBeforeHydration(page, mode, direction)
      await expect(page.locator('#demo img[data-error]')).toHaveCount(5)
      expect(await axe(page, '#demo'), 'live').toEqual([])
      await page.goto(urlFor('avatar--failed', mode, direction))
      expect(await axe(page, '#demo'), 'server HTML').toEqual([])
    })
  }
}
