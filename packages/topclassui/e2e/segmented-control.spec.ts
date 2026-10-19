import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, rgbOf } from './pixels.js'

// What happy-dom cannot lay out or press: the heights of the track and its segments, the selected segment told by more
// than a fill, forced colours, the ring inside a track that clips, a track that scrolls inside itself, the screens, the
// tab stop before hydration, the arrows in a real browser, and the form, before hydration and after a reset.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['basic', 'form', 'full-width', 'long-content', 'many', 'rtl', 'sizes', 'states', 'track-states', 'with-icons'].map((demo) => `segmented-control--${demo}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const
const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const

const segmentIn = (page: Page, name: string) => page.getByRole('radio', { name, exact: true })
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
const focusedText = (page: Page) => page.evaluate(() => (document.activeElement?.getAttribute('role') === 'radio' ? document.activeElement.textContent : document.activeElement?.tagName ?? ''))
const selectedIn = (track: Locator) => track.locator('[role="radio"][aria-checked="true"]').evaluateAll((all) => all.map((el) => el.textContent))

/** The height of a track and of its first segment, and the width of that segment, rounded to a tenth. */
const shape = (track: Locator) => track.evaluate((el) => {
  const round = (px: number) => Math.round(px * 10) / 10
  const segment = el.querySelector('[role="radio"]')?.getBoundingClientRect() ?? new DOMRect()
  return { track: round(el.getBoundingClientRect().height), segment: [round(segment.width), round(segment.height)] }
})

/** Every ancestor that clips and cuts into a box: the ring of a segment is drawn inside it, so its box is the ring. */
const cutBy = (target: Locator) => target.evaluate((el) => {
  const r = el.getBoundingClientRect()
  const cut: string[] = []
  for (let up = el.parentElement; up; up = up.parentElement) {
    const style = getComputedStyle(up)
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
    const clip = up.getBoundingClientRect()
    const [left, right] = [clip.left + up.clientLeft, clip.left + up.clientLeft + up.clientWidth]
    if (r.left < left - 0.01 || r.right > right + 0.01 || r.top < clip.top || r.bottom > clip.bottom) cut.push(up.getAttribute('role') ?? up.tagName)
  }
  return cut
})

/** The colour a value resolves to on this page: a token, or a system colour painted as it is. */
const resolve = (page: Page, value: string) => page.evaluate((colour) => {
  const probe = document.createElement('span')
  probe.style.setProperty('forced-color-adjust', 'none')
  probe.style.backgroundColor = colour
  document.body.appendChild(probe)
  return getComputedStyle(probe).backgroundColor
}, value)

/** A computed colour as sRGB numbers, painted on a canvas: the tokens compute to oklch, which rgbOf cannot read. */
const srgb = (page: Page, computed: string) => page.evaluate((colour): [number, number, number] => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const pen = canvas.getContext('2d')
  if (!pen) throw new Error('no canvas')
  pen.fillStyle = colour
  pen.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = pen.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}, computed)

test.describe('the five sizes, on the static page', () => {
  const FINE = {
    xs: { track: 32, segment: [78.8, 24] }, sm: { track: 32, segment: [51.3, 24] }, md: { track: 36, segment: [68.3, 28] },
    lg: { track: 48, segment: [75.3, 40] }, xl: { track: 56, segment: [122.1, 48] },
  }
  const shapes = async (page: Page) => {
    const out: Record<string, Awaited<ReturnType<typeof shape>>> = {}
    for (const size of SIZES) out[size] = await shape(page.getByRole('radiogroup', { name: NAMES[size], exact: true }))
    return out
  }

  for (const direction of DIRECTIONS) {
    test(`fine pointer, ${direction}: a track of the control scale, a segment never under 24 px (the xs track is 32)`, async ({ page }) => {
      await page.goto(urlFor('segmented-control--sizes', 'light', direction))
      expect(await shapes(page)).toEqual(FINE)
      const off = page.getByRole('radiogroup', { name: 'Extra small' }).getByRole('radio', { name: 'Off' })
      expect((await boxOf(off)).width).toBeGreaterThanOrEqual(24)
    })
  }

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('every segment is 44 px tall and wide at least, and the track grows to hold it', async ({ page }) => {
      await page.goto(urlFor('segmented-control--sizes', 'light', 'ltr'))
      expect(await shapes(page)).toEqual({
        xs: { track: 52, segment: [78.8, 44] }, sm: { track: 52, segment: [51.3, 44] }, md: { track: 52, segment: [68.3, 44] },
        lg: { track: 52, segment: [75.3, 44] }, xl: { track: 56, segment: [122.1, 48] },
      })
      const widths = await page.locator('#demo [role="radio"]').evaluateAll((all) => all.map((el) => el.getBoundingClientRect().width))
      expect(Math.min(...widths)).toBeGreaterThanOrEqual(44)
    })
  })

  test('the type step and the padding of each size', async ({ page }) => {
    await page.goto(urlFor('segmented-control--sizes', 'light', 'ltr'))
    const steps: string[] = []
    for (const size of SIZES) {
      const segment = segmentIn(page, NAMES[size])
      steps.push(`${size} ${await css(segment, 'font-size')} ${await css(segment, 'padding-inline-start')}`)
    }
    expect(steps).toEqual(['xs 12px 8px', 'sm 12px 10px', 'md 12px 11px', 'lg 16px 16px', 'xl 16px 20px'])
  })
})

test.describe('the server HTML, before any script runs', () => {
  test('segmented-control--form sends view=table, and the target spec measures the segments and the button, not the inputs', async ({ page }) => {
    await page.goto(urlFor('segmented-control--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['view', 'table']])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.getAttribute('role') ?? el.tagName)))
      .toEqual(['radio', 'radio', 'radio', 'BUTTON'])
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab enters the track on its selected segment, the one tab stop, and the next Tab leaves it`, async ({ page }) => {
      await page.goto(urlFor('segmented-control--form', 'light', direction))
      await page.keyboard.press('Tab')
      expect(await focusedText(page)).toBe('Table')
      await page.keyboard.press('Tab')
      expect(await focusedText(page)).toBe('BUTTON')
      await page.keyboard.press('Shift+Tab')
      expect(await focusedText(page)).toBe('Table')
    })
  }

  test('states: the disabled track has no tab stop, and every other track has one, on its selected segment', async ({ page }) => {
    await page.goto(urlFor('segmented-control--track-states', 'light', 'ltr'))
    const stops: string[] = []
    for (let press = 0; press < 4; press += 1) {
      await page.keyboard.press('Tab')
      stops.push(await focusedText(page))
    }
    expect(stops).toEqual(['Invalid, selected', 'Live, selected', 'Read-only, selected', 'BODY'])
  })
})

test.describe('the states, on the static page', () => {
  test('selected is raised and shadowed, and also heavier and darker, so a fill is not the only cue', async ({ page }) => {
    await page.goto(urlFor('segmented-control--basic', 'light', 'ltr'))
    const [on, off] = [segmentIn(page, 'Board'), segmentIn(page, 'Table')]
    expect([await css(on, 'font-weight'), await css(off, 'font-weight')]).toEqual(['500', '400'])
    expect(await css(on, 'background-color')).toBe(await resolve(page, 'var(--tc-surface-raised)'))
    expect(await css(off, 'background-color')).toBe('rgba(0, 0, 0, 0)')
    expect(await css(on, 'color')).toBe(await resolve(page, 'var(--tc-body)'))
    expect(await css(off, 'color')).toBe(await resolve(page, 'var(--tc-muted)'))
    expect(await css(on, 'box-shadow')).not.toBe('none')
    expect(await css(off, 'box-shadow')).toBe('none')
  })

  for (const mode of ['light', 'dark', 'ocean'] as const) {
    test(`${mode}: the text of every segment reaches 4.5:1 on what is behind it`, async ({ page }) => {
      await page.goto(urlFor('segmented-control--basic', mode, 'ltr'))
      const colour = async (element: Locator, property: string) => srgb(page, await css(element, property))
      const [on, off] = [segmentIn(page, 'Board'), segmentIn(page, 'Table')]
      const track = await colour(page.getByRole('radiogroup'), 'background-color')
      expect(contrast(await colour(on, 'color'), await colour(on, 'background-color'))).toBeGreaterThanOrEqual(4.5)
      expect(contrast(await colour(off, 'color'), track)).toBeGreaterThanOrEqual(4.5)
    })
  }

  test('invalid: the line of the track turns to danger and is 2 px thick; a live track keeps its hairline', async ({ page }) => {
    await page.goto(urlFor('segmented-control--track-states', 'light', 'ltr'))
    const danger = await resolve(page, 'var(--tc-danger-solid)')
    const invalid = page.getByRole('radiogroup', { name: 'Invalid' })
    expect(await css(invalid, 'border-top-color')).toBe(danger)
    expect(await css(invalid, 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    expect(await css(page.getByRole('radiogroup', { name: 'Read-only' }), 'box-shadow')).toBe('none')
  })

  test('disabled: a segment dims to half, every one of a disabled track too, and a live one beside it does not', async ({ page }) => {
    await page.goto(urlFor('segmented-control--track-states', 'light', 'ltr'))
    for (const name of ['Disabled', 'Disabled, selected', 'One disabled']) expect(await css(segmentIn(page, name), 'opacity'), name).toBe('0.5')
    expect(await css(segmentIn(page, 'Live'), 'opacity')).toBe('1')
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    test('the selected segment takes the system highlight, the others the page, and the track keeps its line', async ({ page }) => {
      await page.goto(urlFor('segmented-control--track-states', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const canvas = FORCED_CANVAS[scheme]
      const highlight = rgbOf(await resolve(page, 'Highlight'))
      for (const name of ['Invalid, selected', 'Live, selected', 'Read-only, selected']) {
        expect(rgbOf(await css(segmentIn(page, name), 'background-color')), name).toEqual(highlight)
        expect(contrast(rgbOf(await css(segmentIn(page, name), 'color')), highlight), name).toBeGreaterThanOrEqual(4.5)
      }
      // A fill left to the browser is the canvas colour at no opacity: nothing is painted.
      for (const name of ['Invalid', 'Live', 'Read-only']) expect(await css(segmentIn(page, name), 'background-color'), name).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/)
      expect(contrast(highlight, canvas)).toBeGreaterThanOrEqual(3)
      expect(contrast(rgbOf(await css(page.getByRole('radiogroup', { name: 'Read-only' }), 'border-top-color')), canvas)).toBeGreaterThanOrEqual(3)
    })

    // SEGMENTED-1: painted on a canvas and read back, so the test measures the colour and not its spelling.
    test('a disabled selected segment takes GrayText and Canvas, apart from a live selected one', async ({ page }) => {
      await page.goto(urlFor('segmented-control--track-states', 'light', 'ltr'))
      const painted = (colour: string) => page.evaluate((value) => {
        const pen = document.createElement('canvas').getContext('2d')
        if (!pen) throw new Error('no canvas')
        pen.fillStyle = value
        pen.fillRect(0, 0, 1, 1)
        return [...pen.getImageData(0, 0, 1, 1).data].slice(0, 3).join()
      }, colour)
      const disabled = segmentIn(page, 'Disabled, selected')
      expect([await painted(await css(disabled, 'background-color')), await painted(await css(disabled, 'color'))])
        .toEqual([await painted(await resolve(page, 'GrayText')), await painted(await resolve(page, 'Canvas'))])
      expect(await painted(await css(disabled, 'background-color'))).not.toBe(await painted(await resolve(page, 'Highlight')))
    })

    test('invalid thickens the line to 2 px; disabled dims; no segment has an outline at rest', async ({ page }) => {
      await page.goto(urlFor('segmented-control--track-states', 'light', 'ltr'))
      expect(await css(page.getByRole('radiogroup', { name: 'Invalid' }), 'border-top-width')).toBe('2px')
      expect(await css(page.getByRole('radiogroup', { name: 'Read-only' }), 'border-top-width')).toBe('1px')
      for (const name of ['Disabled', 'Disabled, selected', 'One disabled']) expect(await css(segmentIn(page, name), 'opacity'), name).toBe('0.5')
      const outlines = await page.locator('#demo [role="radio"]').evaluateAll((all) => all.map((el) => getComputedStyle(el).outlineStyle))
      expect(new Set(outlines)).toEqual(new Set(['none']))
    })

    test('the ring of a focused selected segment is drawn in HighlightText, so it shows on the highlight', async ({ page }) => {
      await page.goto(urlFor('segmented-control--basic', 'light', 'ltr'))
      await page.keyboard.press('Tab')
      const board = segmentIn(page, 'Board')
      await expect(board).toBeFocused()
      expect(await css(board, 'outline-style')).toBe('solid')
      expect(rgbOf(await css(board, 'outline-color'))).toEqual(rgbOf(await resolve(page, 'HighlightText')))
    })
  })
}

test.describe('motion', () => {
  test('a segment fades its colours in 150 ms, and the track holds no indicator that slides', async ({ page }) => {
    await page.goto(urlFor('segmented-control--basic', 'light', 'ltr'))
    const segment = segmentIn(page, 'Table')
    expect([await css(segment, 'transition-duration'), await css(segment, 'transition-property')])
      .toEqual(['0.15s', 'color, background-color, border-color, outline-color, opacity, translate'])
    expect(await page.getByRole('radiogroup').evaluate((el) => [...el.children].map((child) => child.tagName))).toEqual(['BUTTON', 'INPUT', 'BUTTON', 'INPUT', 'BUTTON', 'INPUT'])
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('nothing fades: the segment is raised the moment it is pressed', async ({ page }) => {
      await openLive(page, 'segmented-control--basic')
      const segment = segmentIn(page, 'Table')
      expect(await css(segment, 'transition-duration')).toBe('0s')
      await segment.click()
      expect(await css(segment, 'background-color')).toBe(await resolve(page, 'var(--tc-surface-raised)'))
    })
  })
})

for (const direction of DIRECTIONS) {
  test.describe(`screens, ${direction}`, () => {
    for (const screen of SCREENS) {
      test(`${String(screen.width)} x ${String(screen.height)}: no demo scrolls the page sideways, and every track stays inside it`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of DEMOS) {
          await page.goto(urlFor(demo, 'light', direction))
          await expectNoSidewaysScroll(page)
          const outside = await page.locator('#demo [role="radiogroup"]').evaluateAll((all) => all.filter((el) => {
            const r = el.getBoundingClientRect()
            return r.left < 0 || r.right > document.body.clientWidth
          }).length)
          expect(outside, demo).toBe(0)
        }
      })
    }
  })
}

test.describe('text', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: at a root of 32 px the track and its segments double, the track scrolls inside itself, and the page does not`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor('segmented-control--basic', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      const track = page.getByRole('radiogroup')
      expect(await shape(track)).toEqual({ track: 72, segment: [111.8, 58] })
      expect(await track.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: the segments keep their height, nothing overlaps, and a long label still ends in an ellipsis', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('segmented-control--long-content', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    const segments = await page.locator('#demo [role="radio"]').all()
    let before = Number.NEGATIVE_INFINITY
    for (const segment of segments) {
      const box = await boxOf(segment)
      expect(box.height).toBe(28)
      expect(box.left, 'a segment overlaps the one before').toBeGreaterThanOrEqual(before)
      before = box.right
    }
    const label = segmentIn(page, 'Recently opened by anyone in this workspace').locator('span')
    expect([await css(label, 'text-overflow'), await label.evaluate((el) => el.scrollWidth > el.clientWidth)]).toEqual(['ellipsis', true])
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: the keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('ltr: Tab enters on the selected segment; the arrows move, select and wrap; Space selects; Tab leaves', async ({ page }) => {
    await openLive(page, 'segmented-control--basic')
    const track = page.getByRole('radiogroup')
    await page.keyboard.press('Tab')
    expect(await focusedText(page)).toBe('Board')
    const steps: string[] = []
    for (const key of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']) {
      await page.keyboard.press(key)
      steps.push(`${key}: ${await focusedText(page)} ${(await selectedIn(track)).join()}`)
    }
    expect(steps).toEqual([
      'ArrowRight: Table Table', 'ArrowRight: Calendar Calendar', 'ArrowRight: Board Board',
      'ArrowLeft: Calendar Calendar', 'ArrowDown: Board Board', 'ArrowUp: Calendar Calendar',
    ])
    await page.keyboard.press('Enter')
    await page.keyboard.press('Home')
    expect([await focusedText(page), await selectedIn(track)]).toEqual(['Calendar', ['Calendar']])
    await page.keyboard.press('Tab')
    expect(await focusedText(page)).not.toMatch(/Board|Table|Calendar/)
    await page.keyboard.press('Shift+Tab')
    expect(await focusedText(page)).toBe('Calendar')
  })

  test('rtl, under the provider: the first segment is at the right; ArrowRight goes to the one before, ArrowLeft to the one after', async ({ page }) => {
    await openLive(page, 'segmented-control--rtl', { direction: 'rtl' })
    const track = page.getByRole('radiogroup')
    const [first, second] = [await boxOf(segmentIn(page, 'لوحة')), await boxOf(segmentIn(page, 'جدول'))]
    expect(first.left).toBeGreaterThan(second.left)
    await page.keyboard.press('Tab')
    expect(await focusedText(page)).toBe('جدول')
    await page.keyboard.press('ArrowRight')
    expect([await focusedText(page), await selectedIn(track)]).toEqual(['لوحة', ['لوحة']])
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    expect([await focusedText(page), await selectedIn(track)]).toEqual(['تقويم', ['تقويم']])
    await page.keyboard.press('ArrowLeft')
    expect(await focusedText(page)).toBe('لوحة')
  })

  test('a disabled segment is skipped by the arrows, and a disabled track is skipped by Tab', async ({ page }) => {
    await openLive(page, 'segmented-control--track-states')
    const track = page.getByRole('radiogroup', { name: 'One disabled' })
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(await focusedText(page)).toBe('Live, selected')
    await page.keyboard.press('ArrowRight')
    expect([await focusedText(page), await selectedIn(track)]).toEqual(['Live', ['Live']])
    await page.keyboard.press('ArrowLeft')
    expect(await focusedText(page)).toBe('Live, selected')
  })

  for (const direction of DIRECTIONS) {
    test.describe(`320 px, coarse, ${direction}`, () => {
      test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

      test('many: each segment the arrows reach is brought whole into the track, ring and all, and the wrap brings back the first', async ({ page }) => {
        await openLive(page, 'segmented-control--many', { direction })
        await page.keyboard.press('Tab')
        const forward = direction === 'ltr' ? 'ArrowRight' : 'ArrowLeft'
        const cut: string[] = []
        for (let step = 0; step < 7; step += 1) {
          const focused = page.locator(':focus')
          expect(await css(focused, 'outline-style')).toBe('solid')
          const name = await focusedText(page)
          cut.push(...(await cutBy(focused)).map((by) => `${name}: ${by}`))
          await page.keyboard.press(forward)
        }
        expect(await focusedText(page)).toBe('Overview')
        expect(cut).toEqual([])
        await expectNoSidewaysScroll(page)
      })
    })
  }
})

test.describe('live: pressing it', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('a click selects a segment once, a click on the selected one calls nothing, and the track is never emptied', async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/segmented-control-reset.tsx' })
    await expect(page.locator('#segmented-control-reset')).toHaveAttribute('data-ready', '')
    await segmentIn(page, 'Counted B').click()
    await expect(page.locator('#calls')).toHaveText('b')
    await page.getByText('Counted C').click()
    await expect(page.locator('#calls')).toHaveText('b,c')
    await segmentIn(page, 'Counted C').click()
    await expect(page.locator('#calls')).toHaveText('b,c')
    expect(await selectedIn(page.getByRole('radiogroup', { name: 'Counted' }))).toEqual(['Counted C'])
  })

  test('an rtl island on an ltr page: the first segment is at the right', async ({ page }) => {
    await openLive(page, 'segmented-control--rtl', { direction: 'ltr' })
    expect((await boxOf(segmentIn(page, 'لوحة'))).left).toBeGreaterThan((await boxOf(segmentIn(page, 'تقويم'))).left)
  })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring is 2 px inside the focused segment, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'segmented-control--with-icons')
        await page.keyboard.press('Tab')
        const segment = segmentIn(page, 'Light')
        await expect(segment).toBeFocused()
        expect([await css(segment, 'outline-style'), await css(segment, 'outline-width'), await css(segment, 'outline-offset')]).toEqual(['solid', '2px', '-2px'])
        expect(await cutBy(segment)).toEqual([])
      })
    })
  }
})

test.describe('live: a form reset', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/segmented-control-reset.tsx' })
    await expect(page.locator('#segmented-control-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.segmentedSent?.[name] ?? [], form)
  const selected = (page: Page, name: string) => selectedIn(page.getByRole('radiogroup', { name }))
  // RG-2: the APG tab stop is the selected segment, and Base UI picks it only on mount.
  const stops = (page: Page, names: string[]) => Promise.all(names.map((name) => page.getByRole('radiogroup', { name })
    .locator('[role="radio"][tabindex="0"]').evaluateAll((all) => all.map((el) => el.textContent))))

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each track is back at its default on screen and in the form; a controlled one keeps its owner's value`, async ({ page }) => {
      for (const name of ['Plan B', 'Owned B', 'Far B']) await segmentIn(page, name).click()
      expect(await serverEntries(page, '#plain')).toEqual([['plan', 'b'], ['owned', 'b'], ['far', 'b']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect.poll(() => selected(page, 'Plan')).toEqual(['Plan A'])
      expect([await selected(page, 'Owned'), await selected(page, 'Far')]).toEqual([['Owned B'], ['Far A']])
      await expect(page.locator('#owner')).toHaveText('b')
      expect(await serverEntries(page, '#plain')).toEqual([['plan', 'a'], ['owned', 'b'], ['far', 'a']])
      expect(await stops(page, ['Plan', 'Owned'])).toEqual([['Plan A'], ['Owned B']])
    })
  }

  test('after a React 19 form action settles, the track is back at its default on screen and in the form', async ({ page }) => {
    await segmentIn(page, 'Pick B').click()
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['pick', 'b']]])
    await expect.poll(() => selected(page, 'Pick')).toEqual(['Pick A'])
    expect(await serverEntries(page, '#action')).toEqual([['pick', 'a']])
    expect(await stops(page, ['Pick'])).toEqual([['Pick A']])
  })

  test('with the action\'s answer as the new default, the choice stays, on screen and in the form, and is sent again', async ({ page }) => {
    await segmentIn(page, 'Again B').click()
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    // The reset lands after the timeout of the hook: wait for a frame past it before reading the track.
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    expect(await selected(page, 'Again')).toEqual(['Again B'])
    expect(await serverEntries(page, '#echo')).toEqual([['again', 'b']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['again', 'b']], [['again', 'b']]])
  })
})

test.describe('live: where a page puts a segmented control', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/segmented-control-layouts.tsx' })
    await expect(page.locator('#layouts [role="radio"]').first()).toBeVisible()
  }
  /** Each case: the width of its three-segment track, whether its seven-segment track scrolls inside itself, and
   * whether either track reaches past the case. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((holder) => {
    const edge = holder.getBoundingClientRect()
    const [three, seven] = [...holder.querySelectorAll('[role="radiogroup"]')]
    const outside = [three, seven].some((track) => {
      const r = track?.getBoundingClientRect() ?? new DOMRect()
      return r.left < edge.left - 0.5 || r.right > edge.right + 0.5
    })
    return [holder.getAttribute('data-case'), Math.round((three?.getBoundingClientRect().width ?? 0) * 10) / 10, (seven?.scrollWidth ?? 0) > (seven?.clientWidth ?? 0), outside]
  }))
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: three segments are 193.9 px in every parent; seven fit except in a half-width track column`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, { direction })
      expect(await cases(page)).toEqual([
        ['block', 193.9, false, false], ['grid', 193.9, false, false], ['track', 193.9, true, false],
        ['flex-col', 193.9, false, false], ['label-row', 193.9, false, false], ['flex-1', 193.9, false, false],
        ['w-fit', 193.9, false, false], ['cell', 193.9, false, false], ['full', 1233, false, false],
      ])
      await expectNoSidewaysScroll(page)
    })
  }

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: seven segments scroll inside the track in every parent, and the page does not scroll sideways`, async ({ page }) => {
        await fixture(page, { direction })
        expect(await cases(page)).toEqual([
          ['block', 193.9, true, false], ['grid', 193.9, true, false], ['track', 140, true, false],
          ['flex-col', 193.9, true, false], ['label-row', 193.9, true, false], ['flex-1', 193.9, true, false],
          ['w-fit', 193.9, true, false], ['cell', 193.9, true, false], ['full', 288, true, false],
        ])
        const full = await page.locator('[data-case="full"] [data-track="three"] [role="radio"]').evaluateAll((all) => all.map((el) => Math.round(el.getBoundingClientRect().width * 10) / 10))
        expect(full).toEqual([92, 92, 92])
        await expectNoSidewaysScroll(page)
      })
    }
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: axe finds nothing on the hydrated fixture`, async ({ page }) => {
      await fixture(page, { direction })
      const results = await new AxeBuilder({ page }).include('#layouts').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }
})

test.describe('live: hostile content', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/segmented-control-hostile.tsx' })
    await expect(page.locator('#hostile [role="radio"]').first()).toBeVisible()
  }
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: the long word ends in an ellipsis inside the page, ten and sixty segments scroll inside their track, every target is 44 px`, async ({ page }) => {
        await fixture(page, { direction })
        await expectNoSidewaysScroll(page)
        const word = page.locator('#hostile [role="radio"] span').first()
        expect(await word.textContent()).toHaveLength(100)
        expect([await css(word, 'text-overflow'), await word.evaluate((el) => el.scrollWidth > el.clientWidth)]).toEqual(['ellipsis', true])
        const box = await boxOf(word)
        expect(box.left).toBeGreaterThanOrEqual(0)
        expect(box.right).toBeLessThanOrEqual(320)
        // SEGMENTED-2: an element for a label ends in an ellipsis too, and stays inside its segment in both directions.
        const element = page.locator('#hostile [role="radio"] > strong')
        expect([await css(element, 'text-overflow'), await element.evaluate((el) => el.scrollWidth > el.clientWidth)]).toEqual(['ellipsis', true])
        const [inner, outer] = [await boxOf(element), await boxOf(element.locator('..'))]
        expect([inner.left >= outer.left, inner.right <= outer.right]).toEqual([true, true])
        for (const name of ['Ten', 'Sixty']) {
          expect(await page.getByRole('radiogroup', { name }).evaluate((el) => el.scrollWidth > el.clientWidth), name).toBe(true)
        }
        const small = await page.locator('#hostile [role="radio"]').evaluateAll((all) => all.filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width < 44 || r.height < 44
        }).length)
        expect(small).toBe(0)
        expect(await page.locator('#hostile [role="radio"]').count()).toBe(77)
      })
    }
  })

  test('the empty value is a value: it is selected by default, sent as name=, and the arrows reach it', async ({ page }) => {
    await fixture(page)
    expect(await serverEntries(page, '#hostile')).toEqual([['word', 'long'], ['empty', ''], ['element', 'a'], ['ten', '1'], ['sixty', '1']])
    await segmentIn(page, 'None').focus()
    await page.keyboard.press('ArrowRight')
    expect((await serverEntries(page, '#hostile'))[1]).toEqual(['empty', 'some'])
    await page.keyboard.press('ArrowLeft')
    expect((await serverEntries(page, '#hostile'))[1]).toEqual(['empty', ''])
  })

  test('sixty segments: the last is reached by one ArrowLeft from the first, and brought whole into the track', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 })
    await fixture(page)
    await segmentIn(page, 'Option 1').focus()
    await page.keyboard.press('ArrowLeft')
    const last = segmentIn(page, 'Option 60')
    await expect(last).toBeFocused()
    await expect(last).toHaveAttribute('aria-checked', 'true')
    expect(await cutBy(last)).toEqual([])
  })
})

test.describe('axe on the hydrated demos', () => {
  for (const demo of DEMOS) {
    for (const direction of DIRECTIONS) {
      test(`${demo} ${direction}: no violation once Base UI has run`, async ({ page }) => {
        await openLive(page, demo, { direction })
        const results = await new AxeBuilder({ page }).include('#demo').analyze()
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
      })
    }
  }
})
