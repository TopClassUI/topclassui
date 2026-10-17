import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { boxOf, wheelAt } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, inkOn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out: the window over ten thousand rows, the keys in a real browser in both directions,
// where the ring is drawn, the indent in pixels, and what scrolls.

const DEMOS = [
  'tree-view--basic', 'tree-view--load-more', 'tree-view--long-content', 'tree-view--rtl', 'tree-view--selected',
  'tree-view--skeleton', 'tree-view--status', 'tree-view--ten-thousand',
]
const SCREENS = [
  { width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 },
] as const

const treeOf = (page: Page) => page.locator('#demo [role="tree"]').first()
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY))
const frames = (page: Page) => page.evaluate(() => new Promise<void>((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) }) }))

interface State { text: string | null, named: boolean, highlighted: string | null, whole: boolean, mounted: number, focused: boolean }

/** The row aria-activedescendant names, the row drawn as highlighted, whether it lies whole in the tree, how many rows are mounted. */
const stateOf = (page: Page) => page.evaluate((): State => {
  const tree = document.querySelector('#demo [role="tree"]')
  const id = tree?.getAttribute('aria-activedescendant') ?? null
  const row = id === null ? null : document.getElementById(id)
  const lit = tree?.querySelector('[data-highlighted]') ?? null
  const frame = tree?.getBoundingClientRect()
  const box = lit?.getBoundingClientRect()
  return {
    text: row?.textContent ?? null,
    named: id !== null && row !== null,
    highlighted: lit?.textContent ?? null,
    whole: box !== undefined && frame !== undefined && box.top >= frame.top - 0.5 && box.bottom <= frame.bottom + 0.5,
    mounted: tree?.querySelectorAll('[role="treeitem"]').length ?? 0,
    focused: document.activeElement === tree,
  }
})

/** The outline the browser draws, as style, width and offset; none when it draws none (Chrome reports a width anyway). */
const ringOf = (target: Locator) => target.evaluate((element) => {
  const style = getComputedStyle(element)
  return style.outlineStyle === 'none' ? 'none' : `${style.outlineStyle} ${style.outlineWidth} ${style.outlineOffset}`
})

/** The labels of the visible rows. */
const shown = (page: Page) => page.locator('#demo [role="treeitem"]').evaluateAll((rows) => rows.map((row) => row.textContent))

test('the table names every tree-view demo', async () => {
  const { DEMOS: all } = await import('./pages.js')
  expect(all.filter((demo) => demo.startsWith('tree-view--')).sort()).toEqual(DEMOS)
})

test.describe('static, before any script', () => {
  for (const mode of MODES) {
    test(`${mode}: Tab onto the tree draws its own ring inside its edge, and the server HTML is the one tab stop`, async ({ page }) => {
      await page.goto(urlFor('tree-view--basic', mode, 'ltr'))
      const tree = treeOf(page)
      const box = await boxOf(tree)
      const clip = { x: Math.floor(box.left) + 1, y: Math.floor(box.top) + 1, width: Math.floor(box.width) - 2, height: 4 }
      const before = await page.screenshot({ clip })
      await page.keyboard.press('Tab')
      await expect(tree).toBeFocused()
      expect(await ringOf(tree)).toBe('solid 2px -2px')
      expect(Buffer.compare(before, await page.screenshot({ clip })), 'the ring changes the pixels along the top edge').not.toBe(0)
      await page.keyboard.press('Tab')
      await expect(tree).not.toBeFocused()
    })
  }
})

test.describe('static, before any script: the windowed tree', () => {
  for (const direction of DIRECTIONS) {
    for (const coarse of [false, true]) {
      test(`${direction}${coarse ? ', under a finger' : ''}: ten-thousand fills its 12-row box with rows, none of it blank`, async ({ browser }) => {
        const context = await browser.newContext(coarse ? { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } : {})
        const page = await context.newPage()
        await page.goto(urlFor('tree-view--ten-thousand', 'light', direction))
        const fill = await treeOf(page).evaluate((tree) => {
          const rows = [...tree.querySelectorAll('[role="treeitem"]')]
          const box = tree.getBoundingClientRect()
          return { rows: rows.length, below: Math.round(box.top + tree.clientTop + tree.clientHeight - (rows.at(-1)?.getBoundingClientRect().bottom ?? 0)) }
        })
        expect(fill.rows).toBeGreaterThanOrEqual(12)
        expect(fill.below, 'the last server row reaches past the bottom of the box').toBeLessThanOrEqual(0)
        await context.close()
      })
    }
  }
})

test.describe('live: the keys of the Authoring Practices', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    const [inward, outward] = direction === 'ltr' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight']

    test(`${direction}: which key does what, measured`, async ({ page }) => {
      await openLive(page, 'tree-view--basic', { direction })
      await page.keyboard.press('Tab')
      const steps: string[] = []
      const press = async (key: string) => {
        await page.keyboard.press(key)
        const state = await stateOf(page)
        steps.push(`${key}: ${String(state.text)} [${String((await shown(page)).length)}]`)
      }
      for (const key of ['ArrowDown', inward, inward, inward, outward, outward, outward, 'End', 'Home', 'ArrowUp', inward, 'Enter', 'p']) await press(key)
      // The tree opens on src > app > (layout.tsx, page.tsx), components, lib, package.json, README.md.
      expect(steps).toEqual([
        'ArrowDown: app [8]',
        `${inward}: layout.tsx [8]`,
        `${inward}: layout.tsx [8]`,
        `${inward}: layout.tsx [8]`,
        `${outward}: app [8]`,
        `${outward}: app [6]`,
        `${outward}: src [6]`,
        'End: README.md [6]',
        'Home: src [6]',
        'ArrowUp: src [6]',
        `${inward}: app [6]`,
        'Enter: app [8]',
        'p: page.tsx [8]',
      ])
      expect(await scrollY(page)).toBe(0)
    })

    test(`${direction}: ${inward} opens a closed branch and ${outward} closes it; the caret swaps and points the reading way`, async ({ page }) => {
      await openLive(page, 'tree-view--selected', { direction })
      await page.keyboard.press('Tab')
      expect((await stateOf(page)).text).toBe('page.tsx')
      await page.keyboard.press('End')
      await page.keyboard.press('ArrowUp')
      expect((await stateOf(page)).text).toBe('docs')
      const caret = page.getByRole('treeitem', { name: 'docs' }).locator('svg')
      const pointsAt = () => caret.evaluate((svg) => {
        const path = svg.querySelector('path')?.getAttribute('d') ?? ''
        // Tailwind 4 flips with the scale property, not transform.
        const flipped = getComputedStyle(svg).scale.startsWith('-1')
        if (!path.startsWith('M181.66')) return 'down'
        return flipped ? 'left' : 'right'
      })
      expect(await pointsAt()).toBe(direction === 'ltr' ? 'right' : 'left')
      await page.keyboard.press(inward)
      await expect(page.getByRole('treeitem', { name: 'docs' })).toHaveAttribute('aria-expanded', 'true')
      expect(await pointsAt()).toBe('down')
      await page.keyboard.press(outward)
      await expect(page.getByRole('treeitem', { name: 'docs' })).toHaveAttribute('aria-expanded', 'false')
    })
  }

  test('rtl: ArrowLeft opens a closed branch, on the Arabic demo inside an LTR page too', async ({ page }) => {
    await openLive(page, 'tree-view--rtl', { direction: 'ltr' })
    await page.keyboard.press('Tab')
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowUp')
    const photos = page.getByRole('treeitem', { name: 'الصور' })
    await expect(photos).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('ArrowLeft')
    await expect(photos).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('ArrowLeft')
    expect((await stateOf(page)).text).toBe('رحلة العقبة.jpg')
  })

  test('a space typed inside a type-ahead is part of the query, and selects nothing', async ({ page }) => {
    await openLive(page, 'tree-view--long-content', { tall: true })
    await page.keyboard.press('Tab')
    await page.keyboard.type('sixty i', { delay: 40 })
    await expect.poll(() => stateOf(page)).toMatchObject({ text: 'Sixty items', highlighted: 'Sixty items', whole: true })
    await expect(page.getByRole('treeitem', { name: 'Sixty items' })).toHaveAttribute('aria-selected', 'false')
  })

  test('the ring is on the highlighted row after a key and not after a press', async ({ page }) => {
    await openLive(page, 'tree-view--basic')
    const tree = treeOf(page)
    await page.getByRole('treeitem', { name: 'page.tsx' }).click()
    const lit = page.locator('#demo [data-highlighted]')
    await expect(lit).toHaveText('page.tsx')
    expect([await ringOf(lit), await ringOf(tree)]).toEqual(['none', 'none'])
    await page.keyboard.press('ArrowDown')
    await expect(lit).toHaveText('components')
    // Chromium's :focus-visible turns on at the first key after a press, so the keyboard user sees where the keys are.
    expect(await ringOf(lit)).toBe('solid 2px -2px')
    await page.locator('body').click({ position: { x: 2, y: 2 } })
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowDown')
    expect(await ringOf(page.locator('#demo [data-highlighted]'))).toBe('solid 2px -2px')
    expect(await ringOf(tree)).toBe('none')
  })

  test('a press on a row selects it and opens or closes it; Tab leaves in one step', async ({ page }) => {
    await openLive(page, 'tree-view--basic')
    await page.getByRole('treeitem', { name: 'components' }).click()
    await expect(page.getByRole('treeitem', { name: 'components' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('treeitem', { name: 'button.tsx' })).toBeVisible()
    await expect(treeOf(page)).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(treeOf(page)).not.toBeFocused()
  })
})

test.describe('live: a small wheel never leaves the focused tree with no ring in sight', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  /** The top edge of the tree, where its own ring is drawn. */
  const edgeOf = async (page: Page) => {
    const box = await boxOf(treeOf(page))
    return page.screenshot({ clip: { x: Math.floor(box.left) + 1, y: Math.floor(box.top) + 1, width: Math.floor(box.width) - 2, height: 4 } })
  }

  const cases = [
    ...DIRECTIONS.flatMap((direction) => ['tree-view--basic', 'tree-view--long-content', 'tree-view--ten-thousand'].map((demo) => ({ demo, direction, mode: 'light' as const }))),
    ...MODES.filter((mode) => mode !== 'light').map((mode) => ({ demo: 'tree-view--basic', direction: 'ltr' as const, mode })),
  ]
  for (const { demo, direction, mode } of cases) {
    test(`${demo} ${mode} ${direction}: a 160 px wheel puts the highlighted row out of sight, and the tree draws its ring until a key brings the row back`, async ({ page }) => {
      await openLive(page, demo, { direction, mode, tall: true })
      await page.keyboard.press('Tab')
      const box = await boxOf(treeOf(page))
      await wheelAt(page, box.left + 60, box.top + 60, 160)
      // Mounted but scrolled out: the attribute still names it, and its own ring is drawn where no one sees it.
      expect(await stateOf(page)).toMatchObject({ named: true, whole: false, focused: true })
      expect(await treeOf(page).evaluate((tree) => {
        const row = tree.querySelector('[data-highlighted]')?.getBoundingClientRect()
        const top = tree.getBoundingClientRect().top + tree.clientTop
        return row !== undefined && (row.bottom <= top || row.top >= top + tree.clientHeight)
      })).toBe(true)
      expect(await ringOf(treeOf(page))).toBe('solid 2px -2px')
      const ringed = await edgeOf(page)
      await treeOf(page).evaluate((tree) => { tree.blur() })
      expect(Buffer.compare(ringed, await edgeOf(page)), 'the ring changes the pixels along the top edge').not.toBe(0)
      await treeOf(page).evaluate((tree) => { tree.focus() })
      await page.keyboard.press('ArrowDown')
      await expect.poll(() => stateOf(page)).toMatchObject({ whole: true, focused: true })
      expect(await ringOf(treeOf(page))).toBe('none')
      expect(await ringOf(page.locator('#demo [data-highlighted]'))).toBe('solid 2px -2px')
    })
  }

  test.describe('under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    test('ten-thousand, 44 px rows: a 160 px scroll puts the row out of sight, and the tree draws its ring', async ({ page }) => {
      await openLive(page, 'tree-view--ten-thousand', { tall: true })
      await treeOf(page).focus()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowUp')
      await treeOf(page).evaluate((tree) => { tree.scrollTop = 160 })
      await frames(page)
      expect(await stateOf(page)).toMatchObject({ text: 'Folder 1', named: true, whole: false })
      expect(await ringOf(treeOf(page))).toBe('solid 2px -2px')
    })
  })
})

test.describe('live: a press never scrolls the tree', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  /** Where the tree is scrolled, the row it highlights and the one selected, and whether it holds the focus. */
  const placeOf = (page: Page) => treeOf(page).evaluate((tree) => ({
    scrollTop: Math.round(tree.scrollTop),
    highlighted: tree.querySelector('[data-highlighted]')?.textContent ?? null,
    selected: tree.querySelector('[aria-selected="true"]')?.textContent.slice(0, 12) ?? null,
    focused: document.activeElement === tree,
  }))

  for (const direction of DIRECTIONS) {
    test(`${direction}: a press on the padding or on a row, with the selected row far above, leaves the tree where it was`, async ({ page }) => {
      await openLive(page, 'tree-view--long-content', { direction, tall: true })
      await treeOf(page).evaluate((tree) => { tree.scrollTop = 1500 })
      const box = await boxOf(treeOf(page))
      const start = direction === 'ltr' ? box.left + 4 : box.right - 4
      await page.mouse.click(start, (box.top + box.bottom) / 2)
      expect(await placeOf(page)).toEqual({ scrollTop: 1500, highlighted: null, selected: 'Supercalifra', focused: true })
      await page.keyboard.press('Tab')
      // By coordinates: a locator's click scrolls its row into view first, which is the very thing measured.
      const middle = (box.top + box.bottom) / 2
      const pressed = await page.evaluate(([x, y]) => document.elementFromPoint(x ?? 0, y ?? 0)?.closest('[role="treeitem"]')?.textContent ?? null, [box.left + box.width / 2, middle])
      expect(pressed).toMatch(/^Item \d+$/)
      await page.mouse.click(box.left + box.width / 2, middle)
      expect(await placeOf(page)).toEqual({ scrollTop: 1500, highlighted: pressed, selected: pressed, focused: true })
    })
  }

  test('a press on a disabled row, which takes no pointer, leaves the tree where it was and selects nothing', async ({ page }) => {
    await openLive(page, 'tree-view--selected', { tall: true })
    await page.getByRole('treeitem', { name: 'docs' }).click()
    await page.locator('body').click({ position: { x: 2, y: 2 } })
    await treeOf(page).evaluate((tree) => { tree.style.setProperty('--tc-list-rows', '2'); tree.scrollTop = tree.scrollHeight })
    const before = await placeOf(page)
    expect(before).toMatchObject({ selected: 'docs', focused: false })
    expect(before.scrollTop).toBeGreaterThan(100)
    const faq = await boxOf(page.getByRole('treeitem', { name: 'faq.md' }))
    await page.mouse.click(faq.left + 40, (faq.top + faq.bottom) / 2)
    expect(await placeOf(page)).toEqual({ ...before, focused: true })
  })
})

test.describe('live: ten thousand rows, windowed', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('fewer than a hundred rows on load, after fifty ArrowDown and after End; End lands the last row whole and names it', async ({ page }) => {
    await openLive(page, 'tree-view--ten-thousand', { tall: true })
    expect((await stateOf(page)).mounted).toBeLessThan(100)
    await page.keyboard.press('Tab')
    for (let step = 0; step < 50; step++) await page.keyboard.press('ArrowDown')
    await expect.poll(() => stateOf(page)).toMatchObject({ text: 'File 50.ts', highlighted: 'File 50.ts', whole: true })
    expect((await stateOf(page)).mounted).toBeLessThan(100)
    await page.keyboard.press('End')
    await expect.poll(() => stateOf(page)).toMatchObject({ text: 'File 10000.ts', named: true, highlighted: 'File 10000.ts', whole: true })
    expect((await stateOf(page)).mounted).toBeLessThan(100)
    expect(await ringOf(page.locator('#demo [data-highlighted]'))).toBe('solid 2px -2px')
    // The spacers stood for exactly the rows they replaced: below the last row, only the tree's own 8 px padding.
    const below = await treeOf(page).evaluate((tree) => {
      const last = [...tree.querySelectorAll('[role="treeitem"]')].at(-1)
      const top = tree.getBoundingClientRect().top + tree.clientTop
      return Math.round((tree.scrollHeight - ((last?.getBoundingClientRect().bottom ?? 0) - top + tree.scrollTop)) * 10) / 10
    })
    expect(below).toBe(8)
    expect(await scrollY(page)).toBe(0)
  })

  test('a wheel to the end: fewer than a hundred rows at every step, no aria-activedescendant, the tree draws its ring, the page stays', async ({ page }) => {
    await openLive(page, 'tree-view--ten-thousand', { tall: true })
    await page.keyboard.press('Tab')
    expect((await stateOf(page)).text).toBe('Folder 1')
    const box = await boxOf(treeOf(page))
    const most: number[] = []
    for (let turn = 0; turn < 9; turn++) {
      await wheelAt(page, box.left + 60, box.top + 60, 60_000)
      most.push((await stateOf(page)).mounted)
    }
    expect(Math.max(...most)).toBeLessThan(100)
    await expect(page.getByRole('treeitem', { name: 'File 10000.ts' })).toBeVisible()
    expect(await stateOf(page)).toMatchObject({ named: false, highlighted: null, focused: true })
    expect(await treeOf(page).getAttribute('aria-activedescendant')).toBeNull()
    expect(await ringOf(treeOf(page))).toBe('solid 2px -2px')
    expect(await scrollY(page)).toBe(0)
    await page.keyboard.press('ArrowDown')
    await expect.poll(() => stateOf(page)).toMatchObject({ text: 'File 1.ts', whole: true })
    expect(await ringOf(treeOf(page))).toBe('none')
    expect(await scrollY(page)).toBe(0)
  })

  test('the time to open ten thousand, a key, and the frames while the wheel runs', async ({ page }) => {
    await openLive(page, 'tree-view--ten-thousand')
    await page.keyboard.press('Tab')
    const timed = (key: string) => page.evaluate(async (pressed) => {
      const tree = document.querySelector<HTMLElement>('#demo [role="tree"]')
      const start = performance.now()
      tree?.dispatchEvent(new KeyboardEvent('keydown', { key: pressed, bubbles: true, cancelable: true }))
      await new Promise((resolve) => { requestAnimationFrame(() => { requestAnimationFrame(resolve) }) })
      return Math.round(performance.now() - start)
    }, key)
    const close = await timed('ArrowLeft')
    await expect(page.locator('#demo [role="treeitem"][aria-expanded="false"]')).toHaveCount(1)
    const open = await timed('ArrowRight')
    await expect(page.locator('#demo [role="treeitem"][aria-expanded="false"]')).toHaveCount(0)
    const keys: number[] = []
    for (let step = 0; step < 10; step++) keys.push(await timed('ArrowDown'))
    const box = await boxOf(treeOf(page))
    await page.mouse.move(box.left + 60, box.top + 60)
    await page.evaluate(() => {
      const seen: number[] = []
      Object.assign(window, { __frames: seen })
      let last = performance.now()
      const tick = (now: number) => { seen.push(now - last); last = now; if (seen.length < 240) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    })
    for (let turn = 0; turn < 40; turn++) await page.mouse.wheel(0, 3000)
    await page.waitForFunction(() => (window as unknown as { __frames: number[] }).__frames.length >= 240)
    const spans = (await page.evaluate(() => (window as unknown as { __frames: number[] }).__frames)).slice(1).sort((a, b) => a - b)
    const p95 = spans[Math.floor(spans.length * 0.95)] ?? 0
    const line = `close ${String(close)} ms, open ${String(open)} ms, keys ${keys.join(',')} ms, frames p50 ${(spans[Math.floor(spans.length / 2)] ?? 0).toFixed(1)} p95 ${p95.toFixed(1)} max ${(spans.at(-1) ?? 0).toFixed(1)} ms`
    test.info().annotations.push({ type: 'timing', description: line })
    console.log(`tree-view timing: ${line}`)
    expect(Math.max(close, open)).toBeLessThan(250)
    expect(Math.max(...keys)).toBeLessThan(100)
    expect(p95).toBeLessThan(100)
  })

  test.describe('under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

    const drag = async (page: Page, x: number, fromY: number, toY: number) => {
      const session = await page.context().newCDPSession(page)
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: fromY }] })
      for (let step = 1; step <= 12; step++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: fromY + ((toY - fromY) * step) / 12 }] })
        await frames(page)
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await expect.poll(async () => {
        const at = await treeOf(page).evaluate((tree) => tree.scrollTop)
        await frames(page)
        return at === await treeOf(page).evaluate((tree) => tree.scrollTop)
      }).toBe(true)
      await session.detach()
    }

    test('a drag scrolls the windowed tree and mounts the rows it reaches, never the page; rows are 44 px', async ({ page }) => {
      await openLive(page, 'tree-view--ten-thousand', { tall: true })
      const box = await boxOf(treeOf(page))
      for (let turn = 0; turn < 3; turn++) await drag(page, box.left + 60, box.bottom - 20, box.top + 20)
      expect(await treeOf(page).evaluate((tree) => tree.scrollTop)).toBeGreaterThan(400)
      await expect(page.getByRole('treeitem').first()).not.toHaveText('Folder 1')
      expect((await stateOf(page)).mounted).toBeLessThan(100)
      expect(await scrollY(page)).toBe(0)
      const heights = await page.getByRole('treeitem').evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
      expect(new Set(heights)).toEqual(new Set([44]))
    })

    test('a drag leaves no press behind: the next Tab highlights the selected row, not the row the finger started on', async ({ page }) => {
      await openLive(page, 'tree-view--long-content', { tall: true })
      const box = await boxOf(treeOf(page))
      await drag(page, box.left + 60, box.bottom - 20, box.top + 20)
      expect(await treeOf(page).evaluate((tree) => tree.scrollTop)).toBeGreaterThan(100)
      await expect(treeOf(page)).not.toBeFocused()
      await page.keyboard.press('Tab')
      await expect(treeOf(page)).toBeFocused()
      await expect.poll(() => stateOf(page)).toMatchObject({ highlighted: 'Supercalifragilistic'.repeat(15), whole: true })
    })

    test('sixty siblings: drags reach the last one, and the page never moves', async ({ page }) => {
      await openLive(page, 'tree-view--long-content', { tall: true })
      const box = await boxOf(treeOf(page))
      for (let turn = 0; turn < 12; turn++) await drag(page, box.left + 60, box.bottom - 20, box.top + 20)
      const last = await boxOf(page.getByRole('treeitem', { name: 'Item 60' }))
      expect(last.bottom).toBeLessThanOrEqual(box.bottom + 0.5)
      expect(await scrollY(page)).toBe(0)
    })
  })
})

test.describe('live: paging, through load-more', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('scrolling to the end asks once per page, and opening a branch while a page is on its way asks nothing more', async ({ page }) => {
    await openLive(page, 'tree-view--load-more')
    const asked = page.getByTestId('asked')
    await expect(asked).toHaveText('Pages asked for: 0, loaded: 1')
    const toEnd = () => treeOf(page).evaluate((tree) => { tree.scrollTop = tree.scrollHeight })
    await toEnd()
    await expect(asked).toHaveText('Pages asked for: 1, loaded: 1')
    await page.getByRole('treeitem', { name: 'Folder 20' }).click()
    await page.getByRole('treeitem', { name: 'Folder 20' }).click()
    await expect(asked).toHaveText('Pages asked for: 1, loaded: 2')
    for (const loaded of [3, 4]) {
      await toEnd()
      await expect(asked).toHaveText(`Pages asked for: ${String(loaded - 1)}, loaded: ${String(loaded)}`)
    }
    await toEnd()
    await page.evaluate(() => new Promise((done) => { setTimeout(done, 400) }))
    await expect(asked).toHaveText('Pages asked for: 3, loaded: 4')
    await expect(page.getByRole('treeitem', { name: 'Folder 80' })).toBeVisible()
  })

  test('status: loading marks the tree busy and says Loading under it; empty says Nothing here yet', async ({ page }) => {
    await openLive(page, 'tree-view--status')
    await expect(page.locator('#demo [role="status"]')).toHaveText(['Loading', 'Nothing here yet'])
    await expect(page.locator('#demo [role="tree"]')).toHaveCount(2)
    expect(await page.locator('#demo [role="tree"]').evaluateAll((trees) => trees.map((tree) => getComputedStyle(tree).display))).toEqual(['none', 'none'])
  })
})

/** Where the caret slot starts, from the inline start edge of its row, for the rows of three levels. */
const indents = (page: Page) => page.locator('#demo [role="treeitem"]').evaluateAll((rows) => rows.map((row) => {
  const slot = row.firstElementChild?.getBoundingClientRect()
  const box = row.getBoundingClientRect()
  const rtl = getComputedStyle(row).direction === 'rtl'
  return `${row.getAttribute('aria-level') ?? '?'} ${String(Math.round(((rtl ? box.right - (slot?.right ?? 0) : (slot?.left ?? 0) - box.left)) * 10) / 10)}`
}))

test.describe('the indent and the rows, measured', () => {
  const CASES = [
    { name: 'density 1', css: '', row: 40, steps: ['1 8', '2 26', '3 44'] },
    { name: 'density 1.25', css: ':root { --tc-density: 1.25 !important; }', row: 50, steps: ['1 8', '2 30.5', '3 53'] },
    { name: 'a 32 px root', css: 'html { font-size: 32px !important; }', row: 80, steps: ['1 16', '2 52', '3 88'] },
  ]
  for (const direction of DIRECTIONS) {
    for (const one of CASES) {
      test(`${direction}, ${one.name}: rows of ${String(one.row)} px, and each level starts one indent further in on the inline start`, async ({ page }) => {
        await openLive(page, 'tree-view--basic', { direction })
        if (one.css !== '') await page.addStyleTag({ content: one.css })
        const heights = await page.locator('#demo [role="treeitem"]').evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
        expect(new Set(heights)).toEqual(new Set([one.row]))
        const found = await indents(page)
        expect([...new Set(found)].sort()).toEqual(one.steps)
        await expectNoSidewaysScroll(page)
      })
    }
  }

  test('a row three levels deep starts 36 px further in than a root row, at density 1, in both directions', async ({ page }) => {
    for (const direction of DIRECTIONS) {
      await openLive(page, 'tree-view--basic', { direction })
      const found = await indents(page)
      const at = (level: string) => Number(found.find((line) => line.startsWith(`${level} `))?.split(' ')[1])
      expect(at('3') - at('1'), direction).toBe(36)
    }
  })
})

test.describe('inside the viewport', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: hostile content stays inside the tree, and nothing goes sideways`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openLive(page, 'tree-view--long-content', { direction })
        await expectNoSidewaysScroll(page)
        const tree = treeOf(page)
        const frame = await boxOf(tree)
        expect(frame.left).toBeGreaterThanOrEqual(0)
        expect(frame.right).toBeLessThanOrEqual(await page.evaluate(() => document.body.clientWidth) + 0.5)
        // In an RTL page an overflow past the inline start cannot be seen by the scroll width: each row is measured too.
        const outside = await tree.evaluate((element) => {
          const box = element.getBoundingClientRect()
          return [...element.querySelectorAll('[role="treeitem"]')].filter((row) => {
            const r = row.getBoundingClientRect()
            return r.left < box.left - 0.5 || r.right > box.right + 0.5
          }).length
        })
        expect(outside).toBe(0)
        const label = page.locator('#demo [role="treeitem"] span[dir="auto"]').first()
        expect(await label.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
        await expect(label).toHaveCSS('text-overflow', 'ellipsis')
      })
    }
  }

  test('a 300-character label at 320 and 1280 px never scrolls the page sideways, focused or not', async ({ page }) => {
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 600 })
      await openLive(page, 'tree-view--long-content')
      await page.keyboard.press('Tab')
      await expectNoSidewaysScroll(page)
    }
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: in a grid track, a flex-1 column, a w-fit parent and a table cell, the tree never widens its box`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/tree-view-layouts.tsx' })
      await expect(page.locator('#layouts [role="tree"]')).toHaveCount(5)
      const widths = await page.locator('#layouts > [data-case]').evaluateAll((cases) => cases.map((box) => {
        const tree = box.querySelector('[role="tree"]')?.getBoundingClientRect()
        const own = box.getBoundingClientRect()
        return { name: box.getAttribute('data-case'), inside: tree !== undefined && tree.left >= own.left - 0.5 && tree.right <= own.right + 0.5, own: Math.round(own.width) }
      }))
      expect(widths.filter((one) => !one.inside)).toEqual([])
      const page390 = await page.evaluate(() => document.body.clientWidth)
      expect(widths.filter((one) => one.own > page390)).toEqual([])
      const track = await page.locator('[data-case="track"]').evaluate((box) => [...box.children].map((child) => Math.round(child.getBoundingClientRect().width)))
      expect(track[0]).toBe(track[1])
      await expectNoSidewaysScroll(page)
    })
  }
})

test.describe('focus ring whole, never cut', () => {
  test('the row ring is drawn inside the row, and the tree ring inside the tree, so no clipping parent cuts either', async ({ page }) => {
    await openLive(page, 'tree-view--basic')
    const first = page.getByRole('treeitem').first()
    const [row, tree] = [await boxOf(first), await boxOf(treeOf(page))]
    // The four edges of the row, two pixels deep: every one of them must change when the ring is drawn.
    const bands = [
      { x: Math.floor(row.left) + 8, y: Math.ceil(row.top), width: Math.floor(row.width) - 16, height: 2 },
      { x: Math.floor(row.left) + 8, y: Math.floor(row.bottom) - 2, width: Math.floor(row.width) - 16, height: 2 },
      { x: Math.ceil(row.left), y: Math.floor(row.top) + 8, width: 2, height: Math.floor(row.height) - 16 },
      { x: Math.floor(row.right) - 2, y: Math.floor(row.top) + 8, width: 2, height: Math.floor(row.height) - 16 },
    ]
    const before = await Promise.all(bands.map((clip) => page.screenshot({ clip })))
    await page.keyboard.press('Tab')
    expect(await ringOf(page.locator('#demo [data-highlighted]'))).toBe('solid 2px -2px')
    const after = await Promise.all(bands.map((clip) => page.screenshot({ clip })))
    expect(before.map((shot, index) => Buffer.compare(shot, after[index] ?? shot) !== 0)).toEqual([true, true, true, true])
    expect(row.left).toBeGreaterThanOrEqual(tree.left)
    expect(row.right).toBeLessThanOrEqual(tree.right)
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('the selected row is Highlight with HighlightText, the others are not, and the tree keeps a line', async ({ page }) => {
      await openLive(page, 'tree-view--selected')
      const system = await page.evaluate(() => {
        const probe = document.createElement('span')
        probe.style.cssText = 'background-color: Highlight; color: HighlightText; forced-color-adjust: none'
        document.body.append(probe)
        const style = getComputedStyle(probe)
        const out = { fill: style.backgroundColor, ink: style.color }
        probe.remove()
        return out
      })
      const chosen = page.getByRole('treeitem', { name: 'page.tsx' })
      const look = await chosen.evaluate((row) => ({ fill: getComputedStyle(row).backgroundColor, ink: getComputedStyle(row).color, caret: getComputedStyle(row.firstElementChild ?? row).color }))
      expect(look).toEqual({ fill: system.fill, ink: system.ink, caret: system.ink })
      const other = await page.getByRole('treeitem', { name: 'layout.tsx' }).evaluate((row) => getComputedStyle(row).backgroundColor)
      expect(other).not.toBe(system.fill)
      const frame = await boxOf(treeOf(page))
      const edge = await pixelsOf(page, { x: Math.floor(frame.left), y: Math.floor(frame.top) + 20, width: 2, height: 40 })
      expect(inkOn(edge, FORCED_CANVAS[scheme])).toBeGreaterThanOrEqual(40)
    })

    test('the ring on a selected row is HighlightText, and on another row a system colour, both drawn', async ({ page }) => {
      await openLive(page, 'tree-view--selected')
      await page.keyboard.press('Tab')
      const lit = page.locator('#demo [data-highlighted]')
      await expect(lit).toHaveText('page.tsx')
      const line = await lit.evaluate((row) => [getComputedStyle(row).outlineStyle, getComputedStyle(row).outlineColor, getComputedStyle(row).color])
      expect(line[0]).toBe('solid')
      expect(line[1]).toBe(line[2])
      await page.keyboard.press('ArrowUp')
      await expect(lit).toHaveText('layout.tsx')
      expect(await ringOf(lit)).toBe('solid 2px -2px')
    })
  })
}

test.describe('motion, zoom and spacing', () => {
  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })
    test('rows change colour in no time at all', async ({ page }) => {
      await openLive(page, 'tree-view--basic')
      expect(await page.getByRole('treeitem').first().evaluate((row) => getComputedStyle(row).transitionDuration)).toBe('0s')
    })
  })

  test('at a 32 px root on a phone: rows of 80 px, the last of ten thousand still lands whole, nothing sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openLive(page, 'tree-view--ten-thousand')
    await page.addStyleTag({ content: 'html { font-size: 32px !important; }' })
    expect((await boxOf(page.getByRole('treeitem').first())).height).toBe(80)
    await page.keyboard.press('Tab')
    await page.keyboard.press('End')
    await expect.poll(() => stateOf(page)).toMatchObject({ text: 'File 10000.ts', whole: true })
    await expectNoSidewaysScroll(page)
  })

  test('WCAG 1.4.12 spacing: every label still fits its row, and nothing goes sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'tree-view--basic')
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' })
    const cut = await page.locator('#demo [role="treeitem"] span[dir="auto"]').evaluateAll((spans) =>
      spans.filter((span) => span.scrollHeight > span.clientHeight + 1 || span.getBoundingClientRect().height > (span.parentElement?.clientHeight ?? 0)).length)
    expect(cut).toBe(0)
    await expectNoSidewaysScroll(page)
  })
})

/** axe on the live demo, after the tree has taken the focus so aria-activedescendant is set. */
async function axe(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).include('#demo').analyze()
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.describe('axe on every demo, live and focused', () => {
  for (const demo of DEMOS) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: no violation`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          await page.keyboard.press('Tab')
          expect(await axe(page)).toEqual([])
        })
      }
    }
  }
})

test.describe('axe on every demo, on a 320 x 480 phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

  for (const demo of DEMOS) {
    test(`${demo}: no violation, and every row at least 44 px tall`, async ({ page }) => {
      await openLive(page, demo)
      expect(await axe(page)).toEqual([])
      const heights = await page.locator('#demo [role="treeitem"]').evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
      if (heights.length > 0) expect(Math.min(...heights)).toBeGreaterThanOrEqual(44)
    })
  }
})
