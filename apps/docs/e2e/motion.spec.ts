// The site's motion: still under reduced motion, never past 300 ms otherwise, and no layout shift either way.
import { expect, test, type Page } from '@playwright/test'

const PAGES = ['/en', '/ar', '/en/docs/components', '/en/docs/theming', '/en/docs/components/button'] as const

interface Seen {
  name: string
  timeline: 'document' | 'scroll'
  total: number
  inDemo: boolean
}

/** Adds up every layout shift from the first paint, input or not: the shifts that move an element's box apart from those that move only text. */
async function watchShifts(page: Page) {
  await page.addInitScript(() => {
    const record = window as unknown as { shift: { boxes: number; glyphs: number } }
    record.shift = { boxes: 0, glyphs: 0 }
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; sources: { node: Node | null }[] })[]) {
        const glyphsOnly = entry.sources.every((source) => source.node?.nodeType === Node.TEXT_NODE)
        record.shift[glyphsOnly ? 'glyphs' : 'boxes'] += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

/** No box moves; a web font swapping in under a fallback with other metrics may move text by less than Lighthouse prints (0.000). */
async function expectNoShift(page: Page) {
  const shift = await page.evaluate(() => (window as unknown as { shift: { boxes: number; glyphs: number } }).shift)
  expect(shift.boxes).toBe(0)
  expect(shift.glyphs).toBeLessThan(0.0005)
}

/** Every animation alive right now, with its time from start to end; a library demo's own motion is told apart. */
async function animationsNow(page: Page): Promise<(Seen & { running: boolean })[]> {
  return page.evaluate(() => document.getAnimations().map((animation) => {
    const effect = animation.effect as KeyframeEffect | null
    const timing = effect?.getComputedTiming()
    const target = effect?.target ?? null
    const name = animation instanceof CSSAnimation ? animation.animationName : animation instanceof CSSTransition ? `transition ${animation.transitionProperty}` : 'script'
    return {
      name,
      timeline: animation.timeline instanceof DocumentTimeline ? 'document' : 'scroll',
      total: typeof timing?.endTime === 'number' ? timing.endTime : Number.POSITIVE_INFINITY,
      inDemo: target?.closest('[data-component], section[aria-labelledby="examples"], [style*="--tc-stage-height"]') != null,
      running: animation.playState === 'running',
    } as const
  }))
}

/** Scrolls to the foot of the page in steps and back to the top, calling `each` at every stop. */
async function scrollThrough(page: Page, each: () => Promise<void>) {
  for (let done = false; !done;) {
    done = await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 0.9)
      return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
    })
    await page.waitForTimeout(60)
    await each()
  }
  await page.evaluate(() => { window.scrollTo(0, 0) })
  await page.waitForTimeout(60)
  await each()
}

test.describe('under prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' })
  for (const path of PAGES) {
    test(`${path} runs no animation and shifts nothing`, async ({ page }) => {
      test.setTimeout(300_000)
      await watchShifts(page)
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const running: string[] = []
      await scrollThrough(page, async () => {
        for (const seen of await animationsNow(page)) if (seen.running) running.push(seen.name)
      })
      await page.waitForTimeout(300)
      expect(running).toEqual([])
      expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length)).toBe(0)
      await expectNoShift(page)
    })
  }
})

test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' })
  for (const path of PAGES) {
    test(`${path} ends every timed animation by 300 ms and shifts nothing`, async ({ page }) => {
      test.setTimeout(300_000)
      await watchShifts(page)
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const long: string[] = []
      await scrollThrough(page, async () => {
        for (const seen of await animationsNow(page)) {
          if (seen.timeline === 'document' && !seen.inDemo && seen.total > 300) long.push(`${seen.name} ${String(seen.total)} ms`)
        }
      })
      expect(long).toEqual([])
      await expectNoShift(page)
    })
  }

  test('Home reveals its sections with the scroll and plays the scripted motion once', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    const numbers = page.locator('[data-motion="count"]')
    const chips = page.locator('[data-motion="stagger"]').last()
    await expect(numbers).toHaveAttribute('data-motion-wait', '')
    await expect(chips).toHaveAttribute('data-motion-wait', '')
    await expect(numbers.locator('bdi').first()).toHaveText('46')
    await expect(numbers.locator('[data-count]').first()).toHaveAttribute('aria-hidden', 'true')
    const reveals = await page.locator('section[data-motion="reveal"]').evaluateAll((sections) => sections.map((section) => section.getAnimations().map((animation) => animation instanceof CSSAnimation && animation.timeline instanceof ViewTimeline ? animation.animationName : '').join()))
    expect(reveals).toEqual(['docs-reveal', 'docs-reveal', 'docs-reveal', 'docs-reveal', 'docs-reveal', 'docs-reveal', 'docs-reveal'])
    await numbers.scrollIntoViewIfNeeded()
    await expect(numbers).toHaveAttribute('data-motion-play', '')
    await expect(numbers).not.toHaveAttribute('data-motion-wait', '')
    await page.waitForTimeout(400)
    await expect(numbers.locator('bdi').first()).toHaveCSS('opacity', '1')
    await expect(numbers.locator('[data-count]').first()).toHaveCSS('opacity', '0')
    await chips.scrollIntoViewIfNeeded()
    await expect(chips).toHaveAttribute('data-motion-play', '')
    await page.waitForTimeout(400)
    await expect(chips.locator('li').last()).toHaveCSS('opacity', '1')
    await page.evaluate(() => { window.scrollTo(0, 0) })
    await page.waitForTimeout(100)
    await expect(numbers).not.toHaveAttribute('data-motion-wait', '')
  })

  test('the copy button ticks once it has copied', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/en')
    const button = page.getByRole('button', { name: /^Copy / }).first()
    await button.click()
    await expect(button.locator('svg.docs-tick')).toHaveCount(1)
  })
})
