import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, openLive } from './live.js'
import { type OpenOptions, boxOf, expectClosed, expectNothingSideways, openOverlay, scrollPageTo, touchDrag, wheelAt } from './overlay.js'
import { FORCED_CANVAS, inkOn, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out and the static page cannot open: the lazy panel, the windowed list
// under the combobox, where focus goes, what scrolls, and whether the palette fits a small screen.

/** The trigger of every demo. Written out, so a renamed demo fails here. */
const TRIGGERS: Record<string, string> = {
  'command--basic': 'Search',
  'command--empty-state': 'Find a command',
  'command--groups': 'Commands by group',
  'command--loading': 'Commands that are loading',
  'command--long-content': 'Every hostile case',
  'command--load-more': 'Search results',
  'command--long-page': 'Jump to a section',
  'command--playground': 'Search',
  'command--rtl': 'بحث',
  // No trigger: its palette opens by Ctrl K alone, which its closed cell draws (tests of its own below).
  'command--states': '',
  'command--ten-thousand': 'Ten thousand commands',
  'command--thousand': 'A thousand commands',
  'command--with-shortcuts': 'Commands with shortcuts',
  'command--with-tooltip': 'Find or ask',
}

const SCREENS = [
  { width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 },
] as const

const triggerOf = (page: Page, name: string) => page.locator('#demo button').filter({ has: page.getByText(name, { exact: true }) })
const inputOf = (page: Page) => page.locator('[role="dialog"] input[role="combobox"]')
const listOf = (page: Page) => page.locator('[role="dialog"] [role="listbox"]')
const ranOf = (page: Page) => page.getByTestId('ran')
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))

/** Opens a demo and its palette by its trigger, and returns the popup once it is at rest with the input focused. */
async function open(page: Page, demo: string, options: LiveOptions & OpenOptions = {}): Promise<Locator> {
  const trigger = TRIGGERS[demo]
  if (trigger === undefined) throw new Error(`no row for ${demo}`)
  await openLive(page, demo, options)
  const popup = await openOverlay(page, triggerOf(page, trigger), options)
  await expect(inputOf(page)).toBeFocused()
  return popup
}

/**
 * expectNothingSideways, less the one element it cannot know: the 1 px form input Base UI's autocomplete fixes at
 * the viewport's corner, clipped to nothing, which neither paints nor scrolls anything.
 */
async function nothingSideways(popup: Locator): Promise<void> {
  const hidden = popup.locator('input[id$="-hidden-input"]')
  await expect(hidden).toHaveCount(1)
  await expect(hidden).toHaveCSS('clip-path', 'inset(50%)')
  await hidden.evaluate((element) => { element.style.display = 'none' })
  await expectNothingSideways(popup)
  await hidden.evaluate((element) => { element.style.display = '' })
}

interface Active { id: string | null, text: string | null, highlighted: boolean, whole: boolean, mounted: number }

/** The row aria-activedescendant names, whether it is drawn as active and lies whole inside the list, and how many rows are mounted. */
const activeOf = (page: Page) => page.evaluate((): Active => {
  const input = document.querySelector('[role="dialog"] input[role="combobox"]')
  const list = document.querySelector('[role="dialog"] [role="listbox"]')
  const id = input?.getAttribute('aria-activedescendant') ?? null
  const row = id === null ? null : document.getElementById(id)
  const frame = list?.getBoundingClientRect()
  const box = row?.getBoundingClientRect()
  return {
    id,
    text: row?.textContent ?? null,
    highlighted: row?.hasAttribute('data-highlighted') ?? false,
    whole: box !== undefined && frame !== undefined && box.top >= frame.top - 0.5 && box.bottom <= frame.bottom + 0.5,
    mounted: list?.querySelectorAll('[role="option"]').length ?? 0,
  }
})

/** The scrollable room below the last mounted row. With the last row mounted, the spacers stood for exactly the
 * rows they replaced only if this is the list's own bottom padding, 6 px, and nothing more. */
const afterLast = (page: Page) => listOf(page).evaluate((list) => {
  const last = [...list.querySelectorAll('[role="option"]')].at(-1)
  const bottom = (last?.getBoundingClientRect().bottom ?? 0) - list.getBoundingClientRect().top + list.scrollTop
  return Math.round((list.scrollHeight - bottom) * 10) / 10
})

test('the table names every command demo', async () => {
  const { DEMOS } = await import('./pages.js')
  expect(DEMOS.filter((demo) => demo.startsWith('command--')).sort()).toEqual(Object.keys(TRIGGERS).sort())
})

test.describe('opening and closing', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: the trigger opens it with the focus in the input, and Escape closes it and hands the focus back`, async ({ page }) => {
      await open(page, 'command--basic', { direction })
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await expect(triggerOf(page, 'Search')).toBeFocused()
    })

    test(`${direction}: Ctrl+K and Cmd+K open it from the page, K alone does not`, async ({ page }) => {
      await openLive(page, 'command--basic', { direction })
      await page.keyboard.press('k')
      await expect(page.locator('[role="dialog"]')).toHaveCount(0)
      await page.keyboard.press('Control+k')
      await expect(inputOf(page)).toBeFocused()
      await page.keyboard.press('Escape')
      await expectClosed(page)
      await page.keyboard.press('Meta+k')
      await expect(inputOf(page)).toBeFocused()
    })
  }

  // Playwright cannot switch the keyboard layout, so the event an Arabic layout sends for Ctrl and the K key is dispatched.
  test('under an Arabic layout the K key types its own letter, and Ctrl with it still opens the palette', async ({ page }) => {
    await openLive(page, 'command--basic')
    await page.evaluate(() => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ن', code: 'KeyK', ctrlKey: true, bubbles: true, cancelable: true }))
    })
    await expect(inputOf(page)).toBeFocused()
  })

  // Colemak types e at the K key, Dvorak t: Ctrl+E and Ctrl+T there belong to the page, not to the palette.
  test('under a Latin layout that types another letter at the K key, Ctrl with it is left to the page', async ({ page }) => {
    await openLive(page, 'command--basic')
    const taken = await page.evaluate(() => ['e', 't'].map((key) => {
      const event = new KeyboardEvent('keydown', { key, code: 'KeyK', ctrlKey: true, bubbles: true, cancelable: true })
      document.body.dispatchEvent(event)
      return event.defaultPrevented
    }))
    expect(taken).toEqual([false, false])
    await page.evaluate(() => new Promise((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(resolve) }) }))
    await expect(page.locator('[role="dialog"]')).toHaveCount(0)
  })

  test('Ctrl+Shift+K and Ctrl+Alt+K are left to the browser and the system, and Ctrl+K after them still opens it', async ({ page }) => {
    await open(page, 'command--basic')
    await page.keyboard.press('Escape')
    await expectClosed(page)
    // The panel is loaded now, so a press that wrongly opened it would show within two frames.
    for (const chord of ['Control+Shift+K', 'Control+Alt+k']) {
      await page.keyboard.press(chord)
      await page.evaluate(() => new Promise((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(resolve) }) }))
      await expect(page.locator('[role="dialog"]'), chord).toHaveCount(0)
    }
    await page.keyboard.press('Control+k')
    await expect(inputOf(page)).toBeFocused()
  })

  test('the popup, focused from the keyboard, draws its ring inside its own box, never on the scrim', async ({ page }) => {
    const popup = await open(page, 'command--basic', { by: 'keyboard' })
    await popup.evaluate((element) => { (element as HTMLElement).focus() })
    await expect(popup).toBeFocused()
    expect(await popup.evaluate((element) => {
      const style = getComputedStyle(element)
      return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineOffset}`
    })).toBe('solid 2px -2px')
  })

  test('the panel is fetched on the first open and never before: the page that shows the trigger loads none of it', async ({ page }) => {
    const panel: string[] = []
    page.on('request', (request) => { if (/command-panel|command-rows|@base-ui_react_autocomplete/.test(request.url())) panel.push(request.url()) })
    await openLive(page, 'command--basic')
    expect(panel).toEqual([])
    await openOverlay(page, triggerOf(page, 'Search'))
    expect(panel.some((url) => url.includes('command-panel'))).toBe(true)
    const fetched = panel.length
    await page.keyboard.press('Escape')
    await expectClosed(page)
    await openOverlay(page, triggerOf(page, 'Search'))
    expect(panel, 'a second open fetches nothing more').toHaveLength(fetched)
  })

  // Base UI animates no dialog that mounts open: without the panel's one-commit delay the first open popped in at full opacity.
  test('a first open fades in as every later one does, and the input holds the focus before anything can be seen', async ({ page }) => {
    await openLive(page, 'command--basic')
    const trigger = triggerOf(page, 'Search')
    const before = await boxOf(trigger)
    await page.evaluate(() => {
      const frames: { opacity: number, starting: boolean, input: boolean, focused: boolean }[] = []
      Object.assign(window, { __frames: frames })
      const tick = () => {
        const popup = document.querySelector('[role="dialog"]')
        const input = popup?.querySelector('input[role="combobox"]') ?? null
        if (popup) {
          frames.push({
            opacity: Number(getComputedStyle(popup).opacity),
            starting: popup.hasAttribute('data-starting-style'),
            input: input !== null,
            focused: input !== null && document.activeElement === input,
          })
        }
        if (frames.length < 30) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    await openOverlay(page, trigger)
    const frames = await page.evaluate(() => (window as unknown as { __frames: { opacity: number, starting: boolean, input: boolean, focused: boolean }[] }).__frames)
    expect(frames[0], 'the first frame the palette is in').toEqual({ opacity: 0, starting: true, input: true, focused: false })
    const seen = frames.filter((frame) => frame.opacity > 0)
    expect(seen.length).toBeGreaterThan(0)
    expect(seen.every((frame) => frame.input && frame.focused), 'every frame with any of it visible').toBe(true)
    expect(await boxOf(trigger), 'nothing on the page moved while the panel loaded').toEqual(before)
  })

  for (const path of ['hover', 'focus'] as const) {
    test(`a tooltip inside, opened by ${path}: the first Escape closes the tooltip, the second the palette`, async ({ page }) => {
      await open(page, 'command--with-tooltip')
      await page.keyboard.type('zz')
      const ask = page.locator('[role="status"] button')
      if (path === 'hover') await ask.hover()
      else await page.keyboard.press('Tab')
      const tip = page.locator('[data-placement][data-open]')
      await expect(tip).toHaveText('Sends the query to the team')
      await page.keyboard.press('Escape')
      await expect(tip).toHaveCount(0)
      await expect(page.locator('[role="dialog"][data-open]')).toHaveCount(1)
      await page.keyboard.press('Escape')
      await expectClosed(page)
    })
  }
})

test.describe('the combobox over a listbox', () => {
  test('typing filters, the arrows move the active row, and Enter runs it once and closes', async ({ page }) => {
    await open(page, 'command--basic')
    await page.keyboard.type('but')
    await expect(page.getByRole('option')).toHaveText(['Button', 'Button group', 'Icon button'])
    expect(await activeOf(page)).toMatchObject({ text: 'Button', highlighted: true, whole: true })
    await page.keyboard.press('ArrowDown')
    expect(await activeOf(page)).toMatchObject({ text: 'Button group', highlighted: true })
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    expect(await activeOf(page)).toMatchObject({ text: 'Button group', highlighted: true })
    await page.keyboard.press('Enter')
    await expectClosed(page)
    await expect(ranOf(page)).toHaveText('Ran Button group, 1 in all.')
    await expect(triggerOf(page, 'Search')).toBeFocused()
  })

  test('the input is a named combobox that controls the listbox; the popup is a dialog named by its hidden title', async ({ page }) => {
    await open(page, 'command--basic')
    const input = page.getByRole('combobox', { name: 'Type a command or search' })
    await expect(input).toHaveAttribute('aria-controls', (await listOf(page).getAttribute('id')) ?? '?')
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toHaveCount(1)
    await expect(input).toHaveCSS('font-size', '16px')
  })

  test('groups are read by their headings, each group in the order its first item stood', async ({ page }) => {
    await open(page, 'command--groups')
    await expect(page.getByRole('group', { name: 'Files' }).getByRole('option')).toHaveText(['New file', 'Open recent', 'Save all'])
    await expect(page.getByRole('group', { name: 'Preferences' }).getByRole('option')).toHaveText(['Change the theme', 'Keyboard shortcuts'])
    await expect(page.getByRole('group', { name: 'Help' }).getByRole('option')).toHaveText(['Read the docs', 'Report a problem'])
    await page.keyboard.type('the')
    await expect(page.getByRole('group')).toHaveCount(2)
    expect(await activeOf(page)).toMatchObject({ text: 'Change the theme', highlighted: true })
    await page.keyboard.press('ArrowDown')
    expect(await activeOf(page)).toMatchObject({ text: 'Read the docs', highlighted: true })
  })

  test('a query with no match shows No results from the labels, and no empty listbox is left', async ({ page }) => {
    await open(page, 'command--empty-state')
    await page.keyboard.type('zebra')
    await expect(page.getByRole('status')).toHaveText('No results')
    await expect(listOf(page)).toBeHidden()
  })

  test('loading says Loading from the labels, in the same live region', async ({ page }) => {
    await open(page, 'command--loading')
    await expect(page.getByRole('status')).toHaveText('Loading')
  })
})

test.describe('ten thousand rows, windowed', () => {
  test('ArrowUp from the first row reaches the last one, which was not mounted, names it and scrolls it in whole', async ({ page }) => {
    await open(page, 'command--ten-thousand')
    expect((await activeOf(page)).mounted).toBeLessThan(30)
    await page.keyboard.press('ArrowDown')
    expect(await activeOf(page)).toMatchObject({ text: 'Open report 1', whole: true })
    await page.keyboard.press('ArrowUp')
    await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Pin page 10000', highlighted: true, whole: true })
    expect((await activeOf(page)).id?.endsWith('-9999')).toBe(true)
    // 13 of 10,000 are mounted, so each says its place: a reader hears 10000 of 10000, not 13 of 13.
    const last = page.getByRole('option', { name: 'Pin page 10000' })
    await expect(last).toHaveAttribute('aria-posinset', '10000')
    await expect(last).toHaveAttribute('aria-setsize', '10000')
    expect(await afterLast(page)).toBe(6)
    await page.keyboard.press('ArrowUp')
    await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Duplicate page 9999', whole: true })
    expect((await activeOf(page)).mounted).toBeLessThan(30)
    await page.keyboard.press('Enter')
    await expect(ranOf(page)).toHaveText('Ran Duplicate page 9999.')
  })

  test('a scroll the keyboard did not make leaves the active row mounted in its place: axe passes and Enter runs it', async ({ page }) => {
    await open(page, 'command--ten-thousand')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    expect(await activeOf(page)).toMatchObject({ text: 'Close report 2', highlighted: true })
    const height = await listOf(page).evaluate((list) => list.scrollHeight)
    // The scrollbar's own move: a hundred rows down, with the highlight left where it was.
    await listOf(page).evaluate((list) => { list.scrollTop = 4000 })
    await expect(page.getByRole('option', { name: 'Close report 2' })).not.toBeInViewport()
    await expect.poll(() => page.getByRole('option').nth(1).textContent()).not.toBe('Open report 3')
    expect(await activeOf(page)).toMatchObject({ text: 'Close report 2', highlighted: true, whole: false })
    expect(await listOf(page).evaluate((list) => list.scrollHeight), 'the kept row takes the place of one unit of spacer').toBe(height)
    expect((await axe(page)).violations).toEqual([])
    await page.keyboard.press('Enter')
    await expectClosed(page)
    await expect(ranOf(page)).toHaveText('Ran Close report 2.')
  })

  test('a wheel scrolls to the last row with fewer than a hundred rows mounted at every step, and the page stays put', async ({ page }) => {
    await openLive(page, 'command--ten-thousand', { tall: true })
    await scrollPageTo(page, 20)
    await openOverlay(page, triggerOf(page, 'Ten thousand commands'))
    const list = await boxOf(listOf(page))
    const most: number[] = []
    for (let turn = 0; turn < 8; turn++) {
      await wheelAt(page, list.left + 60, list.top + 60, 60_000)
      most.push((await activeOf(page)).mounted)
    }
    expect(Math.max(...most)).toBeLessThan(100)
    await expect(page.getByRole('option', { name: 'Pin page 10000' })).toBeVisible()
    const last = await boxOf(page.getByRole('option', { name: 'Pin page 10000' }))
    expect(last.bottom).toBeLessThanOrEqual(list.bottom)
    expect(await scrollY(page)).toBe(20)
  })

  // Measured with the drawn gap-0.5 on the list: the row moved 2 px less than the wheel for each row the window passed,
  // and the list grew from 400,042 to 400,054 px. The spacers count whole rows, so the rows take no gap.
  test('a wheel of one row moves the list one row: each row lands where the last one stood, and the height never changes', async ({ page }) => {
    await open(page, 'command--ten-thousand')
    const list = await boxOf(listOf(page))
    await page.mouse.move(list.left + 60, list.top + 60)
    const steps: string[] = []
    for (let turn = 0; turn < 10; turn++) {
      await page.mouse.wheel(0, 32)
      await expect.poll(() => listOf(page).evaluate((el) => Math.round(el.scrollTop))).toBe(32 * (turn + 1))
      steps.push(await listOf(page).evaluate((el) => {
        const top = el.getBoundingClientRect().top
        const row = [...el.querySelectorAll('[role="option"]')].find((option) => option.getBoundingClientRect().bottom > top + 6)
        return `${String(el.scrollHeight)} ${String((row?.getBoundingClientRect().top ?? 0) - top)}`
      }))
    }
    expect(new Set(steps)).toEqual(new Set(['320012 6']))
  })

  test('the frame time while the wheel runs through the list, and the time a key takes to filter ten thousand', async ({ page }) => {
    await open(page, 'command--ten-thousand')
    const list = await boxOf(listOf(page))
    await page.mouse.move(list.left + 60, list.top + 60)
    await page.evaluate(() => {
      const frames: number[] = []
      Object.assign(window, { __frames: frames })
      let last = performance.now()
      const tick = (now: number) => { frames.push(now - last); last = now; if (frames.length < 240) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    })
    for (let turn = 0; turn < 40; turn++) await page.mouse.wheel(0, 3000)
    await page.waitForFunction(() => (window as unknown as { __frames: number[] }).__frames.length >= 240)
    const frames = (await page.evaluate(() => (window as unknown as { __frames: number[] }).__frames)).slice(1).sort((a, b) => a - b)
    const p95 = frames[Math.floor(frames.length * 0.95)] ?? 0
    const keys = await page.evaluate(async () => {
      const input = document.querySelector<HTMLInputElement>('[role="dialog"] input')
      const times: number[] = []
      for (const key of ['p', 'a', 'g', 'e', ' ', '1', '0', '0', '0', '0']) {
        const start = performance.now()
        // A typed key as React and Base UI hear one: the text inserted natively, then an input event of insertText.
        input?.setRangeText(key, input.value.length, input.value.length, 'end')
        input?.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: key }))
        await new Promise((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(resolve) }) })
        times.push(Math.round(performance.now() - start))
      }
      return times
    })
    test.info().annotations.push({ type: 'frames', description: `p50 ${(frames[Math.floor(frames.length / 2)] ?? 0).toFixed(1)} ms, p95 ${p95.toFixed(1)} ms, max ${(frames.at(-1) ?? 0).toFixed(1)} ms` })
    test.info().annotations.push({ type: 'keys', description: `${keys.join(', ')} ms, from the key to the second frame` })
    console.log(`frames p50/p95/max ${(frames[Math.floor(frames.length / 2)] ?? 0).toFixed(1)}/${p95.toFixed(1)}/${(frames.at(-1) ?? 0).toFixed(1)} ms; keys ${keys.join(',')} ms`)
    // A busy machine stretches both; the bound is the one a person notices, three frames at 60 Hz for a key.
    expect(p95).toBeLessThan(100)
    expect(Math.max(...keys)).toBeLessThan(250)
    await expect(page.getByRole('option')).toHaveText(['Pin page 10000'])
  })

  test.describe('under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    test('a drag scrolls the windowed list and mounts the rows it reaches, and never the page', async ({ page }) => {
      await openLive(page, 'command--ten-thousand', { tall: true })
      await touchDrag(page, 195, 700, 660)
      const before = await scrollY(page)
      expect(before).toBeGreaterThan(10)
      await openOverlay(page, triggerOf(page, 'Ten thousand commands'), { by: 'tap' })
      const list = await boxOf(listOf(page))
      for (let drag = 0; drag < 3; drag++) await touchDrag(page, list.left + 60, list.bottom - 20, list.top + 20)
      const top = await listOf(page).evaluate((element) => element.scrollTop)
      expect(top).toBeGreaterThan(400)
      await expect(page.getByRole('option').first()).not.toHaveText('Open report 1')
      expect((await activeOf(page)).mounted).toBeLessThan(100)
      expect(await scrollY(page)).toBe(before)
    })

    test('the first match stays mounted while a finger drags the list away from it, and Enter runs it', async ({ page }) => {
      await open(page, 'command--ten-thousand', { by: 'tap' })
      await page.keyboard.type('open')
      expect(await activeOf(page)).toMatchObject({ text: 'Open report 1', highlighted: true })
      const list = await boxOf(listOf(page))
      for (let drag = 0; drag < 3; drag++) await touchDrag(page, list.left + 60, list.bottom - 20, list.top + 20)
      expect(await listOf(page).evaluate((element) => element.scrollTop)).toBeGreaterThan(400)
      expect(await activeOf(page)).toMatchObject({ text: 'Open report 1', highlighted: true, whole: false })
      await page.keyboard.press('Enter')
      await expectClosed(page)
      await expect(ranOf(page)).toHaveText('Ran Open report 1.')
    })

    test('sixty rows: drags reach the last one, and the page behind never moves', async ({ page }) => {
      await openLive(page, 'command--long-page', { tall: true })
      await touchDrag(page, 195, 700, 660)
      const before = await scrollY(page)
      await openOverlay(page, triggerOf(page, 'Jump to a section'), { by: 'tap' })
      const list = await boxOf(listOf(page))
      // Seven 32 px rows make a 224 px list, so a drag moves 184 px of the 2640 the sixty 44 px rows take.
      for (let drag = 0; drag < 16; drag++) await touchDrag(page, list.left + 60, list.bottom - 20, list.top + 20)
      const last = await boxOf(page.getByRole('option', { name: 'Go to section 60' }))
      expect(last.bottom).toBeLessThanOrEqual(list.bottom + 0.5)
      expect(await scrollY(page)).toBe(before)
    })
  })
})

test.describe('the page behind', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: a wheel over the scrim and past the end of the list leaves the page where it was`, async ({ page }) => {
      await openLive(page, 'command--long-page', { direction, tall: true })
      await scrollPageTo(page, 20)
      await openOverlay(page, triggerOf(page, 'Jump to a section'))
      const list = await boxOf(listOf(page))
      await wheelAt(page, 8, 400, 500)
      for (let turn = 0; turn < 6; turn++) await wheelAt(page, list.left + 60, list.top + 60, 1000)
      await expect(page.getByRole('option', { name: 'Go to section 60' })).toBeInViewport()
      await wheelAt(page, list.left + 60, list.top + 60, 1000)
      expect(await scrollY(page)).toBe(20)
      await page.keyboard.press('ArrowUp')
      expect(await scrollY(page)).toBe(20)
    })
  }
})

test.describe('inside the viewport', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      const label = `${String(screen.width)} x ${String(screen.height)} ${direction}`
      test(`${label}: the palette fits, the list scrolls inside it, and nothing goes sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'command--long-content', { direction })
        await expectInsideViewport(popup, 'the popup', 16 - 0.5)
        const frame = await boxOf(popup)
        expect(frame.width).toBeLessThanOrEqual(420)
        expect(await listOf(page).evaluate((el) => el.scrollHeight > el.clientHeight + 40)).toBe(true)
        expect((await boxOf(listOf(page))).bottom).toBeLessThanOrEqual(frame.bottom)
        await nothingSideways(popup)
        await expectNoSidewaysScroll(page)
      })
    }
  }

  test('a 300-character heading and row truncate inside the popup, and a 300-character query is cut at 256', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    const popup = await open(page, 'command--long-content')
    const row = page.getByRole('option').first()
    expect(await row.evaluate((el) => (el.firstElementChild?.scrollWidth ?? 0) > el.clientWidth)).toBe(true)
    await nothingSideways(popup)
    await inputOf(page).fill('q'.repeat(300))
    await expect(inputOf(page)).toHaveValue('q'.repeat(256))
    await expect(page.getByRole('status')).toContainText('Nothing matches')
    await nothingSideways(popup)
    await expectNoSidewaysScroll(page)
  })

  test('the popup hangs near the top: typing does not move it as the list shrinks', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const popup = await open(page, 'command--basic')
    const top = (await boxOf(popup)).top
    expect(top).toBe(120)
    await page.keyboard.type('dialog')
    await expect(page.getByRole('option')).toHaveCount(1)
    expect((await boxOf(popup)).top).toBe(top)
  })
})

test.describe('direction', () => {
  const sides = (page: Page) => page.evaluate(() => {
    const popup = document.querySelector('[role="dialog"]')
    const glass = popup?.querySelector('svg')?.getBoundingClientRect()
    const input = popup?.querySelector('input')?.getBoundingClientRect()
    const option = popup?.querySelector('[role="option"] span')
    const range = document.createRange()
    if (option) range.selectNodeContents(option)
    const row = option?.parentElement?.getBoundingClientRect()
    const ink = range.getBoundingClientRect()
    return {
      glassBefore: glass !== undefined && input !== undefined && glass.right <= input.left + 0.5,
      glassAfter: glass !== undefined && input !== undefined && glass.left >= input.right - 0.5,
      textAtLeft: row !== undefined && ink.left - row.left < row.right - ink.right,
      dir: popup?.parentElement?.getAttribute('dir') ?? null,
      lang: popup?.parentElement?.getAttribute('lang') ?? null,
    }
  })

  test('ltr: the glass at the left of the input, the rows start at the left', async ({ page }) => {
    await open(page, 'command--basic')
    // The harness mounts a provider on every page, so the viewport carries the page's own dir and lang.
    expect(await sides(page)).toEqual({ glassBefore: true, glassAfter: false, textAtLeft: true, dir: 'ltr', lang: 'en' })
  })

  test('the RTL island on an LTR page lays its palette out right to left, from its provider', async ({ page }) => {
    await open(page, 'command--rtl')
    expect(await sides(page)).toEqual({ glassBefore: false, glassAfter: true, textAtLeft: false, dir: 'rtl', lang: 'ar' })
    await expect(inputOf(page)).toHaveAttribute('placeholder', 'اكتب أمرًا أو ابحث')
  })

  test('the same demo on the RTL page, and the plain demo there, are laid out right to left', async ({ page }) => {
    await open(page, 'command--rtl', { direction: 'rtl' })
    expect(await sides(page)).toMatchObject({ glassAfter: true, textAtLeft: false, dir: 'rtl' })
    await page.keyboard.press('Escape')
    await expectClosed(page)
    await open(page, 'command--basic', { direction: 'rtl' })
    expect(await sides(page)).toMatchObject({ glassAfter: true, textAtLeft: false })
  })
})

test.describe('under a coarse pointer', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  for (const demo of ['command--basic', 'command--groups', 'command--with-shortcuts', 'command--ten-thousand']) {
    test(`${demo}: the input and every row are at least 44 px tall, and the input text is 16 px`, async ({ page }) => {
      await open(page, demo, { by: 'tap' })
      await expect(inputOf(page)).toHaveCSS('font-size', '16px')
      expect((await boxOf(inputOf(page))).height).toBeGreaterThanOrEqual(44)
      const heights = await page.getByRole('option').evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
      expect(heights.length).toBeGreaterThan(0)
      expect(Math.min(...heights)).toBeGreaterThanOrEqual(44)
    })
  }

  test('the windowed list counts 44 px units under a finger too: the last of ten thousand still lands whole', async ({ page }) => {
    await open(page, 'command--ten-thousand', { by: 'tap' })
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Pin page 10000', whole: true })
    expect(await afterLast(page)).toBe(6)
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('the popup keeps a line against the page, and the active row is a bar as well as a fill', async ({ page }) => {
      const popup = await open(page, 'command--basic')
      await page.keyboard.type('but')
      const canvas = FORCED_CANVAS[scheme]
      const frame = await boxOf(popup)
      const along = Math.floor(frame.bottom - frame.top - 48)
      const edge = await pixelsOf(page, { x: Math.floor(frame.left) - 2, y: Math.floor(frame.top) + 24, width: 5, height: along })
      expect(inkOn(edge, canvas), 'pixels of line at 3:1 along the start edge').toBeGreaterThanOrEqual(along)

      const active = page.locator('[role="option"][data-highlighted]')
      // DECISIONS 2026-10-19: the bar at the inline start of the row, no longer a ring around it.
      const look = await active.evaluate((row) => {
        const bar = getComputedStyle(row, '::before')
        return {
          outline: bar.borderInlineStartStyle, width: bar.borderInlineStartWidth, fill: getComputedStyle(row).backgroundColor,
          line: bar.borderInlineStartColor,
        }
      })
      expect(look.outline).toBe('solid')
      expect(look.width).toBe('2px')
      expect(look.line).not.toBe(look.fill)
      // The line is the system's HighlightText, read off a probe that forced colours leave alone.
      const highlightText = await page.evaluate(() => {
        const probe = document.createElement('span')
        probe.style.cssText = 'color: HighlightText; forced-color-adjust: none'
        document.body.append(probe)
        const colour = getComputedStyle(probe).color
        probe.remove()
        return colour
      })
      expect(look.line).toBe(highlightText)
      const rest = await page.locator('[role="option"]:not([data-highlighted])').first().evaluate((row) => getComputedStyle(row, '::before').display)
      expect(rest).toBe('none')
      // The line is drawn: the frame inside the active row, in HighlightText on Highlight.
      const box = await boxOf(active)
      const strip = await pixelsOf(page, { x: Math.floor(box.left) + 4, y: Math.floor(box.top), width: 40, height: 3 })
      expect(inkOn(strip, rgbOf(look.fill)), 'pixels of the frame at 3:1 on the fill').toBeGreaterThanOrEqual(40)
    })
  })
}

test.describe('motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('with prefers-reduced-motion it still opens and closes, in no time at all', async ({ page }) => {
    const popup = await open(page, 'command--basic', { by: 'keyboard' })
    expect(await popup.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s')
    await expect(popup).toHaveCSS('opacity', '1')
    await page.keyboard.press('Escape')
    await expectClosed(page)
    await page.keyboard.press('Control+k')
    await expect(page.locator('[role="dialog"][data-open]')).toHaveCSS('opacity', '1')
  })
})

test.describe('text zoom and text spacing', () => {
  test('at a 32 px root on a phone: rows of 64 px, the palette fits, and the last of ten thousand still lands whole', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openLive(page, 'command--ten-thousand')
    await page.addStyleTag({ content: 'html { font-size: 32px !important; }' })
    const popup = await openOverlay(page, triggerOf(page, 'Ten thousand commands'))
    await expectInsideViewport(popup, 'the popup', 15.5)
    await nothingSideways(popup)
    await expectNoSidewaysScroll(page)
    expect((await boxOf(page.getByRole('option').first())).height).toBe(64)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Pin page 10000', whole: true })
    expect(await afterLast(page)).toBe(12)
  })

  test('WCAG 1.4.12 spacing: every label still fits its row, and nothing goes sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'command--groups')
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' })
    const popup = await openOverlay(page, triggerOf(page, 'Commands by group'))
    const cut = await page.locator('[role="option"] span, [role="group"] span').evaluateAll((spans) =>
      spans.filter((span) => span.scrollHeight > span.clientHeight + 1 || span.getBoundingClientRect().height > (span.parentElement?.clientHeight ?? 0)).length)
    expect(cut).toBe(0)
    await nothingSideways(popup)
    await expectNoSidewaysScroll(page)
  })
})

/** axe on the demo and on the portal the palette opens in. */
async function axe(page: Page): Promise<{ violations: string[], passes: string[] }> {
  const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').analyze()
  return {
    violations: results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    passes: results.passes.map((pass) => pass.id),
  }
}

/** What each demo is checked with: open, and for two of them a query typed first. */
const AXE: Record<string, string> = {
  'command--basic': '',
  'command--empty-state': 'zebra',
  'command--groups': 're',
  'command--loading': '',
  'command--long-content': '',
  'command--rtl': '',
  'command--ten-thousand': '',
  'command--with-shortcuts': '',
  'command--with-tooltip': 'zz',
}

test.describe('axe on the open palette', () => {
  for (const [demo, query] of Object.entries(AXE)) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation`, async ({ page }) => {
          await open(page, demo, { mode, direction })
          if (query !== '') await page.keyboard.type(query)
          const results = await axe(page)
          expect(results.violations).toEqual([])
          expect(results.passes).toContain('aria-dialog-name')
        })
      }
    }
  }
})

test.describe('axe on the open palette, on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const [demo, query] of Object.entries(AXE)) {
    test(`${demo}: no violation`, async ({ page }) => {
      await open(page, demo, { by: 'tap' })
      if (query !== '') await page.keyboard.type(query)
      expect((await axe(page)).violations).toEqual([])
    })
  }
})

test.describe('the states demo, as the Every state strip draws it', () => {
  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`${mode} ${direction}: six cells, each captioned, five of them pictures a reader never meets; Ctrl K opens the real palette with no violation`, async ({ page }) => {
        await openLive(page, 'command--states', { mode, direction })
        const cells = page.locator('#demo [title="closed"]').locator('xpath=..').locator(':scope > *')
        expect(await cells.evaluateAll((all) => all.map((cell) => cell.getAttribute('title')))).toEqual([
          'closed', 'open', 'typing', 'empty', 'loading', 'selected',
        ])
        await expect(page.locator('#demo [aria-hidden="true"]:not(svg)')).toHaveCount(5)
        await expect(page.locator('#demo [data-highlighted]')).toHaveCount(2)
        expect((await axe(page)).violations).toEqual([])
        await page.keyboard.press('ControlOrMeta+k')
        const popup = page.locator('[role="dialog"][data-open]')
        await expect(popup).toBeVisible()
        await expect(inputOf(page)).toBeFocused()
        expect((await axe(page)).violations).toEqual([])
        await page.keyboard.press('Escape')
        await expectClosed(page)
      })
    }
  }
})
