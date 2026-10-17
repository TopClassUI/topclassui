import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, type Direction, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { DEMOS, urlFor } from './pages.js'
import { type Clip, type Rgb, contrast, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out: a bar that sticks, a page that keeps clear of it, a list that scrolls inside
// the bar, a ring a clipping box could cut, a bar that wraps instead of pushing the page wide, and forced colours.

/** Every demo. Written out, so a renamed demo fails here. */
const NAVBARS = ['navbar--basic', 'navbar--many-links', 'navbar--not-sticky', 'navbar--rtl', 'navbar--skeleton', 'navbar--tall-page', 'navbar--with-search']

/** The three screens Unit 3 measures at, and a phone on its side. */
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 }] as const

const SIX = ['Docs', 'Components', 'Icons', 'Theming', 'Connectors', 'Changelog']

/** The bar in the layouts and with the content no demo should show, loaded into a live page. */
const FIXTURE = '/e2e/fixtures/navbar.tsx'

async function openFixture(page: Page, options: LiveOptions = {}): Promise<void> {
  // A page whose own bar does not stick: the fixture's bars are then the only ones that could write the variable.
  await openLive(page, 'navbar--not-sticky', options)
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await expect(page.locator('#navbar-fixture')).toHaveAttribute('data-ready', '')
}

const bar = (page: Page, scope = '#demo') => page.locator(`${scope} header`).first()
const brandOf = (root: Locator) => root.locator(':scope > a')
const listOf = (root: Locator) => root.locator('nav ul')
const linksOf = (root: Locator) => root.locator('nav a')
const actionsOf = (root: Locator) => root.locator(':scope > div')

interface Box { left: number, top: number, right: number, bottom: number, width: number, height: number }

const boxOf = (target: Locator) => target.evaluate((element): Box => {
  const { left, top, right, bottom, width, height } = element.getBoundingClientRect()
  return { left, top, right, bottom, width, height }
})

/** What the bar wrote on the root element, and what the page made of it. */
const sticky = (page: Page) => page.evaluate(() => ({
  variable: document.documentElement.style.getPropertyValue('--tc-sticky-top'),
  padding: getComputedStyle(document.documentElement).scrollPaddingTop,
}))

/** How far the top of a target lies below the bottom of the bar. Negative is under the bar. */
const below = (target: Locator) => target.evaluate((element) => {
  const header = document.querySelector('#demo header')
  if (!header) throw new Error('no bar on the page')
  return Math.round((element.getBoundingClientRect().top - header.getBoundingClientRect().bottom) * 10) / 10
})

/** How much of the focused element lies outside the box its list shows, on each side. Zero and zero is a whole link. */
const cutOf = (list: Locator) => list.evaluate((element) => {
  const link = document.activeElement?.getBoundingClientRect()
  if (!link) throw new Error('nothing is focused')
  const frame = element.getBoundingClientRect()
  const round = (value: number) => Math.round(Math.max(0, value) * 10) / 10
  return { left: round(frame.left - link.left), right: round(link.right - frame.right) }
})

const scrollOf = (list: Locator) => list.evaluate((element) => ({
  at: Math.round(element.scrollLeft), room: element.scrollWidth - element.clientWidth,
}))

const focusedText = (page: Page) => page.evaluate(() => document.activeElement?.textContent ?? null)

/** Presses a key and waits until the focus rests on the element with that text, and the list has settled on it. */
async function press(page: Page, key: string, lands: string): Promise<void> {
  await page.keyboard.press(key)
  await expect.poll(() => focusedText(page), { message: `${key} did not land on ${lands}` }).toBe(lands)
  // The list snaps to the focused link in the frame after the focus moved.
  await page.evaluate(() => new Promise<void>((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) }) }))
}

interface Ring { left: number, right: number, top: number, bottom: number }

/**
 * The ring of the focused element, read as the pixels that change when it loses the focus, on the line through the
 * middle of each side and up to 6 px outside the box. A pixel a clipping box cut is a pixel that did not change.
 */
async function ringOf(page: Page): Promise<Ring> {
  const PAD = 6
  const box = await page.evaluate(() => {
    const { left, top, right, bottom } = (document.activeElement ?? document.body).getBoundingClientRect()
    return { left, top, right, bottom }
  })
  const [x, y] = [Math.max(0, Math.floor(box.left) - PAD), Math.max(0, Math.floor(box.top) - PAD)]
  const clip: Clip = { x, y, width: Math.ceil(box.right) + PAD - x, height: Math.ceil(box.bottom) + PAD - y }
  const focused = await page.evaluateHandle(() => document.activeElement)
  const lit = await pixelsOf(page, clip)
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur() })
  const plain = await pixelsOf(page, clip)
  await focused.evaluate((element) => { (element as HTMLElement | null)?.focus({ preventScroll: true }) })

  const changed = (column: number, row: number): boolean => {
    if (column < 0 || row < 0 || column >= clip.width || row >= clip.height) return false
    const [a, b] = [lit[row * clip.width + column] ?? [0, 0, 0], plain[row * clip.width + column] ?? [0, 0, 0]]
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 40
  }
  const [L, R, T, B] = [Math.floor(box.left) - x, Math.ceil(box.right) - x, Math.floor(box.top) - y, Math.ceil(box.bottom) - y]
  const [midRow, midColumn] = [Math.round((T + B) / 2), Math.round((L + R) / 2)]
  const run = (length: number) => Array.from({ length }, (_, index) => index)
  return {
    left: run(PAD).filter((step) => changed(L - PAD + step, midRow)).length,
    right: run(PAD).filter((step) => changed(R + step, midRow)).length,
    top: run(PAD).filter((step) => changed(midColumn, T - PAD + step)).length,
    bottom: run(PAD).filter((step) => changed(midColumn, B + step)).length,
  }
}

const WHOLE: Ring = { left: 2, right: 2, top: 2, bottom: 2 }

const pixelAt = async (page: Page, x: number, y: number): Promise<Rgb> => (await pixelsOf(page, { x: Math.round(x), y: Math.round(y), width: 1, height: 1 }))[0] ?? [0, 0, 0]

/** How much ink a box holds: every pixel weighed by how far it is from the first one, which is the backdrop. */
async function inkOf(page: Page, target: Locator): Promise<number> {
  const box = await boxOf(target)
  const pixels = await pixelsOf(page, { x: Math.floor(box.left) - 2, y: Math.floor(box.top), width: Math.ceil(box.width) + 4, height: Math.ceil(box.height) })
  const [r, g, b] = pixels[0] ?? [0, 0, 0]
  return Math.round(pixels.reduce((sum, pixel) => sum + (Math.abs(pixel[0] - r) + Math.abs(pixel[1] - g) + Math.abs(pixel[2] - b)) / 765, 0))
}

/** Where the three parts of a bar lie, whether any two overlap, and whether any leaves the bar. */
const layoutOf = (root: Locator) => root.evaluate((header) => {
  const frame = header.getBoundingClientRect()
  const parts = [...header.children].filter((child) => !(child as HTMLElement).hidden).map((child) => {
    const { left, top, right, bottom } = child.getBoundingClientRect()
    return { tag: child.tagName.toLowerCase(), left, top, right, bottom }
  })
  const overlapping: string[] = []
  for (const [index, first] of parts.entries()) {
    for (const second of parts.slice(index + 1)) {
      const apart = first.right <= second.left + 0.5 || second.right <= first.left + 0.5 || first.bottom <= second.top + 0.5 || second.bottom <= first.top + 0.5
      if (!apart) overlapping.push(`${first.tag} over ${second.tag}`)
    }
  }
  const outside = parts.filter((part) => part.left < frame.left - 0.5 || part.right > frame.right + 0.5 || part.top < frame.top - 0.5 || part.bottom > frame.bottom + 0.5).map((part) => part.tag)
  const rows = new Set(parts.map((part) => Math.round((part.top + part.bottom) / 2))).size
  return { rows, overlapping, outside, height: Math.round(frame.height * 10) / 10, width: Math.round(frame.width * 10) / 10 }
})

/** axe on one part of the page: landmarks and document structure belong to the docs app, not to a component. */
async function axe(page: Page, scope = '#demo'): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include(scope).analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

test.afterEach(async ({ page }) => {
  if (page.url().startsWith('http')) expect(await liveErrors(page)).toEqual([])
})

test('the table names every navbar demo', () => {
  expect([...NAVBARS].sort()).toEqual(DEMOS.filter((demo) => demo.startsWith('navbar--')).sort())
  expect(NAVBARS).toHaveLength(7)
})

// PLAN 19: a server-first bar is accepted on the HTML the server sends, before any script has run.
test.describe('the server HTML, with no script', () => {
  test.use({ javaScriptEnabled: false })

  for (const direction of DIRECTIONS) {
    test(`${direction}: the bar is drawn, sticks, and Tab reaches the brand, every link and the actions in that order`, async ({ page }) => {
      await page.goto(liveUrl('navbar--many-links', { direction }))
      const root = bar(page)
      await expect(root).toHaveCSS('position', 'sticky')
      expect((await layoutOf(root)).overlapping).toEqual([])
      const visited: string[] = []
      for (let step = 0; step < 9; step++) {
        await page.keyboard.press('Tab')
        visited.push(await page.evaluate(() => document.activeElement?.textContent || document.activeElement?.getAttribute('aria-label') || ''))
      }
      expect(visited).toEqual(['TopClass UI', ...SIX, 'GitHub', 'Sign in'])
    })
  }

  // The README says so: the variable is 0px until the script runs, and the browser has scrolled by then.
  test('a page opened at an #anchor lands with its heading under the bar: 60 px under', async ({ page }) => {
    await page.goto(`${liveUrl('navbar--tall-page')}#theming`)
    expect(await below(page.locator('#theming'))).toBe(-60)
  })

  test('with the height written in the CSS of the app, the same page lands with its heading at the foot of the bar', async ({ page }) => {
    await page.route('**/navbar--tall-page--light--ltr.html', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace('</head>', '<style>:root { --tc-sticky-top: 3.75rem }</style></head>') })
    })
    await page.goto(`${liveUrl('navbar--tall-page')}#theming`)
    expect(await below(page.locator('#theming'))).toBe(0)
  })
})

// The pages the shared specs measure are these files: static, with no script in them at all.
test.describe('the static pages', () => {
  for (const demo of NAVBARS) {
    test(`${demo}: every link and control is at least 24 px on both axes, in both directions`, async ({ page }) => {
      for (const direction of DIRECTIONS) {
        await page.goto(urlFor(demo, 'light', direction))
        const sizes = await page.locator('#demo :is(a[href], button, input)').evaluateAll((all) => all.map((element) => {
          const { width, height } = element.getBoundingClientRect()
          return { name: element.textContent || element.getAttribute('aria-label'), width, height }
        }))
        expect(sizes.length, direction).toBeGreaterThanOrEqual(4)
        expect(sizes.filter((size) => size.width < 24 || size.height < 24), direction).toEqual([])
      }
    })

    test(`${demo}: the static page has no axe violation at 320 px, where the list scrolls`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor(demo, 'light', 'ltr'))
      expect((await new AxeBuilder({ page }).include('#demo').analyze()).violations.map((v) => v.id)).toEqual([])
    })
  }
})

test.describe('a page opened at an #anchor, with script', () => {
  // The browser scrolls before the height arrives; the bar then brings the target to its foot, once.
  for (const screen of [{ width: 1280, height: 800, bar: 60 }, { width: 390, height: 844, bar: 85 }, { width: 320, height: 480, bar: 85 }]) {
    test(`${String(screen.width)} x ${String(screen.height)}: lands at the foot of the bar of ${String(screen.bar)} px once the height arrives, with or without a height in the CSS of the app`, async ({ page }) => {
      await page.setViewportSize(screen)
      await page.goto(`${liveUrl('navbar--tall-page')}#theming`)
      await expect(page.locator('html')).toHaveAttribute('data-harness', 'hydrated')
      expect(await sticky(page)).toEqual({ variable: `${String(screen.bar)}px`, padding: `${String(screen.bar)}px` })
      expect(await below(page.locator('#theming'))).toBe(0)

      // The one-row height of the README, short of a phone's two rows by 25 px.
      await page.route('**/navbar--tall-page--light--ltr.html', async (route) => {
        const response = await route.fetch()
        await route.fulfill({ response, body: (await response.text()).replace('</head>', '<style>:root { --tc-sticky-top: 3.75rem }</style></head>') })
      })
      await page.goto(`${liveUrl('navbar--tall-page')}#questions`)
      await expect(page.locator('html')).toHaveAttribute('data-harness', 'hydrated')
      expect(await below(page.locator('#questions'))).toBe(0)
    })
  }

  test('a value written in the CSS of the app is replaced by the measured one while the bar is mounted', async ({ page }) => {
    await page.route('**/navbar--tall-page--light--ltr.html', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace('</head>', '<style>:root { --tc-sticky-top: 5rem }</style></head>') })
    })
    await page.goto(`${liveUrl('navbar--tall-page')}#theming`)
    await expect(page.locator('html')).toHaveAttribute('data-harness', 'hydrated')
    expect(await sticky(page)).toEqual({ variable: '60px', padding: '60px' })
  })
})

// R-10.5-3 and WCAG 2.4.11: the bar says how tall it is, and nothing the page scrolls to lands under it.
for (const direction of DIRECTIONS) {
  test.describe(`the sticky bar on a tall page, ${direction}`, () => {
    const firstLink = (page: Page) => page.locator('section[aria-labelledby="install"] a')

    /** Puts a link 20 px from the top of the screen, which is under the bar, then Tabs onto it from the bar's last stop. */
    async function tabOntoLinkUnderTheBar(page: Page): Promise<{ before: number, after: number }> {
      const link = firstLink(page)
      await link.evaluate((element) => { scrollTo(0, element.getBoundingClientRect().top + scrollY - 20) })
      const before = await below(link)
      await actionsOf(bar(page)).locator('a').focus()
      await page.keyboard.press('Tab')
      await expect(link).toBeFocused()
      return { before, after: await below(link) }
    }

    test('the bar writes its height, 60 px, and the page keeps that much clear at its top', async ({ page }) => {
      await openLive(page, 'navbar--tall-page', { direction })
      expect((await boxOf(bar(page))).height).toBe(60)
      expect(await sticky(page)).toEqual({ variable: '60px', padding: '60px' })
    })

    test('it stays at the top of the screen while the page scrolls under it', async ({ page }) => {
      await openLive(page, 'navbar--tall-page', { direction })
      await page.evaluate(() => { scrollTo(0, 1500) })
      const frame = await boxOf(bar(page))
      expect([frame.top, frame.bottom]).toEqual([0, 60])
      // Painted over the page: the heading that scrolled under it is not what a click at its place reaches.
      await expect(bar(page)).toHaveCSS('z-index', '10')
    })

    test('a link to an #anchor brings its heading to the foot of the bar, not under it', async ({ page }) => {
      await openLive(page, 'navbar--tall-page', { direction })
      await linksOf(bar(page)).filter({ hasText: 'Theming' }).click()
      await expect(page).toHaveURL(/#theming$/)
      expect(await below(page.locator('#theming'))).toBe(0)
      await linksOf(bar(page)).filter({ hasText: 'Questions' }).click()
      await expect(page).toHaveURL(/#questions$/)
      expect(await below(page.locator('#questions'))).toBe(0)
    })

    test('a link that lies under the bar is scrolled clear of it when Tab reaches it', async ({ page }) => {
      await openLive(page, 'navbar--tall-page', { direction })
      const { before, after } = await tabOntoLinkUnderTheBar(page)
      expect(before, 'the link starts under the bar').toBe(-40)
      expect(after, 'px between the foot of the bar and the focused link').toBeGreaterThanOrEqual(0)
      await expect(firstLink(page)).toBeInViewport({ ratio: 1 })
    })

    // The control: the same two measurements with the variable held at the 0px it has without the hook.
    test('the control: with the variable at 0px the heading lies 60 px under the bar, and the focused link stays under it', async ({ page }) => {
      await openLive(page, 'navbar--tall-page', { direction })
      await page.addStyleTag({ content: 'html { --tc-sticky-top: 0px !important }' })
      await linksOf(bar(page)).filter({ hasText: 'Theming' }).click()
      await expect(page).toHaveURL(/#theming$/)
      expect(await below(page.locator('#theming'))).toBe(-60)
      expect(await tabOntoLinkUnderTheBar(page)).toEqual({ before: -40, after: -40 })
    })

    test('at 320 px the bar takes a second row: the variable follows, and so do the anchor and the focused link', async ({ page }) => {
      await openLive(page, 'navbar--tall-page', { direction })
      await page.setViewportSize({ width: 320, height: 640 })
      await expect.poll(async () => (await sticky(page)).variable).not.toBe('60px')
      const frame = await boxOf(bar(page))
      expect((await layoutOf(bar(page))).rows).toBe(2)
      expect(frame.height).toBeGreaterThan(80)
      expect(await sticky(page)).toEqual({ variable: `${String(Math.ceil(frame.height))}px`, padding: `${String(Math.ceil(frame.height))}px` })

      await linksOf(bar(page)).filter({ hasText: 'Usage' }).click()
      await expect(page).toHaveURL(/#usage$/)
      expect(await below(page.locator('#usage'))).toBe(0)
      const { before, after } = await tabOntoLinkUnderTheBar(page)
      expect(before).toBeLessThan(0)
      expect(after).toBeGreaterThanOrEqual(0)

      // And back to one row when the screen is wide again.
      await page.setViewportSize({ width: 1280, height: 800 })
      await expect.poll(async () => (await sticky(page)).variable).toBe('60px')
    })

    test('a safe area at the top makes the bar taller by as much, and the variable follows', async ({ page }) => {
      await openLive(page, 'navbar--tall-page', { direction })
      // Emulation reports no safe area, so the tokens are set by hand, as env() would on a phone with a notch.
      await page.evaluate(() => {
        const root = document.documentElement.style
        root.setProperty('--tc-safe-top', '47px')
        root.setProperty('--tc-safe-start', '44px')
        root.setProperty('--tc-safe-end', '30px')
      })
      await expect.poll(async () => (await sticky(page)).variable).toBe('100px')
      const root = bar(page)
      await expect(root).toHaveCSS('padding-top', '53px')
      await expect(root).toHaveCSS('padding-inline-start', '64px')
      await expect(root).toHaveCSS('padding-inline-end', '50px')
      // The brand starts after the start safe area and the drawn 20 px, on the side the page starts at.
      const [frame, brand] = [await boxOf(root), await boxOf(brandOf(root))]
      expect(direction === 'rtl' ? frame.right - brand.right : brand.left - frame.left).toBe(64)
    })
  })
}

test.describe('a bar that is not sticky', () => {
  test('scrolls away with the page, writes no variable and ships no client part', async ({ page }) => {
    await openLive(page, 'navbar--not-sticky', { tall: true })
    const root = bar(page)
    await expect(root).toHaveCSS('position', 'static')
    await expect(root).toHaveCSS('padding-top', '6px')
    expect(await sticky(page)).toEqual({ variable: '', padding: '0px' })
    await expect(root.locator('span[hidden]')).toHaveCount(0)
    await page.evaluate(() => { scrollTo(0, 600) })
    expect((await boxOf(root)).bottom).toBeLessThan(0)
  })
})

test.describe('a bar that mounts and unmounts', () => {
  test('writes the variable when it mounts, follows each row it gains, and removes it when it unmounts', async ({ page }) => {
    await openFixture(page)
    expect(await sticky(page)).toEqual({ variable: '', padding: '0px' })

    await page.locator('#toggle-bar').click()
    await expect(page.locator('#mounted')).toBeVisible()
    await expect.poll(() => sticky(page)).toEqual({ variable: '60px', padding: '60px' })

    await page.locator('#add-row').click()
    await expect(page.locator('#mounted [data-row]')).toHaveCount(1)
    const taller = Math.ceil((await boxOf(page.locator('#mounted'))).height)
    expect(taller).toBeGreaterThan(80)
    await expect.poll(() => sticky(page)).toEqual({ variable: `${String(taller)}px`, padding: `${String(taller)}px` })

    await page.locator('#toggle-bar').click()
    await expect(page.locator('#mounted')).toHaveCount(0)
    expect(await sticky(page)).toEqual({ variable: '', padding: '0px' })
    expect(await page.evaluate(() => document.documentElement.getAttribute('style') ?? '')).not.toContain('--tc-sticky-top')
  })
})

test.describe('one row at 1280 px', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: brand, six links and two actions share one row of 60 px, the brand at the start and the actions at the end`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction })
      const root = bar(page)
      expect(await layoutOf(root)).toMatchObject({ rows: 1, overlapping: [], outside: [], height: 60 })
      const [frame, brand, actions, list] = [await boxOf(root), await boxOf(brandOf(root)), await boxOf(actionsOf(root)), await boxOf(listOf(root))]
      if (direction === 'rtl') {
        expect(Math.round(frame.right - brand.right), 'px from the right edge to the brand').toBe(20)
        expect(Math.round(actions.left - frame.left), 'px from the left edge to the actions').toBe(20)
        expect(list.right).toBeLessThan(brand.left)
      } else {
        expect(Math.round(brand.left - frame.left), 'px from the left edge to the brand').toBe(20)
        expect(Math.round(frame.right - actions.right), 'px from the actions to the right edge').toBe(20)
        expect(list.left).toBeGreaterThan(brand.right)
      }
      // Every link fits: the list has nothing to scroll.
      expect((await scrollOf(listOf(root))).room).toBe(0)
      await expectNoSidewaysScroll(page)
    })
  }

  test('an RTL island on a left-to-right page mirrors by its own dir: the brand at the right of the bar', async ({ page }) => {
    await openLive(page, 'navbar--rtl', { direction: 'ltr' })
    const root = bar(page)
    const [frame, brand, actions] = [await boxOf(root), await boxOf(brandOf(root)), await boxOf(actionsOf(root))]
    expect(Math.round(frame.right - brand.right)).toBe(20)
    expect(Math.round(actions.left - frame.left)).toBe(20)
    await expect(root.locator('nav')).toHaveAttribute('aria-label', 'التنقل الرئيسي')
  })
})

test.describe('every screen, both directions', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: no demo scrolls the page sideways, and no part of a bar overlaps another or leaves the bar`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of NAVBARS) {
          await openLive(page, demo, { direction })
          await expectNoSidewaysScroll(page)
          const layout = await layoutOf(bar(page))
          expect({ overlapping: layout.overlapping, outside: layout.outside }, demo).toEqual({ overlapping: [], outside: [] })
          const [frame, demoBox] = [await boxOf(bar(page)), await boxOf(page.locator('#demo'))]
          expect(frame.left, demo).toBeGreaterThanOrEqual(demoBox.left)
          expect(frame.right, demo).toBeLessThanOrEqual(demoBox.right)
        }
      })
    }
  }
})

// The brief's bar: a brand, six links and two actions in a bar exactly 320 px wide.
test.describe('a 320 px bar', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: two rows, the brand and the links on the first and the actions on the second, and the page as wide as the screen`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction, edge: 'top' })
      const root = bar(page)
      const layout = await layoutOf(root)
      expect(layout).toMatchObject({ width: 320, rows: 2, overlapping: [], outside: [] })
      await expectNoSidewaysScroll(page)
      const [frame, brand, list, actions] = [await boxOf(root), await boxOf(brandOf(root)), await boxOf(listOf(root)), await boxOf(actionsOf(root))]
      // The brand is whole: its label is not cut.
      expect(await brandOf(root).locator('span').evaluate((label) => label.scrollWidth - label.clientWidth)).toBe(0)
      expect(brand.width).toBeGreaterThan(60)
      // The links have what the brand leaves of the row, and it is a width a person can use.
      expect(list.width).toBeGreaterThan(150)
      expect(actions.top).toBeGreaterThan(brand.bottom)
      if (direction === 'rtl') {
        expect(Math.round(frame.right - brand.right)).toBe(20)
        expect(Math.round(actions.left - frame.left)).toBe(20)
      } else {
        expect(Math.round(brand.left - frame.left)).toBe(20)
        expect(Math.round(frame.right - actions.right)).toBe(20)
      }
    })
  }
})

test.describe('six links on a 320 px screen', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: the list scrolls inside the bar and the page does not`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction })
      const list = listOf(bar(page))
      await expectNoSidewaysScroll(page)
      expect((await scrollOf(list)).room, 'px the list scrolls sideways').toBeGreaterThan(200)
      await expect(list).toHaveCSS('overflow-x', 'auto')
      await expect(list).toHaveCSS('overscroll-behavior-x', 'contain')
      const [frame, root] = [await boxOf(list), await boxOf(bar(page))]
      expect(frame.left).toBeGreaterThanOrEqual(root.left)
      expect(frame.right).toBeLessThanOrEqual(root.right)
    })

    test(`${direction}: Tab brings every link whole into view, forward and back, and its ring is whole on all four sides`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction })
      const root = bar(page)
      const list = listOf(root)
      const faults: string[] = []
      const visit = async (key: string, name: string) => {
        await press(page, key, name)
        const cut = await cutOf(list)
        const ring = await ringOf(page)
        if (cut.left > 0 || cut.right > 0) faults.push(`${name} after ${key}: cut ${String(cut.left)} px at the left, ${String(cut.right)} at the right`)
        if (JSON.stringify(ring) !== JSON.stringify(WHOLE)) faults.push(`${name} after ${key}: ring ${JSON.stringify(ring)}`)
      }
      await brandOf(root).focus()
      for (const name of SIX) await visit('Tab', name)
      expect((await scrollOf(list)).at, 'the list is scrolled to its end').not.toBe(0)
      await press(page, 'Tab', '')
      for (const name of [...SIX].reverse()) await visit('Shift+Tab', name)
      expect(faults).toEqual([])
      expect((await scrollOf(list)).at, 'and back at its start').toBe(0)
      expect(await page.evaluate(() => window.scrollX), 'px the page moved sideways').toBe(0)
    })

    test(`${direction}: a link that is half in view is brought whole into view by Tab; the control: without the snap it stays cut in half`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction })
      const root = bar(page)
      const list = listOf(root)
      /** With the focus on the brand, scrolls the list until half of its first link is past its start edge. */
      const hideHalfOfTheFirstLink = async () => {
        await brandOf(root).focus()
        return linksOf(root).first().evaluate((link) => {
          const frame = link.closest('ul')
          if (!frame) throw new Error('no list')
          const [box, edge] = [link.getBoundingClientRect(), frame.getBoundingClientRect()]
          // The room before the link, and then half of the link: in RTL the list scrolls towards negative.
          if (getComputedStyle(frame).direction === 'rtl') frame.scrollLeft -= (edge.right - box.right) + box.width / 2
          else frame.scrollLeft += (box.left - edge.left) + box.width / 2
          return Math.round(box.width / 2)
        })
      }

      // The control first: what Chromium does with a link that is half in view, which is why the list snaps.
      await page.addStyleTag({ content: '#demo nav ul { scroll-snap-type: none !important }' })
      const half = await hideHalfOfTheFirstLink()
      expect(half).toBeGreaterThan(10)
      await press(page, 'Tab', 'Docs')
      const without = await cutOf(list)
      expect(Math.max(without.left, without.right), 'px of the focused link past the edge, without the snap').toBeGreaterThanOrEqual(half - 2)

      await page.locator('style').last().evaluate((style) => { style.remove() })
      await hideHalfOfTheFirstLink()
      await press(page, 'Tab', 'Docs')
      expect(await cutOf(list), 'as built').toEqual({ left: 0, right: 0 })
      expect(await ringOf(page)).toEqual(WHOLE)
    })

    test(`${direction}: the ring of the brand, at the edge of the bar, is whole`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction, edge: 'top' })
      await page.keyboard.press('Tab')
      await expect(brandOf(bar(page))).toBeFocused()
      expect(await ringOf(page)).toEqual(WHOLE)
    })

    test(`${direction}: a wheel turned sideways over the list scrolls the list to its end, and never the page`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction })
      const list = listOf(bar(page))
      const frame = await boxOf(list)
      const towardsEnd = direction === 'rtl' ? -4000 : 4000
      await page.mouse.move(frame.left + frame.width / 2, frame.top + frame.height / 2)
      await page.mouse.wheel(towardsEnd, 0)
      await expect.poll(async () => { const { at, room } = await scrollOf(list); return room - Math.abs(at) }).toBeLessThanOrEqual(1)
      await expect(linksOf(bar(page)).last()).toBeInViewport({ ratio: 1 })
      await page.mouse.wheel(towardsEnd, 0)
      expect(await page.evaluate(() => window.scrollX)).toBe(0)
      // With no link focused the list snaps to nothing: it stays where the wheel left it.
      expect(Math.abs((await scrollOf(list)).at)).toBeGreaterThan(200)
    })

    // A link keeps the focus after Enter, as on a client navigation, and is then the one snap area of the list.
    test(`${direction}: with a link focused, a wheel over the list still scrolls it and it stays; the control: snapping under the pointer springs it back`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction })
      const root = bar(page)
      const list = listOf(root)
      const towardsEnd = direction === 'rtl' ? -4000 : 4000
      const settle = () => page.evaluate(() => new Promise<void>((resolve) => { setTimeout(resolve, 600) }))
      /** Tabs onto Docs with the pointer off the bar, then turns the wheel over the list and lets it settle. */
      const wheelPastTheFocus = async () => {
        await page.mouse.move(5, 470)
        await brandOf(root).focus()
        await press(page, 'Tab', 'Docs')
        expect((await scrollOf(list)).at).toBe(0)
        const frame = await boxOf(list)
        await page.mouse.move(frame.left + frame.width / 2, frame.top + frame.height / 2)
        await page.mouse.wheel(towardsEnd, 0)
        await settle()
        return Math.abs((await scrollOf(list)).at)
      }

      await page.addStyleTag({ content: '#demo nav ul:hover { scroll-snap-type: x mandatory !important }' })
      expect(await wheelPastTheFocus(), 'px the list kept, snapping under the pointer').toBe(0)

      await page.locator('style').last().evaluate((style) => { style.remove() })
      expect(await wheelPastTheFocus(), 'px the list kept, as built').toBe((await scrollOf(list)).room)
      await expect(page.locator('#demo nav a').filter({ hasText: 'Docs' })).toBeFocused()
      // The price: once the pointer leaves, the list snaps to the focused link again.
      await page.mouse.move(5, 470)
      await settle()
      expect((await scrollOf(list)).at).toBe(0)
    })
  }
})

// On the server HTML, before any script: the list opens on the link of the page being read.
test.describe('the page being read is in view when a phone opens it', () => {
  test.use({ viewport: { width: 320, height: 480 }, javaScriptEnabled: false })

  /** Opens many-links with the mark moved to the sixth link, past what the list shows, and returns how much of it shows. */
  async function openOnChangelog(page: Page, direction: Direction, style = ''): Promise<{ shown: number, width: number, at: number, room: number }> {
    await page.route(`**/navbar--many-links--light--${direction}.html*`, async (route) => {
      const response = await route.fetch()
      const body = (await response.text()).replace(' aria-current="page"', '').replace('href="/changelog"', 'href="/changelog" aria-current="page"')
      await route.fulfill({ response, body: body.replace('</head>', `<style>${style}</style></head>`) })
    })
    await page.goto(liveUrl('navbar--many-links', { direction }))
    const list = listOf(bar(page))
    await expect(list.locator('[aria-current="page"]')).toHaveText('Changelog')
    const shown = await list.evaluate((element) => {
      const current = element.querySelector('[aria-current="page"]')
      if (!current) throw new Error('no current link')
      const [frame, box] = [element.getBoundingClientRect(), current.getBoundingClientRect()]
      return { shown: Math.round(Math.max(0, Math.min(frame.right, box.right) - Math.max(frame.left, box.left))), width: Math.round(box.width) }
    })
    return { ...shown, ...await scrollOf(list) }
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: with the sixth link current the list opens scrolled to it, whole; the control: without the property it is out of view`, async ({ page }) => {
      const control = await openOnChangelog(page, direction, '#demo nav a { scroll-initial-target: none !important }')
      expect(control.at, 'the control opens at the start of the list').toBe(0)
      expect(control.shown, 'px of the current link in view, without the property').toBe(0)

      const built = await openOnChangelog(page, direction)
      expect(built.shown, 'px of the current link in view').toBe(built.width)
      expect(Math.abs(built.at)).toBe(built.room)
      expect(await page.evaluate(() => [window.scrollX, window.scrollY]), 'the page itself does not move').toEqual([0, 0])
    })
  }
})

test.describe('under a finger', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  /** A finger dragged sideways, as raw touch events: Playwright has no swipe. */
  async function drag(page: Page, y: number, fromX: number, toX: number): Promise<void> {
    const session = await page.context().newCDPSession(page)
    const frames = () => page.evaluate(() => new Promise<void>((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) }) }))
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fromX, y }] })
    for (let step = 1; step <= 12; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: fromX + ((toX - fromX) * step) / 12, y }] })
      await frames()
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await session.detach()
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: a drag along the list scrolls it until the last link is whole in view, and the page stays put`, async ({ page }) => {
      await openLive(page, 'navbar--many-links', { direction })
      const list = listOf(bar(page))
      const frame = await boxOf(list)
      const [from, to] = direction === 'rtl' ? [frame.left + 15, frame.right - 10] : [frame.right - 15, frame.left + 10]
      await expect(linksOf(bar(page)).last()).not.toBeInViewport()
      await expect(async () => {
        await drag(page, frame.top + frame.height / 2, from, to)
        const { at, room } = await scrollOf(list)
        expect(Math.abs(at)).toBeGreaterThanOrEqual(room - 1)
      }).toPass()
      const [last, box] = [await boxOf(linksOf(bar(page)).last()), await boxOf(list)]
      expect(last.left).toBeGreaterThanOrEqual(box.left)
      expect(last.right).toBeLessThanOrEqual(box.right)
      expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0])
    })
  }

  for (const demo of NAVBARS) {
    test(`${demo}: every link, button and field of the bar is at least 44 px wide and 44 px tall, and a field is typed in at 16 px`, async ({ page }) => {
      await openLive(page, demo)
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
      const sizes = await bar(page).locator(':is(a[href], button, input)').evaluateAll((all) => all.map((element) => {
        const { width, height } = element.getBoundingClientRect()
        return { name: element.textContent || element.getAttribute('aria-label'), width, height, type: element.tagName === 'INPUT' ? getComputedStyle(element).fontSize : null }
      }))
      expect(sizes.length).toBeGreaterThanOrEqual(4)
      expect(sizes.filter((size) => size.width < 44 || size.height < 44)).toEqual([])
      expect(sizes.filter((size) => size.type !== null && size.type !== '16px')).toEqual([])
      await expectNoSidewaysScroll(page)
    })
  }

  test('a link with nothing in it is still a 44 px target, and so is an empty brand', async ({ page }) => {
    await openFixture(page)
    const empty = page.locator('#empty-bar')
    for (const target of [brandOf(empty), ...await linksOf(empty).all()]) {
      const box = await boxOf(target)
      expect([box.width, box.height]).toEqual([44, 44])
    }
  })
})

test.describe('inside a real layout, and with content no demo should show', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: no bar widens its parent, nothing is painted past the edge of the page, and no part overlaps another`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openFixture(page, { direction })
        await expectNoSidewaysScroll(page)
        const found = await page.evaluate(() => {
          const width = document.body.clientWidth
          const crossing: string[] = []
          const wider: string[] = []
          for (const element of document.querySelectorAll('#navbar-fixture *')) {
            // What a list, a brand or a link clips is not painted: only what is outside every clipping box can cross.
            const clipped = element.parentElement?.closest('ul, header > a, li > a') !== null && element.parentElement?.closest('header') !== null
            const box = element.getBoundingClientRect()
            if (box.width > 0 && !clipped && (box.left < -0.5 || box.right > width + 0.5)) crossing.push(element.id || element.tagName.toLowerCase())
          }
          for (const header of document.querySelectorAll('#navbar-fixture header[id]')) {
            const [own, parent] = [header.getBoundingClientRect(), header.parentElement?.getBoundingClientRect()]
            if (parent && own.width > parent.width + 0.5) wider.push(header.id)
          }
          return { crossing, wider }
        })
        expect(found).toEqual({ crossing: [], wider: [] })
        for (const id of ['plain-bar', 'grid-bar', 'flex-bar', 'row-bar', 'fit-bar', 'cell-bar', 'word-bar', 'element-bar', 'sixty-bar', 'empty-bar']) {
          const layout = await layoutOf(page.locator(`#${id}`))
          expect({ overlapping: layout.overlapping, outside: layout.outside }, id).toEqual({ overlapping: [], outside: [] })
        }
      })
    }
  }

  test('320 px: in a grid track, a flex column, a flex row, a w-fit parent and a table cell, six links scroll inside their list', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    for (const layout of ['grid', 'flex', 'row', 'fit', 'cell']) {
      const root = page.locator(`#${layout}-bar`)
      expect((await scrollOf(listOf(root))).room, `${layout}: px the list scrolls`).toBeGreaterThan(150)
      await linksOf(root).last().focus()
      expect(await cutOf(listOf(root)), `${layout}: the last link, brought into view`).toEqual({ left: 0, right: 0 })
    }
  })

  test('at 1280 px a bar in a w-fit parent is as wide as its parts, and one beside a column fills the column', async ({ page }) => {
    await openFixture(page)
    const [fit, plain, column, flex] = [await boxOf(page.locator('#fit-bar')), await boxOf(page.locator('#plain-bar')), await boxOf(page.locator('#flex-column')), await boxOf(page.locator('#flex-bar'))]
    expect(fit.width).toBeLessThan(plain.width - 300)
    expect((await layoutOf(page.locator('#fit-bar'))).rows).toBe(1)
    expect(flex.width).toBe(column.width)
  })

  test('a brand of 300 characters takes a row of its own and ends in an ellipsis, inside the bar', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    const root = page.locator('#word-bar')
    const [frame, brand] = [await boxOf(root), await boxOf(brandOf(root))]
    const label = brandOf(root).locator('span')
    expect((await brandOf(root).textContent())?.length).toBe(100)
    expect(brand.left).toBeGreaterThanOrEqual(frame.left + 20)
    expect(brand.right).toBeLessThanOrEqual(frame.right - 20)
    await expect(label).toHaveCSS('text-overflow', 'ellipsis')
    expect(await label.evaluate((element) => element.scrollWidth > element.clientWidth + 100), 'the label is cut by its box').toBe(true)
  })

  test('a link of 300 characters is cut at 100, is no wider than its list, and the link after it is still reached', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    const root = page.locator('#word-bar')
    const [link, list] = [linksOf(root).first(), listOf(root)]
    expect((await link.textContent())?.length).toBe(100)
    expect((await boxOf(link)).width).toBeLessThanOrEqual((await boxOf(list)).width)
    await expect(link.locator('span')).toHaveCSS('text-overflow', 'ellipsis')
    await link.focus()
    await press(page, 'Tab', 'Next')
    expect(await cutOf(list)).toEqual({ left: 0, right: 0 })
  })

  test('an action of 300 characters is cut by the Button that holds it, inside the bar', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    const root = page.locator('#word-bar')
    const [frame, action] = [await boxOf(root), await boxOf(actionsOf(root).locator('a'))]
    expect(action.left).toBeGreaterThanOrEqual(frame.left + 20)
    expect(action.right).toBeLessThanOrEqual(frame.right - 20)
  })

  test('a brand and a link that hold elements where text is expected clip them at their own edge', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    const root = page.locator('#element-bar')
    const [frame, brand] = [await boxOf(root), await boxOf(brandOf(root))]
    await expect(brandOf(root)).toHaveCSS('overflow-x', 'hidden')
    expect(brand.right).toBeLessThanOrEqual(frame.right - 20)
    // The italic word is 300 characters long: it is wider than the brand, which shows its beginning and no more.
    expect((await boxOf(brandOf(root).locator('em'))).width).toBeGreaterThan(brand.width)
    expect((await boxOf(brandOf(root).locator('strong'))).left).toBeGreaterThanOrEqual(brand.left)
    await expect(linksOf(root).first()).toHaveCSS('overflow-x', 'hidden')
    // And a block 600 px wide among the actions is held to the width of the bar.
    expect((await boxOf(actionsOf(root))).width).toBeLessThanOrEqual(frame.width - 40)
  })

  test('sixty links: Tab from the fifty-ninth brings the sixtieth whole into view, with its whole ring', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openFixture(page)
    const root = page.locator('#sixty-bar')
    await expect(linksOf(root)).toHaveCount(60)
    await linksOf(root).nth(58).focus()
    await press(page, 'Tab', 'Link 60')
    expect(await cutOf(listOf(root))).toEqual({ left: 0, right: 0 })
    expect(await ringOf(page)).toEqual(WHOLE)
    await expectNoSidewaysScroll(page)
  })

  test('a bar with nothing in it, and parts with nothing in them, keep the 60 px of a bar', async ({ page }) => {
    await openFixture(page)
    for (const id of ['bare-bar', 'links-only', 'empty-bar']) expect((await boxOf(page.locator(`#${id}`))).height, id).toBe(60)
    for (const target of [brandOf(page.locator('#empty-bar')), ...await linksOf(page.locator('#empty-bar')).all()]) {
      const box = await boxOf(target)
      expect([box.width, box.height]).toEqual([24, 24])
    }
  })
})

// Two navs with one name cannot be told apart in a list of landmarks: the caller names the second.
test.describe('landmarks', () => {
  test('two navbars, a Breadcrumb and a Pagination on one page: four navs with four names, and axe finds them unique', async ({ page }) => {
    await openFixture(page)
    const names = await page.locator('#landmarks nav').evaluateAll((navs) => navs.map((nav) => nav.getAttribute('aria-label')))
    expect(names).toEqual(['Main', 'Docs sections', 'Breadcrumb', 'Pagination'])
    await expect(page.getByRole('navigation', { name: 'Docs sections' })).toHaveCount(1)
    const found = await axe(page, '#landmarks')
    expect(found.violations).toEqual([])
    expect(found.passes).toContain('landmark-unique')
  })

  // The control: the same rule does fire when two bars keep the default name.
  test('the control: two navbars that both keep the default name fail landmark-unique', async ({ page }) => {
    await openFixture(page)
    const found = await axe(page, '#collision')
    expect(found.violations.map((violation) => violation.split(':')[0])).toEqual(['landmark-unique'])
  })

  test('the nav is named in the language of the labels it is given: Arabic in the rtl demo', async ({ page }) => {
    await openLive(page, 'navbar--rtl', { direction: 'rtl' })
    await expect(page.getByRole('navigation', { name: 'التنقل الرئيسي' })).toHaveCount(1)
    await openLive(page, 'navbar--basic')
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(1)
    await expect(page.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page')
  })
})

for (const mode of MODES) {
  test.describe(`what is drawn, ${mode}`, () => {
    test('the bar has one line along its foot and none on its other three sides, and its last row is not the colour of the page under it', async ({ page }) => {
      await openLive(page, 'navbar--basic', { mode })
      const root = bar(page)
      await expect(root).toHaveCSS('border-bottom-width', '1px')
      await expect(root).toHaveCSS('border-top-width', '0px')
      await expect(root).toHaveCSS('border-inline-start-width', '0px')
      const frame = await boxOf(root)
      const x = frame.left + frame.width / 2
      // In Light and Ocean the fill is the colour of the page and the line parts them; in Dark the line is the fill, which does.
      const [line, under] = [await pixelAt(page, x, frame.bottom - 1), await pixelAt(page, x, frame.bottom + 2)]
      expect(line.join(','), 'the last row of the bar against the page under it').not.toBe(under.join(','))
    })

    test('a link is underlined while the pointer is over it, and not before', async ({ page }) => {
      await openLive(page, 'navbar--basic', { mode })
      const link = linksOf(bar(page)).nth(1)
      await expect(link).toHaveCSS('text-decoration-line', 'none')
      await link.hover()
      await expect(link).toHaveCSS('text-decoration-line', 'underline')
    })

    test('the page being read is read in the body colour at 600, the other links in the muted colour at 400, all at 4.5:1', async ({ page }) => {
      await openLive(page, 'navbar--basic', { mode })
      const root = bar(page)
      const styles = await linksOf(root).evaluateAll((links) => links.map((link) => {
        const style = getComputedStyle(link)
        const probe = document.createElement('canvas').getContext('2d')
        if (!probe) throw new Error('no canvas')
        // Painted and read back, so an oklch colour is compared as the sRGB it is drawn in.
        probe.fillStyle = style.color
        probe.fillRect(0, 0, 1, 1)
        const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data
        return { weight: style.fontWeight, colour: `rgb(${String(r)}, ${String(g)}, ${String(b)})`, current: link.getAttribute('aria-current') }
      }))
      expect(styles.map((style) => `${style.weight} ${String(style.current)}`)).toEqual(['600 page', '400 null', '400 null', '400 null'])
      expect(new Set(styles.slice(1).map((style) => style.colour)).size).toBe(1)
      expect(styles[0]?.colour).not.toBe(styles[1]?.colour)
      const frame = await boxOf(root)
      const surface = await pixelAt(page, frame.left + 4, frame.top + 4)
      for (const style of styles) expect(contrast(rgbOf(style.colour), surface), `${style.colour} on ${surface.join(',')}`).toBeGreaterThanOrEqual(4.5)
    })
  })
}

// WCAG 1.4.1: the current link must differ by more than its colour, in a way this machine really draws.
test.describe('the weight of the current link is drawn', () => {
  for (const [demo, direction] of [['navbar--basic', 'ltr'], ['navbar--rtl', 'rtl']] as const) {
    test(`${demo}: with every link in one colour, the current one holds clearly more ink at 600 than at 400`, async ({ page }) => {
      await openLive(page, demo, { direction })
      await page.addStyleTag({ content: '#demo nav a { color: rgb(0, 0, 0) !important }' })
      const current = linksOf(bar(page)).first()
      await expect(current).toHaveCSS('font-weight', '600')
      const heavy = await inkOf(page, current)
      await current.evaluate((link) => { link.removeAttribute('aria-current') })
      await expect(current).toHaveCSS('font-weight', '400')
      const plain = await inkOf(page, current)
      expect(plain).toBeGreaterThan(40)
      expect(heavy / plain, `ink at 600 (${String(heavy)}) against ink at 400 (${String(plain)})`).toBeGreaterThanOrEqual(1.15)
    })
  }
})

/** The palette's own system colours, asked of the browser and not written here. */
const systemColours = (page: Page) => page.evaluate(() => {
  const read = (colour: string) => {
    const probe = document.createElement('i')
    probe.style.color = colour
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }
  return { canvas: read('Canvas'), text: read('CanvasText'), link: read('LinkText') }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('the bar has lost its fill and keeps an edge against the page: the line along its foot', async ({ page }) => {
      await openLive(page, 'navbar--basic')
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const system = await systemColours(page)
      const root = bar(page)
      await expect(root).toHaveCSS('background-color', system.canvas)
      const frame = await boxOf(root)
      const x = frame.left + frame.width / 2
      const canvas = rgbOf(system.canvas).join(',')
      expect((await pixelAt(page, x, frame.bottom - 3)).join(','), 'inside the bar').toBe(canvas)
      expect((await pixelAt(page, x, frame.bottom + 2)).join(','), 'under the bar').toBe(canvas)
      const line = await pixelAt(page, x, frame.bottom - 1)
      expect(contrast(line, rgbOf(system.canvas)), `the line ${line.join(',')} on ${canvas}`).toBeGreaterThanOrEqual(3)
    })

    test('every link is one colour, so the current one is told by its weight and by an underline no other link has', async ({ page }) => {
      await openLive(page, 'navbar--basic')
      const system = await systemColours(page)
      const drawn = await linksOf(bar(page)).evaluateAll((links) => links.map((link) => {
        const style = getComputedStyle(link)
        return { colour: style.color, weight: style.fontWeight, line: style.textDecorationLine }
      }))
      expect(drawn).toEqual([
        { colour: system.link, weight: '600', line: 'underline' },
        { colour: system.link, weight: '400', line: 'none' },
        { colour: system.link, weight: '400', line: 'none' },
        { colour: system.link, weight: '400', line: 'none' },
      ])
      // Painted, not only computed: a row of link colour under the text of the current link, and none under the next.
      const underlined = async (link: Locator) => {
        const label = await boxOf(link.locator('span'))
        const rows = await pixelsOf(page, { x: Math.round(label.left), y: Math.round(label.top), width: Math.round(label.width), height: Math.round(label.height) })
        const width = Math.round(label.width)
        const colour = rgbOf(system.link).join(',')
        return Array.from({ length: Math.round(label.height) }, (_, row) => rows.slice(row * width, (row + 1) * width).filter((pixel) => pixel.join(',') === colour).length)
          .filter((painted) => painted >= width - 2).length
      }
      expect(await underlined(linksOf(bar(page)).nth(0)), 'rows of underline under the current link').toBeGreaterThanOrEqual(1)
      expect(await underlined(linksOf(bar(page)).nth(1)), 'rows of underline under another link').toBe(0)
    })

    test('the ring of a focused link is whole, in a system colour', async ({ page }) => {
      await openLive(page, 'navbar--basic')
      await brandOf(bar(page)).focus()
      await press(page, 'Tab', 'Docs')
      expect(await ringOf(page)).toEqual(WHOLE)
      await press(page, 'Tab', 'Components')
      expect(await ringOf(page)).toEqual(WHOLE)
    })
  })
}

test.describe('text that is made larger or spaced out', () => {
  const spills = (page: Page) => bar(page).locator('a').evaluateAll((all) => all.map((link) => {
    const range = document.createRange()
    range.selectNodeContents(link)
    const [box, ink] = [link.getBoundingClientRect(), range.getBoundingClientRect()]
    return Math.max(0, box.top - ink.top, ink.bottom - box.bottom)
  }).filter((spill) => spill > 0.5))

  for (const direction of DIRECTIONS) {
    test(`${direction}: with the root at 32 px on a 390 px screen the bar wraps, the page does not scroll sideways, and every link is still reached whole`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openLive(page, 'navbar--many-links', { direction })
      await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
      await expectNoSidewaysScroll(page)
      const root = bar(page)
      const layout = await layoutOf(root)
      expect({ overlapping: layout.overlapping, outside: layout.outside }).toEqual({ overlapping: [], outside: [] })
      expect(await spills(page)).toEqual([])
      await expect(linksOf(root).first()).toHaveCSS('font-size', '28px')
      // Three rows, 321 px, are more than a third of 844: the bar lets go of the top and keeps nothing clear.
      expect(layout.height).toBe(321)
      await expect(root).toHaveAttribute('data-unstuck', '')
      expect(await sticky(page)).toEqual({ variable: '0px', padding: '0px' })
      await brandOf(root).focus()
      for (const name of SIX) {
        await press(page, 'Tab', name)
        expect(await cutOf(listOf(root)), name).toEqual({ left: 0, right: 0 })
      }
    })

    // Three rows would cover most of a phone while the page scrolls: past a third of the screen the bar goes with the page.
    test(`${direction}: with the root at 32 px on a 320 x 480 phone the bar is more than a third of the screen, so it scrolls away and writes 0px; at 16 px it sticks again`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openLive(page, 'navbar--tall-page', { direction })
      const root = bar(page)
      await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
      await expect(root).toHaveAttribute('data-unstuck', '')
      expect((await boxOf(root)).height, 'px of a 480 px screen').toBeGreaterThan(160)
      await expect(root).toHaveCSS('position', 'static')
      expect(await sticky(page)).toEqual({ variable: '0px', padding: '0px' })
      await page.evaluate(() => { scrollTo(0, 1500) })
      expect((await boxOf(root)).bottom, 'the bar has scrolled off the top').toBeLessThanOrEqual(0)
      await linksOf(root).filter({ hasText: 'Theming' }).evaluate((link) => { (link as HTMLElement).click() })
      await expect(page).toHaveURL(/#theming$/)
      expect(await page.locator('#theming').evaluate((heading) => Math.round(heading.getBoundingClientRect().top)), 'nothing covers the heading').toBe(0)

      await page.locator('style').last().evaluate((style) => { style.remove() })
      await expect(root).not.toHaveAttribute('data-unstuck')
      await expect(root).toHaveCSS('position', 'sticky')
      const height = Math.ceil((await boxOf(root)).height)
      expect(height).toBeLessThanOrEqual(160)
      expect(await sticky(page)).toEqual({ variable: `${String(height)}px`, padding: `${String(height)}px` })
    })

    test(`${direction}: at 32 px the bar of a page sticks on a 390 x 844 phone at 225 px, and lets go when the phone turns to 844 x 390`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openLive(page, 'navbar--tall-page', { direction })
      const root = bar(page)
      await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
      await expect.poll(async () => (await sticky(page)).variable).toBe('225px')
      await expect(root).toHaveCSS('position', 'sticky')
      await page.setViewportSize({ width: 844, height: 390 })
      await expect(root).toHaveAttribute('data-unstuck', '')
      expect((await boxOf(root)).height, 'px of a 390 px screen').toBeGreaterThan(130)
      expect(await sticky(page)).toEqual({ variable: '0px', padding: '0px' })
      await page.setViewportSize({ width: 390, height: 844 })
      await expect(root).not.toHaveAttribute('data-unstuck')
      await expect(root).toHaveCSS('position', 'sticky')
      expect(await sticky(page)).toEqual({ variable: '225px', padding: '225px' })
      // A screen that only grows shorter leaves the bar at 225 px, so only the resize of the window can tell.
      await page.setViewportSize({ width: 390, height: 600 })
      await expect(root).toHaveAttribute('data-unstuck', '')
      expect((await boxOf(root)).height).toBe(225)
      expect(await sticky(page)).toEqual({ variable: '0px', padding: '0px' })
    })

    test(`${direction}: with the spacing of WCAG 1.4.12 no label leaves its link and the page does not scroll sideways`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openLive(page, 'navbar--many-links', { direction })
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important }' })
      await expectNoSidewaysScroll(page)
      expect(await spills(page)).toEqual([])
      expect((await layoutOf(bar(page))).overlapping).toEqual([])
    })
  }

  test('with a root of 10 px, where a rem padding would shrink under the ring, the ring of a link at the edge of the list is still whole', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'navbar--many-links')
    await page.addStyleTag({ content: 'html { font-size: 10px !important }' })
    const root = bar(page)
    await expect(listOf(root)).toHaveCSS('padding-left', '5px')
    await brandOf(root).focus()
    await press(page, 'Tab', 'Docs')
    expect(await ringOf(page)).toEqual(WHOLE)
  })
})

// Reduced motion has nothing to reduce: no part of the bar moves, fades or eases.
test.describe('motion', () => {
  for (const reduced of [false, true]) {
    test.describe(reduced ? 'reduced' : 'as it is', () => {
      test.use({ reducedMotion: reduced ? 'reduce' : 'no-preference' })

      test('no part of the bar has a transition or an animation, so the bar is the same either way', async ({ page }) => {
        await openLive(page, 'navbar--many-links')
        const moving = await bar(page).evaluate((header) => [header, ...header.querySelectorAll('nav, ul, li, a, div')].filter((element) => {
          const style = getComputedStyle(element)
          // A Button among the actions brings its own colour transition: only the bar's own parts are read.
          if (element.closest('header > div') && element.tagName === 'A') return false
          return style.transitionDuration.split(', ').some((duration) => duration !== '0s') || style.animationName !== 'none'
        }).map((element) => element.tagName.toLowerCase()))
        expect(moving).toEqual([])
        expect((await boxOf(bar(page))).height).toBe(60)
        await expect(listOf(bar(page))).toHaveCSS('scroll-behavior', 'auto')
      })
    })
  }
})

test.describe('axe on the hydrated bar', () => {
  for (const demo of NAVBARS) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, at rest and with a link focused`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          const first = await axe(page)
          expect(first.violations).toEqual([])
          // Not an empty run: axe did read the list, the links and the name of the nav. Not color-contrast: axe cannot
          // parse oklch(0.145 0 none) and leaves it undecided, so the contrast is measured from pixels further up.
          expect(first.passes).toEqual(expect.arrayContaining(['link-name', 'listitem', 'aria-required-children', 'landmark-unique']))
          await linksOf(bar(page)).last().focus()
          expect((await axe(page)).violations).toEqual([])
        })
      }
    }
  }

  test('the content no demo should show: no violation either', async ({ page }) => {
    await openFixture(page)
    expect((await axe(page, '#hostile')).violations).toEqual([])
    expect((await axe(page, '#in-grid')).violations).toEqual([])
  })
})

test.describe('axe on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const demo of NAVBARS) {
    test(`${demo}: no violation where the list scrolls and the bar wraps`, async ({ page }) => {
      await openLive(page, demo)
      const found = await axe(page)
      expect(found.violations).toEqual([])
      expect(found.passes).toContain('scrollable-region-focusable')
    })
  }
})
