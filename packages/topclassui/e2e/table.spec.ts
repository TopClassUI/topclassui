import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectRing } from './keyboard.js'
import { DEMOS, urlFor } from './pages.js'

// What a class list cannot show, each measured failing before it was fixed: a hidden
// span or a card in a grid that widened the page, cells stacked word by word, a dimmed
// Button painted over the stuck column, and a focused control lying under it (SC 2.4.11).
// Then, from a table in a real page: a sort link as wide as its column, a box pulled
// back on every row by a link in the stuck column, and a stuck column with no edge.
const TABLES = DEMOS.filter((demo) => demo.startsWith('table--'))
const STUCK = ['table--sticky-first-column', 'table--rtl', 'table--row-actions']

test('the set holds the table demos, so a renamed folder cannot empty the loops below', () => {
  expect(TABLES.length).toBeGreaterThan(5)
  for (const demo of [...STUCK, 'table--sorted']) expect(TABLES).toContain(demo)
  // A table in a card of a grid and beside a sidebar: 715 px of page at 390 before the box became a grid.
  expect(TABLES).toContain('table--in-a-layout')
})

test.describe('at 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const demo of TABLES) {
    for (const direction of DIRECTIONS) {
      test(`${demo} ${direction}: the box scrolls, never the page`, async ({ page }) => {
        await page.goto(urlFor(demo, 'light', direction))
        const measured = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          // The body, not the root: the root still counts the scrollbar gutter the harness keeps, 10 px of slack.
          clientWidth: document.body.clientWidth,
          boxes: [...document.querySelectorAll('[role="region"]')].map((box) => {
            const { left, right } = box.getBoundingClientRect()
            return { left, right }
          }),
        }))

        expect(measured.boxes.length).toBeGreaterThan(0)
        // An sr-only span is absolute: unless the box contains it, a far column widens the page.
        expect(measured.scrollWidth, 'the page is wider than the viewport').toBeLessThanOrEqual(measured.clientWidth)
        // scrollWidth cannot see what hangs off the start edge, where nothing can scroll to it.
        for (const box of measured.boxes) {
          expect(box.left, 'a box starts off the page').toBeGreaterThanOrEqual(0)
          expect(box.right, 'a box ends off the page').toBeLessThanOrEqual(measured.clientWidth)
        }
      })
    }
  }

  test('a narrow box scrolls sideways instead of stacking a date word by word', async ({ page }) => {
    await page.goto(urlFor('table--caption', 'light', 'ltr'))
    const measured = await page.locator('[role="region"]').first().evaluate((box) => ({
      scrolls: box.scrollWidth > box.clientWidth,
      head: box.querySelector('thead tr')?.getBoundingClientRect().height ?? 0,
      rows: [...box.querySelectorAll('tbody tr')].map((row) => row.getBoundingClientRect().height),
    }))
    // One line of 14 px type, 12 px of padding each way and the row line: measured 85 before cells kept to one line.
    expect(measured.rows.length).toBeGreaterThan(0)
    for (const height of measured.rows) expect(height).toBeLessThan(50)
    expect(measured.head).toBeLessThan(40)
    expect(measured.scrolls, 'the table fits, so this measured nothing').toBe(true)
  })

  test('the placeholder is exactly as tall as the table it stands in for, so nothing moves when the rows arrive', async ({ page }) => {
    await page.goto(urlFor('table--skeleton', 'light', 'ltr'))
    const placeholder = await page.locator('#demo [aria-hidden="true"]').first().boundingBox()
    const table = await page.locator('[role="region"]').first().boundingBox()
    expect(placeholder?.height ?? 0).toBeGreaterThan(100)
    expect(placeholder?.height).toBe(table?.height)
    expect(placeholder?.width).toBe(table?.width)
  })
})

interface Diff { width: number; height: number; at: boolean[] }

/** Which pixels differ between two screenshots, decoded in the page: Playwright exports no PNG reader. */
async function changed(page: Page, before: Buffer, after: Buffer): Promise<Diff> {
  return page.evaluate(async ([first, second]) => {
    const read = async (base64: string) => {
      const image = new Image()
      image.src = `data:image/png;base64,${base64}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('no canvas to read the screenshot with')
      context.drawImage(image, 0, 0)
      return context.getImageData(0, 0, image.width, image.height)
    }
    const [a, b] = [await read(first), await read(second)]
    // Thrown, not counted: a count of -1 once passed every "fewer than" below.
    if (a.width !== b.width || a.height !== b.height) throw new Error('the two screenshots are not the same size')
    const at: boolean[] = []
    for (let i = 0; i < a.data.length; i += 4) {
      at.push(a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2])
    }
    return { width: a.width, height: a.height, at }
  }, [before.toString('base64'), after.toString('base64')] as const)
}

const changedPixels = async (page: Page, before: Buffer, after: Buffer) => (await changed(page, before, after)).at.filter(Boolean).length

/** The first dimmed Button of the box and the stuck cell of its row, as the page lays them out now. */
const dimmedRow = (box: Locator) => box.evaluate((el) => {
  const button = el.querySelector('tbody button[disabled]')
  const stuck = button?.closest('tr')?.firstElementChild
  if (!button || !stuck) throw new Error('the demo has no disabled Button in a row to scroll under the stuck column')
  const [b, s] = [button.getBoundingClientRect(), stuck.getBoundingClientRect()]
  return {
    button: { left: b.left, right: b.right },
    stuck: { x: s.x, y: s.y, width: s.width, height: s.height, left: s.left, right: s.right },
    opacity: getComputedStyle(button).opacity,
    rtl: getComputedStyle(el).direction === 'rtl',
  }
})

for (const direction of DIRECTIONS) {
  test(`${direction}: the stuck column keeps its pixels while a dimmed Button scrolls under it`, async ({ page }) => {
    await page.goto(urlFor('table--sticky-first-column', 'light', direction))
    const box = page.locator('[data-sticky-first-column]').first()

    const rest = await dimmedRow(box)
    // opacity below 1 is what makes a stacking context, and so what paints over a cell with no z-index.
    expect(Number(rest.opacity)).toBeLessThan(1)
    // One pixel in from every side, so the row line and a sub-pixel edge are not in the picture.
    const clip = { x: Math.ceil(rest.stuck.x) + 1, y: Math.ceil(rest.stuck.y) + 1, width: Math.floor(rest.stuck.width) - 3, height: Math.floor(rest.stuck.height) - 3 }
    const before = await page.screenshot({ clip })

    // Slide the row along until the button lies 8 px inside the stuck cell.
    const shift = rest.rtl ? rest.button.right - rest.stuck.right + 8 : rest.button.left - rest.stuck.left - 8
    await box.evaluate((el, by) => { el.scrollLeft += by }, shift)
    const under = await dimmedRow(box)

    // The cell did not move, and the button really is behind it: otherwise this proves nothing.
    expect(under.stuck.x).toBeCloseTo(rest.stuck.x, 0)
    const overlap = Math.min(under.button.right, under.stuck.right) - Math.max(under.button.left, under.stuck.left)
    expect(overlap, 'the button never reached the stuck column').toBeGreaterThan(20)

    const after = await page.screenshot({ clip })
    // Measured before the fix: more than 2,000 changed pixels. A stray anti-aliased edge is under 50.
    expect(await changedPixels(page, before, after), 'the button is painted over the stuck column').toBeLessThan(50)
  })
}

/** The room the box keeps at each edge, 2rem: Chromium leaves a focused control alone while any of it lies
 * between the two, and centres it there otherwise. So this much of a control, or all of a narrower one, shows. */
const ROOM = 32

/** The focused control against the strip of its box a control can be seen in: past the stuck cell of its row. */
const stopOf = (page: Page) => page.evaluate(() => {
  const focused = document.activeElement
  const box = focused?.closest('[role="region"]')
  const cell = focused?.closest('th, td')
  if (!focused || !box || focused === box || !(cell instanceof HTMLTableCellElement)) return null
  const rtl = getComputedStyle(box).direction === 'rtl'
  const first = cell.parentElement?.firstElementChild
  const inStuck = box.hasAttribute('data-sticky-first-column') && first === cell
  const stuck = box.hasAttribute('data-sticky-first-column') && first && !inStuck ? first.getBoundingClientRect() : null
  const [f, b] = [focused.getBoundingClientRect(), box.getBoundingClientRect()]
  const inner = { left: b.left + box.clientLeft, right: b.left + box.clientLeft + box.clientWidth }
  const left = stuck && !rtl ? stuck.right : inner.left
  const right = stuck && rtl ? stuck.left : inner.right
  // What the box itself counts as in view: its own width less the scroll padding at each end.
  const pad = [getComputedStyle(box).scrollPaddingInlineStart, getComputedStyle(box).scrollPaddingInlineEnd].map(Number.parseFloat)
  const room = { left: inner.left + ((rtl ? pad[1] : pad[0]) ?? 0), right: inner.right - ((rtl ? pad[0] : pad[1]) ?? 0) }
  const style = getComputedStyle(focused)
  const ring = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset)
  return {
    name: focused.getAttribute('aria-label') ?? focused.textContent.trim(),
    head: cell.closest('thead') !== null,
    inStuck,
    column: cell.cellIndex,
    width: f.width,
    left: f.left,
    room,
    shown: Math.max(0, Math.min(f.right, right) - Math.max(f.left, left)),
    // How far the ring runs out of the strip, both sides added.
    ringCut: Math.max(0, left - (f.left - ring)) + Math.max(0, f.right + ring - right),
    scrollLeft: box.scrollLeft,
    onScreen: f.top >= 0 && f.bottom <= window.innerHeight,
  }
})

for (const demo of STUCK) {
  for (const direction of DIRECTIONS) {
    test(`${demo} ${direction}: a focused control is never under the stuck column`, async ({ page }) => {
      // Dozens of keys, each answered by the page: 3 s alone and 12 s beside another suite, so three times the limit.
      test.slow()
      await page.goto(urlFor(demo, 'light', direction))
      const box = page.locator('[data-sticky-first-column]').first()
      const rtl = await box.evaluate((el) => getComputedStyle(el).direction === 'rtl')

      // The keys are how a keyboard gets here at all, so prove they scroll before relying on it.
      await box.focus()
      await expectRing(page, 'the scrolling region')
      await expect(async () => {
        await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight')
        expect(Math.abs(await box.evaluate((el) => el.scrollLeft))).toBeGreaterThan(30)
      }).toPass({ timeout: 10_000 })
      // A key scrolls with an animation, which went on moving the box under the walk below: 7 px, one run in 36.
      await box.evaluate((el) => new Promise<void>((resolve) => {
        let [last, still] = [el.scrollLeft, 0]
        const tick = () => {
          still = el.scrollLeft === last ? still + 1 : 0
          last = el.scrollLeft
          if (still < 10) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      }))

      const stops: { name: string; width: number; shown: number }[] = []
      // Each offset puts a different column under the stuck one; the walk goes forwards, then back.
      for (const offset of [80, 120, 160]) {
        for (const key of ['Tab', 'Shift+Tab']) {
          await box.evaluate((el, to) => { el.scrollLeft = to }, rtl ? -offset : offset)
          await box.focus()
          // Backwards starts from the far side of the box: a first Tab leaves it only when no control follows.
          if (key === 'Shift+Tab') await box.evaluate((el) => { [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].at(-1)?.focus() })
          // Twelve stops are the sort links and four rows of the longest demo: all 25 are walked further down.
          for (let press = 0; press < 12; press++) {
            await page.keyboard.press(key)
            const stop = await stopOf(page)
            if (!stop) break
            if (!stop.inStuck) stops.push({ name: stop.name, width: stop.width, shown: stop.shown })
          }
        }
      }

      // The loop found controls to focus, or an empty walk would pass.
      expect(stops.length).toBeGreaterThan(8)
      // Not under the stuck column and not past the end of the box either: the room is kept at both.
      expect(stops.filter((stop) => stop.shown < Math.min(stop.width, ROOM) - 1), 'hidden while focused').toEqual([])
    })
  }
}

/** Every sort link of the page beside the header cell it sits in. */
const sortLinks = (page: Page) => page.locator('thead a').evaluateAll((links) => links.map((link) => {
  const cell = link.closest('th')
  const label = link.querySelector('span[id]')
  if (!cell || !label) throw new Error('a sort link with no header cell or no label')
  const style = getComputedStyle(cell)
  const rtl = style.direction === 'rtl'
  const [l, c, first] = [link.getBoundingClientRect(), cell.getBoundingClientRect(), label.getBoundingClientRect()]
  const last = (link.querySelector('svg') ?? label).getBoundingClientRect()
  const pad = Number.parseFloat(style.paddingInlineStart)
  return {
    name: link.textContent.trim(),
    link: l.width,
    // The label and the caret after it: what the link is there to show.
    words: rtl ? first.right - last.left : last.right - first.left,
    cell: c.width - 2 * pad,
    end: style.textAlign === 'end',
    // From the inner edge of the cell to the words, on the side the column is aligned to.
    startGap: rtl ? c.right - pad - first.right : first.left - c.left - pad,
    endGap: rtl ? last.left - c.left - pad : c.right - pad - last.right,
  }
}))

const POINTERS = [
  { name: 'a fine pointer', floor: 24, use: { viewport: { width: 1280, height: 800 } } },
  { name: 'a coarse pointer', floor: 44, use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
] as const

for (const pointer of POINTERS) {
  test.describe(`under ${pointer.name}`, () => {
    test.use(pointer.use)

    for (const demo of [...STUCK, 'table--sorted']) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${direction}: a sort link is as wide as its words, and they stay where the column is aligned`, async ({ page }) => {
          await page.goto(urlFor(demo, 'light', direction))
          const links = await sortLinks(page)
          expect(links.length).toBeGreaterThan(2)

          // Its words, or the target floor when they are shorter: measured 236 px for a 60 px word when it filled the cell.
          expect(links.filter((each) => each.link > Math.max(each.words, pointer.floor) + 1), 'wider than its words').toEqual([])
          expect(links.filter((each) => each.link < pointer.floor), 'under the target floor').toEqual([])
          // A column with room to spare, or a link that filled its cell would pass the line above.
          expect(links.filter((each) => each.cell > each.link + 20).length).toBeGreaterThan(0)

          // An end-aligned header ends where its digits end, and a start-aligned one starts where its cells start.
          expect(links.filter((each) => Math.abs(each.end ? each.endGap : each.startGap) > 0.5), 'off the edge its column reads from').toEqual([])
          expect(links.filter((each) => each.end).length).toBeGreaterThan(0)
        })
      }
    }
  })
}

test('a sort header that wraps is no taller than its lines: the link sits on the top of its line', async ({ page }) => {
  await page.goto(urlFor('table--sorted', 'light', 'ltr'))
  const measure = () => page.locator('thead').first().evaluate((head) => {
    const link = head.querySelector('a')
    if (!link) throw new Error('the demo has no sort link')
    return { row: head.getBoundingClientRect().height, link: link.getBoundingClientRect().height }
  })
  const oneLine = await measure()

  // No demo wraps a sortable header, so make the first one long and narrow, and let its cell wrap it.
  await page.locator('thead th').first().evaluate((cell) => {
    const [link, label] = [cell.querySelector('a'), cell.querySelector('span[id]')]
    if (!(cell instanceof HTMLElement) || !link || !label) throw new Error('the first header has no sort link')
    cell.style.whiteSpace = 'normal'
    link.style.maxWidth = '6rem'
    label.textContent = 'Customers in the order of their names'
  })
  const wrapped = await measure()

  expect(wrapped.link, 'the header did not wrap, so this measured nothing').toBeGreaterThan(oneLine.link + 12)
  // 20 px of cell padding less the 8 px the link gives back: on the baseline the wrapped row was 16 px more, not 12.
  expect([oneLine.row - oneLine.link, wrapped.row - wrapped.link]).toEqual([12, 12])
})

type Sides = Record<'top' | 'bottom' | 'left' | 'right', number>

/** The share of each side of the focus ring that is really painted: the pixels that change when the ring is taken away. */
async function ringPainted(page: Page): Promise<Sides> {
  const { x, y, width, height, ring } = await page.evaluate(() => {
    const focused = document.activeElement
    if (!focused) throw new Error('nothing is focused')
    const rect = focused.getBoundingClientRect()
    const style = getComputedStyle(focused)
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, ring: Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset) }
  })
  // Two pixels more than the ring, so a sub-pixel edge still falls inside the band of its side.
  const band = Math.ceil(ring) + 2
  const clip = { x: Math.floor(x) - band, y: Math.floor(y) - band, width: Math.ceil(width) + 2 * band + 1, height: Math.ceil(height) + 2 * band + 1 }
  const withRing = await page.screenshot({ clip })
  const off = await page.addStyleTag({ content: ':focus-visible { outline-style: none !important }' })
  const without = await page.screenshot({ clip })
  await off.evaluate((style) => { style.parentNode?.removeChild(style) })

  const diff = await changed(page, withRing, without)
  const hit = (px: number, py: number) => diff.at[py * diff.width + px] === true
  /** Along one side, corners left out: the share of its length with a changed pixel somewhere across the band. */
  const share = (length: number, across: (at: number) => boolean) => {
    let covered = 0
    for (let at = band + 2; at < length - band - 2; at++) if (across(at)) covered += 1
    return covered / (length - 2 * band - 4)
  }
  const depth = Array.from({ length: band }, (_, index) => index)
  return {
    top: share(diff.width, (px) => depth.some((d) => hit(px, d))),
    bottom: share(diff.width, (px) => depth.some((d) => hit(px, diff.height - 1 - d))),
    left: share(diff.height, (py) => depth.some((d) => hit(d, py))),
    right: share(diff.height, (py) => depth.some((d) => hit(diff.width - 1 - d, py))),
  }
}

/** A side is whole when nine tenths of it changed: the box edge or the stuck column cuts a side to nothing. */
const cutSides = (sides: Sides) => Object.entries(sides).filter(([, share]) => share < 0.9).map(([side]) => side)

/** The column of every sort link of each walk, written out, so a demo that loses one fails here and not silently. */
const SORT_COLUMNS: Record<string, number[]> = {
  // The stuck column, the one beside it, and an end-aligned one.
  'table--row-actions': [0, 1, 3, 4],
  // End-aligned amounts; the seventh column is the last.
  'table--sticky-first-column': [2, 3, 4, 5, 6],
  // Arabic: the stuck column, the one beside it, and the last.
  'table--rtl': [0, 1, 4],
}

/** Puts a sort link wholly out of view, past the end of its box or under its stuck column, with focus on the stop before it. */
const putOutOfView = (link: Element, side: 'end' | 'start') => {
  const box = link.closest('[role="region"]')
  const cell = link.closest('th')
  const stuck = cell?.parentElement?.firstElementChild
  if (!box || !cell || !stuck) throw new Error('not a sort link of a table')
  // A link of the stuck column is always in view: there is nowhere to bring it in from.
  if (cell === stuck) return false
  const rtl = getComputedStyle(box).direction === 'rtl'
  const edges = () => {
    const [l, b, s] = [link.getBoundingClientRect(), box.getBoundingClientRect(), stuck.getBoundingClientRect()]
    // Along the reading direction, from the starting edge of the box: where the link starts and ends, and where the strip does.
    return rtl
      ? { from: b.right - l.right, to: b.right - l.left, stuck: b.right - s.left, end: b.width }
      : { from: l.left - b.left, to: l.right - b.left, stuck: s.right - b.left, end: b.width }
  }
  const rest = edges()
  box.scrollLeft += (rtl ? -1 : 1) * (rest.from - (side === 'end' ? rest.end + 8 : 4))
  const stops = [...document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')]
  stops[stops.indexOf(link as HTMLElement) - 1]?.focus({ preventScroll: true })
  // The scroll range may not reach that far: then this side is one the link can never be out of view on.
  const now = edges()
  return now.to <= now.stuck || now.from >= now.end
}

for (const width of [320, 1280]) {
  test.describe(`${String(width)} px wide`, () => {
    test.use({ viewport: { width, height: 800 } })

    for (const demo of STUCK) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${direction}: tabbing from rest paints the whole ring of every sort link, forwards and back`, async ({ page }) => {
          test.slow()
          await page.goto(urlFor(demo, 'light', direction))
          await page.locator('[data-sticky-first-column]').first().focus()

          const columns: number[] = []
          const cut: string[] = []
          for (const key of ['Tab', 'Shift+Tab']) {
            for (let press = 0; press < 12; press++) {
              await page.keyboard.press(key)
              const stop = await stopOf(page)
              // Forwards ends on the first control of a row, or past the table when it has none; back ends on the box.
              if (!stop?.head) break
              columns.push(stop.column)
              const sides = cutSides(await ringPainted(page))
              if (stop.ringCut > 0.5 || sides.length > 0) cut.push(`${key} ${stop.name}: ${String(stop.ringCut)} px out, ${sides.join(' ')} not painted`)
            }
          }

          const expected = SORT_COLUMNS[demo] ?? []
          expect(columns).toEqual([...expected, ...[...expected].reverse()])
          // Measured when the link filled its cell: 124 px of the ring past the end of the box, and 36 px under the stuck header.
          expect(cut).toEqual([])
        })

        test(`${demo} ${direction}: a sort link brought in from out of view has its whole ring, from either side`, async ({ page }) => {
          test.slow()
          await page.goto(urlFor(demo, 'light', direction))
          const links = page.locator('[data-sticky-first-column]').first().locator('thead a')

          const brought: string[] = []
          const cut: string[] = []
          for (let index = 0; index < await links.count(); index++) {
            for (const side of ['end', 'start'] as const) {
              if (!(await links.nth(index).evaluate(putOutOfView, side))) continue
              await page.keyboard.press('Tab')
              await expect(links.nth(index)).toBeFocused()
              const stop = await stopOf(page)
              const sides = cutSides(await ringPainted(page))
              brought.push(`${String(stop?.column)} ${side}`)
              if (!stop || stop.ringCut > 0.5 || sides.length > 0) cut.push(`${stop?.name ?? ''} from the ${side}: ${String(stop?.ringCut)} px out, ${sides.join(' ')} not painted`)
            }
          }

          expect(cut).toEqual([])
          // How far a box scrolls decides which links it can hide, but always these two: the first one past
          // the stuck column from under it, and the last one from past the end of the box.
          const past = (SORT_COLUMNS[demo] ?? []).filter((column) => column > 0)
          expect(brought).toEqual(expect.arrayContaining([`${String(past.at(0))} start`, `${String(past.at(-1))} end`]))
        })
      }
    }

    for (const direction of DIRECTIONS) {
      test(`table--row-actions ${direction}: a walk down 25 rows moves the box only for a control that was out of view`, async ({ page }) => {
        test.slow()
        await page.goto(urlFor('table--row-actions', 'light', direction))
        const box = page.locator('[data-sticky-first-column]').first()
        await box.focus()

        let before = await box.evaluate((el) => el.scrollLeft)
        for (const key of ['Tab', 'Shift+Tab']) {
          const stops: (NonNullable<Awaited<ReturnType<typeof stopOf>>> & { moved: number })[] = []
          for (let press = 0; press < 80; press++) {
            await page.keyboard.press(key)
            const stop = await stopOf(page)
            if (!stop) break
            stops.push({ ...stop, moved: stop.scrollLeft - before })
            before = stop.scrollLeft
          }
          const rows = stops.filter((stop) => !stop.head)
          const links = rows.filter((stop) => stop.inStuck)
          // Four sort links, then a link and a button in each of 25 rows.
          expect([stops.length, rows.length, links.length], key).toEqual([54, 50, 25])

          // The link of the stuck column never moves the box: it pulled it back 136 px on every row.
          expect(links.filter((stop) => stop.moved !== 0).map((stop) => stop.name), key).toEqual([])
          // And the box was away from rest when they were focused, or there was nothing to pull back.
          expect(links.filter((stop) => Math.abs(stop.scrollLeft) > 100).length, key).toBe(25)
          // So the box moves once at most in the rows, for the first button, and stays there for 24 more.
          expect(rows.filter((stop) => stop.moved !== 0).length, key).toBeLessThanOrEqual(1)

          // Whatever moved the box had no part in the room before the key: its place then is its place now, moved back.
          const inRoom = (stop: (typeof stops)[number]) =>
            Math.min(stop.left + stop.moved + stop.width, stop.room.right) - Math.max(stop.left + stop.moved, stop.room.left)
          expect(stops.filter((stop) => stop.moved !== 0 && inRoom(stop) > 0.5).map((stop) => stop.name), key).toEqual([])
          // And every stop ends with the room showing, or all of it, on a row the page scrolled to.
          expect(stops.filter((stop) => stop.shown < Math.min(stop.width, ROOM) - 1 || !stop.onScreen).map((stop) => stop.name), key).toEqual([])
        }
      })
    }
  })
}

/** Takes the edge of the stuck column away, however it is drawn, to see what it painted and whether it took any room. */
const NO_EDGE = '.sticky::after { display: none !important } .sticky { border-inline-end-width: 0 !important; box-shadow: none !important }'

/** The first stuck body cell: four pixels across its inline-end edge, and where every column of the table lies. */
const edgeOf = (box: Locator) => box.evaluate((el) => {
  const cell = el.querySelector('tbody tr')?.firstElementChild
  if (!cell) throw new Error('the table has no row')
  const c = cell.getBoundingClientRect()
  const rtl = getComputedStyle(el).direction === 'rtl'
  return {
    // Clear of the row lines above and below, which are the same hairline.
    clip: { x: Math.round(rtl ? c.left : c.right) - 2, y: Math.ceil(c.top) + 2, width: 4, height: Math.floor(c.height) - 4 },
    columns: [...el.querySelectorAll('thead th')].map((th) => [th.getBoundingClientRect().left, th.getBoundingClientRect().width]),
    table: el.scrollWidth,
  }
})

const SETTINGS = [
  { name: 'light', mode: 'light', use: {} },
  { name: 'dark', mode: 'dark', use: {} },
  { name: 'ocean', mode: 'ocean', use: {} },
  { name: 'forced colours on the light palette', mode: 'light', use: { forcedColors: 'active', colorScheme: 'light' } },
  { name: 'forced colours on the dark palette', mode: 'light', use: { forcedColors: 'active', colorScheme: 'dark' } },
] as const

for (const setting of SETTINGS) {
  test.describe(`the edge of the stuck column, ${setting.name}`, () => {
    test.use(setting.use)

    for (const direction of DIRECTIONS) {
      test(`${direction}: a line down its inline end, which takes no room from any column`, async ({ page }) => {
        // The stuck column of this demo is narrower than its cap, so a line that took room would show in its width.
        await page.goto(urlFor('table--row-actions', setting.mode, direction))
        const box = page.locator('[data-sticky-first-column]').first()
        // Scrolled, as it is when text runs up to the column: "ORD-5515 nternational" with no edge between.
        await box.evaluate((el) => { el.scrollLeft += getComputedStyle(el).direction === 'rtl' ? -60 : 60 })

        const drawn = await edgeOf(box)
        const withEdge = await page.screenshot({ clip: drawn.clip })
        await page.addStyleTag({ content: NO_EDGE })
        const bare = await edgeOf(box)
        const without = await page.screenshot({ clip: bare.clip })

        // One pixel wide and as tall as the clip: none of it was there before, in any mode.
        const line = await changedPixels(page, withEdge, without)
        expect(line, 'no line is painted').toBeGreaterThanOrEqual(drawn.clip.height)
        expect(line, 'more than a hairline').toBeLessThanOrEqual(2 * drawn.clip.height)
        // A border on the cell made the column 96.5 px for 95.5 and pushed five columns along by one.
        expect(bare.columns).toEqual(drawn.columns)
        expect(bare.table).toBe(drawn.table)
        expect(drawn.columns).toHaveLength(6)
      })
    }
  })
}
