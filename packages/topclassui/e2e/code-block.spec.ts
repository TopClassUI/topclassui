import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { withScrollbar } from './overlay.js'
import { DEMOS, urlFor } from './pages.js'
import { type Clip, type Rgb, contrast, pixelsOf } from './pixels.js'

// CodeBlock in a real browser: what its server HTML promises on the static pages (a line that scrolls in its own box,
// code that reads left to right in an Arabic page, the targets, the rings and the forced-colours edge), then the copy
// button on the live harness, with the clipboard granted to Chromium. happy-dom has no layout and no clipboard.

const FIXTURE = '/e2e/fixtures/code-block-layouts.tsx'
const BLOCKS = DEMOS.filter((demo) => demo.startsWith('code-block--'))
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 }] as const
const LAYOUTS = ['cb-alone', 'cb-track', 'cb-flex', 'cb-fit', 'cb-cell'] as const
const BASIC = 'export default async function Page() {\n  const invoices = await getInvoices()\n  return <InvoiceTable items={invoices} />\n}'
/** px-3 at the default spacing: the code and the header both start 12 px in from the block's edge, as Figma 137:1585 draws. */
const PAD = 12
/** Inside the demo: a live page also holds the harness's own hidden pre for errors. */
const [PRE, CODE, BUTTON] = ['#demo pre', '#demo pre code', '#demo button']

/** What the clipboard holds. Windows hands text back with CRLF line ends, whatever was written. */
const clipboardText = (page: Page) => page.evaluate(async () => (await navigator.clipboard.readText()).replace(/\r\n/g, '\n'))

async function openFixture(page: Page, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'code-block--basic', options)
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await expect(page.locator('#code-block-fixture')).toHaveAttribute('data-ready', '')
}

interface Box { left: number, top: number, right: number, bottom: number, width: number, height: number }
const boxOf = (target: Locator) => target.evaluate((element): Box => {
  const { left, top, right, bottom, width, height } = element.getBoundingClientRect()
  return { left, top, right, bottom, width, height }
})

/** Nothing moves any more: every transition that ends has ended. Never a fixed wait. */
const atRest = (page: Page) => page.evaluate(async () => {
  const running = () => document.getAnimations().filter((animation) => animation.playState === 'running')
  for (let pending = running(); pending.length > 0; pending = running()) await Promise.allSettled(pending.map((a) => a.finished))
})

/** CSS colours painted one over the other on a canvas, so a colour with alpha is read as it lands on its backdrop. */
const paint = (page: Page, layers: string[]) => page.evaluate((all): [number, number, number] => {
  const pen = document.createElement('canvas').getContext('2d')
  if (!pen) throw new Error('no canvas')
  for (const colour of all) { pen.fillStyle = colour; pen.fillRect(0, 0, 1, 1) }
  const [r = 0, g = 0, b = 0] = pen.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}, layers)

const css = (target: Locator, property: string) => target.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property)

/** The pixels on the lines through the middle of a box that change when it loses the focus, and stand 3:1 off the block.
 * outside: the 6 px around the box (an offset ring); inside: the 6 px within its edge (an inset ring). */
async function ringOf(page: Page, block: Rgb, where: 'outside' | 'inside') {
  await atRest(page)
  const SPAN = 6
  const box = await page.evaluate(() => {
    const { left, top, right, bottom } = (document.activeElement ?? document.body).getBoundingClientRect()
    return { left, top, right, bottom }
  })
  const [x, y] = [Math.max(0, Math.floor(box.left) - SPAN), Math.max(0, Math.floor(box.top) - SPAN)]
  const clip: Clip = { x, y, width: Math.ceil(box.right) + SPAN - x, height: Math.ceil(box.bottom) + SPAN - y }
  const lit = await pixelsOf(page, clip)
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur() })
  await atRest(page)
  const plain = await pixelsOf(page, clip)
  const ring = (column: number, row: number) => {
    const none: Rgb = [0, 0, 0]
    const [a, b] = [lit[row * clip.width + column] ?? none, plain[row * clip.width + column] ?? none]
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 40 && contrast(a, block) >= 3
  }
  const [L, R, T, B] = [Math.round(box.left) - x, Math.round(box.right) - x, Math.round(box.top) - y, Math.round(box.bottom) - y]
  const [midRow, midColumn] = [Math.round((T + B) / 2), Math.round((L + R) / 2)]
  const run = Array.from({ length: SPAN }, (_, index) => index)
  const count = (points: [number, number][]) => points.filter(([column, row]) => ring(column, row)).length
  return where === 'outside'
    ? {
        above: count(run.map((step) => [midColumn, T - SPAN + step])), below: count(run.map((step) => [midColumn, B + step])),
        before: count(run.map((step) => [L - SPAN + step, midRow])), after: count(run.map((step) => [R + step, midRow])),
      }
    : {
        above: count(run.map((step) => [midColumn, T + step])), below: count(run.map((step) => [midColumn, B - 1 - step])),
        before: count(run.map((step) => [L + step, midRow])), after: count(run.map((step) => [R - 1 - step, midRow])),
      }
}

/** The block roots that leave the body, and those whose code is painted past their own edge. scrollWidth sees neither in an
 * RTL page, which cannot scroll right: so a point just outside each block, on its first line of code, is hit-tested. */
const rootsInside = (page: Page) => page.evaluate(() => {
  const width = document.body.clientWidth
  const roots = [...document.querySelectorAll('[data-lang], #code-block-fixture > div, #code-block-fixture [id^="cb-"]')]
  const outside = roots.filter((root) => {
    const { left, right } = root.getBoundingClientRect()
    return left < -0.5 || right > width + 0.5
  })
  const spilled = roots.filter((root) => {
    const pre = root.querySelector('pre')
    if (!pre) return false
    pre.scrollIntoView({ block: 'nearest' })
    const [box, line] = [root.getBoundingClientRect(), pre.getBoundingClientRect().top + 8]
    return [box.right + 4, box.left - 4]
      .filter((x) => x > 0 && x < innerWidth)
      .some((x) => { const hit = document.elementFromPoint(x, line); return hit !== null && root.contains(hit) })
  })
  return outside.length + spilled.length
})

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

test('the set holds the nine demos, so a renamed folder cannot empty the loops below', () => {
  expect(BLOCKS.sort()).toEqual([
    'code-block--basic', 'code-block--highlighted', 'code-block--long-line', 'code-block--no-copy', 'code-block--no-header',
    'code-block--playground', 'code-block--rtl', 'code-block--states', 'code-block--wrap',
  ])
})

test.describe('the server HTML, at 320 px', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: the 300-character line scrolls inside its pre, and the page does not`, async ({ page }) => {
      await page.goto(urlFor('code-block--long-line', 'light', direction))
      const pre = page.locator(PRE)
      const { scrollWidth, clientWidth } = await pre.evaluate((element) => ({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }))
      expect(scrollWidth, 'the line is cut or wrapped').toBeGreaterThan(clientWidth * 5)
      await expectNoSidewaysScroll(page)
      expect(await rootsInside(page)).toBe(0)
    })

    // The 300-character line: a short line starts at the left of an RTL pre too (measured), so only an overflowing one tells.
    test(`${direction}: the code starts at the left of its pre, and the button sits at the inline end of the header`, async ({ page }) => {
      await page.goto(urlFor('code-block--long-line', 'light', direction))
      const pre = await boxOf(page.locator(PRE))
      const first = await page.locator(CODE).evaluate((code) => {
        const range = document.createRange()
        const text = code.firstChild
        if (!text) return { left: -1, right: -1 }
        range.setStart(text, 0)
        range.setEnd(text, 1)
        const { left, right } = range.getBoundingClientRect()
        return { left, right }
      })
      expect(Math.round(first.left - pre.left), 'the first character, from the left of the pre').toBe(PAD)
      const [header, button, title] = [await boxOf(page.locator(PRE).locator('xpath=preceding-sibling::div')), await boxOf(page.locator(BUTTON)), await boxOf(page.locator('span[dir="auto"]'))]
      const end = direction === 'ltr' ? header.right - button.right : button.left - header.left
      expect(Math.round(end), 'the button, from the inline end of the header').toBe(PAD)
      expect(direction === 'ltr' ? title.right <= button.left : title.left >= button.right, 'the title before the button').toBe(true)
    })
  }

  test('the rtl demo, inside an Arabic page: the code still starts at the left, the button is at the left, named in Arabic', async ({ page }) => {
    await page.goto(urlFor('code-block--rtl', 'light', 'rtl'))
    expect(await page.locator(PRE).evaluate((element) => getComputedStyle(element).direction)).toBe('ltr')
    const heading = page.locator(PRE).locator('xpath=preceding-sibling::div')
    expect(await heading.evaluate((element) => getComputedStyle(element).direction)).toBe('rtl')
    const [header, button] = [await boxOf(heading), await boxOf(page.locator(BUTTON))]
    expect(Math.round(button.left - header.left)).toBe(PAD)
    await expect(page.getByRole('button', { name: 'نسخ الفواتير.tsx', exact: true })).toHaveCount(1)
  })
})

test.describe('in a real layout, at 320 px', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: alone, in a grid track, a flex-1 column, a w-fit parent and a table cell, the line scrolls inside the block`, async ({ page }) => {
      await openFixture(page, { direction })
      for (const id of LAYOUTS) {
        const root = page.locator(`#${id}`)
        const [own, parent] = [await boxOf(root), await boxOf(root.locator('..'))]
        expect(own.width, `${id} is wider than its parent`).toBeLessThanOrEqual(parent.width + 0.5)
        expect(own.width, `${id} collapsed`).toBeGreaterThan(100)
        expect(await root.locator('pre').evaluate((pre) => pre.scrollWidth > pre.clientWidth * 3), `${id} does not scroll`).toBe(true)
      }
      await expectNoSidewaysScroll(page)
      expect(await rootsInside(page)).toBe(0)
    })

    test(`${direction}: an element or a 300-character word as the title is cut, and the button stays whole beside it`, async ({ page }) => {
      await openFixture(page, { direction })
      for (const id of ['cb-element-title', 'cb-word-title']) {
        const [root, title, button] = [await boxOf(page.locator(`#${id}`)), page.locator(`#${id} span[dir="auto"]`), await boxOf(page.locator(`#${id} button`))]
        expect(await title.evaluate((element) => element.scrollWidth > element.clientWidth + 100), `${id} title`).toBe(true)
        expect(await title.evaluate((element) => getComputedStyle(element).overflow), id).toBe('hidden')
        expect([button.width, button.left >= root.left, button.right <= root.right], id).toEqual([24, true, true])
      }
      await expectNoSidewaysScroll(page)
    })

    test(`${direction}: an empty code keeps the block one line tall, and sixty lines grow it, scrolling nothing sideways`, async ({ page }) => {
      await openFixture(page, { direction })
      const [empty, lines] = [await boxOf(page.locator('#cb-empty pre')), await boxOf(page.locator('#cb-lines pre'))]
      expect(empty.height, 'an empty pre').toBeGreaterThanOrEqual(PAD)
      expect(lines.height, 'sixty lines').toBeGreaterThan(60 * 18)
      await expectNoSidewaysScroll(page)
    })
  }
})

test.describe('no sideways scroll', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: every demo`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of BLOCKS) {
          await page.goto(urlFor(demo, 'light', direction))
          await expectNoSidewaysScroll(page)
          expect(await rootsInside(page), demo).toBe(0)
        }
      })
    }
  }
})

for (const pointer of ['fine', 'coarse'] as const) {
  test.describe(`the button, ${pointer} pointer`, () => {
    test.use(pointer === 'coarse' ? { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } : {})

    for (const direction of DIRECTIONS) {
      test(`${direction}: ${pointer === 'coarse' ? '44' : '24'} px square, inside the header, which grows around it`, async ({ page }) => {
        await page.goto(urlFor('code-block--basic', 'light', direction))
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(pointer === 'coarse')
        const size = pointer === 'coarse' ? 44 : 24
        const [header, button] = [await boxOf(page.locator(PRE).locator('xpath=preceding-sibling::div')), await boxOf(page.locator(BUTTON))]
        expect([button.width, button.height]).toEqual([size, size])
        expect([Math.round(button.top - header.top), Math.round(header.bottom - button.bottom)], 'py-1 above and below').toEqual([4, 4])
      })
    }
  })
}

test.describe('the rings, on the block', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`${mode} ${direction}: the button and the pre ring in the block's text colour, whole and 3:1 against the block`, async ({ page }) => {
        await page.goto(urlFor('code-block--basic', mode, direction))
        const root = page.locator('[data-lang]')
        const [text, block] = [await paint(page, [await css(root, 'color')]), await paint(page, [await css(root, 'background-color')])]
        await page.keyboard.press('Tab')
        await expect(page.locator(BUTTON)).toBeFocused()
        await atRest(page)
        expect(await paint(page, [await css(page.locator(BUTTON), 'outline-color')]), 'the button ring').toEqual(text)
        expect(contrast(text, block)).toBeGreaterThanOrEqual(3)
        expect(await ringOf(page, block, 'outside'), 'the button ring').toEqual({ above: 2, below: 2, before: 2, after: 2 })
        await page.locator(BUTTON).focus()
        await page.keyboard.press('Tab')
        await expect(page.locator(PRE)).toBeFocused()
        await atRest(page)
        expect(await paint(page, [await css(page.locator(PRE), 'outline-color')]), 'the pre ring').toEqual(text)
        expect(await ringOf(page, block, 'inside'), 'the pre ring').toEqual({ above: 2, below: 2, before: 2, after: 2 })
      })
    }
  }
})

/** Under a classic scrollbar, at 320 px: the colour the pre's bottom ring row is painted in when focused, and the colour of the
 * bar just inside it, over the thumb and over the track, with the block's own fill to tell the two apart. */
async function ringOnBar(page: Page, block: Rgb) {
  const pre = page.locator(PRE)
  const bar = await pre.evaluate((element) => (element as HTMLElement).offsetHeight - element.clientHeight)
  const { left, top, width, height } = await boxOf(pre)
  const clip: Clip = { x: Math.ceil(left), y: Math.ceil(top), width: Math.floor(width) - 1, height: Math.floor(height) - 1 }
  await pre.focus()
  await atRest(page)
  const lit = await pixelsOf(page, clip)
  const at = (column: number, row: number): Rgb => lit[row * clip.width + column] ?? [0, 0, 0]
  // The middle row of the bar: a thumb column is any that is not the block's fill. The ends hold the corners and the ring.
  const middle = clip.height - Math.ceil(bar / 2)
  const inner = Array.from({ length: clip.width - 16 }, (_, index) => index + 8)
  const thumb = inner.filter((column) => contrast(at(column, middle), block) >= 1.5)
  const track = inner.filter((column) => contrast(at(column, middle), block) < 1.05)
  const pair = (columns: number[]) => {
    const column = columns[Math.floor(columns.length / 2)] ?? 0
    return { ring: at(column, clip.height - 1), bar: at(column, clip.height - 4) }
  }
  return { bar, thumb: thumb.length > 0 ? pair(thumb) : null, track: track.length > 0 ? pair(track) : null }
}

test.describe('the pre ring over a classic scrollbar', () => {
  for (const mode of MODES) {
    withScrollbar(`${mode}: the bar takes the block's colours, so the ring's bottom side stands 3:1 off its track and its thumb`, async ({ barPage: page }) => {
      // At 390 px basic's 43-character line fits in Consolas, so Windows draws no bar; at 320 px it overflows in every mono.
      await page.setViewportSize({ width: 320, height: 844 })
      for (const demo of ['code-block--long-line', 'code-block--basic']) {
        for (const direction of DIRECTIONS) {
          await page.goto(urlFor(demo, mode, direction))
          const block = await paint(page, [await css(page.locator('[data-lang]'), 'background-color')])
          const read = await ringOnBar(page, block)
          const where = `${demo} ${direction}`
          expect(read.bar, `${where}: the browser draws no classic bar`).toBeGreaterThan(0)
          expect([read.thumb !== null, read.track !== null], `${where}: a thumb and a track`).toEqual([true, true])
          if (read.thumb === null || read.track === null) continue
          expect({
            ringOnTrack: contrast(read.track.ring, read.track.bar) >= 3,
            ringOnThumb: contrast(read.thumb.ring, read.thumb.bar) >= 3,
            thumbOnTrack: contrast(read.thumb.bar, read.track.bar) >= 3,
          }, where).toEqual({ ringOnTrack: true, ringOnThumb: true, thumbOnTrack: true })
        }
      }
    })
  }
})

test.describe('the header text and the icons, against the block', () => {
  for (const mode of MODES) {
    test(`${mode}: the 70% title 4.5:1, the icon 3:1 at rest, and 3:1 on the 10% hover tint`, async ({ page }) => {
      await page.goto(urlFor('code-block--basic', mode, 'ltr'))
      const root = page.locator('[data-lang]')
      const ground = await css(root, 'background-color')
      const block = await paint(page, [ground])
      expect(contrast(await paint(page, [ground, await css(page.locator('span[dir="auto"]'), 'color')]), block), 'title').toBeGreaterThanOrEqual(4.5)
      expect(contrast(await paint(page, [ground, await css(page.locator(BUTTON), 'color')]), block), 'icon at rest').toBeGreaterThanOrEqual(3)
      await page.locator(BUTTON).hover()
      await atRest(page)
      const tint = await paint(page, [ground, await css(page.locator(BUTTON), 'background-color')])
      expect(tint, 'the hover paints a tint').not.toEqual(block)
      expect(contrast(await paint(page, [ground, await css(page.locator(BUTTON), 'color')]), tint), 'icon on hover').toBeGreaterThanOrEqual(3)
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
  return { canvas: read('Canvas'), text: read('CanvasText') }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    test('the block, whose fill is erased, keeps an edge on all four sides; the button ring is whole', async ({ page }) => {
      await page.goto(urlFor('code-block--basic', 'light', 'ltr'))
      const system = await systemColours(page)
      const canvas = await paint(page, [system.canvas])
      const box = await boxOf(page.locator('[data-lang]'))
      const pixel = async (x: number, y: number) => (await pixelsOf(page, { x, y, width: 1, height: 1 }))[0] ?? [0, 0, 0]
      const [midX, midY] = [Math.round((box.left + box.right) / 2), Math.round((box.top + box.bottom) / 2)]
      const edges = {
        before: await pixel(Math.round(box.left) - 1, midY), after: await pixel(Math.round(box.right), midY),
        above: await pixel(midX, Math.round(box.top) - 1), below: await pixel(midX, Math.round(box.bottom)),
      }
      expect(Object.fromEntries(Object.entries(edges).map(([side, rgb]) => [side, contrast(rgb, canvas) >= 3]))).toEqual({ before: true, after: true, above: true, below: true })
      await page.keyboard.press('Tab')
      expect(await ringOf(page, canvas, 'outside')).toEqual({ above: 2, below: 2, before: 2, after: 2 })
    })
  })
}

test.describe('the keyboard', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab reaches the button, then the pre; the arrows scroll the pre; wrap leaves the pre out`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openLive(page, 'code-block--long-line', { direction })
      await page.keyboard.press('Tab')
      await expect(page.locator(BUTTON)).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(page.locator(PRE)).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect.poll(() => page.locator(PRE).evaluate((pre) => pre.scrollLeft)).toBeGreaterThan(0)
      await page.keyboard.press('Shift+Tab')
      await expect(page.locator(BUTTON)).toBeFocused()

      await openLive(page, 'code-block--wrap', { direction })
      await page.keyboard.press('Tab')
      await expect(page.locator(BUTTON)).toBeFocused()
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('PRE')
    })

    test(`${direction}: with no title, Tab lands on a region named Code, never on a nameless box`, async ({ page }) => {
      await openLive(page, 'code-block--no-header', { direction })
      await page.keyboard.press('Tab')
      await expect(page.locator(PRE)).toBeFocused()
      await expect(page.getByRole('region', { name: 'Code', exact: true })).toBeFocused()
    })
  }
})

test.describe('the copy, live, with the clipboard granted', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  for (const [direction, demo, name, said] of [
    ['ltr', 'code-block--basic', 'Copy page.tsx', 'Copied'],
    ['rtl', 'code-block--rtl', 'نسخ الفواتير.tsx', 'تم النسخ'],
  ] as const) {
    test(`${direction}: Tab to the button, Enter: the clipboard holds the code, the status says so for 2 s, and the name stays`, async ({ page }) => {
      await page.clock.install({ time: new Date('2026-10-15T10:00:00Z') })
      await openLive(page, demo, { direction })
      // Paused, so the 2 s are counted by the test alone and no real time slips in between two steps.
      await page.clock.pauseAt(new Date('2026-10-15T10:01:00Z'))
      await page.evaluate(() => navigator.clipboard.writeText('before'))
      await page.keyboard.press('Tab')
      const button = page.getByRole('button', { name, exact: true })
      await expect(button).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('status')).toHaveText(said)
      expect(await clipboardText(page)).toBe(BASIC)
      await expect(button).toHaveAttribute('data-copied', '')
      await expect(page.getByRole('button', { name, exact: true })).toHaveCount(1)
      await page.clock.runFor(1990)
      await expect(page.getByRole('status')).toHaveText(said)
      await page.clock.runFor(10)
      await expect(page.getByRole('status')).toHaveText('')
      await expect(button).not.toHaveAttribute('data-copied')
      await page.keyboard.press('Space')
      await expect(page.getByRole('status')).toHaveText(said)
    })
  }

  test('the highlighted demo copies its plain text, not its markup', async ({ page }) => {
    await openLive(page, 'code-block--highlighted')
    await page.getByRole('button', { name: 'Copy sample.tsx' }).click()
    await expect(page.getByRole('status')).toHaveText('Copied')
    expect(await clipboardText(page)).toBe(await page.locator(CODE).textContent())
  })
})

test.describe('the copy, with no clipboard, as on plain http', () => {
  test('a press says Could not copy, keeps the copy icon, and throws nothing', async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => undefined }) })
    await openLive(page, 'code-block--basic')
    const button = page.getByRole('button', { name: 'Copy page.tsx' })
    const icon = await button.locator('path').getAttribute('d')
    await button.click()
    await expect(page.getByRole('status')).toHaveText('Could not copy')
    expect(await button.locator('path').getAttribute('d')).toBe(icon)
    await expect(button).not.toHaveAttribute('data-copied')

    // Within the 2 s nothing is awaited: the same words must come back as a new node, or the live region has nothing to read.
    await page.getByRole('status').evaluate((status) => {
      const added: string[] = []
      Object.assign(window, { added })
      new MutationObserver((records) => { added.push(...records.flatMap((record) => [...record.addedNodes].map((node) => node.textContent ?? ''))) })
        .observe(status, { childList: true, subtree: true, characterData: true })
    })
    await button.click()
    await expect.poll(() => page.evaluate(() => (window as unknown as { added: string[] }).added)).toEqual(['Could not copy'])
    await expect(page.getByRole('status')).toHaveText('Could not copy')
  })
})

test.describe('text that is made larger or spaced out', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: with the root at 32 px the button keeps its floor, the title its row, and the page does not scroll sideways`, async ({ page }) => {
      for (const demo of ['code-block--basic', 'code-block--long-line', 'code-block--wrap']) {
        await page.goto(urlFor(demo, 'light', direction))
        await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
        await expectNoSidewaysScroll(page)
        expect(await rootsInside(page), demo).toBe(0)
        const [button, title] = [await boxOf(page.locator(BUTTON)), await boxOf(page.locator('span[dir="auto"]'))]
        expect(button.width >= 24 && button.height >= 24, demo).toBe(true)
        expect(direction === 'ltr' ? title.right <= button.left : title.left >= button.right, `${demo}: title beside the button`).toBe(true)
      }
    })

    test(`${direction}: with the spacing of WCAG 1.4.12 nothing leaves the block and the page does not scroll sideways`, async ({ page }) => {
      for (const demo of ['code-block--basic', 'code-block--wrap']) {
        await page.goto(urlFor(demo, 'light', direction))
        await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important }' })
        await expectNoSidewaysScroll(page)
        const [root, title, code] = [await boxOf(page.locator('[data-lang]')), await boxOf(page.locator('span[dir="auto"]')), await boxOf(page.locator(CODE))]
        expect(title.top >= root.top && title.bottom <= root.bottom, `${demo}: title`).toBe(true)
        expect(code.bottom <= root.bottom, `${demo}: code`).toBe(true)
      }
    })
  }
})

test.describe('motion', () => {
  test('the button changes colour over 150 ms', async ({ page }) => {
    await page.goto(urlFor('code-block--basic', 'light', 'ltr'))
    await expect(page.locator(BUTTON)).toHaveCSS('transition-duration', '0.15s')
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('it changes at once, and a press still copies', async ({ page }) => {
      await openLive(page, 'code-block--basic')
      await expect(page.locator(BUTTON)).toHaveCSS('transition-duration', '0s')
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
      await page.locator(BUTTON).click()
      await expect(page.getByRole('status')).toHaveText('Copied')
    })
  })
})

async function axe(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).include('#demo').analyze()
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.describe('axe, on the hydrated pages', () => {
  for (const mode of MODES) {
    for (const direction of DIRECTIONS) {
      test(`${mode} ${direction}: none on any demo`, async ({ page }) => {
        for (const demo of BLOCKS) {
          await openLive(page, demo, { mode, direction })
          expect(await axe(page), demo).toEqual([])
        }
      })
    }
  }

  test.describe('320 x 480 under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: none on any demo`, async ({ page }) => {
        for (const demo of BLOCKS) {
          await openLive(page, demo, { direction })
          expect(await axe(page), demo).toEqual([])
        }
      })
    }
  })
})
