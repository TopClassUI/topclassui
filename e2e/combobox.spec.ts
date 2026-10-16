import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES, type Direction } from '../scripts/lib/harness.js'
import { EDGES } from '../scripts/lib/live-harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectInsideViewport, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { atRest, boxOf, expectNothingSideways, scrollPageTo, touchDrag, wheelAt } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, rgbOf } from './pixels.js'

// What happy-dom cannot lay out or open: the windowed list in a real popup, the highlight on rows that are not mounted,
// where the popup lands, what a finger and a zoomed page get, the server HTML a form sends, and a form reset.

const DEMOS = ['basic', 'form', 'load-more', 'long-content', 'rtl', 'sizes', 'states', 'status', 'ten-thousand'].map((demo) => `combobox--${demo}`)
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const
const POPUP = '[data-placement]'

const inputOf = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true })
const listOf = (page: Page) => page.getByRole('listbox')
const popupOf = (page: Page) => page.locator(POPUP)
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)

/** Opens a live demo, presses its input, and returns the popup once the list is in it and nothing moves. The input
 * keeps the focus, so openOverlay, which waits for the focus to enter the popup, does not fit. */
async function open(page: Page, demo: string, name: string, options: LiveOptions = {}): Promise<Locator> {
  await openLive(page, demo, options)
  await inputOf(page, name).click()
  const popup = popupOf(page)
  await expect(popup).toBeVisible()
  await atRest(popup)
  await expect(inputOf(page, name)).toBeFocused()
  return popup
}

interface Active { id: string | null, text: string | null, whole: boolean, mounted: number, posinset: string | null }

/** The row aria-activedescendant names, whether it lies whole inside the list, and how many rows are mounted. */
const activeOf = (page: Page) => page.evaluate((): Active => {
  const input = document.activeElement
  const list = document.querySelector('[role="listbox"]')
  const id = input?.getAttribute('aria-activedescendant') ?? null
  const row = id === null ? null : document.getElementById(id)
  const frame = list?.getBoundingClientRect()
  const box = row?.getBoundingClientRect()
  return {
    id,
    text: row?.textContent ?? null,
    whole: box !== undefined && frame !== undefined && box.top >= frame.top - 0.5 && box.bottom <= frame.bottom + 0.5,
    mounted: list?.querySelectorAll('[role="option"]').length ?? 0,
    posinset: row?.getAttribute('aria-posinset') ?? null,
  }
})

/** The room below the last mounted row: with the last row mounted, the spacers stood for exactly the rows they
 * replaced only if this is the list's own bottom padding, 6 px, and nothing more. */
const afterLast = (page: Page) => listOf(page).evaluate((list) => {
  const last = [...list.querySelectorAll('[role="option"]')].at(-1)
  const bottom = (last?.getBoundingClientRect().bottom ?? 0) - list.getBoundingClientRect().top + list.scrollTop
  return Math.round((list.scrollHeight - bottom) * 10) / 10
})

test('the table names every combobox demo', async () => {
  const { DEMOS: ALL } = await import('./pages.js')
  expect(ALL.filter((demo) => demo.startsWith('combobox--')).sort()).toEqual(DEMOS)
})

test.describe('the server HTML, before any script runs', () => {
  test('form sends framework=next, the input shows its label and carries the cap, and the target spec measures the input and the button', async ({ page }) => {
    await page.goto(urlFor('combobox--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['framework', 'next']])
    const input = inputOf(page, 'Framework')
    expect([await input.inputValue(), await input.getAttribute('maxlength')]).toEqual(['Next.js', '256'])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.getAttribute('role') ?? el.tagName)))
      .toEqual(['combobox', 'BUTTON'])
  })

  test('every input of the field scale is as wide and as tall as an Input of its size, and 44 px tall under no smaller size', async ({ page }) => {
    await page.goto(urlFor('combobox--sizes', 'light', 'ltr'))
    const boxes = await page.locator('#demo input[role="combobox"]').evaluateAll((all) => all.map((el) => {
      const r = el.getBoundingClientRect()
      return [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10]
    }))
    expect(boxes).toEqual([[165.6, 28], [193.2, 32], [193.2, 40], [220.8, 48], [220.8, 56]])
  })

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('every input is at least 44 px tall and types 16 px text, so iOS does not zoom', async ({ page }) => {
      await page.goto(urlFor('combobox--sizes', 'light', 'ltr'))
      const boxes = await page.locator('#demo input[role="combobox"]').evaluateAll((all) => all.map((el) => [
        Math.round(el.getBoundingClientRect().height), getComputedStyle(el).fontSize,
      ]))
      expect(boxes).toEqual([[44, '16px'], [44, '16px'], [44, '16px'], [48, '16px'], [56, '16px']])
    })
  })

  test('invalid: the line turns to danger and thickens; disabled dims to half; read-only takes the read-only fill', async ({ page }) => {
    await page.goto(urlFor('combobox--states', 'light', 'ltr'))
    const [invalid, disabled, readOnly, live] = ['Invalid', 'Disabled', 'Read-only', 'One option disabled'].map((name) => inputOf(page, name))
    if (!invalid || !disabled || !readOnly || !live) throw new Error('a state is missing')
    expect(await invalid.getAttribute('aria-invalid')).toBe('true')
    expect(await css(invalid, 'box-shadow')).toContain('0px 0px 0px 1px inset')
    expect(await css(live, 'box-shadow')).not.toContain('inset')
    expect(await css(disabled, 'opacity')).toBe('0.5')
    expect(await css(readOnly, 'background-color')).not.toBe(await css(live, 'background-color'))
  })
})

for (const direction of DIRECTIONS) {
  test.describe(`screens, ${direction}`, () => {
    for (const screen of SCREENS) {
      test(`${String(screen.width)} x ${String(screen.height)}: no demo scrolls the page sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of DEMOS) {
          await page.goto(urlFor(demo, 'light', direction))
          await expectNoSidewaysScroll(page)
        }
      })
    }
  })
}

test.describe('live: the keyboard, as the editable combobox of the Authoring Practices', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: ArrowDown opens and moves, the arrows wrap through the input, Enter chooses and closes, and the side arrows only move the caret`, async ({ page }) => {
      await openLive(page, 'combobox--basic', { direction })
      const input = inputOf(page, 'Framework')
      await input.focus()
      await page.keyboard.press('ArrowDown')
      await expect(listOf(page)).toBeVisible()
      expect((await activeOf(page)).text, 'ArrowDown opens on the first row').toBe('Next.js')
      await page.keyboard.press('ArrowDown')
      expect((await activeOf(page)).text).toBe('Astro')
      for (const key of ['ArrowLeft', 'ArrowRight']) {
        await page.keyboard.press(key)
        expect((await activeOf(page)).text, key).toBe('Astro')
      }
      await page.keyboard.press('ArrowUp')
      await page.keyboard.press('ArrowUp')
      expect((await activeOf(page)).id, 'past the first row the highlight is back on the input').toBeNull()
      await page.keyboard.press('ArrowUp')
      expect((await activeOf(page)).text).toBe('Angular')
      await page.keyboard.press('Enter')
      await expect(listOf(page)).toHaveCount(0)
      expect(await input.inputValue()).toBe('Angular')
    })
  }

  test('typing filters by contains, Escape closes, and Escape on the closed input clears the value', async ({ page }) => {
    await openLive(page, 'combobox--form')
    const input = inputOf(page, 'Framework')
    await input.focus()
    await page.keyboard.press('Escape')
    expect(await serverEntries(page), 'Escape on the closed input clears the chosen value').toEqual([['framework', '']])
    expect(await input.inputValue()).toBe('')
    await input.click()
    await page.keyboard.type('R')
    await expect(page.getByRole('option')).toHaveText(['Astro', 'Remix'])
    await page.keyboard.press('Escape')
    await expect(listOf(page)).toHaveCount(0)
    await expect(input).toBeFocused()
  })

  test('a disabled option takes the highlight, is dimmed, and neither Enter nor a click chooses it', async ({ page }) => {
    await open(page, 'combobox--states', 'One option disabled')
    for (let press = 0; press < 3; press++) await page.keyboard.press('ArrowDown')
    expect((await activeOf(page)).text).toBe('Morocco')
    const morocco = page.getByRole('option', { name: 'Morocco' })
    expect(await css(morocco, 'opacity')).toBe('0.5')
    await page.keyboard.press('Enter')
    await morocco.click({ force: true })
    expect(await inputOf(page, 'One option disabled').inputValue()).toBe('')
  })
})

/** Chooses Option 9997 by the keys, closes the list by a click outside, opens it again, and says where the chosen row is. */
async function reopenOnChosen(page: Page) {
  const input = inputOf(page, 'Ten thousand options')
  await input.click()
  await atRest(popupOf(page))
  for (const key of ['ArrowDown', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp']) await page.keyboard.press(key)
  await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Option 9997' })
  await page.keyboard.press('Enter')
  await expect(input).toHaveValue('Option 9997')
  await page.mouse.click(2, 2)
  await expect(popupOf(page)).toHaveCount(0)
  await input.click()
  await atRest(popupOf(page))
  return listOf(page).evaluate((list) => {
    const row = list.querySelector('[data-selected]')
    const frame = list.getBoundingClientRect()
    const box = row?.getBoundingClientRect()
    return { text: row?.textContent ?? null, whole: box !== undefined && box.top >= frame.top - 0.5 && box.bottom <= frame.bottom + 0.5 }
  })
}

test.describe('live: ten thousand options, windowed', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('ArrowUp past the first row reaches the last, never mounted before: aria-activedescendant names it, it reads 10000 of 10000 and is whole', async ({ page }) => {
    await open(page, 'combobox--ten-thousand', 'Ten thousand options')
    expect((await activeOf(page)).mounted).toBeLessThan(30)
    expect(await page.locator('[role="option"][data-row="9999"]').count()).toBe(0)
    await page.keyboard.press('ArrowDown')
    expect(await activeOf(page)).toMatchObject({ text: 'Option 1', whole: true })
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Option 10000', whole: true, posinset: '10000' })
    expect((await activeOf(page)).id?.endsWith('-9999')).toBe(true)
    expect(await page.getByRole('option', { name: 'Option 10000' }).getAttribute('aria-setsize')).toBe('10000')
    expect(await afterLast(page)).toBe(6)
    expect((await activeOf(page)).mounted).toBeLessThan(30)
    expect(await scrollY(page)).toBe(0)
  })

  test('thirty-one ArrowDown keep the highlight whole with fewer than thirty rows mounted, and ArrowUp moves a row above the view to the top edge only', async ({ page }) => {
    await open(page, 'combobox--ten-thousand', 'Ten thousand options')
    for (let press = 0; press < 31; press++) await page.keyboard.press('ArrowDown')
    expect(await activeOf(page)).toMatchObject({ text: 'Option 31', whole: true })
    expect((await activeOf(page)).mounted).toBeLessThan(30)
    const before = await listOf(page).evaluate((list) => list.scrollTop)
    for (let press = 0; press < 5; press++) await page.keyboard.press('ArrowUp')
    expect(await activeOf(page)).toMatchObject({ text: 'Option 26', whole: true })
    expect(await listOf(page).evaluate((list) => list.scrollTop), 'a row still in view moves nothing').toBe(before)
    for (let press = 0; press < 7; press++) await page.keyboard.press('ArrowUp')
    const row = await boxOf(page.getByRole('option', { name: 'Option 19', exact: true }))
    expect(row.top - (await boxOf(listOf(page))).top, 'a row above the view lands at the top, inside the padding').toBe(6)
  })

  test('a wheel to the end keeps fewer than a hundred rows mounted at every step, reaches the last row, and never moves the page', async ({ page }) => {
    await openLive(page, 'combobox--ten-thousand', { tall: true })
    await scrollPageTo(page, 20)
    await inputOf(page, 'Ten thousand options').click()
    await atRest(popupOf(page))
    const list = await boxOf(listOf(page))
    const most: number[] = []
    for (let turn = 0; turn < 8; turn++) {
      await wheelAt(page, list.left + 60, list.top + 60, 60_000)
      most.push((await activeOf(page)).mounted)
    }
    expect(Math.max(...most)).toBeLessThan(100)
    const last = page.getByRole('option', { name: 'Option 10000' })
    await expect(last).toBeVisible()
    expect((await boxOf(last)).bottom).toBeLessThanOrEqual(list.bottom)
    await wheelAt(page, list.left + 60, list.top + 60, 1000)
    expect(await scrollY(page)).toBe(20)
  })

  test('a wheel of one row moves the list one row: each row lands where the last one stood, and the height never changes', async ({ page }) => {
    await open(page, 'combobox--ten-thousand', 'Ten thousand options')
    const list = await boxOf(listOf(page))
    await page.mouse.move(list.left + 60, list.top + 60)
    const steps: string[] = []
    for (let turn = 0; turn < 10; turn++) {
      await page.mouse.wheel(0, 40)
      await expect.poll(() => listOf(page).evaluate((el) => Math.round(el.scrollTop))).toBe(40 * (turn + 1))
      steps.push(await listOf(page).evaluate((el) => {
        const top = el.getBoundingClientRect().top
        const row = [...el.querySelectorAll('[role="option"]')].find((option) => option.getBoundingClientRect().bottom > top + 6)
        return `${String(el.scrollHeight)} ${String((row?.getBoundingClientRect().top ?? 0) - top)}`
      }))
    }
    expect(new Set(steps)).toEqual(new Set(['400012 6']))
  })

  test('typing 999 leaves the nineteen that contain it, unwindowed, and zzz says No results and hides the list', async ({ page }) => {
    await open(page, 'combobox--ten-thousand', 'Ten thousand options')
    await page.keyboard.type('999')
    await expect(page.getByRole('option')).toHaveCount(19)
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('zzz')
    await expect(page.getByRole('status').first()).toHaveText('No results')
    await expect(listOf(page)).toBeHidden()
  })

  test('the time to open, the time a key takes, and the frame time while the wheel runs', async ({ page }) => {
    await openLive(page, 'combobox--ten-thousand')
    await page.evaluate(() => {
      const marks: Record<string, number> = {}
      Object.assign(window, { __marks: marks })
      new MutationObserver(() => {
        if (marks['open'] === undefined && document.querySelector('[role="option"]')) marks['open'] = performance.now()
      }).observe(document.body, { childList: true, subtree: true })
      marks['click'] = performance.now()
    })
    await inputOf(page, 'Ten thousand options').click()
    await atRest(popupOf(page))
    const opened = await page.evaluate(() => { const m = (window as unknown as { __marks: Record<string, number> }).__marks; return Math.round((m['open'] ?? 0) - (m['click'] ?? 0)) })
    const keys = await page.evaluate(async () => {
      const input = document.activeElement as HTMLInputElement
      const times: number[] = []
      for (let press = 0; press < 10; press++) {
        const start = performance.now()
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
        await new Promise((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(resolve) }) })
        times.push(Math.round(performance.now() - start))
      }
      return times
    })
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
    const p50 = frames[Math.floor(frames.length / 2)] ?? 0
    const p95 = frames[Math.floor(frames.length * 0.95)] ?? 0
    const line = `open ${String(opened)} ms; keys ${keys.join(',')} ms; frames p50/p95/max ${p50.toFixed(1)}/${p95.toFixed(1)}/${(frames.at(-1) ?? 0).toFixed(1)} ms`
    test.info().annotations.push({ type: 'timing', description: line })
    console.log(line)
    // A busy machine stretches all three; the bounds are what a person notices.
    expect(opened).toBeLessThan(1000)
    expect(Math.max(...keys)).toBeLessThan(250)
    expect(p95).toBeLessThan(100)
  })

  test.describe('under a finger', () => {
    test.use(COARSE)

    test('rows are 44 px, the input text 16 px, and the last of ten thousand still lands whole: the spacers count 44 px units', async ({ page }) => {
      await open(page, 'combobox--ten-thousand', 'Ten thousand options')
      expect(await css(inputOf(page, 'Ten thousand options'), 'font-size')).toBe('16px')
      expect((await boxOf(page.getByRole('option').first())).height).toBe(44)
      await page.keyboard.press('ArrowUp')
      await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Option 10000', whole: true })
      expect(await afterLast(page)).toBe(6)
      expect(await listOf(page).evaluate((el) => el.scrollHeight)).toBe(440_012)
    })

    test('opened again on a row chosen far down, the list shows that row whole: the window counts 44 px rows', async ({ page }) => {
      await openLive(page, 'combobox--ten-thousand')
      expect(await reopenOnChosen(page)).toEqual({ text: 'Option 9997', whole: true })
    })

    test('a drag scrolls the windowed list and mounts the rows it reaches, and never the page', async ({ page }) => {
      await openLive(page, 'combobox--ten-thousand', { tall: true })
      await touchDrag(page, 195, 700, 660)
      const before = await scrollY(page)
      await inputOf(page, 'Ten thousand options').tap()
      await atRest(popupOf(page))
      const list = await boxOf(listOf(page))
      for (let drag = 0; drag < 3; drag++) await touchDrag(page, list.left + 60, list.bottom - 20, list.top + 20)
      expect(await listOf(page).evaluate((element) => element.scrollTop)).toBeGreaterThan(400)
      await expect(page.getByRole('option').first()).not.toHaveText('Option 1')
      expect((await activeOf(page)).mounted).toBeLessThan(100)
      expect(await scrollY(page)).toBe(before)
    })
  })

  test('at a 32 px root, opened again on a row chosen far down, the list shows that row whole: the window counts 80 px rows', async ({ page }) => {
    await openLive(page, 'combobox--ten-thousand')
    await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
    expect(await reopenOnChosen(page)).toEqual({ text: 'Option 9997', whole: true })
  })

  test('at a 32 px root on a phone: rows of 80 px, the popup fits, and the last of ten thousand still lands whole', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'combobox--ten-thousand')
    await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
    await inputOf(page, 'Ten thousand options').click()
    await atRest(popupOf(page))
    expect((await boxOf(page.getByRole('option').first())).height).toBe(80)
    await expectInsideViewport(popupOf(page), 'the popup')
    await page.keyboard.press('ArrowUp')
    await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Option 10000', whole: true })
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: paging, through load-more', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('nothing is asked while closed or on open; scrolling to the end asks once per page, until hasMore is false', async ({ page }) => {
    await openLive(page, 'combobox--load-more')
    const asked = page.getByTestId('asked')
    await expect(asked).toHaveText('Pages asked for: 0, loaded: 1')
    await inputOf(page, 'Search results').click()
    await atRest(popupOf(page))
    await expect(asked).toHaveText('Pages asked for: 0, loaded: 1')
    // Straight to the end, not by the wheel: Chrome's smooth wheel keeps going into the page that has just arrived.
    const toEnd = () => listOf(page).evaluate((list) => { list.scrollTop = list.scrollHeight })
    for (const loaded of [2, 3, 4]) {
      await toEnd()
      await expect(asked).toHaveText(`Pages asked for: ${String(loaded - 1)}, loaded: ${String(loaded)}`)
      // The new page sits below the end the list was scrolled to, more than ten rows away: nothing more is asked.
      await page.evaluate(() => new Promise((done) => { setTimeout(done, 400) }))
      await expect(asked).toHaveText(`Pages asked for: ${String(loaded - 1)}, loaded: ${String(loaded)}`)
    }
    await toEnd()
    await expect(page.getByRole('option', { name: 'Result 200' })).toBeVisible()
    await page.evaluate(() => new Promise((done) => { setTimeout(done, 400) }))
    await expect(asked).toHaveText('Pages asked for: 3, loaded: 4')
  })

  test('a query whose matches sit on later pages keeps asking, one page per length of items, and reaches them', async ({ page }) => {
    await openLive(page, 'combobox--load-more')
    const asked = page.getByTestId('asked')
    await inputOf(page, 'Search results').click()
    await atRest(popupOf(page))
    await inputOf(page, 'Search results').fill('Result 15')
    // Page 2 holds no new match: the list stays one row long, at its end, and the next page is still asked for.
    await expect(asked).toHaveText('Pages asked for: 3, loaded: 4')
    await expect(page.getByRole('option')).toHaveText(['Result 15', ...Array.from({ length: 10 }, (_, n) => `Result ${String(150 + n)}`)])
    await page.evaluate(() => new Promise((done) => { setTimeout(done, 400) }))
    await expect(asked).toHaveText('Pages asked for: 3, loaded: 4')
  })

  test('typing while a page loads asks for nothing more: the next ask waits for the page', async ({ page }) => {
    await openLive(page, 'combobox--load-more')
    const asked = page.getByTestId('asked')
    await inputOf(page, 'Search results').click()
    await atRest(popupOf(page))
    // Each change of the line, as pages asked for less pages loaded: one page in flight at most reads 0.
    await asked.evaluate((node) => {
      const ahead: number[] = []
      const read = () => { const [ask = 0, have = 0] = (node.textContent.match(/\d+/g) ?? []).map(Number); ahead.push(ask - have) }
      new MutationObserver(read).observe(node, { childList: true, characterData: true, subtree: true })
      Object.assign(window, { ahead })
    })
    await page.keyboard.type('Result 199')
    await expect(asked).toHaveText('Pages asked for: 3, loaded: 4')
    await expect(page.getByRole('option')).toHaveText(['Result 199'])
    await page.evaluate(() => new Promise((done) => { setTimeout(done, 400) }))
    await expect(asked).toHaveText('Pages asked for: 3, loaded: 4')
    expect(Math.max(...await page.evaluate(() => (window as unknown as { ahead: number[] }).ahead))).toBe(0)
  })

  test('status: loading turns the caret into a spinner, says Loading in the list, and marks the input busy', async ({ page }) => {
    await open(page, 'combobox--status', 'City, loading')
    expect(await inputOf(page, 'City, loading').getAttribute('aria-busy')).toBe('true')
    await expect(page.getByRole('status').last()).toHaveText('Loading')
    expect(await page.locator('#demo .animate-spin').count()).toBe(1)
  })
})

test.describe('live: where the popup lands', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    for (const edge of EDGES) {
      test(`${direction}, pinned ${edge}: inside the viewport and 8 px clear of it, as wide as the input, 6 px from it`, async ({ page }) => {
        const popup = await open(page, 'combobox--basic', 'Framework', { direction, edge })
        await expectInsideViewport(popup, 'the popup', 8)
        const [box, input] = [await boxOf(popup), await boxOf(inputOf(page, 'Framework'))]
        // Base UI writes --anchor-width in whole pixels: 193 px for an input of 193.2.
        expect(Math.abs(box.width - input.width)).toBeLessThan(1)
        const gap = edge === 'bottom' ? input.top - box.bottom : box.top - input.bottom
        expect(Math.round(gap), edge === 'bottom' ? 'above, at the bottom edge' : 'below').toBe(6)
      })
    }
  }

  for (const screen of [{ width: 320, height: 480 }, { width: 844, height: 390 }]) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)}, ${direction}: the popup of ten thousand is inside the viewport and scrolls inside itself`, async ({ page }) => {
        await page.setViewportSize(screen)
        const popup = await open(page, 'combobox--ten-thousand', 'Ten thousand options', { direction })
        await expectInsideViewport(popup, 'the popup')
        expect(await css(listOf(page), 'overscroll-behavior-y')).toBe('contain')
        await expectNothingSideways(popup)
        await expectNoSidewaysScroll(page)
      })
    }
  }

  test('rtl: the popup lines up with the right edge of the input, the caret sits at its left, and the tick ends a row at its left', async ({ page }) => {
    const popup = await open(page, 'combobox--rtl', 'المدينة', { direction: 'rtl' })
    const [box, input] = [await boxOf(popup), await boxOf(inputOf(page, 'المدينة'))]
    expect(Math.abs(box.right - input.right)).toBeLessThanOrEqual(1)
    const caret = await boxOf(page.locator('#demo [aria-hidden] svg'))
    expect(caret.left - input.left).toBeLessThan(input.right - caret.right)
    const chosen = page.getByRole('option', { name: 'عمّان' })
    const [tick, row] = [await boxOf(chosen.locator('svg')), await boxOf(chosen)]
    expect(tick.left - row.left).toBeLessThan(row.right - tick.right)
  })

  test('the positioner takes dir and lang from the provider, in an rtl island on an ltr page too, and none with no provider', async ({ page }) => {
    await open(page, 'combobox--rtl', 'المدينة', { direction: 'ltr' })
    const positioner = popupOf(page).locator('xpath=..')
    expect([await positioner.getAttribute('dir'), await positioner.getAttribute('lang')]).toEqual(['rtl', 'ar'])
    await openLive(page, 'separator--horizontal', { direction: 'rtl' })
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/combobox-no-provider.tsx' })
    await inputOf(page, 'No provider').click()
    await atRest(popupOf(page))
    expect([await positioner.getAttribute('dir'), await positioner.getAttribute('lang')]).toEqual([null, null])
  })
})

test.describe('live: the name, while the list is open', () => {
  /** The name Chrome itself computes for the input, read from its accessibility tree, not from Playwright's. */
  const chromeName = async (page: Page) => {
    const session = await page.context().newCDPSession(page)
    const { nodes } = await session.send('Accessibility.getFullAXTree') as { nodes: { role?: { value?: string }, name?: { value?: string } }[] }
    await session.detach()
    return nodes.filter((node) => node.role?.value === 'combobox').map((node) => node.name?.value ?? '')
  }

  for (const [demo, name, direction] of [['combobox--ten-thousand', 'Ten thousand options', 'ltr'], ['combobox--rtl', 'المدينة', 'rtl']] as const) {
    test(`${demo}: Base UI hides the <label for> while the list is open, and the input keeps its name`, async ({ page }) => {
      await open(page, demo, name, { direction })
      expect(await page.locator('#demo label').getAttribute('aria-hidden')).toBe('true')
      expect(await chromeName(page)).toEqual([name])
    })
  }

  test('closed, the live label names the input: a label renamed while closed names it at once, and again once open', async ({ page }) => {
    await open(page, 'combobox--basic', 'Framework')
    await page.keyboard.press('Escape')
    await expect(popupOf(page)).toHaveCount(0)
    expect(await page.locator('#demo input[role="combobox"]').getAttribute('aria-label')).toBeNull()
    await page.locator('#demo label').evaluate((label) => { label.textContent = 'Framework (required)' })
    expect(await chromeName(page)).toEqual(['Framework (required)'])
    await page.locator('#demo input[role="combobox"]').click()
    await atRest(popupOf(page))
    expect(await chromeName(page)).toEqual(['Framework (required)'])
  })
})

test.describe('live: inside the repo\'s Dialog', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('the list paints above the dialog; Escape closes the list, then clears the value, and only the third closes the dialog', async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/combobox-in-dialog.tsx' })
    await page.getByRole('button', { name: 'Edit project' }).click()
    // Pressed while the dialog still grows, the list's first layout can end in Chrome's ResizeObserver loop notice under load.
    await atRest(page.locator('[role="dialog"]'))
    const input = inputOf(page, 'Framework')
    await input.click()
    await atRest(popupOf(page))
    const row = await boxOf(page.getByRole('option', { name: 'Framework 2', exact: true }))
    expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[role="option"]')?.textContent ?? null, { x: row.left + 20, y: row.top + 10 }))
      .toBe('Framework 2')
    const dialog = page.locator('[role="dialog"][data-open]')
    await page.keyboard.press('Escape')
    await expect(listOf(page)).toHaveCount(0)
    await expect(dialog).toHaveCount(1)
    expect(await serverEntries(page, '#project')).toEqual([['framework', '2']])
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(1)
    expect(await serverEntries(page, '#project')).toEqual([['framework', '']])
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  })
})

test.describe('live: a form reset', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/combobox-reset.tsx' })
    await expect(page.locator('#combobox-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.comboboxSent?.[name] ?? [], form)
  const shown = (page: Page) => page.locator('#combobox-reset input[role="combobox"]').evaluateAll((all) => all.map((el) => (el as HTMLInputElement).value))
  const choose = async (page: Page, name: string, option: string) => {
    await inputOf(page, name).click()
    await page.getByRole('option', { name: option }).click()
  }

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each is back at its default on screen and in the form; one with none is empty; a controlled one keeps its owner's value`, async ({ page }) => {
      for (const name of ['Plan', 'Empty', 'Owned', 'Far']) await choose(page, name, 'Bravo')
      expect(await serverEntries(page, '#plain')).toEqual([['plan', 'b'], ['empty', 'b'], ['owned', 'b'], ['far', 'b']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect.poll(() => serverEntries(page, '#plain')).toEqual([['plan', 'a'], ['empty', ''], ['owned', 'b'], ['far', 'a']])
      expect((await shown(page)).slice(0, 4)).toEqual(['Alpha', '', 'Bravo', 'Alpha'])
      await expect(page.locator('#owner')).toHaveText('b')
    })
  }

  test('text typed with nothing chosen is not sent: the form receives the empty value', async ({ page }) => {
    await inputOf(page, 'Empty').click()
    await page.keyboard.type('Bra')
    expect(await serverEntries(page, '#plain')).toEqual([['plan', 'a'], ['empty', ''], ['owned', 'a'], ['far', 'a']])
  })

  test('after a React 19 form action settles, the combobox is back at its default on screen and in the form', async ({ page }) => {
    await choose(page, 'Pick', 'Charlie')
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['pick', 'c']]])
    await expect.poll(() => serverEntries(page, '#action')).toEqual([['pick', 'a']])
    expect(await inputOf(page, 'Pick').inputValue()).toBe('Alpha')
  })

  test('with the action\'s answer as the new default, the choice stays, on screen and in the form, and is sent again', async ({ page }) => {
    await choose(page, 'Again', 'Charlie')
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    expect(await inputOf(page, 'Again').inputValue()).toBe('Charlie')
    expect(await serverEntries(page, '#echo')).toEqual([['again', 'c']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['again', 'c']], [['again', 'c']]])
  })
})

test.describe('live: where a page puts a combobox', () => {
  const fixture = async (page: Page, direction: Direction) => {
    await openLive(page, 'separator--horizontal', { direction })
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/combobox-layouts.tsx' })
    await expect(page.locator('#layouts input[role="combobox"]').first()).toBeVisible()
  }
  /** Every case, as the widths of its visible inputs: the comboboxes, and the two Inputs they are measured against. */
  const widths = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((holder) => [
    holder.getAttribute('data-case'),
    [...holder.querySelectorAll('input:not([aria-hidden="true"])')].map((el) => Math.round(el.getBoundingClientRect().width * 10) / 10),
  ]))
  const expected = (one: number, pair: number) => [
    ['grid', [one]], ['track', [one]], ['flex-1', [one]], ['w-fit', [one]], ['cell', [one]], ['label-row', [one]],
    ['pair-grid', [pair, pair]], ['pair-grid-wrapped', [pair, pair]], ['pair-input', [pair, pair]], ['pair-flex', [pair, pair]],
    ['pair-flex-wrapped', [pair, pair]], ['beside-label', [one]], ['beside-label-wrapped', [one]],
  ]
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: every case is an Input wide, holding a 300-character word`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, direction)
      expect(await widths(page)).toEqual(expected(193.2, 193.2))
      await expectNoSidewaysScroll(page)
    })
  }

  for (const width of [320, 390] as const) {
    test.describe(`${String(width)} px, coarse pointer`, () => {
      test.use({ ...COARSE, viewport: { width, height: 700 } })

      for (const direction of DIRECTIONS) {
        test(`${direction}: two side by side are as wide as two Inputs, and the page does not scroll sideways`, async ({ page }) => {
          await fixture(page, direction)
          // The page is 16 px in from each side with a gap of 8 between the two: (320 - 40) / 2 and (390 - 40) / 2.
          const pair = width === 320 ? 140 : 175
          const result = await widths(page)
          expect(result.filter(([name]) => String(name).startsWith('pair'))).toEqual(expected(0, pair).filter(([name]) => String(name).startsWith('pair')))
          await expectNoSidewaysScroll(page)
        })
      }
    })
  }
})

test.describe('live: hostile content', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/combobox-hostile.tsx' })
    await expect(page.locator('#hostile input[role="combobox"]').first()).toBeVisible()
  }
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: the 300-character word stays inside its input and its row ends in an ellipsis; nothing goes sideways`, async ({ page }) => {
        await fixture(page, { direction })
        await expectNoSidewaysScroll(page)
        for (const name of ['A long word', 'A long word, full width']) {
          const box = await boxOf(inputOf(page, name))
          expect(box.right, name).toBeLessThanOrEqual(320)
          expect(box.left, name).toBeGreaterThanOrEqual(0)
        }
        await inputOf(page, 'A long word').click()
        await inputOf(page, 'A long word').fill('')
        const popup = popupOf(page)
        await atRest(popup)
        const text = page.getByRole('option').first().locator('span').first()
        expect(await text.evaluate((el) => el.scrollWidth > el.clientWidth && getComputedStyle(el).textOverflow === 'ellipsis')).toBe(true)
        await expectNothingSideways(popup)
      })
    }
  })

  test('the empty value is a value: it is chosen by default and sent as name=', async ({ page }) => {
    await fixture(page)
    expect(await serverEntries(page, '#hostile')).toEqual([['word', 'long'], ['wide', 'long'], ['empty', ''], ['sixty', '1']])
    expect(await inputOf(page, 'An empty value').inputValue()).toBe('None')
  })

  test('sixty options: the last is reached by ArrowUp from the first, scrolled whole into view, and chosen by Enter', async ({ page }) => {
    await fixture(page)
    await inputOf(page, 'Sixty').click()
    await atRest(popupOf(page))
    await inputOf(page, 'Sixty').fill('')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect.poll(() => activeOf(page)).toMatchObject({ text: 'Section 60', whole: true })
    await page.keyboard.press('Enter')
    expect(await serverEntries(page, '#hostile')).toEqual([['word', 'long'], ['wide', 'long'], ['empty', ''], ['sixty', '60']])
  })
})

test.describe('live: the ring, motion and forced colours', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring of the focused input is whole: 2 px, 2 px out, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'combobox--basic')
        await page.keyboard.press('Tab')
        const input = inputOf(page, 'Framework')
        await expect(input).toBeFocused()
        expect([await css(input, 'outline-style'), await css(input, 'outline-width'), await css(input, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
        const cut = await input.evaluate((el) => {
          const r = el.getBoundingClientRect()
          const edge = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
          const out: string[] = []
          for (let up = el.parentElement; up; up = up.parentElement) {
            const style = getComputedStyle(up)
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const clip = up.getBoundingClientRect()
            if (edge.left < clip.left || edge.top < clip.top || edge.right > clip.right || edge.bottom > clip.bottom) out.push(up.tagName)
          }
          return out
        })
        expect(cut).toEqual([])
      })
    })
  }

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('the popup opens and closes with no transition, and the spinner stands still', async ({ page }) => {
      await open(page, 'combobox--status', 'City, loading')
      expect(await css(popupOf(page), 'transition-duration')).toBe('0s')
      expect(await css(page.locator('#demo .animate-spin'), 'animation-name')).toBe('none')
    })
  })

  for (const scheme of ['light', 'dark'] as const) {
    test.describe(`forced colours, ${scheme} palette`, () => {
      test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

      test('the input keeps a 3:1 line; the active row is Highlight with a line inside it; the chosen row keeps its tick', async ({ page }) => {
        await open(page, 'combobox--form', 'Framework')
        const canvas = FORCED_CANVAS[scheme]
        expect(contrast(rgbOf(await css(inputOf(page, 'Framework'), 'border-top-color')), canvas)).toBeGreaterThanOrEqual(3)
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        const active = page.locator('[role="option"][data-highlighted]')
        expect(await css(active, 'outline-style')).toBe('solid')
        expect(contrast(rgbOf(await css(active, 'background-color')), canvas)).toBeGreaterThanOrEqual(3)
        expect(await page.getByRole('option', { name: 'Next.js' }).locator('svg').count()).toBe(1)
      })
    })
  }
})

/** axe on the demo and on the portal its popup opens in. Base UI's focus guards and its two hidden Dismiss buttons
 * are its own: they are left out, and the README says so. */
async function axe(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).include('#demo').include('[data-base-ui-portal]').exclude('[data-base-ui-focus-guard]').analyze()
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.describe('axe on the open popup', () => {
  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`ten-thousand ${mode} ${direction}: no violation, with a row highlighted`, async ({ page }) => {
        await open(page, 'combobox--ten-thousand', 'Ten thousand options', { mode, direction })
        await page.keyboard.press('ArrowDown')
        expect(await axe(page)).toEqual([])
      })
    }
  }

  test.describe('on a 320 x 480 phone', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const [demo, name] of [['combobox--basic', 'Framework'], ['combobox--rtl', 'المدينة']] as const) {
      test(`${demo}: no violation`, async ({ page }) => {
        await open(page, demo, name, { direction: demo.endsWith('rtl') ? 'rtl' : 'ltr' })
        expect(await axe(page)).toEqual([])
      })
    }
  })
})
