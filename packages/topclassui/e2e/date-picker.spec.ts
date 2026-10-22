import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { EDGES } from '../scripts/lib/live-harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { type Box, atRest, boxOf, expectClosed, expectNothingSideways, focusIsInside, openOverlay } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out or open: the trigger's box, the calendar beside it at every edge and on a phone, the
// keys and the focus trap in a real browser, today in a real time zone, forced colours, and the form before hydration.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['basic', 'form', 'in-field', 'limits', 'playground', 'rtl', 'sizes', 'states', 'week-start'].map((demo) => `date-picker--${demo}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const
const POPUP = '[role="dialog"][data-placement]'
const RLM = String.fromCodePoint(0x200f)

const trigger = (page: Page, name?: string) => (name === undefined
  ? page.locator('#demo button[aria-haspopup="dialog"]').first()
  : page.getByRole('button', { name, exact: true }))
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
const focused = (page: Page) => page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName ?? '')
const hiddenValue = (page: Page, scope = '#demo') => page.locator(`${scope} input[aria-hidden="true"]`).first().inputValue()
const openCalendar = (page: Page, button: Locator, by: 'click' | 'keyboard' | 'tap' = 'click') => openOverlay(page, button, { by, popup: POPUP })
const day = (popup: Locator, name: string) => popup.getByRole('button', { name, exact: true })

/** The colour a value resolves to on this page: a token, or a system colour painted as it is. */
const resolve = (page: Page, value: string) => page.evaluate((colour) => {
  const probe = document.createElement('span')
  probe.style.setProperty('forced-color-adjust', 'none')
  probe.style.backgroundColor = colour
  document.body.appendChild(probe)
  return getComputedStyle(probe).backgroundColor
}, value)

/** Whether a popup lies beside its trigger, and how far off. Null while the two overlap. */
function gapOf(popup: Box, button: Box): number | null {
  if (popup.bottom <= button.top) return button.top - popup.bottom
  if (popup.top >= button.bottom) return popup.top - button.bottom
  if (popup.right <= button.left) return button.left - popup.right
  if (popup.left >= button.right) return popup.left - button.right
  return null
}

/** Loads a fixture module into a plain live page and waits for its first trigger. */
async function fixture(page: Page, file: string, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'separator--horizontal', options)
  await page.addScriptTag({ type: 'module', url: `/e2e/fixtures/${file}.tsx` })
  await expect(page.locator('button[aria-haspopup="dialog"]').first()).toBeVisible()
}

/** Presses a key and waits until the focus rests on the named day. */
async function press(page: Page, key: string, expected: string): Promise<void> {
  await page.keyboard.press(key)
  await expect.poll(() => focused(page), { message: `${key} should move to ${expected}` }).toBe(expected)
}

test.describe('the static page: the server HTML, before any script runs', () => {
  test.use({ reducedMotion: 'reduce' })

  const FINE = { xs: [165.6, 28], sm: [193.2, 32], md: [193.2, 40], lg: [220.8, 48], xl: [220.8, 56] }
  const sizes = async (page: Page) => {
    const out: Record<string, number[]> = {}
    for (const size of SIZES) { const box = await boxOf(trigger(page, NAMES[size])); out[size] = [box.width, box.height] }
    return out
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: at each size the trigger is as wide as an Input of that size, and as tall as a control`, async ({ page }) => {
      await page.goto(urlFor('date-picker--sizes', 'light', direction))
      expect(await sizes(page)).toEqual(FINE)
    })
  }

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('every trigger is at least 44 px tall, and its text is 16 px, so the width is an Input\'s of 16 px', async ({ page }) => {
      await page.goto(urlFor('date-picker--sizes', 'light', 'ltr'))
      expect(await sizes(page)).toEqual({ xs: [220.8, 44], sm: [220.8, 44], md: [220.8, 44], lg: [220.8, 48], xl: [220.8, 56] })
      for (const size of SIZES) expect(await css(trigger(page, NAMES[size]), 'font-size'), size).toBe('16px')
    })
  })

  test('date-picker--form sends checkIn=2026-10-02, and the target spec measures the trigger and the button, not the form input', async ({ page }) => {
    await page.goto(urlFor('date-picker--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['checkIn', '2026-10-02']])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.getAttribute('aria-haspopup') ?? el.getAttribute('type'))))
      .toEqual(['dialog', 'submit'])
  })

  test.describe('with JavaScript off', () => {
    test.use({ javaScriptEnabled: false })

    test('the static form submits checkIn=2026-10-02 itself; in a Field the label names the trigger and the input holds the day', async ({ page }) => {
      await page.goto(urlFor('date-picker--form', 'light', 'ltr'))
      await page.getByRole('button', { name: 'Save' }).click()
      await expect.poll(() => new URL(page.url()).searchParams.get('checkIn')).toBe('2026-10-02')
      await page.goto(urlFor('date-picker--in-field', 'light', 'ltr'))
      await expect(page.getByRole('button', { name: 'Check-in', exact: true })).toHaveAccessibleDescription('Oct 2, 2026 Rooms are ready from 15:00')
      expect(await page.locator('#demo input[name="checkIn"]').inputValue()).toBe('2026-10-02')
    })
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab stops on the trigger, the one stop, and the next Tab goes on to the submit button`, async ({ page }) => {
      await page.goto(urlFor('date-picker--form', 'light', direction))
      await page.keyboard.press('Tab')
      await expect(trigger(page)).toBeFocused()
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.getAttribute('type'))).toBe('submit')
    })
  }

  test('the states: the placeholder is muted, invalid is red and 2 px, disabled is dimmed; the icon sits at the inline start', async ({ page }) => {
    await page.goto(urlFor('date-picker--states', 'light', 'ltr'))
    const danger = await resolve(page, 'var(--tc-danger-solid)')
    expect(await css(trigger(page, 'idle').locator('span[id]'), 'color')).toBe(await resolve(page, 'var(--tc-muted)'))
    expect(await css(trigger(page, 'invalid'), 'border-top-color')).toBe(danger)
    expect(await css(trigger(page, 'invalid'), 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    expect(await css(trigger(page, 'disabled'), 'opacity')).toBe('0.5')
    const [icon, value] = [await boxOf(trigger(page, 'invalid').locator('span').first()), await boxOf(trigger(page, 'invalid').locator('span[id]'))]
    expect(icon.right).toBeLessThanOrEqual(value.left)
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`forced colours, ${scheme}: the trigger keeps a line at 3:1, and invalid thickens it to 2 px`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active', colorScheme: scheme })
      await page.goto(urlFor('date-picker--states', 'light', 'ltr'))
      const canvas = FORCED_CANVAS[scheme]
      const box = await boxOf(trigger(page, 'idle'))
      const left = await pixelsOf(page, { x: Math.floor(box.left), y: Math.round(box.top + box.height / 2), width: 3, height: 1 })
      expect(inkOn(left, canvas), 'line pixels at 3:1 on the inline-start edge').toBeGreaterThan(0)
      expect(contrast(rgbOf(await css(trigger(page, 'idle'), 'border-top-color')), canvas)).toBeGreaterThanOrEqual(3)
      expect(await css(trigger(page, 'invalid'), 'border-top-width')).toBe('2px')
    })
  }

  for (const direction of DIRECTIONS) {
    for (const screen of SCREENS) {
      test(`${direction} ${String(screen.width)} x ${String(screen.height)}: no demo scrolls the page sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of DEMOS) {
          await page.goto(urlFor(demo, 'light', direction))
          await expectNoSidewaysScroll(page)
          for (const button of await page.locator('#demo button').all()) {
            const box = await boxOf(button)
            expect(box.left, `${demo}: a button crosses the left edge`).toBeGreaterThanOrEqual(0)
            expect(box.right, `${demo}: a button crosses the right edge`).toBeLessThanOrEqual(screen.width)
          }
        }
      })
    }
  }

  test('text zoom: at a root of 32 px the trigger grows with its text and the page does not scroll sideways at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('date-picker--basic', 'light', 'ltr'))
    await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
    const box = await boxOf(trigger(page))
    expect(box.height).toBe(80)
    expect(box.right).toBeLessThanOrEqual(320)
    await expectNoSidewaysScroll(page)
  })

  test('WCAG 1.4.12 spacing: the trigger keeps its text on one line and its height', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('date-picker--basic', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    expect(await css(trigger(page).locator('span[id]'), 'text-overflow')).toBe('ellipsis')
    expect((await boxOf(trigger(page))).height).toBe(40)
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: hydration, the lazy calendar and the words of each locale', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const [demo, direction] of [['date-picker--basic', 'ltr'], ['date-picker--rtl', 'rtl'], ['date-picker--week-start', 'ltr']] as const) {
    test(`${demo} hydrates with no console error, ${direction}: the server's ICU and the browser's print the same day`, async ({ page }) => {
      await openLive(page, demo, { direction })
      expect(await liveErrors(page)).toEqual([])
    })
  }

  test('Node and this Chromium format the three locales alike, so a server page hydrates in each', async ({ page }) => {
    await openLive(page, 'date-picker--basic')
    const options = { calendar: 'gregory', timeZone: 'UTC', numberingSystem: 'latn' } as const
    const node = ['en', 'en-GB', 'ar'].map((locale) => new Intl.DateTimeFormat(locale, { ...options, dateStyle: 'medium' }).format(Date.UTC(2026, 8, 22)))
    const browser = await page.evaluate((opts) => ['en', 'en-GB', 'ar'].map((locale) => new Intl.DateTimeFormat(locale, { ...opts, dateStyle: 'medium' }).format(Date.UTC(2026, 8, 22))), options)
    expect(browser).toEqual(node)
    expect(node).toEqual(['Sep 22, 2026', '22 Sept 2026', `22${RLM}/09${RLM}/2026`])
  })

  test('the calendar is fetched on the first open and never before; a second open fetches nothing more', async ({ page }) => {
    const part: string[] = []
    page.on('request', (request) => { if (/date-picker-calendar/.test(request.url())) part.push(request.url()) })
    await openLive(page, 'date-picker--basic')
    expect(part).toEqual([])
    await openCalendar(page, trigger(page))
    expect(part.length).toBeGreaterThan(0)
    const fetched = part.length
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
    await openCalendar(page, trigger(page))
    expect(part, 'a second open fetches nothing more').toHaveLength(fetched)
  })

  test('Escape while the calendar is still loading: the part that arrives later shows nothing, takes no focus and leaves no portal', async ({ page }) => {
    let release = (): void => undefined
    const held = new Promise<void>((resolve) => { release = resolve })
    await page.route(/date-picker-calendar/, async (route) => { await held; await route.continue() })
    await openLive(page, 'date-picker--basic')
    const button = trigger(page)
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    const arrived = page.waitForResponse(/date-picker-calendar/)
    release()
    await arrived
    // The part's icons load after it, then it renders and focuses a frame later: nothing to poll for, so a wait.
    await page.waitForTimeout(500)
    expect(await page.locator('[role="dialog"]').count(), 'a calendar mounted after the close').toBe(0)
    expect(await page.locator('[data-base-ui-portal]:empty').count(), 'Base UI still holds the closed root mounted').toBe(0)
    await expect(button).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator(POPUP)).toBeVisible()
    await expect.poll(() => focused(page)).toBe('Tuesday, September 22, 2026')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
    expect(await hiddenValue(page)).toBe('2026-09-22')
  })

  test('a click and Enter each open it with the focus on the chosen day; Escape and Close return it to the trigger', async ({ page }) => {
    await openLive(page, 'date-picker--basic')
    const button = trigger(page)
    await openCalendar(page, button)
    expect(await focused(page)).toBe('Tuesday, September 22, 2026')
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
    await expect(button).toBeFocused()
    const popup = await openCalendar(page, button, 'keyboard')
    expect(await focused(page)).toBe('Tuesday, September 22, 2026')
    await popup.getByRole('button', { name: 'Close' }).click()
    await expectClosed(page, POPUP)
    await expect(button).toBeFocused()
    expect(await hiddenValue(page)).toBe('2026-09-22')
  })

  for (const open of ['first', 'second'] as const) {
    test(`Tab goes round previous, next and close, then the grid, on the ${open} open, and never leaves the popup`, async ({ page }) => {
      await openLive(page, 'date-picker--basic')
      if (open === 'second') {
        await openCalendar(page, trigger(page))
        await page.keyboard.press('Escape')
        await expectClosed(page, POPUP)
      }
      const popup = await openCalendar(page, trigger(page))
      const order: string[] = []
      for (let step = 0; step < 5; step++) {
        await page.keyboard.press('Tab')
        await expect.poll(() => focusIsInside(popup), { message: 'Tab took the focus out of the popup' }).toBe(true)
        order.push(await focused(page))
      }
      expect(order).toEqual(['Previous month', 'Next month', 'Close', 'Tuesday, September 22, 2026', 'Previous month'])
      await page.keyboard.press('Shift+Tab')
      await expect.poll(() => focused(page)).toBe('Tuesday, September 22, 2026')
    })
  }

  test('while open, Base UI hides the page from readers, the label too; once closed the trigger is named by its label again', async ({ page }) => {
    await openLive(page, 'date-picker--basic')
    const label = page.locator('label[for="date-picker-basic"]')
    await openCalendar(page, trigger(page))
    const hidden = () => label.evaluate((el) => el.closest('[aria-hidden="true"], [inert]') !== null)
    const dialog = page.locator(POPUP)
    expect([await hidden(), await dialog.getAttribute('aria-labelledby') !== null]).toEqual([true, true])
    await page.keyboard.press('Enter')
    await expectClosed(page, POPUP)
    await expect.poll(hidden).toBe(false)
    await expect(page.getByRole('button', { name: 'Check-in', exact: true })).toBeFocused()
    expect(await trigger(page).evaluate((el) => el.getAttribute('aria-describedby')?.split(' ').map((id) => document.getElementById(id)?.textContent)))
      .toEqual(['Sep 22, 2026'])
  })
})

test.describe('live: the keys of the grid, the Authoring Practices date picker dialog', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    const demo = direction === 'ltr' ? 'date-picker--week-start' : 'date-picker--rtl'
    test(`${direction}: the arrows, Home, End, PageUp, PageDown and Shift move the active day; Enter chooses it`, async ({ page }) => {
      await openLive(page, demo, { direction })
      const button = direction === 'ltr' ? trigger(page, 'Monday first') : trigger(page)
      const popup = await openCalendar(page, button)
      const name = async () => focused(page)
      if (direction === 'ltr') {
        await press(page, 'ArrowRight', 'Wednesday, September 23, 2026')
        await press(page, 'ArrowLeft', 'Tuesday, September 22, 2026')
        await press(page, 'ArrowDown', 'Tuesday, September 29, 2026')
        await press(page, 'ArrowUp', 'Tuesday, September 22, 2026')
        await press(page, 'Home', 'Monday, September 21, 2026')
        await press(page, 'End', 'Sunday, September 27, 2026')
        await press(page, 'PageDown', 'Tuesday, October 27, 2026')
        await press(page, 'Shift+PageUp', 'Monday, October 27, 2025')
        await press(page, 'PageUp', 'Saturday, September 27, 2025')
      } else {
        const first = await name()
        expect(first).toBe('الثلاثاء، 22 سبتمبر 2026')
        await press(page, 'ArrowLeft', 'الأربعاء، 23 سبتمبر 2026')
        await press(page, 'ArrowRight', 'الثلاثاء، 22 سبتمبر 2026')
        await press(page, 'ArrowDown', 'الثلاثاء، 29 سبتمبر 2026')
        await press(page, 'Home', 'السبت، 26 سبتمبر 2026')
        await press(page, 'End', 'الجمعة، 2 أكتوبر 2026')
        await press(page, 'PageDown', 'الاثنين، 2 نوفمبر 2026')
      }
      await expect(popup.getByRole('heading')).toHaveText(direction === 'ltr' ? 'September 2025' : 'نوفمبر 2026')
      await page.keyboard.press('Enter')
      await expectClosed(page, POPUP)
      await expect(button).toBeFocused()
      expect(await button.evaluate((el) => el.parentElement?.querySelector('input')?.value)).toBe(direction === 'ltr' ? '2025-09-27' : '2026-11-02')
    })
  }

  test('ltr: Home and End cross the month edge to the first and the last day of the week, and the grid turns with them', async ({ page }) => {
    await openLive(page, 'date-picker--week-start')
    const button = trigger(page, 'Monday first')
    const popup = await openCalendar(page, button)
    const heading = popup.getByRole('heading')
    await press(page, 'PageDown', 'Thursday, October 22, 2026')
    for (let step = 0; step < 3; step++) await page.keyboard.press('ArrowUp')
    await expect.poll(() => focused(page)).toBe('Thursday, October 1, 2026')
    await press(page, 'Home', 'Monday, September 28, 2026')
    await expect(heading).toHaveText('September 2026')
    await press(page, 'End', 'Sunday, October 4, 2026')
    await expect(heading).toHaveText('October 2026')
    await page.keyboard.press('Enter')
    await expectClosed(page, POPUP)
    expect(await button.evaluate((el) => el.parentElement?.querySelector('input')?.value)).toBe('2026-10-04')
  })

  test('rtl: ArrowLeft is the next day, and the next day is drawn to the left of the active one', async ({ page }) => {
    await openLive(page, 'date-picker--rtl', { direction: 'rtl' })
    const popup = await openCalendar(page, trigger(page))
    const [today, next] = [await boxOf(day(popup, 'الثلاثاء، 22 سبتمبر 2026')), await boxOf(day(popup, 'الأربعاء، 23 سبتمبر 2026'))]
    expect(next.right).toBeLessThanOrEqual(today.left)
    await press(page, 'ArrowLeft', 'الأربعاء، 23 سبتمبر 2026')
    const [previous, after] = [await boxOf(popup.getByRole('button', { name: 'الشهر السابق' })), await boxOf(popup.getByRole('button', { name: 'الشهر التالي' }))]
    expect(after.right).toBeLessThanOrEqual(previous.left)
  })

  test('the range stops the active day, and the previous button is disabled in minDate\'s month', async ({ page }) => {
    await openLive(page, 'date-picker--limits')
    const popup = await openCalendar(page, trigger(page))
    await press(page, 'PageUp', 'Friday, September 25, 2026')
    await press(page, 'ArrowLeft', 'Friday, September 25, 2026')
    await expect(popup.getByRole('button', { name: 'Previous month' })).toHaveAttribute('aria-disabled', 'true')
    const early = day(popup, 'Thursday, September 24, 2026')
    await expect(early).toHaveAttribute('aria-disabled', 'true')
    // The month changed under the pointer: the opacity transition of the new cells is let finish.
    await expect.poll(() => css(early, 'opacity')).toBe('0.5')
  })

  for (const [button, ends, title] of [['Next month', 'March 2027', 'Previous month'], ['Previous month', 'September 2026', 'Next month']] as const) {
    test(`${button} pressed into the month at the range's end keeps the focus, is dimmed, and does nothing more`, async ({ page }) => {
      await openLive(page, 'date-picker--limits')
      const popup = await openCalendar(page, trigger(page))
      const month = popup.getByRole('button', { name: button })
      await press(page, 'Tab', 'Previous month')
      if (button === 'Next month') await press(page, 'Tab', 'Next month')
      for (let step = 0; step < 6; step++) await page.keyboard.press('Enter')
      await expect(popup.getByRole('heading')).toHaveText(ends)
      await expect(month).toHaveAttribute('aria-disabled', 'true')
      await expect(month).toBeFocused()
      await expect.poll(() => css(month, 'opacity')).toBe('0.5')
      await page.keyboard.press('Enter')
      await expect(popup.getByRole('heading')).toHaveText(ends)
      await expect(popup.getByRole('button', { name: title })).not.toHaveAttribute('aria-disabled', 'true')
      await page.keyboard.press('Escape')
      await expectClosed(page, POPUP)
      await expect(trigger(page)).toBeFocused()
    })
  }

  test('no provider: it opens, formats in English, the popup takes the page\'s direction, and the keys work', async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/date-picker-no-provider.tsx' })
    const button = page.locator('#no-provider button')
    await expect(button).toHaveText('Sep 22, 2026')
    const popup = await openCalendar(page, button)
    expect(await popup.evaluate((el) => [el.parentElement?.getAttribute('dir') ?? null, getComputedStyle(el).direction])).toEqual([null, 'ltr'])
    await expect(popup.getByRole('heading')).toHaveText('September 2026')
    await press(page, 'ArrowRight', 'Wednesday, September 23, 2026')
    await page.keyboard.press('Enter')
    await expect(button).toHaveText('Sep 23, 2026')
  })
})

test.describe('live: today in the browser\'s own time zone', () => {
  test.use({ timezoneId: 'Asia/Riyadh' })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('at 2026-10-14T22:30:00Z it is already 15 October in Riyadh: that day is aria-current, underlined, and the calendar opens on it', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-14T22:30:00Z'))
    await openLive(page, 'date-picker--states')
    const popup = await openCalendar(page, trigger(page, 'idle'))
    const today = day(popup, 'Thursday, October 15, 2026')
    await expect(today).toHaveAttribute('aria-current', 'date')
    await expect(popup.locator('[aria-current]')).toHaveCount(1)
    await expect(today).toBeFocused()
    expect(await css(today, 'text-decoration-line')).toBe('underline')
  })
})

test.describe('live: where the calendar opens', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('ltr: 6 px under the trigger, its left edge on the trigger\'s, 268 px wide, six rows of 24 px days', async ({ page }) => {
    await openLive(page, 'date-picker--basic')
    const button = trigger(page)
    const popup = await openCalendar(page, button)
    const [p, t] = [await boxOf(popup), await boxOf(button)]
    expect(gapOf(p, t)).toBe(6)
    expect(Math.abs(p.left - t.left)).toBeLessThanOrEqual(1)
    expect(p.width).toBe(268)
    expect(await popup.locator('tbody tr').count()).toBe(6)
    expect((await boxOf(day(popup, 'Tuesday, September 22, 2026'))).height).toBe(24)
    expect(await popup.evaluate((el) => getComputedStyle(el).overscrollBehaviorY)).toBe('contain')
  })

  test('an RTL island on an LTR page: the calendar is laid out right to left, in Arabic, and ends at the trigger\'s right edge', async ({ page }) => {
    await openLive(page, 'date-picker--rtl', { direction: 'ltr' })
    const button = trigger(page)
    const popup = await openCalendar(page, button)
    expect(await popup.evaluate((el) => [getComputedStyle(document.body).direction, getComputedStyle(el).direction, el.parentElement?.getAttribute('lang')]))
      .toEqual(['ltr', 'rtl', 'ar'])
    expect(Math.abs((await boxOf(popup)).right - (await boxOf(button)).right)).toBeLessThanOrEqual(1)
    await press(page, 'ArrowLeft', 'الأربعاء، 23 سبتمبر 2026')
  })

  for (const direction of DIRECTIONS) {
    for (const edge of EDGES) {
      test(`${direction}, pinned ${edge}: the calendar is 8 px inside the viewport, 6 px off its trigger, and never over it`, async ({ page }) => {
        await openLive(page, 'date-picker--basic', { direction, edge })
        const button = trigger(page)
        const popup = await openCalendar(page, button)
        await expectInsideViewport(popup, 'the calendar', 8)
        await expectNoSidewaysScroll(page)
        const gap = gapOf(await boxOf(popup), await boxOf(button))
        expect(gap, 'the calendar lies over its trigger').not.toBeNull()
        expect(Math.abs((gap ?? 0) - 6)).toBeLessThanOrEqual(1)
      })
    }
  }

  for (const screen of [{ width: 320, height: 480 }, { width: 844, height: 390 }]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: at the four edges the calendar is whole or scrolls itself, and nothing in it scrolls sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const edge of EDGES) {
          await openLive(page, 'date-picker--basic', { direction, edge })
          const popup = await openCalendar(page, trigger(page))
          await expectInsideViewport(popup, `pinned ${edge}`, 8)
          await expectNothingSideways(popup)
          await expectNoSidewaysScroll(page)
          const focusedBox = await page.evaluate(() => { const r = document.activeElement?.getBoundingClientRect(); return r ? [r.top, r.bottom] : null })
          expect(focusedBox?.[0], `pinned ${edge}: the focused day is above the screen`).toBeGreaterThanOrEqual(0)
        }
      })
    }
  }

  test.describe('on a 320 x 480 phone with a coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: every day is at least 24 px wide and 44 px tall, the header buttons 44 px, and the page does not scroll sideways`, async ({ page }) => {
        await openLive(page, 'date-picker--basic', { direction })
        const popup = await openCalendar(page, trigger(page), 'tap')
        const days = await popup.locator('tbody button').evaluateAll((all) => all.map((el) => { const r = el.getBoundingClientRect(); return [r.width, r.height] }))
        expect(days).toHaveLength(30)
        expect(Math.min(...days.map(([width = 0]) => width))).toBeGreaterThanOrEqual(24)
        expect(Math.min(...days.map(([, height = 0]) => height))).toBeGreaterThanOrEqual(44)
        const header = await popup.locator(':scope > div').first().locator('button').evaluateAll((all) => all.map((el) => {
          const r = el.getBoundingClientRect()
          return r.width >= 44 && r.height >= 44
        }))
        expect(header).toEqual([true, true, true])
        await expectInsideViewport(popup, 'the calendar', 8)
        await expectNoSidewaysScroll(page)
      })
    }
  })
})

test.describe('live: where a page puts a DatePicker', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  /** The width and the height of every trigger, Select and Input of every case, by the case. */
  const boxes = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => Object.fromEntries(all.map((holder): [string, number[][]] => [
    holder.getAttribute('data-case') ?? '',
    [...holder.querySelectorAll('button, input:not([aria-hidden="true"])')].map((el) => {
      const r = el.getBoundingClientRect()
      return [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10]
    }),
  ])))
  const ALONE = ['grid', 'track', 'flex-1', 'w-fit', 'cell', 'label-row', 'beside-label'] as const
  const PAIRS = ['grid-pair', 'grid-pair-wrapped', 'flex-pair', 'flex-pair-wrapped'] as const

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: in every parent the trigger is an Input wide, 193.2 px, whatever its parent sizes by`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, 'date-picker-layouts', { direction })
      const found = await boxes(page)
      for (const name of ALONE) expect(found[name], name).toEqual([[193.2, 40]])
      for (const name of PAIRS) expect(found[name], name).toEqual([[193.2, 40], [193.2, 40]])
      expect(found['input-pair']?.map(([width]) => width)).toEqual([193.2, 193.2])
      await expectNoSidewaysScroll(page)
    })
  }

  for (const width of [320, 390]) {
    test.describe(`${String(width)} px, coarse pointer`, () => {
      test.use({ ...COARSE, viewport: { width, height: 700 } })

      for (const direction of DIRECTIONS) {
        test(`${direction}: two side by side are as wide as two Inputs and two Selects, keep their 44 px, and the page does not scroll`, async ({ page }) => {
          await fixture(page, 'date-picker-layouts', { direction })
          const found = await boxes(page)
          const inputs = found['input-pair']?.map(([w]) => w) ?? []
          expect(inputs[0], 'the Input of the pair').toBeLessThan(220.8)
          expect(found['select-pair']?.map(([w]) => w)).toEqual(inputs)
          for (const name of PAIRS) {
            expect(found[name]?.map(([w]) => w), name).toEqual(inputs)
            expect(found[name]?.map(([, h]) => h), name).toEqual([44, 44])
          }
          for (const name of ['w-fit', 'label-row', 'grid'] as const) expect(found[name], name).toEqual([[220.8, 44]])
          await expectNoSidewaysScroll(page)
        })
      }
    })
  }
})

test.describe('live: hostile content', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })
  test.use({ ...COARSE, viewport: { width: 320, height: 600 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a 300-character placeholder ends in an ellipsis, fullWidth in a table cell does not widen the page`, async ({ page }) => {
      await fixture(page, 'date-picker-hostile', { direction })
      await expectNoSidewaysScroll(page)
      for (const name of ['Long word', 'Long word, full width']) {
        const button = trigger(page, name)
        expect(await button.locator('span[id]').evaluate((el) => el.scrollWidth > el.clientWidth), name).toBe(true)
        const box = await boxOf(button)
        expect([box.left >= 0, box.right <= 320], name).toEqual([true, true])
      }
    })
  }

  test('a value that is no day sends name=, one outside the range is kept, and years 1 and 9999 open and stop at their ends', async ({ page }) => {
    await fixture(page, 'date-picker-hostile')
    expect(await serverEntries(page, '#hostile')).toEqual([['word', ''], ['bad', ''], ['outside', '2030-01-15'], ['first', '0001-01-01'], ['last', '9999-12-31']])
    await expect(trigger(page, 'No such day')).toHaveText('Pick a date')
    await expect(trigger(page, 'Outside')).toHaveText('Jan 15, 2030')
    let popup = await openCalendar(page, trigger(page, 'Year one'), 'tap')
    await expect(popup.getByRole('heading')).toHaveText('January 1')
    await expect(popup.getByRole('button', { name: 'Previous month' })).toHaveAttribute('aria-disabled', 'true')
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
    popup = await openCalendar(page, trigger(page, 'Year 9999'), 'tap')
    await expect(popup.getByRole('button', { name: 'Next month' })).toHaveAttribute('aria-disabled', 'true')
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
  })

  test('ar-u-nu-arab with numberingSystem arab: Arabic-Indic digits in the trigger, the title and the days', async ({ page }) => {
    await fixture(page, 'date-picker-hostile')
    await expect(trigger(page, 'Arabic digits')).toHaveText(`٢٢${RLM}/٠٩${RLM}/٢٠٢٦`)
    const popup = await openCalendar(page, trigger(page, 'Arabic digits'), 'tap')
    await expect(popup.getByRole('heading')).toHaveText('سبتمبر ٢٠٢٦')
    await expect(day(popup, 'الثلاثاء، ٢٢ سبتمبر ٢٠٢٦')).toHaveText('٢٢')
  })
})

test.describe('live: a form reset, a form action, and the input event', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/date-picker-reset.tsx' })
    await expect(page.locator('#date-picker-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.datePickerSent?.[name] ?? [], form)
  async function choose(page: Page, name: string, label: string) {
    const popup = await openCalendar(page, trigger(page, name))
    await day(popup, label).click()
    await expectClosed(page, POPUP)
  }

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each one is back at its default on screen and in the form; a controlled one keeps its owner's value`, async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-20T12:00:00'))
      for (const name of ['Plan', 'Empty', 'Owned', 'Far']) await choose(page, name, 'Friday, September 25, 2026')
      expect(await serverEntries(page, '#plain')).toEqual([['plan', '2026-09-25'], ['empty', '2026-09-25'], ['owned', '2026-09-25'], ['far', '2026-09-25']])
      expect(await page.evaluate(() => window.datePickerHeard)).toEqual(['2026-09-25', '2026-09-25', '2026-09-25'])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect(trigger(page, 'Plan')).toHaveText('Sep 22, 2026')
      await expect(trigger(page, 'Empty')).toHaveText('Pick a date')
      await expect(trigger(page, 'Owned')).toHaveText('Sep 25, 2026')
      await expect(trigger(page, 'Far')).toHaveText('Sep 22, 2026')
      expect(await serverEntries(page, '#plain')).toEqual([['plan', '2026-09-22'], ['empty', ''], ['owned', '2026-09-25'], ['far', '2026-09-22']])
    })
  }

  test('after a React 19 form action settles, it is back at its default on screen and in the form', async ({ page }) => {
    await choose(page, 'Pick', 'Friday, September 25, 2026')
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['pick', '2026-09-25']]])
    await expect(trigger(page, 'Pick')).toHaveText('Sep 22, 2026')
    expect(await serverEntries(page, '#action')).toEqual([['pick', '2026-09-22']])
  })

  test('with the action\'s answer as the new default, the choice stays, on screen and in the form', async ({ page }) => {
    await choose(page, 'Again', 'Friday, September 25, 2026')
    await page.locator('#echo').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    await expect(trigger(page, 'Again')).toHaveText('Sep 25, 2026')
    expect(await serverEntries(page, '#echo')).toEqual([['again', '2026-09-25']])
  })

  test('required with nothing chosen blocks the submit, and the focus goes to the trigger', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-20T12:00:00'))
    await page.locator('#required').getByRole('button', { name: 'Submit' }).click()
    await expect(trigger(page, 'Needed')).toBeFocused()
    expect(await sent(page, 'required')).toEqual([])
    await choose(page, 'Needed', 'Friday, September 25, 2026')
    await page.locator('#required').getByRole('button', { name: 'Submit' }).click()
    await expect.poll(() => sent(page, 'required')).toEqual([[['needed', '2026-09-25']]])
  })
})

test.describe('live: a Dialog around it', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('the first Escape closes the calendar and the second the Dialog; the page behind keeps scrolling with the calendar open', async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/date-picker-in-dialog.tsx' })
    await page.getByRole('button', { name: 'Edit booking' }).click()
    await expect(page.locator('[role="dialog"][data-open]:not([data-placement])')).toBeVisible()
    const button = trigger(page, 'In the dialog')
    const popup = await openCalendar(page, button)
    const box = await boxOf(popup)
    expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-placement]') !== null, { x: box.left + box.width / 2, y: box.top + box.height / 2 })).toBe(true)
    await page.keyboard.press('Escape')
    await expectClosed(page, POPUP)
    await expect(button).toBeFocused()
    await expect(page.locator('[role="dialog"]:visible')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expectClosed(page)
    await openCalendar(page, trigger(page, 'On the page'))
    const before = await page.evaluate(() => window.scrollY)
    await page.mouse.move(900, 600)
    await page.mouse.wheel(0, 300)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before)
  })
})

test.describe('live: a month button at the end of the range, and the first load, inside a Dialog and a Drawer', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const LAYERS = [['Dialog', 'Edit booking', 'Two months in the dialog'], ['Drawer', 'Pick a night', 'Two months in the drawer']] as const
  // A Drawer's sheet carries data-placement too; only the calendar is placed beside a side of its trigger.
  const CALENDAR = '[role="dialog"][data-side]'
  const layer = (page: Page) => page.locator('[role="dialog"]:not([data-side])')

  for (const [kind, opener, name] of LAYERS) {
    for (const by of ['keyboard', 'mouse'] as const) {
      test(`${kind}, ${by}: Next month into maxDate's month keeps the focus in the calendar, so one Escape closes the calendar alone`, async ({ page }) => {
        await fixture(page, 'date-picker-in-dialog')
        await page.getByRole('button', { name: opener }).click()
        const button = trigger(page, name)
        const popup = await openOverlay(page, button, { by: 'click', popup: CALENDAR })
        const next = popup.getByRole('button', { name: 'Next month' })
        if (by === 'keyboard') {
          await press(page, 'Tab', 'Previous month')
          await press(page, 'Tab', 'Next month')
          await page.keyboard.press('Enter')
        } else await next.click()
        await expect(popup.getByRole('heading')).toHaveText('October 2026')
        await expect(next).toHaveAttribute('aria-disabled', 'true')
        await expect(next).toBeFocused()
        await page.keyboard.press('Escape')
        await expectClosed(page, CALENDAR)
        await expect(button).toBeFocused()
        await expect(layer(page), `the Escape closed the ${kind} too`).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(layer(page)).toHaveCount(0)
      })
    }

    test(`${kind}: Escape while the calendar is still loading closes the calendar alone, and the part that arrives later takes no focus`, async ({ page }) => {
      let release = (): void => undefined
      const held = new Promise<void>((resolve) => { release = resolve })
      await page.route(/date-picker-calendar/, async (route) => { await held; await route.continue() })
      await fixture(page, 'date-picker-in-dialog')
      await page.getByRole('button', { name: opener }).click()
      const button = trigger(page, name)
      await expect(button).toBeVisible()
      await button.focus()
      await page.keyboard.press('Enter')
      await expect(button).toHaveAttribute('aria-expanded', 'true')
      await page.keyboard.press('Escape')
      await expect(button).toHaveAttribute('aria-expanded', 'false')
      await expect(layer(page), `the Escape closed the ${kind} too`).toBeVisible()
      const arrived = page.waitForResponse(/date-picker-calendar/)
      release()
      await arrived
      // The part's icons load after it, then it renders and focuses a frame later: nothing to poll for, so a wait.
      await page.waitForTimeout(500)
      expect(await page.locator(CALENDAR).count(), 'a calendar mounted after the close').toBe(0)
      await expect(button).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Enter')
      await expect(page.locator(CALENDAR)).toBeVisible()
      await expect.poll(() => focused(page)).toBe('Tuesday, September 22, 2026')
      await page.keyboard.press('Escape')
      await expectClosed(page, CALENDAR)
      await expect(layer(page)).toBeVisible()
      await expect(button).toHaveText('Sep 22, 2026')
    })
  }
})

test.describe('live: focus, forced colours and motion', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring is drawn whole around the trigger and around the focused day, 2 px at 2 px, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'date-picker--basic')
        await page.keyboard.press('Tab')
        const button = trigger(page)
        await expect(button).toBeFocused()
        const ring = (el: Locator) => Promise.all([css(el, 'outline-style'), css(el, 'outline-width'), css(el, 'outline-offset')])
        const cut = (el: Locator) => el.evaluate((node) => {
          const r = node.getBoundingClientRect()
          const edge = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
          const found: string[] = []
          for (let up = node.parentElement; up; up = up.parentElement) {
            const style = getComputedStyle(up)
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const clip = up.getBoundingClientRect()
            if (edge.left < clip.left || edge.top < clip.top || edge.right > clip.right || edge.bottom > clip.bottom) found.push(up.tagName)
          }
          return found
        })
        expect(await ring(button)).toEqual(['solid', '2px', '2px'])
        expect(await cut(button)).toEqual([])
        await page.keyboard.press('Enter')
        await expect(page.locator(POPUP)).toBeVisible()
        await expect.poll(() => focused(page)).toBe('Tuesday, September 22, 2026')
        await press(page, 'Home', 'Sunday, September 20, 2026')
        const active = page.locator(':focus')
        expect(await ring(active)).toEqual(['solid', '2px', '2px'])
        expect(await cut(active)).toEqual([])
      })
    })
  }

  for (const scheme of ['light', 'dark'] as const) {
    test.describe(`forced colours, ${scheme} palette`, () => {
      test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce', timezoneId: 'UTC' })

      test('the chosen day is the Highlight pair, today keeps its underline, and the header buttons keep their icons', async ({ page }) => {
        await page.clock.setFixedTime(new Date('2026-09-24T12:00:00Z'))
        await openLive(page, 'date-picker--basic')
        const popup = await openCalendar(page, trigger(page))
        const chosen = day(popup, 'Tuesday, September 22, 2026')
        expect(await css(chosen, 'background-color')).toBe(await resolve(page, 'Highlight'))
        expect(await css(chosen, 'color')).toBe(await resolve(page, 'HighlightText'))
        const today = day(popup, 'Thursday, September 24, 2026')
        expect(await css(today, 'text-decoration-line')).toBe('underline')
        expect(await css(today, 'background-color')).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/)
        const caret = await boxOf(popup.getByRole('button', { name: 'Next month' }).locator('svg'))
        const pixels = await pixelsOf(page, { x: Math.floor(caret.left), y: Math.floor(caret.top), width: Math.ceil(caret.width), height: Math.ceil(caret.height) })
        expect(inkOn(pixels, FORCED_CANVAS[scheme]), 'pixels of the caret at 3:1').toBeGreaterThan(5)
      })

      test('the ring on the focused chosen day is CanvasText, whichever mode the page is pinned to', async ({ page }) => {
        for (const mode of MODES) {
          await openLive(page, 'date-picker--basic', { mode })
          await page.keyboard.press('Tab')
          await page.keyboard.press('Enter')
          await expect.poll(() => focused(page), { message: mode }).toBe('Tuesday, September 22, 2026')
          const chosen = page.locator(':focus')
          expect(await css(chosen, 'outline-color'), mode).toBe(await resolve(page, 'CanvasText'))
          const box = await boxOf(chosen)
          const ring = await pixelsOf(page, { x: Math.floor(box.left) - 4, y: Math.round(box.top + box.height / 2), width: 2, height: 1 })
          expect(inkOn(ring, FORCED_CANVAS[scheme]), `${mode}: ring pixels at 3:1 on Canvas`).toBe(2)
        }
      })
    })
  }

  for (const mode of MODES) {
    test(`${mode}: the chosen day is told by more than its fill, an edge at 3:1 on the surface and a heavier weight`, async ({ page }) => {
      await openLive(page, 'date-picker--basic', { mode })
      const popup = await openCalendar(page, trigger(page))
      await atRest(popup)
      await press(page, 'ArrowRight', 'Wednesday, September 23, 2026')
      const chosen = day(popup, 'Tuesday, September 22, 2026')
      const [box, frame] = [await boxOf(chosen), await boxOf(popup)]
      const [surface = FORCED_CANVAS.light] = await pixelsOf(page, { x: Math.round(frame.left + 8), y: Math.round(frame.bottom - 8), width: 1, height: 1 })
      const edge = await pixelsOf(page, { x: Math.floor(box.left), y: Math.round(box.top + box.height / 2), width: 2, height: 1 })
      expect(Math.max(...edge.map((pixel) => contrast(pixel, surface))), 'the edge of the chosen day on the surface').toBeGreaterThanOrEqual(3)
      expect([await css(chosen, 'font-weight'), await css(day(popup, 'Monday, September 21, 2026'), 'font-weight')]).toEqual(['500', '400'])
    })
  }

  test('the calendar takes 150 ms to come and go; with reduced motion it opens in no time', async ({ page, browser }) => {
    await openLive(page, 'date-picker--basic')
    const popup = await openCalendar(page, trigger(page))
    expect(await css(popup, 'transition-duration')).toBe('0.15s')
    const reduced = await browser.newPage({ reducedMotion: 'reduce' })
    await openLive(reduced, 'date-picker--basic')
    const still = await openCalendar(reduced, trigger(reduced))
    expect([await css(still, 'transition-duration'), await css(still, 'opacity')]).toEqual(['0s', '1'])
    await reduced.close()
  })

  /** Each day whose digits leave under 2 px to the next day's, measured as laid out: closer, "10" and "11" read as one number. */
  const spilledDays = (popup: Locator) => popup.locator('tbody button').evaluateAll((all) => all.filter((el) => {
    const text = document.createRange()
    text.selectNodeContents(el)
    return text.getBoundingClientRect().width + 2 > el.getBoundingClientRect().width
  }).map((el) => el.textContent))

  for (const direction of DIRECTIONS) {
    for (const digits of ['Latin', 'Arabic-Indic'] as const) {
      test(`text zoom, ${direction}, ${digits} digits: at a root of 32 px the open calendar at 320 px scrolls itself, stays on screen, and no day outgrows its button`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 640 })
        if (digits === 'Latin') await openLive(page, 'date-picker--basic', { direction })
        else await fixture(page, 'date-picker-hostile', { direction })
        await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
        const popup = await openCalendar(page, digits === 'Latin' ? trigger(page) : trigger(page, 'Arabic digits'))
        await atRest(popup)
        await expectInsideViewport(popup, 'the calendar', 8)
        await expectNothingSideways(popup)
        await expectNoSidewaysScroll(page)
        expect(await spilledDays(popup), 'days whose digits run past their button').toEqual([])
      })
    }

    test(`${direction}: at the normal root the popup keeps the 14 px it is drawn with on a 320 px phone, and its days are as wide as their columns`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await openLive(page, 'date-picker--basic', { direction })
      const popup = await openCalendar(page, trigger(page))
      await atRest(popup)
      const chosen = await boxOf(popup.locator('tbody button[data-selected]'))
      expect([await css(popup, 'padding'), (await boxOf(popup)).width, Math.round(chosen.width)]).toEqual(['14px', 268, 34])
    })
  }
})

/** axe on the demo and on the portal its calendar opens in. Base UI's focus guards are aria-hidden and focusable on
 * purpose (aria-hidden-focus counts them), so they are left out. */
async function axe(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').exclude('[data-base-ui-focus-guard]').analyze()
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.describe('axe on the open calendar', () => {
  for (const demo of ['date-picker--basic', 'date-picker--rtl', 'date-picker--limits', 'date-picker--in-field']) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, in the calendar or in the demo behind it`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          await openCalendar(page, trigger(page))
          expect(await axe(page)).toEqual([])
        })
      }
    }
  }

  test.describe('on a 320 x 480 phone', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

    for (const demo of ['date-picker--basic', 'date-picker--rtl']) {
      test(`${demo}: no violation`, async ({ page }) => {
        await openLive(page, demo)
        await openCalendar(page, trigger(page), 'tap')
        expect(await axe(page)).toEqual([])
      })
    }
  })
})
