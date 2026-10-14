import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { expectNoSidewaysScroll, openLive } from './live.js'
import { urlFor } from './pages.js'
import { type Rgb, paintedIn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out or paint: which half of a half star is filled in each direction, what forced
// colours leave of a fill, the browser's own radio group under the keyboard, the pointer's fill, the size of a
// step, the ring on a label whose radio is invisible, and whether ten stars at xl fit a phone.

/** A small phone, a phone, a desktop and a phone on its side. */
const SCREENS = [
  { width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 },
] as const

const group = (page: Page, scope = '#demo') => page.locator(`${scope} [role="radiogroup"]`).first()

/** How much of each star is drawn, first to last: 1, 0.5 or 0, read from the width of its clip. */
const fills = (rating: Locator) => rating.evaluate((root) =>
  [...root.querySelectorAll(':scope > span, :scope > label > span')].map((star) => {
    const fill = star.querySelector(':scope > span')
    return fill ? Math.round((fill.getBoundingClientRect().width / star.getBoundingClientRect().width) * 2) / 2 : 0
  }))

/** Which radio has the keyboard and which is checked, counted from 1; 0 for none. */
const where = (page: Page) => page.evaluate(() => {
  const radios = [...document.querySelectorAll('#demo input[type="radio"]')]
  return { focus: radios.indexOf(document.activeElement as Element) + 1, checked: radios.findIndex((r) => (r as HTMLInputElement).checked) + 1 }
})

const formData = (page: Page) => page.evaluate(() => {
  const form = document.querySelector('#demo form')
  return form instanceof HTMLFormElement ? [...new FormData(form)].map(([key, value]) => `${key}=${value as string}`) : null
})

/** A computed colour as the screen paints it: Tailwind writes oklch, which a canvas turns into rgb. */
const paintedColour = (target: Locator, property: 'color' | 'outlineColor') => target.evaluate((element, name): Rgb => {
  const pen = document.createElement('canvas').getContext('2d')
  if (!pen) throw new Error('no canvas')
  pen.fillStyle = getComputedStyle(element)[name]
  pen.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = pen.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}, property)

async function openFixture(page: Page, direction: 'ltr' | 'rtl' = 'ltr'): Promise<void> {
  await openLive(page, 'separator--horizontal', { direction })
  await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/rating.tsx' })
  await expect(page.locator('#rating-fixture')).toHaveAttribute('data-ready', '')
}

/** The pixels of a star's two halves, the one at the left and the one at the right. */
async function halves(page: Page, star: Locator): Promise<{ left: Rgb[], right: Rgb[] }> {
  const box = await star.boundingBox()
  if (!box) throw new Error('the star has no box')
  const half = Math.floor(box.width / 2)
  return {
    left: await pixelsOf(page, { x: box.x, y: box.y, width: half, height: box.height }),
    right: await pixelsOf(page, { x: box.x + box.width - half, y: box.y, width: half, height: box.height }),
  }
}

test.describe('half a star is clipped from the inline start: its right half is filled in Arabic, with no second icon', () => {
  const CASES = [
    { name: 'read-only ltr', demo: 'rating--read-only', direction: 'ltr', rating: 3, filled: 'left' },
    { name: 'read-only rtl', demo: 'rating--read-only', direction: 'rtl', rating: 3, filled: 'right' },
    { name: 'the rtl island on an ltr page', demo: 'rating--rtl', direction: 'ltr', rating: 0, filled: 'right' },
  ] as const

  for (const { name, demo, direction, rating, filled } of CASES) {
    test(name, async ({ page }) => {
      await openLive(page, demo, { direction })
      const root = page.locator('#demo [role="img"]').nth(rating)
      expect(await fills(root)).toEqual([1, 1, 1, 0.5, 0])
      const half = root.locator(':scope > span').nth(3)
      expect(await half.locator('svg').count(), 'one outline and one filled icon').toBe(2)
      const colour = await paintedColour(half.locator(':scope > span'), 'color')
      const { left, right } = await halves(page, half)
      const painted = { left: paintedIn(left, colour), right: paintedIn(right, colour) }
      const other = filled === 'left' ? 'right' : 'left'
      expect(painted[filled], `the ${filled} half is filled`).toBeGreaterThanOrEqual(60)
      expect(painted[other], `the ${other} half is not`).toBeLessThanOrEqual(4)
    })
  }
})

/** The text colour Chromium emulates under forced colours, the inverse of FORCED_CANVAS. */
const CANVAS_TEXT = { light: [0, 0, 0], dark: [255, 255, 255] } as const satisfies Record<string, Rgb>

test.describe('forced colours keep a filled star apart from an empty one', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test.describe(scheme, () => {
      test.use({ forcedColors: 'active', colorScheme: scheme })

      for (const direction of DIRECTIONS) {
        test(`${direction}: a full star is solid, an empty one an outline, a half one between`, async ({ page }) => {
          await openLive(page, 'rating--read-only', { direction })
          const starOf = (rating: number, index: number) => page.locator('#demo [role="img"]').nth(rating).locator(':scope > span').nth(index)
          // Pixels painted exactly in CanvasText, the one colour forced colours leave a star.
          const ink = async (star: Locator) => {
            const { left, right } = await halves(page, star)
            return paintedIn([...left, ...right], CANVAS_TEXT[scheme])
          }
          // Measured at md in both palettes: 196 for a full star, 112 for a half, 28 for an outline.
          expect(await ink(starOf(1, 0)), 'full').toBeGreaterThanOrEqual(180)
          expect(await ink(starOf(3, 3)), 'half').toBeGreaterThanOrEqual(95)
          expect(await ink(starOf(3, 3)), 'half').toBeLessThanOrEqual(130)
          expect(await ink(starOf(1, 4)), 'empty').toBeLessThanOrEqual(40)
          expect(await ink(starOf(1, 4)), 'the outline is drawn').toBeGreaterThanOrEqual(15)
        })
      }
    })
  }
})

test.describe('the keyboard is the browser\'s own radio group', () => {
  // Chromium follows the eye: in RTL the right arrow goes to the star at the right, the previous step.
  const ARROWS = {
    ltr: { ArrowRight: 4, ArrowLeft: 3, ArrowDown: 4, ArrowUp: 3 },
    rtl: { ArrowRight: 2, ArrowLeft: 3, ArrowDown: 4, ArrowUp: 3 },
  } as const
  const SHOWN = {
    ltr: [[1, 1, 1, 1, 0], [1, 1, 1, 0, 0], [1, 1, 1, 1, 0], [1, 1, 1, 0, 0]],
    rtl: [[1, 1, 0, 0, 0], [1, 1, 1, 0, 0], [1, 1, 1, 1, 0], [1, 1, 1, 0, 0]],
  } as const

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab enters on the checked star, each arrow moves and selects, Tab leaves`, async ({ page }) => {
      await openLive(page, 'rating--editable', { direction })
      await page.locator('#demo h2').click()
      await page.keyboard.press('Tab')
      expect(await where(page)).toEqual({ focus: 3, checked: 3 })
      for (const [index, [key, step]] of Object.entries(ARROWS[direction]).entries()) {
        await page.keyboard.press(key)
        expect(await where(page), key).toEqual({ focus: step, checked: step })
        expect(await fills(group(page)), key).toEqual(SHOWN[direction][index])
      }
      await page.keyboard.press('Tab')
      expect(await where(page), 'Tab leaves the group').toEqual({ focus: 0, checked: 3 })
      await page.keyboard.press('Shift+Tab')
      expect(await where(page), 'Shift+Tab comes back to the checked star').toEqual({ focus: 3, checked: 3 })
    })
  }

  test('with nothing checked, Tab enters on the first star and Shift+Tab on the last', async ({ page }) => {
    await openFixture(page)
    const inCounting = () => page.evaluate(() => {
      const radios = [...document.querySelectorAll('#counting input[type="radio"]')]
      return { focus: radios.indexOf(document.activeElement as Element) + 1, checked: radios.findIndex((r) => (r as HTMLInputElement).checked) + 1 }
    })
    // The ten stars in the table cell come first: Tab lands on their checked sixth, then leaves them.
    await page.locator('#in-cell td').first().click()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(await inCounting()).toEqual({ focus: 1, checked: 0 })
    // Chromium then enters an unchecked group on the radio that last had focus, so the page starts again.
    await openFixture(page)
    await page.locator('[data-hostile="nan"]').click()
    await page.keyboard.press('Shift+Tab')
    expect(await inCounting()).toEqual({ focus: 5, checked: 0 })
  })

  test('disabled: no star takes the keyboard', async ({ page }) => {
    await openLive(page, 'rating--disabled')
    await page.mouse.click(2, 2)
    for (let press = 0; press < 4; press += 1) {
      await page.keyboard.press('Tab')
      expect((await where(page)).focus).toBe(0)
    }
  })
})

test.describe('the pointer', () => {
  test('fills up to the hovered star, and leaving puts the value back', async ({ page }) => {
    await openLive(page, 'rating--editable')
    const steps = group(page).locator('label')
    expect(await fills(group(page))).toEqual([1, 1, 1, 0, 0])
    await steps.nth(4).hover()
    expect(await fills(group(page))).toEqual([1, 1, 1, 1, 1])
    await steps.nth(1).hover()
    expect(await fills(group(page))).toEqual([1, 1, 0, 0, 0])
    await page.locator('#demo h2').hover()
    expect(await fills(group(page))).toEqual([1, 1, 1, 0, 0])
    expect(await where(page)).toEqual({ focus: 0, checked: 3 })
  })

  test('a click selects and calls onValueChange once; the checked star again calls nothing', async ({ page }) => {
    await openFixture(page)
    const counting = page.locator('#counting')
    const steps = counting.locator('label')
    await steps.nth(3).click()
    await expect(counting).toHaveAttribute('data-calls', '4')
    await steps.nth(3).click()
    await steps.nth(1).click()
    await expect(counting).toHaveAttribute('data-calls', '4,2')
    await page.locator('#hostile').hover({ position: { x: 1, y: 1 } })
    expect(await fills(counting.locator('[role="radiogroup"]'))).toEqual([1, 1, 0, 0, 0])
  })

  test('disabled: hovering fills nothing and a click checks nothing', async ({ page }) => {
    await openLive(page, 'rating--disabled')
    const last = group(page).locator('label').nth(4)
    const box = await last.boundingBox()
    if (!box) throw new Error('no box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    expect(await fills(group(page))).toEqual([1, 1, 0, 0, 0])
    await page.mouse.down()
    await page.mouse.up()
    expect(await where(page)).toEqual({ focus: 0, checked: 2 })
    expect(await fills(group(page))).toEqual([1, 1, 0, 0, 0])
  })
})

test.describe('a form', () => {
  test('the server HTML submits the default star before any script runs', async ({ page }) => {
    await page.goto(urlFor('rating--in-form', 'light', 'ltr'))
    expect(await formData(page)).toEqual(['stay=4'])
  })

  test('after hydration: a click changes what is submitted, and reset puts the server\'s star back', async ({ page }) => {
    await openLive(page, 'rating--in-form')
    const steps = group(page).locator('label')
    await steps.nth(1).click()
    expect(await formData(page)).toEqual(['stay=2'])
    await page.getByRole('button', { name: 'Reset' }).click()
    expect(await where(page)).toEqual({ focus: 0, checked: 4 })
    expect(await fills(group(page))).toEqual([1, 1, 1, 1, 0])
    expect(await formData(page)).toEqual(['stay=4'])
    await steps.nth(0).click()
    await page.locator('#demo form').evaluate((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault()
        form.setAttribute('data-sent', [...new FormData(form as HTMLFormElement)].map(([k, v]) => `${k}=${v as string}`).join('&'))
      })
    })
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.locator('#demo form')).toHaveAttribute('data-sent', 'stay=1')
  })
})

test.describe('every step is a target', () => {
  const DEMOS = ['rating--sizes', 'rating--editable', 'rating--max-ten'] as const
  const sizes = (page: Page) => page.locator('#demo label:has(> input[type="radio"]), #demo input[type="radio"]').evaluateAll((all) =>
    all.map((element) => { const { width, height } = element.getBoundingClientRect(); return Math.min(width, height) }))

  for (const demo of DEMOS) {
    test(`${demo}: every label and radio is at least 24 px`, async ({ page }) => {
      await openLive(page, demo)
      const found = await sizes(page)
      expect(found.length).toBeGreaterThanOrEqual(10)
      expect(Math.min(...found)).toBeGreaterThanOrEqual(24)
    })
  }

  test.describe('under a coarse pointer', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })
    for (const demo of DEMOS) {
      test(`${demo}: every label and radio is at least 44 px`, async ({ page }) => {
        await openLive(page, demo)
        const found = await sizes(page)
        expect(found.length).toBeGreaterThanOrEqual(10)
        expect(Math.min(...found)).toBeGreaterThanOrEqual(44)
      })
    }
  })

  test('the xs star is 16 px inside a 24 px step', async ({ page }) => {
    await openLive(page, 'rating--sizes')
    const xs = group(page).locator('label').first()
    expect(await xs.locator('svg').first().evaluate((svg) => svg.getBoundingClientRect().width)).toBe(16)
    expect(await xs.evaluate((label) => label.getBoundingClientRect().width)).toBe(24)
  })
})

/** Every parent of an element that clips, and would cut a ring of 2 px drawn 2 px outside it. */
const clippedBy = (target: Locator) => target.evaluate((element) => {
  const reach = 4
  const own = element.getBoundingClientRect()
  const cut: string[] = []
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent)
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
    const box = parent.getBoundingClientRect()
    const outside = own.left - reach < box.left || own.right + reach > box.right || own.top - reach < box.top || own.bottom + reach > box.bottom
    if (outside) cut.push(parent.tagName)
  }
  return cut
})

test.describe('the focus ring sits on the label of the focused radio', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: on the last of ten xl stars, wrapped on a phone, drawn whole and cut by nothing`, async ({ page }) => {
      await openLive(page, 'rating--max-ten', { direction })
      const label = group(page).locator('label').nth(9)
      const band = async () => {
        const box = await label.boundingBox()
        if (!box) throw new Error('no box')
        return pixelsOf(page, { x: box.x - 5, y: box.y - 5, width: box.width + 10, height: box.height + 10 })
      }
      const before = await band()
      await page.locator('#demo [role="img"]').click()
      await page.keyboard.press('Tab')
      expect(await where(page)).toEqual({ focus: 8, checked: 8 })
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      expect(await where(page)).toEqual({ focus: 10, checked: 10 })
      const style = await label.evaluate((element) => {
        const { outlineStyle, outlineWidth, outlineOffset } = getComputedStyle(element)
        return { outlineStyle, outlineWidth, outlineOffset }
      })
      expect(style).toEqual({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px' })
      // A 40 px box with a 2 px ring 2 px out and rounded corners: measured at 266 pixels.
      const ring = await paintedColour(label, 'outlineColor')
      expect(paintedIn(await band(), ring) - paintedIn(before, ring), 'ring pixels').toBeGreaterThanOrEqual(220)
      expect(await clippedBy(label)).toEqual([])
    })
  }
})

test.describe('ten stars at xl never scroll the page sideways', () => {
  for (const screen of SCREENS) {
    test.describe(`${String(screen.width)}x${String(screen.height)}`, () => {
      test.use({ viewport: screen })
      for (const direction of DIRECTIONS) {
        test(`${direction}: both rows stay inside the page`, async ({ page }) => {
          await openLive(page, 'rating--max-ten', { direction })
          await expectNoSidewaysScroll(page)
          const sides = await page.locator('#demo [role="img"], #demo [role="radiogroup"]').evaluateAll((all) => all.map((rating) => {
            const { left, right } = rating.getBoundingClientRect()
            return { left: left >= 0, right: right <= document.body.clientWidth }
          }))
          expect(sides).toEqual([{ left: true, right: true }, { left: true, right: true }])
        })
      }
    })
  }

  test.describe('inside a grid track, a flex-1 column, a w-fit parent and a table cell, at 320 px', () => {
    test.use({ viewport: { width: 320, height: 480 } })
    for (const direction of DIRECTIONS) {
      test(direction, async ({ page }) => {
        await openFixture(page, direction)
        await expectNoSidewaysScroll(page)
        const placed = await page.locator('[data-layout]').evaluateAll((all) => all.map((rating) => {
          const box = rating.getBoundingClientRect()
          const section = rating.closest('section')?.getBoundingClientRect()
          const inside = section !== undefined && box.left >= section.left - 0.5 && box.right <= section.right + 0.5
          return `${rating.getAttribute('data-layout') ?? ''} ${inside ? 'inside' : 'out'} ${box.right <= document.body.clientWidth ? 'on the page' : 'off'}`
        }))
        expect(placed).toEqual([
          'grid inside on the page', 'grid inside on the page', 'flex inside on the page', 'flex inside on the page',
          'fit inside on the page', 'fit inside on the page', 'cell inside on the page', 'cell inside on the page',
        ])
      })
    }
  })

  test('hostile values: clamped, rounded, never more than ten stars', async ({ page }) => {
    await openFixture(page)
    const shown = async (name: string) => fills(page.locator(`[data-hostile="${name}"]`))
    expect(await shown('nan')).toEqual([0, 0, 0, 0, 0])
    expect(await shown('negative')).toEqual([0, 0, 0, 0, 0])
    expect(await shown('over')).toEqual([1, 1, 1, 1, 1])
    expect(await shown('many')).toEqual([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
    expect(await shown('none')).toEqual([1])
    expect(await shown('rounded')).toEqual([1, 1, 1])
    expect(await page.locator('[data-hostile="nan"]').getAttribute('aria-label')).toBe('0 out of 5')
    expect(await page.locator('[data-hostile="many"]').getAttribute('aria-label')).toBe('4 out of 10')
  })
})

test.describe('text zoom and spacing', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: root text at 32 px and the WCAG 1.4.12 spacing scroll nothing sideways, and a step holds its star`, async ({ page }) => {
      await openLive(page, 'rating--sizes', { direction })
      await page.addStyleTag({ content: 'html { font-size: 32px !important } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important }' })
      await expectNoSidewaysScroll(page)
      const custom = page.locator('#demo [role="radiogroup"]').nth(1).locator('label').first()
      const [step, star] = await custom.evaluate((label) => [label.getBoundingClientRect().width, label.querySelector('svg')?.getBoundingClientRect().width ?? 0])
      // text-3xl at a 32 px root is 60 px, and the step grows with it.
      expect(star).toBe(60)
      expect(step).toBe(60)
    })
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing in a rating moves, with or without the setting: the fill changes in one frame', async ({ page }) => {
    await openLive(page, 'rating--editable')
    await group(page).locator('label').nth(4).hover()
    const moving = await group(page).evaluate((root) => ({
      animations: root.getAnimations({ subtree: true }).length,
      timed: [root, ...root.querySelectorAll('*')].filter((element) => getComputedStyle(element).transitionDuration !== '0s').length,
    }))
    expect(moving).toEqual({ animations: 0, timed: 0 })
  })
})

test.describe('axe on the hydrated demos', () => {
  const DEMOS = ['rating--read-only', 'rating--editable', 'rating--disabled', 'rating--in-form', 'rating--rtl'] as const
  for (const demo of DEMOS) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          const results = await new AxeBuilder({ page }).include('#demo').analyze()
          expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
        })
      }
    }
  }

  test.describe('at 320x480 under a coarse pointer', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })
    for (const demo of ['rating--editable', 'rating--max-ten'] as const) {
      test(demo, async ({ page }) => {
        await openLive(page, demo)
        await expectNoSidewaysScroll(page)
        const results = await new AxeBuilder({ page }).include('#demo').analyze()
        expect(results.violations.map((v) => v.id)).toEqual([])
      })
    }
  })
})

