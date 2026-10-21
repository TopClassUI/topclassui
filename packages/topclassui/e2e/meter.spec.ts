import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectNoSidewaysScroll, liveErrors, openLive, type LiveOptions } from './live.js'
import { urlFor } from './pages.js'
import { describeBarContrast } from './bar-contrast.js'

// The static pages are the server HTML with no script: everything a Meter promises is in that HTML.
const DEMOS = ['basic', 'custom-size', 'range', 'rtl', 'sizes', 'tones'] as const

/** Each meter of the page: its track, its bar, and the ARIA a reader hears. */
const meters = (page: Page) => page.locator('#demo [role="meter"]').evaluateAll((all) => all.map((meter) => {
  const track = meter.getBoundingClientRect()
  const bar = meter.firstElementChild?.getBoundingClientRect()
  if (!bar) throw new Error('a meter lost its bar')
  return {
    track: { left: track.left, right: track.right, width: track.width, height: track.height },
    bar: { left: bar.left, right: bar.right, width: bar.width, height: bar.height },
  }
}))

test.describe('the bar sits where the range says', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: 512 of 1024 is half the track, from the ${direction === 'ltr' ? 'left' : 'right'} edge`, async ({ page }) => {
      await page.goto(urlFor('meter--range', 'light', direction))
      const [only, ...more] = await meters(page)
      expect(more).toEqual([])
      if (!only) throw new Error('the range demo lost its meter')
      expect(Math.abs(only.bar.width - only.track.width / 2), 'half the track').toBeLessThanOrEqual(0.5)
      const edge = direction === 'ltr' ? only.bar.left - only.track.left : only.track.right - only.bar.right
      expect(edge, 'from the inline-start edge').toBe(0)
      expect(only.bar.height).toBe(only.track.height)
    })
  }

  test('the rtl demo on an LTR page grows from the right: its own dir decides, not the page', async ({ page }) => {
    await page.goto(urlFor('meter--rtl', 'light', 'ltr'))
    const [disk, battery] = await meters(page)
    if (!disk || !battery) throw new Error('the rtl demo lost a meter')
    expect([disk.track.right - disk.bar.right, Math.round(disk.bar.width / disk.track.width * 100)]).toEqual([0, 50])
    expect([battery.track.right - battery.bar.right, Math.round(battery.bar.width / battery.track.width * 100)]).toEqual([0, 30])
  })

  test('a reader finds the role, its name and the reading in units, before any script', async ({ page }) => {
    await page.goto(urlFor('meter--range', 'light', 'ltr'))
    expect(await page.evaluate(() => document.scripts.length)).toBe(0)
    await expect(page.locator('#demo')).toMatchAriaSnapshot(`
      - text: "Disk: 512 GB of 1 TB"
      - 'meter "Disk: 512 GB of 1 TB"'
    `)
    await expect(page.getByRole('meter', { name: 'Disk: 512 GB of 1 TB' })).toHaveAttribute('aria-valuetext', '512 GB of 1 TB')
  })
})

test.describe('the heights follow padding-y', () => {
  test('the five sizes are 2, 4, 6, 8 and 10 px tall, and custom takes the caller height', async ({ page }) => {
    await page.goto(urlFor('meter--sizes', 'light', 'ltr'))
    expect((await meters(page)).map((m) => m.track.height)).toEqual([2, 4, 6, 8, 10])
    await page.goto(urlFor('meter--custom-size', 'light', 'ltr'))
    expect((await meters(page)).map((m) => m.track.height)).toEqual([6, 12])
  })

  test('text zoom to a 32 px root doubles them, and a phone still does not scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('meter--sizes', 'light', 'ltr'))
    await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
    expect((await meters(page)).map((m) => m.track.height)).toEqual([4, 8, 12, 16, 20])
    await expectNoSidewaysScroll(page)
  })
})

describeBarContrast('meter', 'meter')

test.describe('it takes no focus and does not move', () => {
  test('Tab passes over every meter of the page', async ({ page }) => {
    await page.goto(urlFor('meter--tones', 'light', 'ltr'))
    for (let stop = 0; stop < 3; stop += 1) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.closest('[role="meter"]') ?? null)).toBeNull()
    }
  })

  test('nothing animates, with or without reduced motion', async ({ page }) => {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion })
      await page.goto(urlFor('meter--basic', 'light', 'ltr'))
      const motion = await page.locator('#demo [role="meter"], #demo [role="meter"] > div').evaluateAll((all) =>
        all.map((el) => [getComputedStyle(el).transitionDuration, getComputedStyle(el).animationName]))
      expect(motion, reducedMotion).toEqual([['0s', 'none'], ['0s', 'none']])
    }
  })
})

const VIEWPORTS = [[320, 480], [390, 844], [1280, 800], [844, 390]] as const

test.describe('every demo fits every screen', () => {
  for (const [width, height] of VIEWPORTS) {
    for (const direction of DIRECTIONS) {
      test(`${String(width)} x ${String(height)}, ${direction}: no sideways scroll, every track inside the page and every bar inside its track`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        for (const demo of DEMOS) {
          await page.goto(urlFor(`meter--${demo}`, 'light', direction))
          await expectNoSidewaysScroll(page)
          const pageWidth = await page.evaluate(() => document.body.clientWidth)
          for (const { track, bar } of await meters(page)) {
            expect.soft(track.left, `${demo}: a track leaves the page`).toBeGreaterThanOrEqual(0)
            expect.soft(track.right, `${demo}: a track leaves the page`).toBeLessThanOrEqual(pageWidth)
            expect.soft(bar.left, `${demo}: a bar leaves its track`).toBeGreaterThanOrEqual(track.left)
            expect.soft(bar.right, `${demo}: a bar leaves its track`).toBeLessThanOrEqual(track.right)
          }
        }
      })
    }
  }
})

test.describe('live: where a page puts a meter, and hostile values', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/meter-layouts.tsx' })
    await expect(page.locator('#layouts [role="meter"]').first()).toBeAttached()
  }
  /** Per case: the width of its box, then each meter as track width / bar width, and whether each bar starts at the inline start. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((box) => {
    const rtl = getComputedStyle(box).direction === 'rtl'
    return [box.getAttribute('data-case'), Math.round(box.getBoundingClientRect().width * 10) / 10,
      ...[...box.querySelectorAll('[role="meter"]')].map((meter) => {
        const track = meter.getBoundingClientRect()
        const bar = meter.firstElementChild?.getBoundingClientRect()
        const start = bar && (rtl ? track.right - bar.right : bar.left - track.left) === 0
        return `${String(Math.round(track.width * 10) / 10)}/${String(Math.round((bar?.width ?? -1) * 10) / 10)}${start ? '' : ' off the start'}`
      })]
  }))
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  // A w-fit parent gives a track nothing to fill, so it takes its 4rem floor. Given a width, it keeps it.
  const WIDE = [
    ['grid', 1238, '1238/619'],
    ['track', 1238, '615/307.5'],
    ['flex-1', 1238, '1150/575'],
    ['w-fit', 64, '64/32'],
    ['w-fit-sized', 160, '160/80'],
    ['cell', 1238, '1140/570'],
    ['cell-sized', 1238, '160/80'],
    ['row', 1238, '1180.2/590.1'],
    ['word', 1238, '1238/619'],
    ['hostile', 1238, '1238/1238', '1238/0', '1238/0', '1238/619', '1238/1238', '1238/619', '1238/619'],
  ]
  const PHONE = [
    ['grid', 278, '278/139'],
    ['track', 278, '135/67.5'],
    ['flex-1', 278, '190/95'],
    ['w-fit', 64, '64/32'],
    ['w-fit-sized', 160, '160/80'],
    ['cell', 278, '180/90'],
    ['cell-sized', 278, '160/80'],
    ['row', 278, '220.2/110.1'],
    ['word', 278, '278/139'],
    ['hostile', 278, '278/278', '278/0', '278/0', '278/139', '278/278', '278/139', '278/139'],
  ]

  for (const direction of DIRECTIONS) {
    for (const [width, expected] of [[1280, WIDE], [320, PHONE]] as const) {
      test(`${String(width)} px, ${direction}: each layout gives the track its box, every bar starts at the inline start`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 })
        await fixture(page, { direction })
        expect(await cases(page)).toEqual(expected)
        await expectNoSidewaysScroll(page)
      })
    }
  }

  test('hostile values reach ARIA clamped, never as NaN or 1e308, and a NaN end takes its default', async ({ page }) => {
    await fixture(page)
    const read = await page.locator('#layouts [data-case="hostile"] [role="meter"]').evaluateAll((all) => all.map((m) =>
      ['aria-valuemin', 'aria-valuemax', 'aria-valuenow'].map((name) => m.getAttribute(name))))
    expect(read).toEqual([
      ['0', '100', '100'],
      ['0', '100', '0'],
      ['0', '100', '0'],
      ['-1000000000000000', '1000000000000000', '0'],
      ['10', '10', '10'],
      ['0', '100', '50'],
      ['0', '100', '50'],
    ])
  })
})
