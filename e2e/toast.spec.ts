import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import type { ToastPlacement } from '../src/shared/contracts/toast.js'
import type { toast as toastApi } from '../src/components/toast/index.js'
import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { atRest, boxOf, expectNothingSideways, focusedName } from './overlay.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out: where the one viewport sits, what it lets through, what a finger, a key, a
// clock and a modal dialog do to a toast, and whether every toast stays inside a small screen.

declare global {
  interface Window { tc?: typeof toastApi }
}

/** A toast, once Base UI has drawn it: a dialog, or an alertdialog when its priority is high. */
const ROOTS = '[role="region"] > [role="dialog"], [role="region"] > [role="alertdialog"]'
/** The toasts a reader can see: past the limit one stays mounted, hidden. */
const SHOWN = `:is(${ROOTS}):visible`
const CLOSE = { en: 'Dismiss this notification', ar: 'إغلاق هذا الإشعار' } as const
const REGION = { en: 'Notifications', ar: 'الإشعارات' } as const
const PLACEMENTS = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'] as const satisfies readonly ToastPlacement[]
/** --tc-overlay-inset, the room the viewport keeps from the screen's edges. */
const INSET = 16
const SCREENS = [
  { width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 },
] as const

/** Opens a toast demo and hands the page the very `toast` the provider listens to, as a plain function. */
async function openToasts(page: Page, demo = 'basic', options: LiveOptions = {}): Promise<void> {
  await openLive(page, `toast--${demo}`, options)
  await page.addScriptTag({ type: 'module', content: "import { toast } from '/src/components/toast/index.tsx'\nwindow.tc = toast" })
  await page.waitForFunction(() => window.tc !== undefined)
}

/** toast.add from outside React, with the options a test can send across: text, numbers and strings. */
async function add(page: Page, options: { title?: string, description?: string, tone?: string, duration?: number, priority?: string, action?: string }): Promise<Locator> {
  await page.evaluate((given) => {
    const { action, ...rest } = given
    const api = window.tc
    if (!api) throw new Error('no toast on the page')
    return api.add({ ...(rest as Parameters<typeof api.add>[0]), ...(action === undefined ? {} : { action: { label: action, onClick: () => undefined } }) })
  }, options)
  const shown = page.locator(ROOTS).filter({ hasText: options.title ?? '' }).first()
  await expect(shown).toBeVisible()
  await atRest(shown)
  return shown
}

const xOf = (toast: Locator) => toast.getByRole('button', { name: /^(Dismiss this notification|إغلاق هذا الإشعار)$/ })
const region = (page: Page) => page.locator('[role="region"][aria-live]')

/** Where a toast is, relative to the screen's four edges. The body's width: a fixed box keeps clear of the
 * harness's scrollbar gutter, which the root's clientWidth still counts. */
async function edges(toast: Locator) {
  const box = await boxOf(toast)
  const screen = await toast.page().evaluate(() => ({ width: document.body.clientWidth, height: innerHeight }))
  return { left: box.left, right: screen.width - box.right, top: box.top, bottom: screen.height - box.bottom, center: box.left + box.width / 2 - screen.width / 2 }
}

test.describe('where the one viewport sits', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: bottom-end, the default, is the bottom ${direction === 'ltr' ? 'right' : 'left'}`, async ({ page }) => {
      await openToasts(page, 'basic', { direction })
      await page.locator('#demo button').click()
      const toast = page.locator(SHOWN).first()
      await atRest(toast)
      const at = await edges(toast)
      expect(at.bottom).toBe(INSET)
      expect(direction === 'ltr' ? at.right : at.left).toBe(INSET)
      expect(direction === 'ltr' ? at.left : at.right).toBeGreaterThan(500)
    })

    for (const placement of PLACEMENTS) {
      test(`${direction}: ${placement} sits at its edge`, async ({ page }) => {
        await openToasts(page, 'basic', { direction, toast: placement })
        const at = await edges(await add(page, { title: 'Placed', duration: 0 }))
        const [block, inline] = placement.split('-')
        expect(block === 'top' ? at.top : at.bottom).toBe(INSET)
        if (inline === undefined) expect(Math.abs(at.center)).toBeLessThanOrEqual(1)
        else {
          const atRight = (inline === 'end') === (direction === 'ltr')
          expect(atRight ? at.right : at.left).toBe(INSET)
        }
      })
    }

    for (const placement of ['top-end', 'bottom-end'] as const) {
      test(`${direction}: at ${placement} the newest toast is the nearest the edge`, async ({ page }) => {
        await openToasts(page, 'basic', { direction, toast: placement })
        for (const title of ['First', 'Second', 'Third']) await add(page, { title, duration: 0 })
        const titles = await page.locator(SHOWN).evaluateAll((all) => all
          .map((el) => ({ title: el.querySelector('h2')?.textContent ?? '', top: el.getBoundingClientRect().top }))
          .sort((a, b) => a.top - b.top)
          .map((row) => row.title))
        expect(titles).toEqual(placement === 'top-end' ? ['Third', 'Second', 'First'] : ['First', 'Second', 'Third'])
      })
    }
  }

  // The island takes nothing of its own: the one viewport is the outermost provider's, with its direction, language and settings.
  test('an RTL island on an English page has one viewport, the page provider\'s: bottom right, ltr, English', async ({ page }) => {
    await openToasts(page, 'rtl', { direction: 'ltr' })
    await page.locator('#demo button').click()
    await expect(page.locator('[role="region"]')).toHaveCount(1)
    await expect(region(page)).toHaveAttribute('dir', 'ltr')
    await expect(region(page)).toHaveAttribute('lang', 'en')
    await expect(region(page)).toHaveAttribute('aria-label', REGION.en)
    const toast = page.locator(SHOWN).first()
    await atRest(toast)
    await expect(xOf(toast)).toHaveAttribute('aria-label', CLOSE.en)
    expect((await edges(toast)).right).toBe(INSET)
  })

  test('the same island on an Arabic page: one viewport, bottom left, rtl, Arabic', async ({ page }) => {
    await openToasts(page, 'rtl', { direction: 'rtl' })
    await page.locator('#demo button').click()
    await expect(page.locator('[role="region"]')).toHaveCount(1)
    await expect(region(page)).toHaveAttribute('dir', 'rtl')
    await expect(region(page)).toHaveAttribute('lang', 'ar')
    await expect(region(page)).toHaveAttribute('aria-label', REGION.ar)
    const toast = page.locator(SHOWN).first()
    await atRest(toast)
    await expect(xOf(toast)).toHaveAttribute('aria-label', CLOSE.ar)
    expect((await edges(toast)).left).toBe(INSET)
  })
})

/** A small button of the page, fixed at a point, which records a real press. */
async function buttonUnder(page: Page, x: number, y: number): Promise<Locator> {
  await page.evaluate(([left, top]) => {
    document.getElementById('under')?.remove()
    const button = document.createElement('button')
    button.id = 'under'
    button.setAttribute('aria-label', 'Under')
    Object.assign(button.style, { position: 'fixed', left: `${String(left - 5)}px`, top: `${String(top - 5)}px`, width: '10px', height: '10px', padding: '0' })
    button.addEventListener('click', () => { button.dataset['pressed'] = 'yes' })
    document.body.append(button)
  }, [x, y] as const)
  return page.locator('#under')
}

test.describe('the viewport never catches a press meant for the page', () => {
  for (const placement of PLACEMENTS) {
    test(`${placement}: empty, and beside a toast, a button under its box is pressed by a real click`, async ({ page }) => {
      await openToasts(page, 'basic', { toast: placement })
      const empty = await boxOf(region(page))
      expect(empty.width * empty.height, 'an empty viewport still has a box').toBeGreaterThan(0)
      const center = [empty.left + empty.width / 2, empty.top + empty.height / 2] as const
      const under = await buttonUnder(page, ...center)
      await page.mouse.click(...center)
      await expect(under).toHaveAttribute('data-pressed', 'yes')

      await add(page, { title: 'Beside', duration: 0 })
      const full = await boxOf(region(page))
      // In the inset beside the toast, inside the viewport's own box.
      const beside = [full.left + 6, placement.startsWith('top') ? full.bottom - 6 : full.top + 6] as const
      const second = await buttonUnder(page, ...beside)
      expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.id, beside)).toBe('under')
      await page.mouse.click(...beside)
      await expect(second).toHaveAttribute('data-pressed', 'yes')
    })
  }

  test('with no toast the viewport is a named region with nothing in it, and axe passes', async ({ page }) => {
    await openToasts(page)
    await expect(region(page)).toHaveAttribute('role', 'region')
    expect(await region(page).evaluate((el) => el.children.length)).toBe(0)
    expect(await page.locator('body').ariaSnapshot()).toContain('- region "Notifications"')
    const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])
    expect(results.passes.map((pass) => pass.id)).toEqual(expect.arrayContaining(['aria-allowed-role', 'landmark-unique']))
  })
})

test.describe('with a toast open', () => {
  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`axe, ${mode} ${direction}: every tone, a description and an action`, async ({ page }) => {
        await openToasts(page, 'basic', { mode, direction })
        // Three at a time, the limit: a toast past it is not drawn, so axe would skip it.
        for (const tones of [['neutral', 'primary', 'success'], ['warning', 'danger', 'info']]) {
          await page.evaluate(() => { window.tc?.close() })
          await expect(page.locator(ROOTS)).toHaveCount(0)
          for (const tone of tones) await add(page, { tone, title: `A ${tone} toast`, description: 'A line under it.', action: 'Undo', duration: 0 })
          const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').analyze()
          expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
        }
      })
    }
  }

  test('the live region is polite and named, and a toast is read with its x, which Base UI would hide', async ({ page }) => {
    await openToasts(page)
    await add(page, { tone: 'success', title: 'Invitation sent', description: 'They get an email within the minute.', duration: 0 })
    await expect(region(page)).toHaveAttribute('aria-live', 'polite')
    const tree = await page.locator('body').ariaSnapshot()
    expect(tree).toContain('- region "Notifications":\n  - dialog "Invitation sent":\n    - heading "Invitation sent" [level=2]')
    expect(tree).toContain('    - paragraph: They get an email within the minute.\n    - button "Dismiss this notification"')
  })

  test('priority high: an alert carries the title and the text while the toast is not focused', async ({ page }) => {
    await openToasts(page, 'high-priority')
    await page.locator('#demo button').click()
    const alert = page.getByRole('alert')
    await expect(alert).toHaveText('Payment failedYour card was declined.')
  })

  test('priority high, not focused: the toast, its action and its x stay in the tree, and axe passes (TOAST-2)', async ({ page }) => {
    await openToasts(page)
    await add(page, { tone: 'danger', priority: 'high', title: 'Payment failed', description: 'Your card was declined.', action: 'Retry', duration: 0 })
    const root = page.locator('[role="region"] > [role="alertdialog"]')
    await expect(root).toHaveAttribute('aria-hidden', 'false')
    expect(await root.evaluate((el) => el.contains(document.activeElement))).toBe(false)
    const tree = await page.locator('body').ariaSnapshot()
    expect(tree).toContain('- region "Notifications":\n  - alertdialog "Payment failed":\n    - heading "Payment failed" [level=2]')
    expect(tree).toContain('    - paragraph: Your card was declined.\n    - button "Retry"\n    - button "Dismiss this notification"')
    const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
  })

  test('F6 reaches the viewport; Tab goes toast, action, x, then back to the page; Enter on the x returns focus to the trigger', async ({ page }) => {
    await openToasts(page, 'with-action')
    const trigger = page.locator('#demo button')
    await trigger.focus()
    await page.keyboard.press('Enter')
    await atRest(page.locator(SHOWN).first())
    await page.keyboard.press('F6')
    expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('region')
    const stops: string[] = []
    for (let n = 0; n < 4; n++) {
      await page.keyboard.press('Tab')
      stops.push(await focusedName(page))
    }
    expect(stops).toEqual(['Project archivedUndo', 'Undo', CLOSE.en, 'Archive'])
    await page.keyboard.press('F6')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(await focusedName(page)).toBe(CLOSE.en)
    await page.keyboard.press('Enter')
    await expect(page.locator(ROOTS)).toHaveCount(0)
    await expect.poll(() => focusedName(page)).toBe('Archive')
  })

  test('Escape closes the toast that holds focus and returns focus to the page; on the page it closes nothing', async ({ page }) => {
    await openToasts(page, 'sticky')
    const trigger = page.locator('#demo button')
    await trigger.focus()
    await page.keyboard.press('Enter')
    await atRest(page.locator(SHOWN).first())
    await page.keyboard.press('Escape')
    await expect(page.locator(SHOWN)).toHaveCount(1)
    await page.keyboard.press('F6')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Escape')
    await expect(page.locator(ROOTS)).toHaveCount(0)
    await expect.poll(() => focusedName(page)).toBe('Go offline')
  })
})

test.describe('over a modal dialog', () => {
  test('the toast is painted above the scrim, its x takes the mouse, F6 reaches it, and it is read', async ({ page }) => {
    await openToasts(page, 'over-dialog')
    await page.locator('#demo button').click()
    const dialog = page.locator('[role="dialog"][data-open]')
    await atRest(dialog)
    await dialog.getByRole('button', { name: 'Save' }).click()
    const toast = page.locator(SHOWN).first()
    await atRest(toast)
    const x = xOf(toast)
    const box = await boxOf(x)
    expect(await page.evaluate(([cx, cy]) => document.elementFromPoint(cx, cy)?.closest('button')?.getAttribute('aria-label'), [box.left + box.width / 2, box.top + box.height / 2] as const)).toBe(CLOSE.en)
    // The modal hides the page from a reader, never the portal of the toasts.
    expect(await page.locator('body').ariaSnapshot()).toContain('- region "Notifications":\n  - dialog "Settings saved"')

    // Tab stays in the dialog; F6 leaves it for the toast, and Tab past the x comes back to Save.
    await dialog.getByRole('button', { name: 'Save' }).focus()
    await page.keyboard.press('F6')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(await focusedName(page)).toBe(CLOSE.en)
    await page.keyboard.press('Tab')
    expect(await focusedName(page)).toBe('Save')

    await x.click()
    await expect(page.locator(ROOTS)).toHaveCount(0)
    await expect(dialog, 'pressing the x of a toast is no press outside the dialog').toBeVisible()
  })
})

test.describe('the limit and the timers', () => {
  test('at a limit of 3 the fourth toast is hidden, and appears when one closes', async ({ page }) => {
    await openToasts(page, 'many')
    await page.getByRole('button', { name: 'Twenty messages' }).click()
    await expect(page.locator(ROOTS)).toHaveCount(20)
    await expect(page.locator(SHOWN)).toHaveCount(3)
    await expect(page.locator(SHOWN).locator('h2')).toHaveText(['Message 20', 'Message 19', 'Message 18'])
    await xOf(page.locator(SHOWN).first()).click()
    await expect(page.locator(SHOWN).locator('h2')).toHaveText(['Message 19', 'Message 18', 'Message 17'])
  })

  test('a short duration leaves by itself, 0 stays, and hover and focus hold the timer (on Playwright\'s clock)', async ({ page }) => {
    await page.clock.install()
    await openToasts(page)
    await add(page, { title: 'Short', duration: 1000 })
    await add(page, { title: 'Sticky', duration: 0 })
    await page.clock.runFor(1500)
    await expect(page.locator(ROOTS).filter({ hasText: 'Short' })).toHaveCount(0)
    await page.clock.runFor(700_000)
    await expect(page.locator(SHOWN).filter({ hasText: 'Sticky' })).toHaveCount(1)
    await page.evaluate(() => { window.tc?.close() })
    await expect(page.locator(ROOTS)).toHaveCount(0)

    const hovered = await add(page, { title: 'Hovered', duration: 1000 })
    await hovered.hover()
    await page.clock.runFor(5000)
    await expect(hovered).toBeVisible()
    await page.mouse.move(2, 2)
    await page.clock.runFor(1500)
    await expect(page.locator(ROOTS)).toHaveCount(0)

    const focused = await add(page, { title: 'Focused', duration: 1000 })
    await page.keyboard.press('F6')
    await page.keyboard.press('Tab')
    await page.clock.runFor(5000)
    await expect(focused).toBeVisible()
  })
})

/** A finger on a toast, moved in a straight line by raw touch events, as e2e/overlay.ts's touchDrag does. */
async function swipe(page: Page, toast: Locator, dx: number, dy: number): Promise<number> {
  const box = await boxOf(toast)
  const [x, y] = [box.left + box.width / 2, box.top + box.height / 2]
  const session = await page.context().newCDPSession(page)
  const steps = 12
  let movedAtHalf = 0
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (let step = 1; step <= steps; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * step) / steps, y: y + (dy * step) / steps }] })
    await page.evaluate(() => new Promise((resolve) => { requestAnimationFrame(resolve) }))
    if (step === steps / 2) {
      const now = await boxOf(toast)
      movedAtHalf = Math.hypot(now.left - box.left, now.top - box.top)
    }
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
  return movedAtHalf
}

test.describe('a swipe, under a finger', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  const CASES: { placement: ToastPlacement, direction: 'ltr' | 'rtl', closes: [number, number][], stays: [number, number][] }[] = [
    { placement: 'bottom-end', direction: 'ltr', closes: [[150, 0], [0, 120]], stays: [[-150, 0], [0, -120]] },
    { placement: 'bottom-end', direction: 'rtl', closes: [[-150, 0], [0, 120]], stays: [[150, 0], [0, -120]] },
    { placement: 'top-start', direction: 'ltr', closes: [[-150, 0], [0, -120]], stays: [[150, 0], [0, 120]] },
    { placement: 'top-start', direction: 'rtl', closes: [[150, 0], [0, -120]], stays: [[-150, 0], [0, 120]] },
    { placement: 'bottom', direction: 'ltr', closes: [[0, 120]], stays: [[150, 0], [-150, 0], [0, -120]] },
    { placement: 'top', direction: 'rtl', closes: [[0, -120]], stays: [[150, 0], [-150, 0], [0, 120]] },
  ]

  for (const { placement, direction, closes, stays } of CASES) {
    test(`${placement} ${direction}: closes toward ${closes.map(String).join(' and ')}, stays toward ${stays.map(String).join(' and ')}`, async ({ page }) => {
      await openToasts(page, 'basic', { direction, toast: placement })
      for (const [dx, dy] of stays) {
        const toast = await add(page, { title: `Stays ${String(dx)},${String(dy)}`, description: 'A line to hold.', duration: 0 })
        await swipe(page, toast, dx, dy)
        await atRest(toast)
        await expect(toast, `a swipe of ${String(dx)},${String(dy)} closed it`).toBeVisible()
        const back = await boxOf(toast)
        expect(back.width).toBeGreaterThan(100)
        await page.evaluate(() => { window.tc?.close() })
        await expect(page.locator(ROOTS)).toHaveCount(0)
      }
      for (const [dx, dy] of closes) {
        const toast = await add(page, { title: `Closes ${String(dx)},${String(dy)}`, description: 'A line to hold.', duration: 0 })
        await swipe(page, toast, dx, dy)
        await expect(page.locator(ROOTS), `a swipe of ${String(dx)},${String(dy)} left it open`).toHaveCount(0)
      }
    })
  }

  test('the toast follows the finger: half-way through a 150 px swipe it has moved as far as the finger, not twice as far', async ({ page }) => {
    await openToasts(page)
    const toast = await add(page, { title: 'Held', description: 'A line to hold.', duration: 0 })
    const moved = await swipe(page, toast, 150, 0)
    expect(moved).toBeGreaterThan(55)
    expect(moved).toBeLessThanOrEqual(75)
  })
})

test.describe('toast.promise, toast.update and toast.close', () => {
  for (const [button, final, icon] of [['Upload', 'Uploaded', 'success'], ['Upload and fail', 'Upload failed', 'error']] as const) {
    test(`${button}: one toast turns from the spinner to ${icon}`, async ({ page }) => {
      await page.clock.install()
      await openToasts(page, 'promise')
      await page.getByRole('button', { name: button, exact: true }).click()
      const toast = page.locator(SHOWN).first()
      await expect(toast).toHaveAttribute('data-type', 'loading')
      await expect(toast.locator('h2')).toHaveText('Uploading')
      await expect(toast.locator('svg.animate-spin')).toHaveCount(1)
      const id = await toast.getAttribute('aria-labelledby')
      await page.clock.runFor(1100)
      await expect(toast).toHaveAttribute('data-type', icon)
      await expect(toast.locator('h2')).toHaveText(final)
      await expect(toast.locator('svg.animate-spin')).toHaveCount(0)
      await expect(toast.locator('svg')).toHaveCount(2)
      await expect(page.locator(ROOTS)).toHaveCount(1)
      expect(await toast.getAttribute('aria-labelledby')).toBe(id)
      expect(await liveErrors(page)).toEqual([])
    })
  }

  test('update and close from a plain function on the page, outside React', async ({ page }) => {
    await openToasts(page)
    const id = await page.evaluate(() => window.tc?.add({ title: 'Uploading', duration: 0 }) ?? '')
    await expect(page.locator(SHOWN).locator('h2')).toHaveText('Uploading')
    await page.evaluate((given) => { window.tc?.update(given, { title: 'Uploaded', tone: 'success' }) }, id)
    await expect(page.locator(SHOWN).locator('h2')).toHaveText('Uploaded')
    await expect(page.locator(SHOWN)).toHaveAttribute('data-type', 'success')
    await page.evaluate((given) => { window.tc?.close(given) }, id)
    await expect(page.locator(ROOTS)).toHaveCount(0)
  })
})

test.describe('hostile content', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)}x${String(screen.height)} ${direction}: a 300-letter word, a long action, twenty at once`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openToasts(page, 'long-content', { direction })
        await page.getByRole('button', { name: 'One long word' }).click()
        const toast = page.locator(SHOWN).first()
        await atRest(toast)
        await expectNothingSideways(toast, 'the toast of one long word')
        // The action's label wraps inside the button: a text node that overflows is no element, so it is measured here.
        const action = toast.getByRole('button', { name: /^Open the full report/ })
        expect(await action.evaluate((el) => el.scrollWidth - el.clientWidth), 'the action label runs out of its button').toBeLessThanOrEqual(1)
        const box = await boxOf(toast)
        const width = await page.evaluate(() => document.documentElement.clientWidth)
        expect(box.left).toBeGreaterThanOrEqual(0)
        expect(box.right).toBeLessThanOrEqual(width)
        await expectNoSidewaysScroll(page)

        await page.evaluate(() => { for (let n = 1; n <= 20; n++) window.tc?.add({ title: `Message ${String(n)}`, description: 'x'.repeat(300), duration: 0 }) })
        await expect(page.locator(SHOWN)).toHaveCount(3)
        await expectNoSidewaysScroll(page)
      })
    }
  }

  for (const direction of DIRECTIONS) {
    test(`844x390 ${direction}: three toasts taller than the screen; the viewport scrolls, and every x is reached by Tab and by the wheel`, async ({ page }) => {
      await page.setViewportSize({ width: 844, height: 390 })
      await openToasts(page, 'long-content', { direction })
      await page.getByRole('button', { name: 'Three tall toasts' }).click()
      await expect(page.locator(SHOWN)).toHaveCount(3)
      await atRest(page.locator(SHOWN).first())
      const scroller = await region(page).evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight }))
      expect(scroller.scroll).toBeGreaterThan(scroller.client)
      expect(scroller.client).toBeLessThanOrEqual(390)

      await page.keyboard.press('F6')
      for (const title of ['Third check', 'Second check', 'First check']) {
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        expect(await focusedName(page)).toBe(CLOSE[direction === 'ltr' ? 'en' : 'ar'])
        const x = await boxOf(xOf(page.locator(SHOWN).filter({ hasText: title })))
        expect(x.top, `${title}: its x is above the screen`).toBeGreaterThanOrEqual(0)
        expect(x.bottom, `${title}: its x is below the screen`).toBeLessThanOrEqual(390)
      }

      await page.mouse.click(2, 2)
      await region(page).evaluate((el) => { el.scrollTop = 0 })
      const oldest = xOf(page.locator(SHOWN).filter({ hasText: 'First check' }))
      const newest = await boxOf(page.locator(SHOWN).filter({ hasText: 'Third check' }))
      await page.mouse.move(newest.left + 40, newest.top + 40)
      for (let turn = 0; turn < 10 && (await boxOf(oldest)).top < 0; turn++) {
        await page.mouse.wheel(0, -300)
        await page.evaluate(() => new Promise((resolve) => { requestAnimationFrame(resolve) }))
      }
      expect((await boxOf(oldest)).top, 'the wheel never brought the oldest x into view').toBeGreaterThanOrEqual(0)
      await expectNoSidewaysScroll(page)
    })
  }
})

test.describe('the safe area', () => {
  for (const [placement, token, side] of [['bottom-end', '--tc-safe-bottom', 'padding-bottom'], ['top-start', '--tc-safe-top', 'padding-top']] as const) {
    test(`${placement}: ${token} set to 34px on the root grows the viewport's ${side} by 34 px`, async ({ page }) => {
      await openToasts(page, 'basic', { toast: placement })
      const before = await region(page).evaluate((el, prop) => parseFloat(getComputedStyle(el).getPropertyValue(prop)), side)
      await page.evaluate((name) => { document.documentElement.style.setProperty(name, '34px') }, token)
      const after = await region(page).evaluate((el, prop) => parseFloat(getComputedStyle(el).getPropertyValue(prop)), side)
      expect([before, after]).toEqual([INSET, INSET + 34])
    })
  }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('a toast keeps an edge against the page, and its icon and its x are drawn', async ({ page }) => {
      await openToasts(page)
      const toast = await add(page, { tone: 'success', title: 'Invitation sent', duration: 0 })
      const canvas = FORCED_CANVAS[scheme]
      const frame = await boxOf(toast)
      const edge = await pixelsOf(page, { x: Math.floor(frame.left) - 2, y: Math.floor(frame.top) + 10, width: 5, height: 20 })
      expect(inkOn(edge, canvas), 'no line parts the toast from the page').toBeGreaterThanOrEqual(20)
      for (const [part, target] of [['icon', toast.locator('svg').first()], ['x', xOf(toast)]] as const) {
        const box = await boxOf(target)
        const ink = await pixelsOf(page, { x: Math.floor(box.left), y: Math.floor(box.top), width: Math.ceil(box.width), height: Math.ceil(box.height) })
        expect(inkOn(ink, canvas), `the ${part} is not drawn`).toBeGreaterThan(10)
      }
    })

    test('a tone is told by its icon: four tones carry one, neutral and primary none', async ({ page }) => {
      await openToasts(page)
      const icons: Record<string, number> = {}
      for (const tone of ['success', 'warning', 'danger', 'info', 'neutral', 'primary']) {
        const toast = await add(page, { tone, title: `Tone ${tone}`, duration: 0 })
        icons[tone] = await toast.locator(':scope > span svg').count()
        await page.evaluate(() => { window.tc?.close() })
      }
      expect(icons).toEqual({ success: 1, warning: 1, danger: 1, info: 1, neutral: 0, primary: 0 })
    })
  })
}

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  test('the x and the action are at least 44 px', async ({ page }) => {
    await openToasts(page)
    const toast = await add(page, { title: 'Project archived', action: 'Undo', duration: 0 })
    for (const target of [xOf(toast), toast.getByRole('button', { name: 'Undo' })]) {
      const box = await boxOf(target)
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('at 844x390 under a finger, tapping each x in turn closes all three tall toasts', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    await openToasts(page, 'long-content')
    await page.getByRole('button', { name: 'Three tall toasts' }).tap()
    await expect(page.locator(SHOWN)).toHaveCount(3)
    for (const left of [2, 1, 0]) {
      const x = xOf(page.locator(SHOWN).first())
      await atRest(page.locator(SHOWN).first())
      await x.tap()
      await expect(page.locator(ROOTS)).toHaveCount(left)
    }
  })

  for (const screen of [{ width: 320, height: 480 }, { width: 844, height: 390 }]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)}x${String(screen.height)} ${direction}: a toast taller than the screen keeps its x on it, and one tap closes it (TOAST-3)`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openToasts(page, 'basic', { direction })
        const toast = await add(page, { tone: 'info', title: 'Report ready', description: `${'a'.repeat(300)} ${'More text follows here. '.repeat(20)}`, action: 'Open report', duration: 0 })
        // The finger cannot scroll a toast, so its top is above the screen for good.
        expect((await boxOf(toast)).top).toBeLessThan(0)
        const x = await boxOf(xOf(toast))
        expect(x.top).toBeGreaterThanOrEqual(0)
        expect(x.bottom).toBeLessThanOrEqual(screen.height)
        // The touchscreen, not Locator.tap, which would scroll the x into view first.
        await page.touchscreen.tap(x.left + x.width / 2, x.top + x.height / 2)
        await expect(page.locator(ROOTS)).toHaveCount(0)
      })
    }
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the spinner does not turn, and a closed toast leaves at once, never half-faded', async ({ page }) => {
    await openToasts(page, 'promise')
    await page.getByRole('button', { name: 'Upload', exact: true }).click()
    const spinner = page.locator(`${SHOWN} svg`).first()
    await expect(spinner).toHaveClass(/animate-spin/)
    expect(await spinner.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
    const toast = await add(page, { title: 'Leaving', duration: 0 })
    expect(await toast.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s')
    await xOf(toast).click()
    await expect(page.locator(ROOTS).filter({ hasText: 'Leaving' })).toHaveCount(0)
  })
})

test.describe('text zoom and spacing', () => {
  test('root at 32px on a 390 px screen: no sideways scroll, and the x stays on the screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openToasts(page)
    await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
    const toast = await add(page, { tone: 'success', title: 'Invitation sent', description: 'They get an email within the minute.', action: 'Undo', duration: 0 })
    await expectNothingSideways(toast)
    const x = await boxOf(xOf(toast))
    expect(x.right).toBeLessThanOrEqual(390)
    await expectNoSidewaysScroll(page)
  })

  for (const direction of DIRECTIONS) {
    test(`root at 32px on a 320 px screen, ${direction}: the text keeps 40% of the toast, and the action breaks only between words (TOAST-4)`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openToasts(page, 'basic', { direction })
      await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
      const toast = await add(page, { tone: 'warning', title: 'Storage almost full', description: 'Delete old files to free room.', action: 'Manage storage', duration: 0 })
      const frame = await boxOf(toast)
      const text = await boxOf(toast.locator('h2').locator('..'))
      expect(text.width / frame.width).toBeGreaterThanOrEqual(0.4)
      // Each line of the label, read letter by letter from where the browser drew it.
      const lines = await toast.getByRole('button', { name: 'Manage storage' }).evaluate((button) => {
        const node = [...button.childNodes].find((child) => child.nodeType === Node.TEXT_NODE)
        const out = new Map<number, string>()
        for (let at = 0; at < (node?.textContent?.length ?? 0); at++) {
          const range = document.createRange()
          range.setStart(node as Text, at)
          range.setEnd(node as Text, at + 1)
          const top = Math.round(range.getBoundingClientRect().top)
          out.set(top, (out.get(top) ?? '') + (node?.textContent?.[at] ?? ''))
        }
        return [...out.values()].map((line) => line.trim())
      })
      expect(lines).toEqual(['Manage', 'storage'])
      await expectNothingSideways(toast)
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: nothing leaves the toast', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openToasts(page)
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important } p { margin-bottom: 2em !important }' })
    const toast = await add(page, { tone: 'success', title: 'Invitation sent', description: 'They get an email within the minute.', action: 'Undo', duration: 0 })
    await expectNothingSideways(toast)
    const frame = await boxOf(toast)
    for (const part of await toast.locator('h2, p, button').all()) {
      const box = await boxOf(part)
      expect(box.bottom).toBeLessThanOrEqual(frame.bottom)
    }
    await expectNoSidewaysScroll(page)
  })
})
