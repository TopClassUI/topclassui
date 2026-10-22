import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import {
  type Box, type OpenOptions, OPENED, atRest, boxOf, expectClosed, expectNothingSideways, focusedName, inkOf, openOverlay,
  pageLock, pressInside, scrollPageTo, touchDrag, wheelAt, withScrollbar,
} from './overlay.js'
import { DEMOS } from './pages.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out and the static page cannot open: where focus goes, what holds the page
// behind still, what scrolls, and whether the popup and everything in it stay inside a small screen.

/** The first trigger of every demo and the title its dialog shows. Written out, so a renamed demo fails here. */
const DIALOGS: Record<string, { trigger: string, title: string }> = {
  'dialog--basic': { trigger: 'Publish', title: 'Publish changes' },
  'dialog--close-on-success': { trigger: 'Rename and close', title: 'Rename this project' },
  'dialog--confirm': { trigger: 'Delete project', title: 'Delete this project?' },
  'dialog--long-body': { trigger: 'Read the terms', title: 'Terms of service' },
  'dialog--long-content': {
    trigger: 'Move to the archive',
    title: 'Move the quarterly report, its eleven attachments and every comment thread to the shared archive of the finance team',
  },
  'dialog--no-close-button': { trigger: 'What is new', title: 'Version 2.4' },
  'dialog--non-modal': { trigger: 'Find and replace', title: 'Find and replace' },
  'dialog--playground': { trigger: 'Publish', title: 'Publish changes' },
  'dialog--rtl': { trigger: 'نشر', title: 'نشر التغييرات' },
  'dialog--sizes': { trigger: 'xs', title: 'Size xs' },
  // The closed cell's trigger; its three other cells draw their dialogs open (tests of their own below).
  'dialog--states': { trigger: 'Open', title: 'Open' },
  'dialog--trap-focus': { trigger: 'Inspect', title: 'Inspector' },
  'dialog--with-form': { trigger: 'Rename', title: 'Rename this project' },
  'dialog--with-tooltip': { trigger: 'Share', title: 'Share this project' },
}

/** The three screens Unit 3 measures at: a small phone, a phone and a desktop. */
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }] as const

/** The x. In English and in Arabic, since the island demo names it from its own provider. */
const CLOSE = { en: 'Close this dialog', ar: 'إغلاق هذا الحوار' } as const

/** A trigger by its whole label. Not by role: the page behind an open dialog is hidden from roles. */
const triggerOf = (page: Page, name: string) =>
  page.locator('#demo button').filter({ has: page.getByText(name, { exact: true }) })

/** Opens a demo page and its first dialog, and returns the settled popup. */
async function open(page: Page, demo: string, options: LiveOptions & OpenOptions = {}): Promise<Locator> {
  const known = DIALOGS[demo]
  if (!known) throw new Error(`no row for ${demo}`)
  await openLive(page, demo, options)
  const popup = await openOverlay(page, triggerOf(page, known.trigger), options)
  await expect(popup.locator('h2')).toHaveText(known.title)
  return popup
}

const xOf = (popup: Locator) => popup.locator(`button[aria-label="${CLOSE.en}"], button[aria-label="${CLOSE.ar}"]`)

interface Parts { popup: Box, header: Box, body: Box, footer: Box, scrollTop: number, scrollable: number }

/** The three bars of a popup, found from its title: the header holds it, the body and the footer follow. */
const partsOf = (popup: Locator) => popup.evaluate((element): Parts => {
  const header = element.querySelector('h2')?.parentElement?.parentElement
  const body = header?.nextElementSibling
  const footer = body?.nextElementSibling
  if (!header || !body || !footer) throw new Error('the popup has no header, body and footer')
  const box = (target: Element): Box => {
    const { left, top, right, bottom, width, height } = target.getBoundingClientRect()
    return { left, top, right, bottom, width, height }
  }
  return {
    popup: box(element), header: box(header), body: box(body), footer: box(footer),
    scrollTop: body.scrollTop, scrollable: body.scrollHeight - body.clientHeight,
  }
})

const bodyOf = (popup: Locator) => popup.locator('div:has(> div > h2) + div')
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))

/** Each action of the footer: how tall its button is, how many lines its label takes, and whether any of it is cut. */
const actionsOf = (popup: Locator) => popup.evaluate((element) => {
  const footer = element.querySelector('h2')?.parentElement?.parentElement?.nextElementSibling?.nextElementSibling
  return [...(footer?.querySelectorAll('button') ?? [])].map((button) => {
    const label = button.querySelector('span') ?? button
    const range = document.createRange()
    range.selectNodeContents(label)
    const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size
    const cut = label.scrollWidth > label.clientWidth + 1 || label.scrollHeight > label.clientHeight + 1
    return `${String(button.getBoundingClientRect().height)} px, ${String(lines)} ${lines === 1 ? 'line' : 'lines'}, ${cut ? 'cut' : 'whole'}`
  })
})

/** The room the hostile dialog's text takes, in the platform's font: what a pin written out in px cannot know (Windows
 * wraps dialog--long-content at 320 px to other heights than Linux): the lines of the body's word, and the header and footer
 * that stand above and below the 60 px body floor in a popup 446 px inside. */
const textRoomOf = (popup: Locator) => popup.evaluate((element) => {
  const header = element.querySelector('h2')?.parentElement?.parentElement
  const body = header?.nextElementSibling
  const footer = body?.nextElementSibling
  if (!header || !body || !footer) throw new Error('the popup has no header, body and footer')
  const range = document.createRange()
  range.selectNodeContents(body)
  return {
    // Its lines at the 20 px line of text-sm: a range's box stops at the last glyph, short of its line.
    word: new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size * 20,
    body: body.clientHeight,
    bars: Math.round(header.getBoundingClientRect().height + footer.getBoundingClientRect().height),
  }
})

/** An action's height follows its lines: 40 px for one, and one 10 px step more for a label that wraps to two. */
const expectActionsWhole = (actions: string[]) => {
  for (const action of actions) {
    const [, height = '', lines = ''] = /^(\d+) px, (\d+) lines?, whole$/.exec(action) ?? []
    expect(action, 'an action is cut').toMatch(/, whole$/)
    expect(Number(height), action).toBe(40 + 10 * (Number(lines) - 1))
  }
}

/** How many boxes of a popup really scroll up and down: the popup itself and its body are the two that can. */
const scrollersOf = (popup: Locator) => popup.evaluate((element) => {
  const body = element.querySelector('h2')?.parentElement?.parentElement?.nextElementSibling
  return [element, body].filter((box) => box && box.scrollHeight > box.clientHeight + 1 && getComputedStyle(box).overflowY !== 'visible').length
})

test('the table names every dialog demo', () => {
  expect(Object.keys(DIALOGS).sort()).toEqual(DEMOS.filter((demo) => demo.startsWith('dialog--')).sort())
  expect(Object.keys(DIALOGS)).toHaveLength(14)
})

test.describe('the helper that opens every overlay', () => {
  /** What moves on the popup and beside it, read in the same tick openOverlay returned in. */
  const motion = (popup: Locator) => popup.evaluate((element) => {
    const style = getComputedStyle(element)
    const layer = element.closest('[data-base-ui-portal]') ?? element
    return {
      opacity: style.opacity, scale: style.scale, translate: style.translate,
      width: element.getBoundingClientRect().width, left: element.getBoundingClientRect().left,
      running: layer.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length,
    }
  })

  // On the first frame a popup is open and past its starting style it is at opacity 0, scale 0.95, 361 px wide.
  test('returns a dialog at rest: opaque, at full size, with no transition left running', async ({ page }) => {
    const popup = await open(page, 'dialog--basic')
    expect(await motion(popup)).toEqual({ opacity: '1', scale: 'none', translate: 'none', width: 380, left: 445, running: 0 })
  })

  // A Drawer slides and never fades, so a wait on its opacity would return on the first frame of the slide.
  test('waits out a slide that never fades, as a Drawer will make: the box it returns is the final one', async ({ page }) => {
    await openLive(page, 'dialog--basic')
    await page.addStyleTag({ content: [
      '[role="dialog"] { transition: translate 300ms linear !important; opacity: 1 !important; scale: none !important }',
      '[role="dialog"][data-starting-style] { translate: 100% 0 !important }',
    ].join('\n') })
    const popup = await openOverlay(page, triggerOf(page, 'Publish'))
    expect(await motion(popup)).toEqual({ opacity: '1', scale: 'none', translate: 'none', width: 380, left: 445, running: 0 })
  })

  test('returns at once where nothing moves, under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const popup = await open(page, 'dialog--basic')
    expect(await motion(popup)).toEqual({ opacity: '1', scale: 'none', translate: 'none', width: 380, left: 445, running: 0 })
  })
})

test.describe('focus', () => {
  test('opened from the keyboard, focus moves to the x with its ring, and Escape hands it back to the trigger', async ({ page }) => {
    const popup = await open(page, 'dialog--basic', { by: 'keyboard' })
    await expect(xOf(popup)).toBeFocused()
    await expect(xOf(popup)).toHaveCSS('outline-style', 'solid')
    await expect(xOf(popup)).toHaveCSS('outline-width', '2px')

    await page.keyboard.press('Escape')
    await expectClosed(page)
    await expect(triggerOf(page, 'Publish')).toBeFocused()
    expect(await liveErrors(page)).toEqual([])
  })

  test('the x closes the dialog and focus returns to the trigger', async ({ page }) => {
    const popup = await open(page, 'dialog--basic')
    await xOf(popup).click()
    await expectClosed(page)
    await expect(triggerOf(page, 'Publish')).toBeFocused()
  })

  test('Tab and Shift+Tab go round inside the dialog and never reach the page behind', async ({ page }) => {
    const popup = await open(page, 'dialog--basic', { by: 'keyboard' })
    expect(await focusedName(page)).toBe('Close this dialog')
    const seen: string[] = []
    for (const key of ['Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab'] as const) {
      seen.push(await pressInside(page, popup, key))
    }
    // Three controls: forward past the last one wraps to the x, and back from the x wraps to the last.
    expect(seen).toEqual([
      'Cancel', 'Publish now', 'Close this dialog', 'Cancel', 'Close this dialog', 'Publish now', 'Cancel',
    ])
  })

  test('a press outside closes it, and focus returns to the trigger', async ({ page }) => {
    await open(page, 'dialog--basic')
    await page.mouse.click(20, 600)
    await expectClosed(page)
    await expect(triggerOf(page, 'Publish')).toBeFocused()
  })

  test('with disablePointerDismissal a press outside leaves it open, and Escape still closes it', async ({ page }) => {
    const popup = await open(page, 'dialog--confirm')
    await page.mouse.click(20, 600)
    // Longer than the 150 ms it would take to fade out, so a dialog on its way out is not read as open.
    await page.waitForTimeout(400)
    await expect(popup).toBeVisible()
    await expect(popup).toHaveAttribute('data-open', '')

    await page.keyboard.press('Escape')
    await expectClosed(page)
    await expect(triggerOf(page, 'Delete project')).toBeFocused()
  })

  test('a form dialog starts in its first field, and Enter there submits the form the footer button belongs to', async ({ page }) => {
    const popup = await open(page, 'dialog--with-form', { by: 'keyboard' })
    const field = popup.locator('input[name="name"]')
    await expect(field).toBeFocused()
    // The whole column is one form, and the popup keeps the dialog role a form may not carry.
    expect(await popup.evaluate((el) => `${el.tagName} ${el.getAttribute('role') ?? ''}`)).toBe('DIV dialog')
    expect(await popup.locator('button[type="submit"]').evaluate((el: HTMLButtonElement) => el.form?.contains(document.activeElement))).toBe(true)

    await popup.locator('form').evaluate((form) => {
      form.addEventListener('submit', (event) => { event.preventDefault(); form.dataset['submitted'] = 'yes' })
    })
    await page.keyboard.press('Enter')
    await expect(popup.locator('form')).toHaveAttribute('data-submitted', 'yes')
  })

  test('with more in the form than the window holds, its body is still what scrolls: the form makes no box of its own', async ({ page }) => {
    // 268 px of popup, 266 inside its line, for a header of 53, a footer of 69 and a body grown to 304.
    await page.setViewportSize({ width: 400, height: 300 })
    const popup = await open(page, 'dialog--with-form')
    await bodyOf(popup).evaluate((body) => {
      const more = document.createElement('div')
      more.style.height = '200px'
      body.append(more)
    })
    const parts = await partsOf(popup)
    expect(parts.popup.height).toBe(268)
    expect(parts.body.height).toBe(144)
    expect(parts.scrollable, 'px the body scrolls').toBe(160)
    expect(parts.footer.bottom).toBe(parts.popup.bottom - 1)
    expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight), 'px the popup scrolls').toBe(0)
  })

  test('a form closes when its action succeeds, stays open with the error when it fails, and starts clean next time', async ({ page }) => {
    const popup = await open(page, 'dialog--close-on-success', { by: 'keyboard' })
    const field = popup.locator('input[name="name"]')
    await expect(field).toBeFocused()
    await expect(field).toHaveValue('Website redesign')

    // The name the stand-in action refuses. React empties the form after it; the demo hands the name back.
    await field.fill('Untitled')
    await page.keyboard.press('Enter')
    await expect(popup.locator('#demo-rename-error')).toHaveText('That name is taken.')
    await expect(popup).toHaveAttribute('data-open', '')
    await expect(field).toHaveValue('Untitled')
    await expect(field).toHaveAttribute('aria-invalid', 'true')

    await field.fill('Atlas')
    await popup.locator('button[type="submit"]').click()
    await expectClosed(page)
    await expect(triggerOf(page, 'Rename and close')).toBeFocused()
    expect((await pageLock(page)).overflow).toBe('visible')

    await page.keyboard.press('Enter')
    const again = page.locator('[role="dialog"][data-open]')
    await expect(again.locator('input[name="name"]')).toHaveValue('Website redesign')
    await expect(again.locator('#demo-rename-error')).toHaveCount(0)
    expect(await liveErrors(page)).toEqual([])
  })

  // The popup itself takes focus when its text is clicked, and shows its ring as soon as a key is pressed.
  for (const mode of MODES) {
    test(`${mode}: the ring of the popup is drawn inside it, on its own surface, and not on the scrim`, async ({ page }) => {
      const popup = await open(page, 'dialog--basic', { mode })
      await popup.locator('h2').click()
      await page.keyboard.press('ArrowDown')
      await expect(popup).toBeFocused()
      await expect(popup).toHaveCSS('outline-style', 'solid')
      await expect(popup).toHaveCSS('outline-offset', '-2px')

      // Its top edge, clear of the corners: the second row from the edge is ring against the surface, at 3:1 or more.
      const frame = await boxOf(popup)
      const [left, top] = [Math.floor(frame.left), Math.floor(frame.top)]
      const surface = await pixelsOf(page, { x: left + 40, y: top + 8, width: 1, height: 1 })
      const band = await pixelsOf(page, { x: left + 24, y: top + 1, width: 332, height: 1 })
      expect(inkOn(band, surface[0] ?? [0, 0, 0]), 'pixels of ring at 3:1 on the surface, along the top edge').toBe(332)
      // And nothing of it outside the box, where it lay on the scrim at 1.8:1.
      const ring = (band[0] ?? [0, 0, 0]).join(',')
      const outside = await pixelsOf(page, { x: left + 24, y: top - 4, width: 332, height: 3 })
      expect(outside.filter((pixel) => pixel.join(',') === ring), 'pixels of ring in the three rows above the popup').toEqual([])
    })
  }
})

test.describe('the page behind', () => {
  test('is hidden from assistive technology and cannot scroll while the dialog is open, and is given back on close', async ({ page }) => {
    await openLive(page, 'dialog--basic', { tall: true })
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect((await pageLock(page)).reachable).toEqual(['h1', 'main', 'pre', 'portal'])
    await expect(page.getByRole('button', { name: 'Publish' })).toHaveCount(1)

    await openOverlay(page, triggerOf(page, 'Publish'))
    // Base UI 1.8.0 marks every sibling of its portal aria-hidden, and locks the scroll on the body.
    const locked = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(locked.reachable).toEqual(['portal', 'portal'])
    expect(locked.body).toBe('overflow: hidden;')
    expect(locked.overflow).toBe('hidden')
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toHaveCount(0)
    await expect(page.getByRole('dialog', { name: 'Publish changes' })).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expectClosed(page)
    const released = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(released.reachable).toEqual(['h1', 'main', 'pre', 'portal'])
    expect(released.overflow).toBe('visible')
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a wheel over the scrim, the header and the end of the body leaves the page where it was`, async ({ page }) => {
      await openLive(page, 'dialog--long-body', { direction, tall: true })
      await scrollPageTo(page, 20)
      const popup = await openOverlay(page, triggerOf(page, 'Read the terms'))
      expect(await scrollY(page)).toBe(20)
      const { header, body } = await partsOf(popup)

      await wheelAt(page, 8, 400, 500)
      expect(await scrollY(page), 'after a wheel over the scrim').toBe(20)
      await wheelAt(page, header.left + 80, header.top + 20, 500)
      expect(await scrollY(page), 'after a wheel over the header').toBe(20)
      expect((await partsOf(popup)).scrollTop).toBe(0)

      for (let turn = 0; turn < 8; turn++) await wheelAt(page, body.left + 80, body.top + 200, 1000)
      const end = await partsOf(popup)
      expect(end.scrollable).toBeGreaterThan(1000)
      expect(end.scrollTop, 'the body is at its end').toBe(end.scrollable)
      await wheelAt(page, body.left + 80, body.top + 200, 1000)
      expect(await scrollY(page), 'after a wheel past the end of the body').toBe(20)

      // The same wheel does move the page once the dialog is gone, or all of the above proved nothing.
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await page.mouse.wheel(0, 200)
      await expect.poll(() => scrollY(page)).toBe(220)
    })
  }

  test.describe('under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    test('a drag inside the open dialog scrolls its body and never the page', async ({ page }) => {
      await openLive(page, 'dialog--long-body', { tall: true })
      // The control: the same drag scrolls the page while nothing is open.
      await touchDrag(page, 195, 600, 560)
      const before = await scrollY(page)
      expect(before).toBeGreaterThan(10)

      const popup = await openOverlay(page, triggerOf(page, 'Read the terms'), { by: 'tap' })
      const { body, header } = await partsOf(popup)
      await touchDrag(page, body.left + 80, body.top + 400, body.top + 100)
      expect((await partsOf(popup)).scrollTop).toBeGreaterThan(200)
      expect(await scrollY(page), 'after a drag in the body').toBe(before)

      for (let drag = 0; drag < 12; drag++) await touchDrag(page, body.left + 80, body.bottom - 20, body.top + 20)
      const end = await partsOf(popup)
      expect(end.scrollTop, 'the body is at its end').toBe(end.scrollable)
      await touchDrag(page, body.left + 80, body.bottom - 20, body.top + 20)
      expect(await scrollY(page), 'after a drag past the end of the body').toBe(before)

      await touchDrag(page, header.left + 80, header.bottom - 10, header.top + 4)
      await touchDrag(page, 8, 700, 400)
      expect(await scrollY(page), 'after a drag on the header and on the scrim').toBe(before)
      await expect(popup).toHaveAttribute('data-open', '')
    })
  })

  test.describe('with a classic scrollbar', () => {
    for (const direction of DIRECTIONS) {
      for (const edge of ['start', 'end'] as const) {
        withScrollbar(`${direction}, trigger at the ${edge}: opening and closing the dialog does not move the trigger`, async ({ barPage: page }) => {
          await openLive(page, 'dialog--basic', { direction, edge, tall: true })
          // A real bar, 10 px as the page draws it thin: the root's client box is narrower than the window.
          expect(await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)).toBe(10)
          const trigger = triggerOf(page, 'Publish')
          const before = await boxOf(trigger)

          await openOverlay(page, trigger)
          expect((await pageLock(page)).overflow).toBe('hidden')
          expect(await boxOf(trigger), 'while the dialog is open').toEqual(before)

          await page.keyboard.press('Escape')
          await expectClosed(page)
          expect(await boxOf(trigger), 'after it has closed').toEqual(before)
        })
      }
    }

    withScrollbar('the comparison can fail: with the gutter forced off, the trigger at the end moves by the 10 px of the bar', async ({ barPage: page }) => {
      await openLive(page, 'dialog--basic', { edge: 'end', tall: true })
      await page.addStyleTag({ content: 'html { scrollbar-gutter: auto !important }' })
      const trigger = triggerOf(page, 'Publish')
      const before = await boxOf(trigger)
      await openOverlay(page, trigger)
      expect((await boxOf(trigger)).left).toBe(before.left - 10)
    })
  })
})

test.describe('the long body', () => {
  test('scrolls inside the popup while the header and the footer keep their boxes', async ({ page }) => {
    const popup = await open(page, 'dialog--long-body')
    const before = await partsOf(popup)
    expect(before.scrollable).toBeGreaterThan(1000)
    // Flush: the header starts and the footer ends one line width inside the popup.
    expect(before.header.top).toBe(before.popup.top + 1)
    expect(before.footer.bottom).toBe(before.popup.bottom - 1)
    expect(before.body.top).toBe(before.header.bottom)
    expect(before.body.bottom).toBe(before.footer.top)

    await wheelAt(page, before.body.left + 80, before.body.top + 200, 600)
    const after = await partsOf(popup)
    expect(after.scrollTop).toBe(600)
    expect(after.header).toEqual(before.header)
    expect(after.footer).toEqual(before.footer)
    expect(after.popup).toEqual(before.popup)
    // The popup itself did not scroll: it is only the last resort of a screen too short for the three bars.
    expect(await popup.evaluate((el) => `${String(el.scrollTop)} ${String(el.scrollHeight - el.clientHeight)}`)).toBe('0 0')
  })

  test('takes focus from the keyboard with a ring drawn inside its own box, where the popup cannot clip it', async ({ page }) => {
    const popup = await open(page, 'dialog--long-body', { by: 'keyboard' })
    const body = bodyOf(popup)
    await page.keyboard.press('Tab')
    await expect(body).toBeFocused()
    await expect(body).toHaveCSS('outline-style', 'solid')
    await expect(body).toHaveCSS('outline-offset', '-2px')

    // The two pixels inside its top edge are ring from end to end: outside the box the popup would cut it.
    const box = await boxOf(body)
    const surface = await pixelsOf(page, { x: box.left + 40, y: box.top + 10, width: 1, height: 1 })
    const band = await pixelsOf(page, { x: box.left, y: box.top, width: box.width, height: 2 })
    expect(inkOn(band, surface[0] ?? [0, 0, 0]), 'pixels of ring along the top edge of the body').toBeGreaterThan(band.length * 0.9)

    // And the keyboard scrolls it from there.
    await page.keyboard.press('PageDown')
    await expect.poll(async () => (await partsOf(popup)).scrollTop).toBeGreaterThan(200)
  })
})

// No demo writes a tabIndex: the body takes one from useScrollTabStop for as long as its content overflows it.
test.describe('the body is a tab stop only while it scrolls', () => {
  test('a body that holds all it has takes no tabindex, so Tab goes from the x straight to the actions', async ({ page }) => {
    const popup = await open(page, 'dialog--basic', { by: 'keyboard' })
    expect((await partsOf(popup)).scrollable, 'px the body scrolls').toBe(0)
    await expect(bodyOf(popup)).not.toHaveAttribute('tabindex')
    expect(await pressInside(page, popup, 'Tab')).toBe('Cancel')
  })

  test('a body that scrolls takes tabindex 0: it is the stop after the x, and the arrow keys scroll it', async ({ page }) => {
    const popup = await open(page, 'dialog--long-body', { by: 'keyboard' })
    expect((await partsOf(popup)).scrollable, 'px the body scrolls').toBeGreaterThan(1000)
    await expect(bodyOf(popup)).toHaveAttribute('tabindex', '0')
    await page.keyboard.press('Tab')
    await expect(bodyOf(popup)).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect.poll(async () => (await partsOf(popup)).scrollTop).toBeGreaterThan(0)
    expect(await pressInside(page, popup, 'Tab')).toBe('Decline')
  })

  test('it becomes a stop when the screen shrinks under its text, and stops being one when the screen grows back', async ({ page }) => {
    const popup = await open(page, 'dialog--long-content')
    expect((await partsOf(popup)).scrollable, 'px the body scrolls at 1280 x 720').toBe(0)
    await expect(bodyOf(popup)).not.toHaveAttribute('tabindex')

    await page.setViewportSize({ width: 320, height: 480 })
    await expect(bodyOf(popup)).toHaveAttribute('tabindex', '0')
    // 180 on Linux, 174 on Windows: the word and its 36 px of padding, less the body's box.
    const room = await textRoomOf(popup)
    expect((await partsOf(popup)).scrollable, 'px the body scrolls at 320 x 480').toBe(room.word + 36 - room.body)

    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(bodyOf(popup)).not.toHaveAttribute('tabindex')
    expect(await liveErrors(page)).toEqual([])
  })
})

// BRO-1 and A11-1. Tab scrolls a control only just into view, flush with the edge of the box that scrolls it,
// and the ring is drawn 4 px outside the control: SCROLL_AREA keeps that much clear with scroll-padding.
test.describe('twenty fields in the body', () => {
  /** Adds twenty copies of the demo's field to the body, named f0 to f19, and says which box scrolls now and how far. */
  const addFields = (popup: Locator) => bodyOf(popup).evaluate((body) => {
    const field = body.querySelector('input')
    // Not its parent: in this demo a form with display contents sits between the two.
    const popupBox = body.closest('[role="dialog"]')
    if (!field || !popupBox) throw new Error('the body holds no field')
    for (let index = 0; index < 20; index++) {
      const copy = field.cloneNode(true) as HTMLInputElement
      copy.id = `f${String(index)}`
      copy.name = copy.id
      copy.removeAttribute('autofocus')
      body.append(copy)
    }
    const far = (box: Element) => box.scrollHeight - box.clientHeight
    return { body: far(body) > 0, popup: far(popupBox) > 0 }
  })

  /** The room between the focused field and the two block edges of the box that scrolls it, inside that box's line. */
  const roomOf = (popup: Locator) => bodyOf(popup).evaluate((body) => {
    const scroller = getComputedStyle(body).overflowY === 'visible' ? body.closest('[role="dialog"]') ?? body : body
    const top = scroller.getBoundingClientRect().top + scroller.clientTop
    const field = (document.activeElement ?? body).getBoundingClientRect()
    return { above: field.top - top, below: top + scroller.clientHeight - field.bottom }
  })

  for (const [width, height, scrolls] of [
    [390, 844, { body: true, popup: false }], [1280, 800, { body: true, popup: false }],
    // Under 272 px the popup is the one scroller, and it carries the same class.
    [320, 256, { body: false, popup: true }],
  ] as const) {
    for (const direction of DIRECTIONS) {
      test(`${String(width)} x ${String(height)} ${direction}: every field Tab brings into view keeps the 4 px its ring reaches, forward and back`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        const popup = await open(page, 'dialog--with-form', { direction, by: 'keyboard' })
        expect(await addFields(popup), 'which box scrolls').toEqual(scrolls)

        const cut: string[] = []
        const visit = async (key: 'Tab' | 'Shift+Tab', index: number) => {
          await page.keyboard.press(key)
          await expect(popup.locator(`#f${String(index)}`)).toBeFocused()
          const { above, below } = await roomOf(popup)
          if (above < 4 || below < 4) cut.push(`${key} to f${String(index)}: ${String(above)} px above, ${String(below)} px below`)
        }
        for (let index = 0; index < 20; index++) await visit('Tab', index)
        // The ring those 4 px are for: 2 px wide, 2 px away from the field.
        await expect(popup.locator('#f19')).toHaveCSS('outline-style', 'solid')
        await expect(popup.locator('#f19')).toHaveCSS('outline-width', '2px')
        await expect(popup.locator('#f19')).toHaveCSS('outline-offset', '2px')
        for (let index = 18; index >= 0; index--) await visit('Shift+Tab', index)
        expect(cut).toEqual([])
      })
    }
  }
})

test.describe('inside the viewport', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      const label = `${String(screen.width)} x ${String(screen.height)} ${direction}`

      test(`${label}: a body taller than the screen leaves the popup inside it, 16 px clear of every edge`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'dialog--long-body', { direction })
        await expectInsideViewport(popup, 'the popup', 16)
        await expectNoSidewaysScroll(page)
        await expectNothingSideways(popup)
        const parts = await partsOf(popup)
        expect(parts.scrollable, 'px the body can scroll').toBeGreaterThan(1000)
        expect(parts.footer.bottom).toBe(parts.popup.bottom - 1)
      })

      test(`${label}: a long title, a 300-character word and three long actions stay inside the popup`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'dialog--long-content', { direction })
        await expectInsideViewport(popup, 'the popup', 16)
        await expectNoSidewaysScroll(page)
        await expectNothingSideways(popup)

        // The title wraps beside the x and never runs under it.
        const [title, x] = [await inkOf(popup.locator('h2')), await boxOf(xOf(popup))]
        expect(title.height, 'px of title: more than one line').toBeGreaterThan(40)
        if (direction === 'ltr') expect(title.right).toBeLessThanOrEqual(x.left - 12)
        else expect(title.left).toBeGreaterThanOrEqual(x.right + 12)

        // The word is broken into lines no wider than the body, and the body still shows at least one of them.
        const [word, body] = [await inkOf(bodyOf(popup)), await boxOf(bodyOf(popup))]
        expect(word.left).toBeGreaterThanOrEqual(body.left + 18)
        expect(word.right).toBeLessThanOrEqual(body.right - 18)
        expect(word.height, 'px of word: several lines').toBeGreaterThan(100)
        expect(body.height).toBeGreaterThanOrEqual(60)

        // Where the three bars are taller than the screen, a wheel over the header scrolls the popup to its last
        // action. A wheel, not scrollIntoView: a script scrolls a box that clips, and a reader cannot.
        const [frame, header] = [await boxOf(popup), (await partsOf(popup)).header]
        const hidden = await popup.evaluate((el) => el.scrollHeight - el.clientHeight)
        // At 480 px tall, what the header, the 60 px body floor and the footer need past the 446 px inside the popup: 28 on Linux, 0 on Windows.
        const { bars } = await textRoomOf(popup)
        expect(hidden, 'px of popup below its own box').toBe(screen.height === 480 ? Math.max(0, bars + 60 - 446) : 0)
        await wheelAt(page, header.left + 40, header.top + 20, hidden)
        expect(await popup.evaluate((el) => el.scrollTop), 'px the wheel scrolled the popup').toBe(hidden)
        for (const button of await popup.locator('button:not([aria-label])').all()) {
          const box = await boxOf(button)
          const name = (await button.textContent()) ?? ''
          expect(box.top, `${name} starts above the popup`).toBeGreaterThanOrEqual(frame.top)
          expect(box.bottom, `${name} ends below the popup`).toBeLessThanOrEqual(frame.bottom)
          expect(box.left, `${name} starts outside the popup`).toBeGreaterThanOrEqual(frame.left)
          expect(box.right, `${name} ends outside the popup`).toBeLessThanOrEqual(frame.right)
        }

        // No action ends in an ellipsis. At 320 px the two long ones wrap onto a second line and grow by one
        // line of text; where a label fits its row, the button keeps the 40 px of its size.
        if (screen.width === 320) expectActionsWhole(await actionsOf(popup))
        else expect(await actionsOf(popup)).toEqual(['40 px, 1 line, whole', '40 px, 1 line, whole', '40 px, 1 line, whole'])
      })
    }
  }

  test('the five sizes are 320, 360, 380, 512 and 640 px wide, and custom takes the width of its className', async ({ page }) => {
    await openLive(page, 'dialog--sizes')
    const seen: string[] = []
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) {
      const popup = await openOverlay(page, triggerOf(page, size))
      seen.push(`${(await popup.getAttribute('data-size')) ?? ''} ${String((await boxOf(popup)).width)}`)
      await page.keyboard.press('Escape')
      await expectClosed(page)
    }
    expect(seen).toEqual(['xs 320', 'sm 360', 'md 380', 'lg 512', 'xl 640', 'custom 768'])
  })

  test('the stylesheet already holds the classes of a popup nothing has rendered yet', async ({ page }) => {
    const popup = await open(page, 'dialog--basic')
    const styles = await popup.evaluate((element) => {
      const own = getComputedStyle(element)
      const viewport = getComputedStyle(element.parentElement ?? element)
      const scrim = getComputedStyle(element.parentElement?.previousElementSibling ?? element)
      return {
        maxWidth: own.maxWidth, maxHeight: own.maxHeight, radius: own.borderRadius, line: own.borderTopWidth,
        raised: own.boxShadow !== 'none', wrap: own.overflowWrap, layer: `${viewport.zIndex} ${scrim.zIndex}`,
        inset: viewport.paddingTop, scrim: scrim.backgroundColor !== 'rgba(0, 0, 0, 0)', fixed: `${viewport.position} ${scrim.position}`,
      }
    })
    // max-w-95, the screen less two insets, rounded-box, the line, shadow-(--tc-shadow-overlay), wrap-anywhere, --tc-z-dialog, --tc-overlay-inset.
    expect(styles).toEqual({
      maxWidth: '380px', maxHeight: '688px', radius: '12px', line: '1px', raised: true, wrap: 'anywhere', layer: '60 60',
      inset: '16px', scrim: true, fixed: 'fixed fixed',
    })
  })
})

test.describe('a screen under 272 px tall', () => {
  // 320 x 256 is where WCAG judges reflow: 1280 x 1024 at 400%. 844 x 190 is a phone on its side with its keyboard up.
  for (const [width, height] of [[320, 256], [844, 190]] as const) {
    test(`${String(width)} x ${String(height)}: the popup is the one scroller, so a wheel that starts on the body reaches the last action`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      const popup = await open(page, 'dialog--long-body')
      await expectInsideViewport(popup, 'the popup', 16)
      await expect(bodyOf(popup)).toHaveCSS('overflow-y', 'visible')
      expect(await scrollersOf(popup), 'boxes that scroll').toBe(1)

      const [frame, parts] = [await boxOf(popup), await partsOf(popup)]
      expect(parts.footer.bottom, 'the footer starts out below the popup').toBeGreaterThan(frame.bottom + 1000)
      for (let turn = 0; turn < 6; turn++) await wheelAt(page, parts.body.left + 40, frame.top + frame.height / 2, 1000)
      expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop), 'px of popup still below').toBe(0)
      expect((await partsOf(popup)).footer.bottom).toBe(frame.bottom - 1)
      await expectNoSidewaysScroll(page)
    })
  }

  // The popup is tabindex -1: no stop of its own. Every control is inside it, so the keys that scroll act on it.
  test('320 x 256: the body is no tab stop there, and End, pressed on the x, scrolls the popup to its last action', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 })
    const popup = await open(page, 'dialog--long-body', { by: 'keyboard' })
    await expect(bodyOf(popup)).not.toHaveAttribute('tabindex')
    await expect(popup).toHaveAttribute('tabindex', '-1')
    await expect(xOf(popup)).toBeFocused()
    expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight), 'px the popup scrolls').toBeGreaterThan(3000)

    await page.keyboard.press('End')
    await expect.poll(() => popup.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop), { message: 'px of popup still below' }).toBe(0)
    expect((await partsOf(popup)).footer.bottom).toBe((await boxOf(popup)).bottom - 1)
    await expect(xOf(popup)).toBeFocused()
    expect((await axe(page)).violations).toEqual([])
  })

  test('568 x 320, a phone on its side: tall enough, so the bars stay put and the body is the one scroller', async ({ page }) => {
    await page.setViewportSize({ width: 568, height: 320 })
    const popup = await open(page, 'dialog--long-body')
    await expect(bodyOf(popup)).toHaveCSS('overflow-y', 'auto')
    expect(await scrollersOf(popup), 'boxes that scroll').toBe(1)
    const parts = await partsOf(popup)
    expect(parts.body.height).toBe(144)
    expect(parts.footer.bottom).toBe(parts.popup.bottom - 1)
    expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight)).toBe(0)
  })
})

// DIALOG-1. Text zoom grows the bars but not the rem of a media query, so the rule is a container query on the viewport.
test.describe('the root at 32 px', () => {
  for (const [width, height, short] of [[844, 390, true], [568, 320, true], [320, 480, true], [390, 844, false]] as const) {
    test(`${String(width)} x ${String(height)}: ${short ? 'the popup' : 'the body'} is the one scroller, and a wheel over the popup reaches the last action`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await openLive(page, 'dialog--long-body')
      await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
      const popup = await openOverlay(page, triggerOf(page, 'Read the terms'))
      await expect(bodyOf(popup)).toHaveCSS('overflow-y', short ? 'visible' : 'auto')
      expect(await scrollersOf(popup), 'boxes that scroll').toBe(1)

      const frame = await boxOf(popup)
      for (let turn = 0; turn < 30; turn++) await wheelAt(page, frame.left + frame.width / 2, frame.top + frame.height / 2, 1000)
      const parts = await partsOf(popup)
      expect(parts.footer.bottom, 'the end of the footer, against the end of the popup').toBe(parts.popup.bottom - 1)
      await expectNoSidewaysScroll(page)
    })
  }
})

test.describe('each value of modal', () => {
  const behind = (page: Page) => triggerOf(page, 'Behind the panel')
  const scrims = (page: Page) => page.locator('[data-base-ui-portal] .bg-overlay')

  /** Counts the presses a page button receives from now on, on the button itself. */
  const count = (button: Locator) => button.evaluate((element: HTMLElement) => {
    element.dataset['presses'] = '0'
    element.addEventListener('click', () => { element.dataset['presses'] = String(Number(element.dataset['presses']) + 1) })
  })

  /** Presses the middle of a box with the mouse, whatever is painted there: locator.click would wait for the box itself. */
  const pressAt = async (page: Page, target: Locator) => {
    const box = await boxOf(target)
    await page.mouse.click(box.left + box.width / 2, box.top + box.height / 2)
  }

  /** Whether a press in the middle of the popup lands on the popup: under a viewport that lets presses through, it must take its own back. */
  const takesPresses = (popup: Locator) => popup.evaluate((element) => {
    const box = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))
  })

  test('true, the default: a scrim, and a press on a page button closes the dialog without reaching the button', async ({ page }) => {
    await open(page, 'dialog--basic')
    await expect(scrims(page)).toHaveCount(1)
    const trigger = triggerOf(page, 'Publish')
    await count(trigger)
    await pressAt(page, trigger)
    await expectClosed(page)
    await expect(trigger).toHaveAttribute('data-presses', '0')
  })

  test('trap-focus: no scrim, the page takes a wheel and a press, and Tab and a screen reader stay in the dialog', async ({ page }) => {
    const popup = await open(page, 'dialog--trap-focus', { tall: true, by: 'keyboard' })
    await expect(scrims(page)).toHaveCount(0)
    await expect(popup.locator('xpath=..')).toHaveCSS('pointer-events', 'none')
    await expect(popup).toHaveCSS('pointer-events', 'auto')
    expect(await takesPresses(popup), 'a press on the popup lands on it').toBe(true)

    // The keyboard and the screen reader: held, as in a modal dialog.
    const seen = [await pressInside(page, popup, 'Tab'), await pressInside(page, popup, 'Tab'), await pressInside(page, popup, 'Tab')]
    expect(seen).toEqual(['Done', 'Close this dialog', 'Done'])
    const lock = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(lock.reachable).toEqual(['portal', 'portal'])

    // The pointer: free. The page scrolls behind the open dialog, and its button takes the press.
    expect(lock.overflow).toBe('visible')
    await wheelAt(page, 8, 500, 300)
    expect(await scrollY(page)).toBe(300)
    await page.evaluate(() => { window.scrollTo(0, 0) })
    await count(behind(page))
    await pressAt(page, behind(page))
    await expect(behind(page)).toHaveAttribute('data-presses', '1')
    // And that press outside closes it, as in every dialog without disablePointerDismissal.
    await expectClosed(page)
  })

  test('false: no scrim, the page takes a wheel and a press and is read, and Tab past the last control closes the dialog', async ({ page }) => {
    const popup = await open(page, 'dialog--non-modal', { tall: true, by: 'keyboard' })
    await expect(scrims(page)).toHaveCount(0)
    await expect(popup.locator('xpath=..')).toHaveCSS('pointer-events', 'none')
    await expect(popup).toHaveCSS('pointer-events', 'auto')
    expect(await takesPresses(popup), 'a press on the popup lands on it').toBe(true)
    const lock = await pageLock(page)
    // The first portal is the toast region TopClassProvider mounts on every page, which a modal leaves readable.
    expect(lock.reachable).toEqual(['h1', 'main', 'pre', 'portal', 'portal'])
    expect(lock.overflow).toBe('visible')
    await wheelAt(page, 8, 500, 300)
    expect(await scrollY(page)).toBe(300)
    await page.evaluate(() => { window.scrollTo(0, 0) })

    // Focus is not held: from the x, one Tab reaches Done, and the next leaves the dialog and closes it.
    expect(await pressInside(page, popup, 'Tab')).toBe('Done')
    await page.keyboard.press('Tab')
    await expectClosed(page)

    await openOverlay(page, triggerOf(page, 'Find and replace'))
    await count(behind(page))
    await pressAt(page, behind(page))
    await expect(behind(page)).toHaveAttribute('data-presses', '1')
    await expectClosed(page)
  })
})

// A Server Component hands a part its Button already rendered. A Button that is not disabled writes no disabled
// key, so the part's own is not outranked: before, such a trigger looked disabled and was announced as enabled.
test('disabled on a trigger or a close around a server-built Button: it leaves the tab order, is exposed as disabled, and takes no press', async ({ page }) => {
  await openLive(page, 'separator--horizontal')
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/dialog-server-built.tsx' })
  const off = page.locator('#server-built button').filter({ hasText: 'Disabled on the part' })
  await expect(off).toHaveAttribute('disabled', '')
  await expect(off).toHaveAttribute('data-disabled', '')
  // It keeps its pointer events for its not-allowed cursor, and a real press opens nothing.
  await expect(off).toHaveCSS('cursor', 'not-allowed')
  await off.click({ force: true })
  await expect(page.locator('[role="dialog"]')).toHaveCount(0)
  // What a screen reader is told: a button that is unavailable, by its native state and no ARIA stand-in.
  await expect(page.getByRole('button', { name: 'Disabled on the part', disabled: true })).toHaveCount(1)
  expect(await off.getAttribute('aria-disabled')).toBeNull()

  // Tab passes it by, and a click the page makes itself opens nothing.
  await page.locator('#before').focus()
  await page.keyboard.press('Tab')
  expect(await focusedName(page)).toBe('Enabled')
  await off.evaluate((button: HTMLButtonElement) => { button.click() })
  await expect(page.locator('[role="dialog"]')).toHaveCount(0)

  // The close that is disabled on the part, inside the dialog the enabled trigger opens.
  const popup = await openOverlay(page, page.locator('#server-built button').filter({ hasText: 'Enabled' }), { by: 'keyboard' })
  await expect(popup.getByRole('button', { name: 'Not now', disabled: true })).toHaveCount(1)
  await expect(popup.getByRole('button', { name: 'Done', disabled: false })).toHaveCount(1)
  // Two stops, not three: the x and Done.
  expect([await pressInside(page, popup, 'Tab'), await pressInside(page, popup, 'Tab')]).toEqual(['Done', 'Close this dialog'])
  expect(await liveErrors(page)).toEqual([])
})

// What wrap-anywhere costs: text may break at any letter, so beside a part that cannot shrink it shrinks to one.
// break-word instead lets a 300-character word widen a grid body to 2509 px, so anywhere stays and the cost is pinned.
test('320 x 480: a label beside a part that cannot shrink is one letter a line, and flex-wrap on the row is the remedy', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 })
  const popup = await open(page, 'dialog--basic')
  /** Puts a row of a label and a file name that never wraps into the body, and measures the label. */
  const labelIn = (row: string) => bodyOf(popup).evaluate((body, classes) => {
    document.getElementById('row')?.remove()
    body.insertAdjacentHTML('beforeend', `<div id="row" class="${classes}"><span id="label">Project name</span>`
      + '<span class="whitespace-nowrap">quarterly-report-final-v2-reviewed.pdf</span></div>')
    const label = document.getElementById('label')?.getBoundingClientRect()
    return { width: Math.round(label?.width ?? 0), height: Math.round(label?.height ?? 0), sideways: body.scrollWidth - body.clientWidth }
  }, row)

  expect(await labelIn('flex gap-2')).toEqual({ width: 12, height: 180, sideways: 0 })
  expect(await labelIn('flex flex-wrap gap-2')).toEqual({ width: 81, height: 20, sideways: 0 })
})

test.describe('a popup inside the dialog', () => {
  const tooltip = (page: Page) => page.locator('[data-placement][data-open]')

  // Base UI's tooltip is outside its tree of popups: opened by hover, one Escape used to close it and the dialog.
  for (const path of ['hover', 'focus'] as const) {
    test(`a tooltip opened by ${path}: the first Escape closes the tooltip, the second the dialog`, async ({ page }) => {
      const popup = await open(page, 'dialog--with-tooltip', { by: 'keyboard' })
      const copy = popup.locator('button[aria-label="Copy link"]')
      if (path === 'hover') await copy.hover()
      else await copy.focus()
      await expect(tooltip(page)).toHaveText('Copy link')
      // By hover the focus is still on the x; by focus it is on the tooltip's own trigger.
      expect(await focusedName(page)).toBe(path === 'hover' ? 'Close this dialog' : 'Copy link')

      await page.keyboard.press('Escape')
      await expect(tooltip(page)).toHaveCount(0)
      await expect(popup).toHaveAttribute('data-open', '')
      await expect(popup).toBeVisible()

      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(triggerOf(page, 'Share')).toBeFocused()
    })
  }

  // The inner trigger sits in the outer popup and is itself open: a guard that read the role of every dialog found it
  // there and cancelled the inner close, so the key closed nothing. Each root now looks inside its own popup only.
  test('a dialog nested in a dialog, focus back on its trigger: the first Escape closes it, the second the outer one', async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/dialog-nested.tsx' })
    const inner = page.locator('button').filter({ hasText: 'Rename' })
    const titles = () => page.locator('[role="dialog"][data-open] h2').allTextContents()
    await openOverlay(page, page.locator('#nested-dialog button').filter({ hasText: 'Settings' }), { by: 'keyboard' })
    await openOverlay(page, inner, { by: 'keyboard' })
    expect(await titles()).toEqual(['Project settings', 'Rename this project'])
    await page.keyboard.press('Shift+Tab')
    await expect(inner).toBeFocused()

    await page.keyboard.press('Escape')
    await expect.poll(titles).toEqual(['Project settings'])
    await page.keyboard.press('Escape')
    await expect.poll(titles).toEqual([])
  })
})

test.describe('direction', () => {
  /** Where the x, the title and the two actions lie: 19 px in from the box, the x's box 14, so its glyph ends on that line. */
  async function layoutOf(popup: Locator) {
    const [frame, x, title] = [await boxOf(popup), await boxOf(xOf(popup)), await inkOf(popup.locator('h2'))]
    const [first, second] = await Promise.all((await popup.locator('button:not([aria-label])').all()).map((b) => boxOf(b)))
    if (!first || !second) throw new Error('the footer holds two actions')
    return {
      xFromLeft: x.left - frame.left, xFromRight: frame.right - x.right,
      titleFromLeft: Math.round(title.left - frame.left), titleFromRight: Math.round(frame.right - title.right),
      firstFromLeft: first.left - frame.left, secondFromRight: Math.round(frame.right - second.right),
      secondFromLeft: second.left - frame.left, firstIsRightOfSecond: first.left > second.right,
    }
  }

  test('ltr: the x is at the right, the title starts at the left and the actions end at the right', async ({ page }) => {
    const layout = await layoutOf(await open(page, 'dialog--basic'))
    expect(layout).toMatchObject({ xFromRight: 14, titleFromLeft: 19, secondFromRight: 19, firstIsRightOfSecond: false })
  })

  test('rtl: the x is at the left, the title starts at the right and the actions end at the left', async ({ page }) => {
    const layout = await layoutOf(await open(page, 'dialog--basic', { direction: 'rtl' }))
    expect(layout).toMatchObject({ xFromLeft: 14, titleFromRight: 19, secondFromLeft: 19, firstIsRightOfSecond: true })
  })

  // The demo mounts its own RTL provider, so on an LTR page its portal sits in a <body> of the other direction.
  test('an RTL island on an LTR page lays its dialog out right to left: the x at the left, the text right-aligned', async ({ page }) => {
    const popup = await open(page, 'dialog--rtl', { direction: 'ltr' })
    const directions = await popup.evaluate((element) => ({
      body: getComputedStyle(document.body).direction,
      viewport: getComputedStyle(element.parentElement ?? element).direction,
      popup: getComputedStyle(element).direction,
      footer: getComputedStyle(element.lastElementChild ?? element).direction,
    }))
    expect(directions).toEqual({ body: 'ltr', viewport: 'rtl', popup: 'rtl', footer: 'rtl' })
    expect(await layoutOf(popup)).toMatchObject({ xFromLeft: 14, titleFromRight: 19, secondFromLeft: 19, firstIsRightOfSecond: true })
    // Named by the island's own labels, not the page's.
    await expect(xOf(popup)).toHaveAttribute('aria-label', CLOSE.ar)

    // And read in the island's language: the viewport carries the locale of the provider, and no demo writes lang.
    const languages = await popup.evaluate((element) => ({
      page: document.documentElement.lang,
      viewport: element.parentElement?.getAttribute('lang') ?? null,
      popup: element.getAttribute('lang'),
      arabic: element.matches(':lang(ar)'),
      english: element.matches(':lang(en)'),
    }))
    expect(languages).toEqual({ page: 'en', viewport: 'ar', popup: null, arabic: true, english: false })
  })

  test('the same demo on the RTL page is laid out the same way', async ({ page }) => {
    const popup = await open(page, 'dialog--rtl', { direction: 'rtl' })
    expect(await layoutOf(popup)).toMatchObject({ xFromLeft: 14, titleFromRight: 19, secondFromLeft: 19, firstIsRightOfSecond: true })
  })

  /** What a dialog must inherit from each page when no provider tells it, written out. */
  const INHERITED = {
    ltr: { direction: 'ltr', arabic: false, english: true, layout: { xFromRight: 14, titleFromLeft: 19, secondFromRight: 19, firstIsRightOfSecond: false } },
    rtl: { direction: 'rtl', arabic: true, english: false, layout: { xFromLeft: 14, titleFromRight: 19, secondFromLeft: 19, firstIsRightOfSecond: true } },
  } as const

  // R-13-1 asks for the provider and the harness always mounts one, so this dialog comes from a fixture module.
  for (const direction of DIRECTIONS) {
    test(`with no provider at all, on the ${direction} page: nothing is stamped on the viewport, and the dialog is laid out as its page is`, async ({ page }) => {
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/dialog-no-provider.tsx' })
      const popup = await openOverlay(page, page.locator('#no-provider button'))
      const read = await popup.evaluate((element) => ({
        dir: element.parentElement?.getAttribute('dir') ?? null,
        lang: element.parentElement?.getAttribute('lang') ?? null,
        direction: getComputedStyle(element).direction,
        arabic: element.matches(':lang(ar)'),
        english: element.matches(':lang(en)'),
      }))
      const { layout, ...inherited } = INHERITED[direction]
      expect(read).toEqual({ dir: null, lang: null, ...inherited })
      expect(await layoutOf(popup)).toMatchObject(layout)
      // With no provider the labels are the English defaults, on either page.
      await expect(xOf(popup)).toHaveAttribute('aria-label', CLOSE.en)
      expect(await liveErrors(page)).toEqual([])
    })
  }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    // Forced colours erase the fill, the shadow and the scrim: the line of the surface is the only edge left.
    test('the popup keeps a line against the page on every side, and the x is drawn', async ({ page }) => {
      const popup = await open(page, 'dialog--basic')
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const canvas = FORCED_CANVAS[scheme]
      const frame = await boxOf(popup)
      const [left, top, right, bottom] = [Math.floor(frame.left), Math.floor(frame.top), Math.ceil(frame.right), Math.ceil(frame.bottom)]
      // Both sides of the edge are Canvas there: the page behind the scrim and the surface of the popup.
      const outside = await pixelsOf(page, { x: left - 8, y: top + 100, width: 1, height: 1 })
      const inside = await pixelsOf(page, { x: left + 8, y: top + 100, width: 1, height: 1 })
      expect([outside[0], inside[0]]).toEqual([canvas, canvas])

      // Five pixels across each edge, clear of the rounded corners: one of the five is line, all the way along.
      const [along, across] = [bottom - top - 48, right - left - 48]
      const edges = {
        left: { x: left - 2, y: top + 24, width: 5, height: along },
        right: { x: right - 3, y: top + 24, width: 5, height: along },
        top: { x: left + 24, y: top - 2, width: across, height: 5 },
        bottom: { x: left + 24, y: bottom - 3, width: across, height: 5 },
      }
      for (const [side, clip] of Object.entries(edges)) {
        const length = side === 'left' || side === 'right' ? along : across
        expect(inkOn(await pixelsOf(page, clip), canvas), `pixels of line at 3:1 along the ${side} edge`).toBeGreaterThanOrEqual(length)
      }

      const x = await boxOf(xOf(popup))
      const glyph = { x: Math.floor(x.left), y: Math.floor(x.top), width: Math.ceil(x.width), height: Math.ceil(x.height) }
      // Two strokes one pixel wide across a 16 px glyph: 20 pixels were measured at 3:1 on both palettes.
      expect(inkOn(await pixelsOf(page, glyph), canvas), 'pixels of the x at 3:1').toBeGreaterThanOrEqual(16)
    })
  })
}

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const demo of Object.keys(DIALOGS)) {
    test(`${demo}: the x, every button and every field of the open dialog is at least 44 px`, async ({ page }) => {
      const popup = await open(page, demo, { by: 'tap' })
      const targets = await popup.locator('button, input').all()
      expect(targets.length).toBeGreaterThanOrEqual(1)
      for (const target of targets) {
        const box = await boxOf(target)
        const name = (await target.getAttribute('aria-label')) ?? (await target.getAttribute('name')) ?? (await target.textContent()) ?? ''
        expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44)
        expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44)
      }
    })
  }

  test('on a 320 x 480 phone the hostile dialog is taller than its screen, so the popup scrolls and no action is cut off', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    const popup = await open(page, 'dialog--long-content', { by: 'tap' })
    await expectInsideViewport(popup, 'the popup', 16)
    const parts = await partsOf(popup)
    // The body keeps one whole line, and what no longer fits is reached by scrolling the popup.
    expect(parts.body.height).toBe(60)
    // The header, the body floor and the 44 px actions past the 446 px inside the popup: 50 on Linux, 26 on Windows.
    const below = (await textRoomOf(popup)).bars + 60 - 446
    expect(below, 'px of popup below its own box').toBeGreaterThan(0)
    expect(await popup.evaluate((el) => el.scrollHeight - el.clientHeight), 'px of popup below its own box').toBe(below)
    const last = popup.locator('button').last()
    const frame = await boxOf(popup)
    // The footer's 14 px of padding and its 1 px line stand under the last action.
    expect((await boxOf(last)).bottom, 'the last action, before any scroll').toBe(frame.bottom + below - 15)

    // A finger on the header drags the popup up: a real drag, since a script scrolls a box that clips and a finger cannot.
    await touchDrag(page, parts.header.left + 40, parts.header.top + 200, parts.header.top + 80)
    expect(await popup.evaluate((el) => el.scrollTop), 'px the drag scrolled the popup').toBe(below)
    const box = await boxOf(last)
    expect(box.height).toBe(44)
    expect(box.bottom, 'the last action ends below the popup').toBeLessThanOrEqual(frame.bottom)
    expect(box.top, 'the last action starts above the popup').toBeGreaterThanOrEqual(frame.top)
    expect(await scrollY(page)).toBe(0)
  })
})

/**
 * axe on the demo and on the portal its dialog opens in. Not on the shell of the harness page: its
 * heading sits in no landmark, which a modal dialog hides and a dialog that is not modal leaves in view.
 */
async function axe(page: Page): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

test.describe('axe on the open dialog', () => {
  for (const demo of Object.keys(DIALOGS)) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation, in the dialog or in the demo behind it`, async ({ page }) => {
          await open(page, demo, { mode, direction })
          const results = await axe(page)
          expect(results.violations).toEqual([])
          // Not an empty run: axe did read the dialog.
          expect(results.passes).toContain('aria-dialog-name')
        })
      }
    }
  }
})

// At 320 x 480 the hostile body is 60 px tall for 240 px of text: a scroller with no control in it.
test.describe('axe on the open dialog, on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  const violations = async (page: Page) => (await axe(page)).violations

  for (const demo of Object.keys(DIALOGS)) {
    test(`${demo}: no violation`, async ({ page }) => {
      await open(page, demo, { by: 'tap' })
      expect(await violations(page)).toEqual([])
    })
  }

  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`dialog--long-content ${mode} ${direction}: its body scrolls there, and the keyboard can reach it`, async ({ page }) => {
        const popup = await open(page, 'dialog--long-content', { mode, direction, by: 'tap' })
        expect((await partsOf(popup)).scrollable, 'px the body scrolls').toBeGreaterThan(100)
        await expect(bodyOf(popup)).toHaveAttribute('tabindex', '0')
        expect(await violations(page)).toEqual([])
      })
    }
  }
})

test.describe('motion', () => {
  const durations = (popup: Locator) => popup.evaluate((element) => ({
    popup: getComputedStyle(element).transitionDuration,
    scrim: getComputedStyle(element.parentElement?.previousElementSibling ?? element).transitionDuration,
    animated: getComputedStyle(element).transitionProperty,
  }))

  test('the popup and the scrim take 150 ms to come and go', async ({ page }) => {
    expect(await durations(await open(page, 'dialog--basic'))).toEqual({ popup: '0.15s', scrim: '0.15s', animated: 'opacity, scale' })
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('with prefers-reduced-motion the dialog still opens and closes, in no time at all', async ({ page }) => {
      const popup = await open(page, 'dialog--basic', { by: 'keyboard' })
      expect(await durations(popup)).toEqual({ popup: '0s', scrim: '0s', animated: 'opacity, scale' })
      await expect(popup).toHaveCSS('opacity', '1')
      await expect(popup).toHaveCSS('scale', 'none')

      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(triggerOf(page, 'Publish')).toBeFocused()
      // And again: a popup that never left its ending style would not come back.
      await page.keyboard.press('Enter')
      await expect(page.locator('[role="dialog"][data-open]')).toHaveCSS('opacity', '1')
    })
  })
})

// The wrap of the footer is for its actions: a Badge, a Tag, a Spinner or a Progress writes data-size too.
test.describe('what a footer holds besides its actions', () => {
  const heightsOf = (scope: Locator): Promise<Record<string, string>> => scope.locator('[data-kind]').evaluateAll(
    // The computed height and not the box: a turning spinner's box is as tall as its diagonal.
    (all) => Object.fromEntries(all.map((el) => [el.getAttribute('data-kind') ?? '', getComputedStyle(el).height])),
  )

  for (const coarse of [false, true]) {
    test.describe(coarse ? 'under a finger' : 'under a mouse', () => {
      test.use(coarse ? { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } : {})

      test('keeps the height it has on the page, and only a Button grows to the floor of its size', async ({ page }) => {
        await openLive(page, 'separator--horizontal')
        await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/dialog-footer-kinds.tsx' })
        const trigger = page.locator('#footer-kinds button').filter({ hasText: 'Footer' })
        await expect(trigger).toBeVisible()
        const alone = await heightsOf(page.locator('#footer-kinds'))
        const popup = await openOverlay(page, trigger, { by: 'keyboard' })
        const footer = popup.locator('[data-kind="badge"]').locator('..')
        const inside = await heightsOf(footer)
        expect(Object.keys(inside).sort()).toEqual(['badge', 'button', 'progress', 'spinner', 'tag'])
        for (const kind of ['badge', 'tag', 'spinner', 'progress']) expect(inside[kind], kind).toBe(alone[kind])
        await expect(footer.locator('[data-kind="button"]')).toHaveCSS('min-height', coarse ? '44px' : '40px')
      })
    })
  }
})

test.describe('the states demo, as the Every state strip draws it', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: closed, open, alert, scrolled and focus trapped; the four open dialogs whole inside their cells, taking no focus, and only the long body scrolls`, async ({ page }) => {
      await openLive(page, 'dialog--states', { direction })
      const cells = page.locator('#demo [title="closed"]').locator('xpath=..').locator(':scope > *')
      expect(await cells.evaluateAll((all) => all.map((cell) => cell.getAttribute('title')))).toEqual(['closed', 'open', 'alert', 'scrolled', 'focus trapped'])
      await expect(page.locator('#demo [title="closed"] [role="dialog"]')).toHaveCount(0)
      for (const [title, scrolls] of [['open', false], ['alert', false], ['scrolled', true], ['focus trapped', false]] as const) {
        const cell = page.locator(`#demo [title="${title}"]`)
        const popup = cell.locator(`[role="dialog"]${OPENED}`)
        await atRest(popup)
        const [inner, outer] = [await boxOf(popup), await boxOf(cell)]
        expect(inner.left >= outer.left && inner.right <= outer.right && inner.top >= outer.top && inner.bottom <= outer.bottom, `the dialog of "${title}" leaves its cell`).toBe(true)
        await expect(popup.locator('[data-scrolls]'), title).toHaveCount(scrolls ? 1 : 0)
      }
      await expect(xOf(page.locator('#demo [title="alert"] [role="dialog"]'))).toHaveCount(0)
      await expect(page.locator('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveCount(0)
      expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true)
      expect((await axe(page)).violations).toEqual([])
      expect(await liveErrors(page)).toEqual([])
    })
  }
})
