import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { type Clip, contrast, pixelsOf, rgbOf } from './pixels.js'

// The removable Tag on the live harness: its name, its keys, its box at every size and pointer, and the
// layouts and the content no demo should show. happy-dom has no layout and computes no accessible name.

const FIXTURE = '/e2e/fixtures/tag-remove.tsx'
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 844, height: 390 }] as const
const LAYOUTS = ['word-tag', 'element-tag', 'grid-tag', 'flex-tag', 'fit-tag', 'cell-tag'] as const

/** The tag's height and the button's box at each size, written out. Fine: 24 px x, and xs grows from 22 to 24. */
const FINE = { xs: 24, sm: 26, md: 30, lg: 38, xl: 46 } as const
const COARSE = { xs: 44, sm: 44, md: 44, lg: 44, xl: 46 } as const
/** A plain tag of each size, which the x must not change. */
const PLAIN = { xs: 22, sm: 26, md: 30, lg: 38, xl: 46 } as const
/** From the x to the end edge of the chip: the block padding, then the 1 px border. */
const END = { xs: 3, sm: 5, md: 7, lg: 9, xl: 11 } as const

async function openFixture(page: Page, options: LiveOptions = {}): Promise<void> {
  await openLive(page, 'tag--removable', options)
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await expect(page.locator('#tag-fixture')).toHaveAttribute('data-ready', '')
}

const calls = (page: Page) => page.evaluate(() => [...(window.__tagRemoved ?? [])])

interface Box { left: number, top: number, right: number, bottom: number, width: number, height: number }
const boxOf = (target: Locator) => target.evaluate((element): Box => {
  const { left, top, right, bottom, width, height } = element.getBoundingClientRect()
  return { left, top, right, bottom, width, height }
})
const round = (value: number) => Math.round(value * 10) / 10

/** The tag, its label and its x, and how the three sit. */
async function partsOf(tag: Locator) {
  const [box, label, button] = [await boxOf(tag), await boxOf(tag.locator(':scope > span')), await boxOf(tag.locator('button'))]
  const apart = label.right <= button.left + 0.5 || button.right <= label.left + 0.5
  const inside = button.top >= box.top - 0.5 && button.bottom <= box.bottom + 0.5 && button.left >= box.left && button.right <= box.right
  return { box, label, button, apart, inside }
}

/** Nothing moves any more: every transition that ends has ended. Never a fixed wait. */
const atRest = (page: Page) => page.evaluate(async () => {
  const running = () => document.getAnimations().filter((animation) => animation.playState === 'running')
  for (let pending = running(); pending.length > 0; pending = running()) await Promise.allSettled(pending.map((a) => a.finished))
})

/** The ring of the focused element on the lines through its middle, outside its box: the pixels that change when it
 * loses the focus. The ring is 2 px wide 2 px out, so a whole one is 2 on each side, and a pixel a clip cut never changes. */
async function ringOf(page: Page): Promise<{ above: number, below: number, before: number, after: number }> {
  await atRest(page)
  const PAD = 6
  const box = await page.evaluate(() => {
    const { left, top, right, bottom } = (document.activeElement ?? document.body).getBoundingClientRect()
    return { left, top, right, bottom }
  })
  const [x, y] = [Math.max(0, Math.floor(box.left) - PAD), Math.max(0, Math.floor(box.top) - PAD)]
  const clip: Clip = { x, y, width: Math.ceil(box.right) + PAD - x, height: Math.ceil(box.bottom) + PAD - y }
  const lit = await pixelsOf(page, clip)
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur() })
  await atRest(page)
  const plain = await pixelsOf(page, clip)
  const changed = (column: number, row: number) => {
    const [a, b] = [lit[row * clip.width + column] ?? [0, 0, 0], plain[row * clip.width + column] ?? [0, 0, 0]]
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 40
  }
  const [L, R, T, B] = [Math.round(box.left) - x, Math.round(box.right) - x, Math.round(box.top) - y, Math.round(box.bottom) - y]
  const [midRow, midColumn] = [Math.round((T + B) / 2), Math.round((L + R) / 2)]
  const run = (length: number) => Array.from({ length }, (_, index) => index)
  const count = (points: [number, number][]) => points.filter(([column, row]) => changed(column, row)).length
  return {
    above: count(run(PAD).map((step) => [midColumn, T - PAD + step])),
    below: count(run(PAD).map((step) => [midColumn, B + step])),
    before: count(run(PAD).map((step) => [L - PAD + step, midRow])),
    after: count(run(PAD).map((step) => [R + step, midRow])),
  }
}

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

test.describe('the accessible name', () => {
  for (const [direction, remove] of [['ltr', 'Remove'], ['rtl', 'إزالة']] as const) {
    test(`${direction}: each x is named by the provider's word, then the label of its own tag`, async ({ page }) => {
      await openLive(page, 'tag--removable', { direction })
      const names = await page.locator('#demo button').evaluateAll((all) => all.map((button) => button.getAttribute('aria-labelledby')))
      expect(names).toHaveLength(6)
      await expect(page.locator('#demo ul')).toMatchAriaSnapshot(`
        - list "Topics":
          - listitem:
            - text: Design systems
            - button "${remove} Design systems"
          - listitem:
            - text: Accessibility
            - button "${remove} Accessibility"
          - listitem:
            - text: React
            - button "${remove} React"
          - listitem:
            - text: Tailwind
            - button "${remove} Tailwind"
          - listitem:
            - text: Right to left
            - button "${remove} Right to left"
          - listitem:
            - text: Server Components
            - button "${remove} Server Components"
      `)
    })
  }

  test('the server HTML already names each x, before any script runs', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(liveUrl('tag--removable'))
    await expect(page.getByRole('button', { name: 'Remove React', exact: true })).toHaveCount(1)
    await context.close()
  })
})

test.describe('the keyboard', () => {
  test('Tab goes from x to x and never stops on a tag; Enter and Space each call onRemove once', async ({ page }) => {
    await openFixture(page)
    await page.locator('#size-sm button').focus()
    await page.keyboard.press('Tab')
    await expect(page.locator('#size-md button')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(page.locator('#size-sm button')).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    expect(await calls(page)).toEqual(['md'])
    await page.keyboard.press('Space')
    expect(await calls(page)).toEqual(['md', 'md'])
    await page.locator('#size-md button').click()
    expect(await calls(page)).toEqual(['md', 'md', 'md'])
  })

  for (const direction of DIRECTIONS) {
    for (const size of SIZES) {
      test(`${direction} ${size}: the ring of a focused x is whole, two px on each side, and the tag cuts none of it`, async ({ page }) => {
        await openFixture(page, { direction })
        await page.locator('#size-sm button').focus()
        await page.locator(`#size-${size} button`).focus()
        await page.keyboard.press('Shift+Tab')
        await page.keyboard.press('Tab')
        await expect(page.locator(`#size-${size} button`)).toHaveCSS('outline-style', 'solid')
        expect(await ringOf(page)).toEqual({ above: 2, below: 2, before: 2, after: 2 })
      })
    }
  }
})

test.describe('the caller takes the tag out, and the x hands the focus on', () => {
  test('a caller that does nothing about the focus still finds it on the next x, never the body', async ({ page }) => {
    await openFixture(page)
    await page.getByRole('button', { name: 'Remove Beta' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Remove Beta' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Remove Gamma' })).toBeFocused()
  })

  test('in the demo it goes to the x that took its place, then the one before, then the button the demo moves it to', async ({ page }) => {
    await openLive(page, 'tag--removable')
    await page.getByRole('button', { name: 'Remove React' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Remove Tailwind' })).toBeFocused()
    await page.getByRole('button', { name: 'Remove Server Components' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Remove Right to left' })).toBeFocused()
    for (let left = 4; left > 0; left--) await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Restore the topics' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#demo ul button')).toHaveCount(6)
  })
})

for (const pointer of ['fine', 'coarse'] as const) {
  test.describe(`every size, ${pointer} pointer`, () => {
    test.use(pointer === 'coarse' ? { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } : {})

    for (const direction of DIRECTIONS) {
      test(`${direction}: the x's box, the tag's height, nothing overlapping, and the x at the inline end`, async ({ page }) => {
        await openFixture(page, { direction })
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(pointer === 'coarse')
        const target = pointer === 'coarse' ? 44 : 24
        const found: Record<string, unknown> = {}
        for (const size of SIZES) {
          const { box, label, button, apart, inside } = await partsOf(page.locator(`#size-${size}`))
          const end = direction === 'ltr' ? box.right - button.right : button.left - box.left
          const atEnd = direction === 'ltr' ? button.left >= label.right - 0.5 : button.right <= label.left + 0.5
          found[size] = { button: [button.width, button.height], height: round(box.height), apart, inside, atEnd, end: round(end) }
        }
        const expected = Object.fromEntries(SIZES.map((size) => [size, {
          button: [target, target], height: (pointer === 'coarse' ? COARSE : FINE)[size], apart: true, inside: true, atEnd: true, end: END[size],
        }]))
        expect(found).toEqual(expected)
        const plain = await Promise.all(SIZES.map(async (size) => (await boxOf(page.locator(`#plain-${size}`))).height))
        expect(plain, 'a tag with no x keeps its own height').toEqual(SIZES.map((size) => PLAIN[size]))
      })
    }
  })
}

test.describe('content no demo should show', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  test('a label of 300 characters is cut at 100, ends in an ellipsis, and the x stays whole and pressable', async ({ page }) => {
    await openFixture(page)
    const tag = page.locator('#word-tag')
    const text = tag.locator(':scope > span > span')
    expect((await text.textContent())?.length).toBe(100)
    await expect(text).toHaveCSS('text-overflow', 'ellipsis')
    expect(await text.evaluate((element) => element.scrollWidth > element.clientWidth + 100)).toBe(true)
    const { button, apart, inside } = await partsOf(tag)
    expect([button.width, button.height, apart, inside]).toEqual([24, 24, true, true])
    await tag.locator('button').click()
    expect(await calls(page)).toEqual(['word'])
  })

  test('an element where text is expected is clipped by the label, and the x stays whole and pressable', async ({ page }) => {
    await openFixture(page)
    const tag = page.locator('#element-tag')
    await expect(tag.locator(':scope > span')).toHaveCSS('overflow', 'hidden')
    const [bold, label] = [await boxOf(tag.locator('strong')), await boxOf(tag.locator(':scope > span'))]
    expect(bold.width, 'the strong runs on past its label').toBeGreaterThan(label.width + 100)
    const { apart, inside } = await partsOf(tag)
    expect([apart, inside]).toEqual([true, true])
    await tag.locator('button').click()
    expect(await calls(page)).toEqual(['element'])
  })

  test('sixty removable tags wrap inside a 320 px row, none outside it and no two x overlapping', async ({ page }) => {
    await openFixture(page)
    const row = await boxOf(page.locator('#sixty-row'))
    const tags = await page.locator('#sixty-row > span').evaluateAll((all) => all.map((tag) => {
      const box = tag.getBoundingClientRect()
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom }
    }))
    expect(tags).toHaveLength(60)
    expect(tags.filter((tag) => tag.left < row.left - 0.5 || tag.right > row.right + 0.5)).toEqual([])
    expect(new Set(tags.map((tag) => Math.round(tag.top))).size, 'rows of tags').toBeGreaterThan(10)
    const overlapping = tags.filter((a, i) => tags.some((b, j) => i < j && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom))
    expect(overlapping).toEqual([])
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: in a grid track, a flex-1 column, a w-fit parent and a table cell the tag is no wider than its parent, and its x is pressed`, async ({ page }) => {
      await openFixture(page, { direction })
      for (const id of ['grid-tag', 'flex-tag', 'fit-tag', 'cell-tag'] as const) {
        const tag = page.locator(`#${id}`)
        const [own, parent] = [await boxOf(tag), await boxOf(tag.locator('..'))]
        expect(own.width, `${id} is wider than its parent`).toBeLessThanOrEqual(parent.width + 0.5)
        const { button, apart, inside } = await partsOf(tag)
        expect([button.width, apart, inside], id).toEqual([24, true, true])
        expect(button.left >= 0 && button.right <= 320, `${id}: the x is on the screen`).toBe(true)
        await tag.locator('button').click()
      }
      expect(await calls(page)).toEqual(['grid', 'flex', 'fit', 'cell'])
      await expectNoSidewaysScroll(page)
    })
  }

  test('a w-fit parent around a short label is as wide as the tag, which shows the whole label', async ({ page }) => {
    await openFixture(page)
    const label = page.locator('#fit-short > span')
    expect(await label.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  })
})

test.describe('no sideways scroll', () => {
  for (const screen of SCREENS) {
    for (const direction of DIRECTIONS) {
      test(`${String(screen.width)} x ${String(screen.height)} ${direction}: the demos and the fixture`, async ({ page }) => {
        await page.setViewportSize(screen)
        await openLive(page, 'tag--removable-sizes', { direction })
        await expectNoSidewaysScroll(page)
        await openFixture(page, { direction })
        await expectNoSidewaysScroll(page)
        for (const id of LAYOUTS) {
          const box = await boxOf(page.locator(`#${id}`))
          expect(box.left >= -0.5 && box.right <= screen.width + 0.5, `${id} leaves the screen`).toBe(true)
        }
      })
    }
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
  return { canvas: read('Canvas'), text: read('CanvasText'), highlight: read('Highlight'), highlightText: read('HighlightText') }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    test('the x is drawn in a system colour, hover fills it with the highlight, and focus draws a ring', async ({ page }) => {
      await openFixture(page)
      const system = await systemColours(page)
      const button = page.locator('#size-md button')
      const box = await boxOf(button)
      const clip = { x: Math.round(box.left), y: Math.round(box.top), width: 24, height: 24 }
      const canvas = rgbOf(system.canvas)
      expect((await pixelsOf(page, clip)).filter((pixel) => contrast(pixel, canvas) >= 3).length, 'px of the x at rest').toBeGreaterThan(10)

      await button.hover()
      await expect(button).toHaveCSS('background-color', system.highlight)
      await expect(button).toHaveCSS('color', system.highlightText)
      const hovered = await pixelsOf(page, clip)
      expect(hovered.filter((pixel) => pixel.join(',') === rgbOf(system.highlight).join(',')).length, 'px of highlight').toBeGreaterThan(300)
      expect(hovered.filter((pixel) => contrast(pixel, rgbOf(system.highlight)) >= 3).length, 'px of the x on it').toBeGreaterThan(20)

      await page.mouse.move(0, 0)
      await page.locator('#size-sm button').focus()
      await page.keyboard.press('Tab')
      await expect(button).toHaveCSS('outline-style', 'solid')
      expect(await ringOf(page)).toEqual({ above: 2, below: 2, before: 2, after: 2 })
    })
  })
}

test.describe('text that is made larger or spaced out', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  for (const direction of DIRECTIONS) {
    test(`${direction}: with the root at 32 px each x keeps its box inside a taller tag, and the page does not scroll sideways`, async ({ page }) => {
      await openFixture(page, { direction })
      await page.addStyleTag({ content: 'html { font-size: 32px !important }' })
      await expectNoSidewaysScroll(page)
      const found: Record<string, unknown> = {}
      for (const size of SIZES) {
        const { box, button, apart, inside } = await partsOf(page.locator(`#size-${size}`))
        found[size] = { grew: box.height > FINE[size], apart, inside, target: button.width >= 24 && button.height >= 24 }
      }
      expect(found).toEqual(Object.fromEntries(SIZES.map((size) => [size, { grew: true, apart: true, inside: true, target: true }])))
    })

    test(`${direction}: with the spacing of WCAG 1.4.12 no label leaves its tag and no x overlaps it`, async ({ page }) => {
      await openFixture(page, { direction })
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important }' })
      await expectNoSidewaysScroll(page)
      const found: Record<string, unknown> = {}
      for (const size of SIZES) {
        const { box, label, apart, inside } = await partsOf(page.locator(`#size-${size}`))
        found[size] = { apart, inside, label: label.top >= box.top - 0.5 && label.bottom <= box.bottom + 0.5 }
      }
      expect(found).toEqual(Object.fromEntries(SIZES.map((size) => [size, { apart: true, inside: true, label: true }])))
    })
  }
})

test.describe('motion', () => {
  test('the x changes colour over 150 ms', async ({ page }) => {
    await openLive(page, 'tag--removable')
    await expect(page.locator('#demo button').first()).toHaveCSS('transition-duration', '0.15s')
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('it changes at once, and a press still removes the tag', async ({ page }) => {
      await openLive(page, 'tag--removable')
      await expect(page.locator('#demo button').first()).toHaveCSS('transition-duration', '0s')
      await page.getByRole('button', { name: 'Remove React' }).click()
      await expect(page.locator('#demo ul button')).toHaveCount(5)
    })
  })
})

async function axe(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).include('#demo').analyze()
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.describe('axe', () => {
  for (const demo of ['tag--removable', 'tag--removable-sizes']) {
    for (const mode of MODES) {
      for (const direction of DIRECTIONS) {
        test(`${demo} ${mode} ${direction}: none on the hydrated page`, async ({ page }) => {
          await openLive(page, demo, { mode, direction })
          expect(await axe(page)).toEqual([])
        })
      }
    }

    for (const direction of DIRECTIONS) {
      // axe runs as a script, so the page keeps scripting and loses only its own: the server HTML, never hydrated.
      test(`${demo} ${direction}: none on the server HTML, before any script of the page runs`, async ({ page }) => {
        const url = liveUrl(demo, { direction })
        await page.route(url, async (route) => {
          const response = await route.fetch()
          await route.fulfill({ response, body: (await response.text()).replace(/<script\b[\s\S]*?<\/script>/g, '') })
        })
        await page.goto(url)
        expect(await page.evaluate(() => document.documentElement.dataset['harness'] ?? 'never hydrated')).not.toBe('hydrated')
        expect(await page.locator('#demo button').count()).toBeGreaterThan(4)
        expect(await axe(page)).toEqual([])
      })
    }
  }

  test.describe('320 x 480 under a finger', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: none on either demo`, async ({ page }) => {
        for (const demo of ['tag--removable', 'tag--removable-sizes']) {
          await openLive(page, demo, { direction })
          expect(await axe(page), demo).toEqual([])
        }
      })
    }
  })
})
