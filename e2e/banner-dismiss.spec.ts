import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES, type Direction } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, type Rgb, inkOn, pixelsOf, rgbOf } from './pixels.js'

// The client half of Banner on the live harness: the x, what it remembers, what a reload shows before and after the
// script runs, where focus goes, and the x among hostile content and real layouts.

const DEMO = 'banner--dismissible'
const NAME: Record<Direction, string> = { ltr: 'Dismiss', rtl: 'إغلاق' }
const KEY = 'tc-banner-dismissed:release-v2'
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 }] as const

const release = (page: Page) => page.getByRole('region', { name: 'Release announcement' })
const maintenance = (page: Page) => page.getByRole('region', { name: 'Maintenance notice' })
const xOf = (region: Locator) => region.locator(':scope > button:last-child')
const stored = (page: Page) => page.evaluate(() => JSON.stringify(Object.entries(localStorage)))
const focused = (page: Page) => page.evaluate(() => {
  const at = document.activeElement
  return `${at?.tagName ?? ''} ${at?.getAttribute('aria-label') ?? ''} ${at?.closest('[role="region"]')?.getAttribute('aria-label') ?? ''}`.trim()
})

/** Dismissible banners with hostile content and in real layouts, loaded into a live page. */
async function openFixture(page: Page, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'separator--horizontal', options)
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/banner.tsx' })
  await expect(page.locator('#banner-fixture')).toHaveAttribute('data-ready', '')
}

/** Presses Tab until the x of the release banner has focus, which is what a keyboard user does. */
async function tabToX(page: Page, direction: Direction = 'ltr'): Promise<void> {
  for (let presses = 0; presses < 4; presses++) {
    await page.keyboard.press('Tab')
    if (await focused(page) === `BUTTON ${NAME[direction]} Release announcement`) return
  }
  throw new Error(`Tab never reached the x: ${await focused(page)}`)
}

test.describe('dismissing', () => {
  for (const by of ['click', 'Enter', 'Space'] as const) {
    test(`by ${by}: the banner is gone, the key is stored, and the other banner stays`, async ({ page }) => {
      await openLive(page, DEMO)
      if (by === 'click') await xOf(release(page)).click()
      else {
        await tabToX(page)
        await page.keyboard.press(by === 'Enter' ? 'Enter' : ' ')
      }
      await expect(release(page)).toHaveCount(0)
      await expect(maintenance(page)).toHaveCount(1)
      expect(await stored(page)).toBe(JSON.stringify([[KEY, '1']]))
      expect(await liveErrors(page)).toEqual([])
    })
  }

  for (const by of ['click', 'Enter', 'Space'] as const) {
    test(`by ${by}: onDismiss is called once`, async ({ page }) => {
      await openFixture(page)
      const x = page.locator('#counted [role="region"] > button')
      if (by === 'click') await x.click()
      else {
        await x.focus()
        await page.keyboard.press(by === 'Enter' ? 'Enter' : ' ')
      }
      await expect(page.locator('#counted [role="region"]')).toHaveCount(0)
      await expect(page.locator('#dismiss-count')).toHaveAttribute('data-count', '1')
    })
  }

  test('focus falls to the body, and the next Tab goes on from where the banner was', async ({ page }) => {
    await openLive(page, DEMO)
    await tabToX(page)
    await page.keyboard.press('Enter')
    await expect(release(page)).toHaveCount(0)
    expect(await focused(page)).toBe('BODY')
    await page.keyboard.press('Tab')
    expect(await focused(page)).toBe('BUTTON Dismiss Maintenance notice')
  })
})

test.describe('the next page', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('a dismissed banner is in the server HTML until the script runs, then gone, and the page moves up by it', async ({ page }) => {
    await openLive(page, DEMO)
    await xOf(release(page)).click()
    await expect(release(page)).toHaveCount(0)

    // Hold the hydration module, so the page shows exactly what the server sent.
    let open: () => void = () => undefined
    const gate = new Promise<void>((resolve) => { open = resolve })
    await page.route('**/scripts/lib/live-client.tsx*', async (route) => { await gate; await route.continue() })
    await page.goto(liveUrl(DEMO), { waitUntil: 'commit' })
    await expect(maintenance(page)).toBeVisible()
    const before = await page.evaluate(() => ({
      flag: document.documentElement.dataset['harness'],
      held: document.querySelector('[aria-label="Release announcement"]')?.getBoundingClientRect().height ?? 0,
      next: document.querySelector('[aria-label="Maintenance notice"]')?.getBoundingClientRect().top ?? 0,
    }))
    expect(before.flag).toBe('pending')
    expect(before.held).toBeGreaterThan(0)

    open()
    await page.waitForFunction(() => document.documentElement.dataset['harness'] === 'hydrated')
    await expect(release(page)).toHaveCount(0)
    const next = await maintenance(page).evaluate((element) => element.getBoundingClientRect().top)
    // The banner's height and the 12 px gap of the demo's column: what a visitor sees jump.
    expect(before.next - next).toBe(before.held + 12)
    const shift = await page.evaluate(() => new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        resolve(list.getEntries().reduce((sum, entry) => sum + (entry as unknown as { value: number }).value, 0))
      }).observe({ type: 'layout-shift', buffered: true })
    }))
    expect(shift).toBeGreaterThan(0)
    expect(await liveErrors(page)).toEqual([])
  })

  test('after a reload the dismissed id stays gone and another id is still shown', async ({ page }) => {
    await openLive(page, DEMO)
    await xOf(release(page)).click()
    await openLive(page, DEMO)
    await expect(release(page)).toHaveCount(0)
    await expect(maintenance(page)).toBeVisible()
    await expect(xOf(maintenance(page))).toBeVisible()
  })

  test('storage that throws: the x still hides the banner for the page, and nothing is reported', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() { throw new DOMException('The operation is insecure.', 'SecurityError') },
      })
    })
    await openLive(page, DEMO)
    await expect(release(page)).toBeVisible()
    await xOf(release(page)).click()
    await expect(release(page)).toHaveCount(0)
    await expect(maintenance(page)).toBeVisible()
    expect(await liveErrors(page)).toEqual([])
    // Nothing could be stored, so the next page shows it again: memory lasts one page.
    await openLive(page, DEMO)
    await expect(release(page)).toBeVisible()
  })
})

test.describe('the x', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: is named "${NAME[direction]}" in the accessibility tree, once per banner`, async ({ page }) => {
      await openLive(page, DEMO, { direction })
      await expect(page.getByRole('button', { name: NAME[direction], exact: true })).toHaveCount(2)
      await expect(release(page)).toMatchAriaSnapshot(`- button "${NAME[direction]}"`)
    })
  }

  test('is 24 px on a fine pointer', async ({ page }) => {
    await openLive(page, DEMO)
    const box = await xOf(release(page)).boundingBox()
    expect([box?.width, box?.height]).toEqual([24, 24])
  })

  test.describe('on a coarse pointer', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    test('is 44 px, and a tap dismisses', async ({ page }) => {
      await openLive(page, DEMO)
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
      const box = await xOf(release(page)).boundingBox()
      expect([box?.width, box?.height]).toEqual([44, 44])
      await xOf(release(page)).tap()
      await expect(release(page)).toHaveCount(0)
    })
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: the focus ring is drawn whole on the banner's fill, all four sides`, async ({ page }) => {
      await openLive(page, DEMO, { direction })
      await tabToX(page, direction)
      const ring = await xOf(release(page)).evaluate((x) => {
        const style = getComputedStyle(x)
        const reach = parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth)
        const box = x.getBoundingClientRect()
        let clipped = 0
        for (let at = x.parentElement; at && at !== document.body; at = at.parentElement) {
          if (getComputedStyle(at).overflow !== 'visible') clipped++
        }
        const fill = getComputedStyle(x.parentElement as Element).backgroundColor
        return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), reach, box: box.toJSON() as DOMRect, clipped, fill }
      })
      expect(ring.style).toBe('solid')
      expect(ring.clipped).toBe(0)
      const { x, y, width, height } = ring.box
      const fill = rgbOf(ring.fill)
      const band = async (clip: { x: number, y: number, width: number, height: number }) => inkOn(await pixelsOf(page, clip), fill)
      const sides = {
        top: await band({ x, y: y - ring.reach, width, height: ring.width }),
        bottom: await band({ x, y: y + height + ring.reach - ring.width, width, height: ring.width }),
        start: await band({ x: x - ring.reach, y, width: ring.width, height }),
        end: await band({ x: x + width + ring.reach - ring.width, y, width: ring.width, height }),
      }
      // Every pixel of each side, at 3:1 on the fill: 24 px long and the ring's width deep.
      const whole = 24 * ring.width
      expect(sides).toEqual({ top: whole, bottom: whole, start: whole, end: whole })
    })
  }
})

/** Each banner in a scope: the x against the banner, its parent and every other child, and its gap to the inline end. */
function geometry(scope: string) {
  const SLACK = 0.5
  const meets = (a: DOMRect, b: DOMRect) => a.left < b.right - SLACK && b.left < a.right - SLACK && a.top < b.bottom - SLACK && b.top < a.bottom - SLACK
  return [...document.querySelectorAll(`${scope} [role="region"]`)].map((banner) => {
    const box = banner.getBoundingClientRect()
    const parent = (banner.parentElement as Element).getBoundingClientRect()
    const x = banner.lastElementChild as Element
    const at = x.getBoundingClientRect()
    let onText = 0
    const texts = document.createTreeWalker(banner, NodeFilter.SHOW_TEXT)
    for (let text = texts.nextNode(); text; text = texts.nextNode()) {
      const range = document.createRange()
      range.selectNodeContents(text)
      for (const rect of range.getClientRects()) if (meets(rect, at)) onText++
    }
    const rtl = getComputedStyle(banner).direction === 'rtl'
    return {
      name: banner.getAttribute('aria-label') ?? '',
      tag: x.tagName,
      endGap: Math.round(rtl ? at.left - box.left : box.right - at.right),
      inBanner: at.left >= box.left - SLACK && at.right <= box.right + SLACK && at.top >= box.top - SLACK && at.bottom <= box.bottom + SLACK,
      inParent: box.left >= parent.left - SLACK && box.right <= parent.right + SLACK,
      onChild: [...banner.children].filter((child) => child !== x && meets(child.getBoundingClientRect(), at)).length,
      onText,
    }
  })
}

const FIXTURE_NAMES = ['Counted', 'Long word', 'Element', 'Empty', 'In a grid track', 'In a flex-1 column', 'In a w-fit parent', 'In a table cell']

test.describe('hostile content and real layouts', () => {
  for (const screen of SCREENS) {
    test.describe(`${String(screen.width)}x${String(screen.height)}`, () => {
      test.use({ viewport: screen })

      for (const direction of DIRECTIONS) {
        test(`${direction}: the x sits at the inline end, inside its banner, on nothing; no banner leaves its parent; no sideways scroll`, async ({ page }) => {
          await openFixture(page, { direction })
          await expectNoSidewaysScroll(page)
          const found = await page.evaluate(geometry, '#banner-fixture')
          expect(found.map((banner) => banner.name)).toEqual(FIXTURE_NAMES)
          for (const banner of found) {
            // px-5: the x keeps the row's own 20 px from the inline end, on whatever line it wraps to.
            expect(banner, banner.name).toEqual({ ...banner, tag: 'BUTTON', endGap: 20, inBanner: true, inParent: true, onChild: 0, onText: 0 })
          }
        })
      }
    })
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: the demo at 320 px keeps the x at the inline end and on nothing`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openLive(page, DEMO, { direction })
      await expectNoSidewaysScroll(page)
      for (const banner of await page.evaluate(geometry, '#demo')) {
        expect(banner, banner.name).toEqual({ ...banner, tag: 'BUTTON', endGap: 20, inBanner: true, inParent: true, onChild: 0, onText: 0 })
      }
    })
  }
})

test.describe('text made larger or spaced out', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: with the root at 32 px the x grows with the text and still covers nothing`, async ({ page }) => {
      await openFixture(page, { direction })
      // Not the layouts: a 85 px grid track and a table cell widen to the 80 px of padding and the action's 160 px,
      // dismissible or not. That is the server half's minimum width, reported, not this x.
      await page.addStyleTag({ content: 'html { font-size: 32px !important } #layouts { display: none }' })
      await expectNoSidewaysScroll(page)
      const found = await page.evaluate(geometry, '#banner-fixture')
      expect(found.map((banner) => banner.name)).toEqual(FIXTURE_NAMES)
      for (const banner of found.slice(0, 4)) {
        // px-5 is 1.25rem, so 40 px at a 32 px root.
        expect(banner, banner.name).toEqual({ ...banner, endGap: 40, inBanner: true, inParent: true, onChild: 0, onText: 0 })
      }
      const box = await page.locator('#counted [role="region"] > button').boundingBox()
      expect(box?.width).toBe(28)
    })

    test(`${direction}: with the spacing of WCAG 1.4.12 the x covers nothing and the page does not scroll sideways`, async ({ page }) => {
      await openFixture(page, { direction })
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important }' })
      await expectNoSidewaysScroll(page)
      for (const banner of await page.evaluate(geometry, '#banner-fixture')) {
        expect(banner, banner.name).toEqual({ ...banner, endGap: 20, inBanner: true, inParent: true, onChild: 0, onText: 0 })
      }
    })
  }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('the x is drawn, and a hovered x draws an outline where its fill is erased', async ({ page }) => {
      await openLive(page, DEMO)
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const x = xOf(maintenance(page))
      const box = await x.boundingBox()
      if (!box) throw new Error('no x to measure')
      const canvas: Rgb = FORCED_CANVAS[scheme]
      // Two thin strokes of a 14 px glyph: 16 pixels reach 3:1, and an x that vanished would have none.
      expect(inkOn(await pixelsOf(page, box), canvas), 'pixels of the x at 3:1 on the canvas').toBeGreaterThanOrEqual(12)

      const band = { x: box.x, y: box.y - 1, width: box.width, height: 1 }
      expect(await x.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('none')
      expect(inkOn(await pixelsOf(page, band), canvas), 'a line above the x at rest').toBe(0)
      await x.hover()
      expect(await x.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid')
      // The straight run between the rounded corners: 14 of the 24 px measured, none at rest.
      expect(inkOn(await pixelsOf(page, band), canvas), 'the outline above the hovered x').toBeGreaterThanOrEqual(12)
    })
  })
}

test('outside forced colours a hovered x is told by its fill, with no outline', async ({ page }) => {
  await openLive(page, DEMO)
  const x = xOf(maintenance(page))
  const rest = await x.evaluate((element) => getComputedStyle(element).backgroundColor)
  await x.hover()
  await expect(x).not.toHaveCSS('background-color', rest)
  expect(await x.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('none')
})

test.describe('motion', () => {
  test('the x changes colour over the shared duration', async ({ page }) => {
    await openLive(page, DEMO)
    await expect(xOf(release(page))).toHaveCSS('transition-duration', '0.15s')
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('with prefers-reduced-motion it changes at once, and the x still dismisses', async ({ page }) => {
      await openLive(page, DEMO)
      await expect(xOf(release(page))).toHaveCSS('transition-duration', '0s')
      await xOf(release(page)).click()
      await expect(release(page)).toHaveCount(0)
    })
  })
})

/** axe on the demo alone: landmarks and document structure belong to the page, not to a component. */
async function axe(page: Page): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include('#demo').analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

test.describe('axe', () => {
  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`${mode} ${direction}: no violation on the hydrated demo, and none on the server page`, async ({ page }) => {
        await openLive(page, DEMO, { mode, direction })
        const live = await axe(page)
        expect(live.violations).toEqual([])
        // Not an empty run: axe read the two x buttons and found each named.
        expect(live.passes).toEqual(expect.arrayContaining(['button-name']))

        await page.goto(urlFor(DEMO, mode, direction))
        const server = await axe(page)
        expect(server.violations).toEqual([])
        expect(server.passes).toEqual(expect.arrayContaining(['button-name']))
      })
    }
  }

  test.describe('320x480 on a coarse pointer', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: no violation`, async ({ page }) => {
        await openLive(page, DEMO, { direction })
        expect((await axe(page)).violations).toEqual([])
      })
    }
  })
})
