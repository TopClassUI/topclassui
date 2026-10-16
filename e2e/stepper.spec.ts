import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { expectNoSidewaysScroll, liveErrors, openLive, type LiveOptions } from './live.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, pixelsOf, type Rgb } from './pixels.js'

// The connector is the one thing a Stepper can get wrong: it must run from one circle's centre to the
// next, level with both, at every size, width and direction. Everything else is server HTML.

interface Step { mark: DOMRect; title: DOMRect; item: DOMRect; connector: DOMRect | null }
interface Geometry { direction: string; list: DOMRect; steps: Step[] }

/** Every box of one list, and the direction it is laid out in, read in the page. */
const geometryOf = (list: Locator): Promise<Geometry> => list.evaluate((ol) => ({
  direction: getComputedStyle(ol).direction,
  list: ol.getBoundingClientRect().toJSON() as DOMRect,
  steps: [...ol.children].map((li) => ({
    item: li.getBoundingClientRect().toJSON() as DOMRect,
    mark: li.querySelector('.rounded-full')?.getBoundingClientRect().toJSON() as DOMRect,
    title: li.querySelector('[dir="auto"]')?.getBoundingClientRect().toJSON() as DOMRect,
    connector: (li.querySelector('.absolute')?.getBoundingClientRect().toJSON() ?? null) as DOMRect | null,
  })),
}))

const centreX = (box: DOMRect) => box.x + box.width / 2
const centreY = (box: DOMRect) => box.y + box.height / 2

/** The worst distance, in px, between a connector's ends and the centres it should join, and its height off theirs. */
function offsets({ steps, direction }: Geometry) {
  let worst = 0
  steps.forEach((step, index) => {
    const next = steps[index + 1]
    if (!next) {
      expect(step.connector, 'the last step has no connector').toBeNull()
      return
    }
    const line = step.connector
    if (!line) throw new Error(`step ${String(index)} lost its connector`)
    const [start, end] = direction === 'rtl' ? [line.x + line.width, line.x] : [line.x, line.x + line.width]
    worst = Math.max(worst,
      Math.abs(start - centreX(step.mark)), Math.abs(end - centreX(next.mark)),
      Math.abs(centreY(line) - centreY(step.mark)), Math.abs(centreY(line) - centreY(next.mark)))
  })
  return worst
}

/** Each circle inside the list and clear of the next: what holds while the steps fit their width. */
function expectClearCircles({ steps, list }: Geometry, label: string) {
  steps.forEach((step, index) => {
    expect(step.mark.x, `${label}: circle ${String(index)} leaves the list`).toBeGreaterThanOrEqual(list.x - 0.5)
    expect(step.mark.x + step.mark.width, `${label}: circle ${String(index)} leaves the list`).toBeLessThanOrEqual(list.x + list.width + 0.5)
    const next = steps[index + 1]?.mark
    if (next) expect(Math.abs(centreX(next) - centreX(step.mark)), `${label}: circles ${String(index)} and ${String(index + 1)} overlap`).toBeGreaterThanOrEqual((step.mark.width + next.width) / 2)
  })
}

const WIDTHS = [[320, 480], [390, 844], [1280, 800], [844, 390]] as const
const DEMOS = ['stepper--basic', 'stepper--sizes', 'stepper--statuses', 'stepper--long-content', 'stepper--arabic-digits', 'stepper--custom-size'] as const

for (const direction of DIRECTIONS) {
  for (const [width, height] of WIDTHS) {
    test(`${direction} at ${String(width)} x ${String(height)}: every connector joins two centres within 1 px, and nothing scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      for (const demo of DEMOS) {
        await page.goto(urlFor(demo, 'light', direction))
        const lists = await page.locator('#demo ol').all()
        expect(lists.length, demo).toBeGreaterThan(0)
        for (const list of lists) {
          const geometry = await geometryOf(list)
          // The arabic-digits demo is right to left on either page.
          expect(geometry.direction, demo).toBe(demo === 'stepper--arabic-digits' ? 'rtl' : direction)
          expect(offsets(geometry), demo).toBeLessThanOrEqual(1)
          expectClearCircles(geometry, demo)
          // The first step sits at the inline start: the left in LTR, the right in RTL.
          const [first, last] = [geometry.steps[0]?.item, geometry.steps.at(-1)?.item]
          if (!first || !last) throw new Error('a list has no steps')
          expect(geometry.direction === 'rtl' ? first.x > last.x : first.x < last.x, demo).toBe(true)
        }
        await expectNoSidewaysScroll(page)
      }
    })
  }

  test(`${direction}: long-content wraps each title inside its own column at 320 px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('stepper--long-content', 'light', direction))
    const { steps, list } = await geometryOf(page.locator('#demo ol'))
    expect(steps).toHaveLength(6)
    for (const step of steps) {
      expect(step.title.x).toBeGreaterThanOrEqual(step.item.x - 0.5)
      expect(step.title.x + step.title.width).toBeLessThanOrEqual(step.item.x + step.item.width + 0.5)
      // Forty characters in a column a sixth of the page: several lines, never cut.
      expect(step.title.height).toBeGreaterThan(60)
    }
    const widths = steps.map((step) => Math.round(step.item.width * 10) / 10)
    expect(new Set(widths).size, 'six equal columns').toBe(1)
    expect(steps.reduce((sum, step) => sum + step.item.width, 0)).toBeCloseTo(list.width, 0)
    await expectNoSidewaysScroll(page)
  })
}

test('the five sizes draw circles of 24, 28, 32, 40 and 48 px', async ({ page }) => {
  await page.goto(urlFor('stepper--sizes', 'light', 'ltr'))
  const sizes = await page.locator('#demo ol').evaluateAll((lists) => lists.map((ol) => {
    const box = ol.querySelector('.rounded-full')?.getBoundingClientRect()
    return [box?.width, box?.height]
  }))
  expect(sizes).toEqual([[24, 24], [28, 28], [32, 32], [40, 40], [48, 48]])
})

/** Pixels of a circle on its horizontal axis, at 70% of the radius each side, and at 70% above the centre. */
async function insideMark(page: Page, mark: Locator) {
  const box = await mark.boundingBox()
  if (!box) throw new Error('a circle has no box')
  const r = box.width / 2
  const at = async (x: number, y: number) => (await pixelsOf(page, { x: Math.round(x), y: Math.round(y), width: 1, height: 1 }))[0] as Rgb
  const [cx, cy] = [box.x + r, box.y + r]
  return { before: await at(cx - 0.7 * r, cy), after: await at(cx + 0.7 * r, cy), above: await at(cx, cy - 0.7 * r) }
}

for (const mode of MODES) {
  test(`${mode}: each circle covers the ends of the line behind it, at every size`, async ({ page }) => {
    await page.goto(urlFor('stepper--sizes', mode, 'ltr'))
    for (const mark of await page.locator('#demo .rounded-full').all()) {
      const { before, after, above } = await insideMark(page, mark)
      // On the line's height, inside the circle, the circle's own fill and not the line's colour.
      expect(before, 'the line shows through before the centre').toEqual(above)
      expect(after, 'the line shows through after the centre').toEqual(above)
    }
  })
}

for (const [palette, canvas] of Object.entries(FORCED_CANVAS)) {
  test(`forced colours, the ${palette} palette: done, current and todo are all visible and differ`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active', colorScheme: palette as 'light' | 'dark' })
    await page.goto(urlFor('stepper--basic', 'light', 'ltr'))
    const marks = await page.locator('#demo .rounded-full').all()
    const read = async (mark: Locator) => {
      const box = await mark.boundingBox()
      if (!box) throw new Error('a circle has no box')
      // The middle 60% of the circle, where the glyph is and no edge or corner is.
      const side = Math.round(box.width * 0.6)
      const x = Math.round(box.x + box.width / 2 - side / 2)
      const y = Math.round(box.y + box.height / 2 - side / 2)
      return { whole: await pixelsOf(page, box), glyph: await pixelsOf(page, { x, y, width: side, height: side }), inside: await insideMark(page, mark) }
    }
    const [done, current, todo] = [await read(marks[0] as Locator), await read(marks[1] as Locator), await read(marks[2] as Locator)]
    // A fill in the text colour for done and current, the canvas for todo.
    expect(contrast(done.inside.above, canvas), 'done is filled').toBeGreaterThanOrEqual(3)
    expect(contrast(current.inside.above, canvas), 'current is filled').toBeGreaterThanOrEqual(3)
    expect(contrast(todo.inside.above, canvas), 'todo is not').toBeLessThan(1.2)
    // A glyph that stands out from its fill, and a todo circle drawn by its line.
    expect(inkOn(done.glyph, done.inside.above), 'the tick').toBeGreaterThan(10)
    expect(inkOn(current.glyph, current.inside.above), 'the number').toBeGreaterThan(10)
    expect(inkOn(todo.glyph, canvas), 'the number on the canvas').toBeGreaterThan(10)
    expect(inkOn(todo.whole, canvas) - inkOn(todo.glyph, canvas), 'the line round it').toBeGreaterThan(40)
    expect(done.glyph, 'a tick is not a number').not.toEqual(current.glyph)
  })
}

for (const direction of DIRECTIONS) {
  test(`${direction}: custom takes the circle from --tc-stepper-mark, 32 px by default, and the tick and the x stay 55% of it`, async ({ page }) => {
    await page.goto(urlFor('stepper--custom-size', 'light', direction))
    for (const [index, side, icon] of [[0, 32, 17.6], [1, 56, 30.8]] as const) {
      const list = page.locator('#demo ol').nth(index)
      const geometry = await geometryOf(list)
      expect(geometry.steps.map(({ mark }) => [mark.width, mark.height]), `list ${String(index)}`).toEqual([[side, side], [side, side], [side, side], [side, side]])
      const icons = await list.locator('.rounded-full svg').evaluateAll((all) => all.map((svg) => Math.round(svg.getBoundingClientRect().width * 10) / 10))
      expect(icons, `list ${String(index)}: the tick and the x`).toEqual([icon, icon])
      expect(offsets(geometry)).toBeLessThanOrEqual(1)
      expectClearCircles(geometry, `list ${String(index)}`)
    }
  })
}

test('the steps are in the accessibility tree as a list, each with its word, and the circles are not', async ({ page }) => {
  await page.goto(urlFor('stepper--statuses', 'light', 'ltr'))
  await expect(page.locator('#demo')).toMatchAriaSnapshot(`
    - list "Publishing":
      - listitem: Upload Completed
      - listitem: Check Needs attention
      - listitem: Publish
      - listitem: Share Not started
  `)
  expect(await page.locator('#demo li[aria-current="step"] [dir="auto"]').allInnerTexts()).toEqual(['Publish'])
})

test('the Arabic labels say the status in Arabic, and ar-u-nu-arab writes Arabic-Indic numbers', async ({ page }) => {
  await page.goto(urlFor('stepper--arabic-digits', 'light', 'rtl'))
  const first = page.locator('#demo ol').first()
  await expect(first).toMatchAriaSnapshot(`
    - list:
      - listitem: السلة مكتمل
      - listitem: العنوان مكتمل
      - listitem: الدفع
      - listitem: التأكيد لم يبدأ
  `)
  expect(await first.locator('.rounded-full').allInnerTexts()).toEqual(['', '', '٣', '٤'])
  expect(await page.locator('#demo ol').nth(1).locator('.rounded-full').allInnerTexts()).toEqual(['', '', '3', '4'])
})

test('nothing takes the focus: Tab goes from before the stepper to the end of the page', async ({ page }) => {
  await page.goto(urlFor('stepper--basic', 'light', 'ltr'))
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.activeElement?.closest('#demo') ?? null)).toBeNull()
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`reduced motion ${reducedMotion}: nothing here moves, so there is nothing to reduce`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto(urlFor('stepper--statuses', 'light', 'ltr'))
    const moving = await page.locator('#demo *').evaluateAll((all) => all.filter((el) => {
      const style = getComputedStyle(el)
      return style.animationName !== 'none' || style.transitionDuration.split(',').some((d) => parseFloat(d) > 0)
    }).length)
    expect(moving).toBe(0)
  })
}

for (const direction of DIRECTIONS) {
  test(`${direction}: text zoom (root 32 px) and WCAG 1.4.12 spacing keep the geometry and the page`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    for (const demo of ['stepper--basic', 'stepper--long-content'] as const) {
      await page.goto(urlFor(demo, 'light', direction))
      await page.addStyleTag({ content: 'html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }' })
      const geometry = await geometryOf(page.locator('#demo ol'))
      expect(geometry.direction).toBe(direction)
      expect(offsets(geometry), demo).toBeLessThanOrEqual(1)
      expect(geometry.steps[0]?.mark.width, 'md is 2rem').toBe(64)
      await expectNoSidewaysScroll(page)
    }
  })
}

test.describe('live: where a page puts a stepper, and hostile content', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/stepper-layouts.tsx' })
    await expect(page.locator('#layouts [data-case="sixty"] li')).toHaveCount(60)
  }
  const MANY = new Set(['twelve', 'sixty'])
  const each = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((box) => box.getAttribute('data-case')))

  for (const direction of DIRECTIONS) {
    for (const [width, height] of WIDTHS) {
      test(`${direction} at ${String(width)} x ${String(height)}: every layout keeps the connectors on the centres, and the page does not scroll sideways`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await fixture(page, { direction })
        for (const name of await each(page)) {
          const list = page.locator(`#layouts [data-case="${String(name)}"] ol`)
          const geometry = await geometryOf(list)
          expect(geometry.direction, String(name)).toBe(direction)
          expect(offsets(geometry), String(name)).toBeLessThanOrEqual(1)
          // More steps than circles fit across: they overlap (see the test below), but stay on their centres.
          if (!MANY.has(String(name))) expectClearCircles(geometry, String(name))
          // Equal columns, each within the list: a long word wraps inside its own.
          for (const step of geometry.steps) {
            expect(step.item.x, String(name)).toBeGreaterThanOrEqual(geometry.list.x - 0.5)
            expect(step.item.x + step.item.width, String(name)).toBeLessThanOrEqual(geometry.list.x + geometry.list.width + 0.5)
            expect(step.title.x + step.title.width, String(name)).toBeLessThanOrEqual(step.item.x + step.item.width + 0.5)
          }
        }
        await expectNoSidewaysScroll(page)
      })
    }

    // The limit, measured: twelve md circles fit 1280 and 844 but not 390 or 320; sixty fit nowhere. Past it the
    // circles overlap, each still centred on its column, and spill half a circle less half a column past the list.
    const FITS = { 320: [false, false], 390: [false, false], 844: [true, false], 1280: [true, false] } as const
    test(`${direction}: more steps than circles fit across overlap but keep their centres and spill (32 - column) / 2 px`, async ({ page }) => {
      for (const [width, height] of WIDTHS) {
        await page.setViewportSize({ width, height })
        await fixture(page, { direction })
        const found = []
        for (const name of ['twelve', 'sixty']) {
          const { steps, list } = await geometryOf(page.locator(`#layouts [data-case="${name}"] ol`))
          const column = steps[0]?.item.width ?? 0
          const spill = Math.max(...steps.map(({ mark }) => Math.max(list.x - mark.x, mark.x + mark.width - list.x - list.width)))
          found.push(column >= 32)
          if (column < 32) expect(spill, `${name} at ${String(width)}`).toBeCloseTo((32 - column) / 2, 0)
        }
        expect(found, String(width)).toEqual(FITS[width])
        await expectNoSidewaysScroll(page)
      }
    })

    test(`${direction}: a step value names is current even with an error of its own, after hydration too`, async ({ page }) => {
      await fixture(page, { direction })
      const list = page.locator('#layouts [data-case="fixing"] ol')
      await expect(list).toMatchAriaSnapshot(`
        - list "Fixing a step":
          - listitem: Account Completed
          - listitem: Profile Needs attention
          - listitem: Team Not started
          - listitem: Done Not started
      `)
      expect(await list.locator('li[aria-current="step"] [dir="auto"]').allInnerTexts()).toEqual(['Profile'])
    })

    test(`${direction}: axe finds nothing in any layout or hostile case`, async ({ page }) => {
      await fixture(page, { direction })
      const results = await new AxeBuilder({ page }).include('#layouts').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }
})
