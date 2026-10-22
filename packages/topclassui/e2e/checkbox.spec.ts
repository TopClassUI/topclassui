import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, paintedIn, pixelsOf, rgbOf, ringRow } from './pixels.js'

// What happy-dom cannot lay out or press: the target around the box, the mark inside it, the ring, forced colours,
// the screens, a wrapping label, and the form a real browser sends, before hydration and after a reset.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['checkbox--basic', 'checkbox--form', 'checkbox--labelled', 'checkbox--playground', 'checkbox--rtl', 'checkbox--sizes', 'checkbox--states', 'checkbox--combined'] as const
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const
const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const

const boxIn = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true })
const drawn = (control: Locator) => control.locator(':scope > span')
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
const markOf = (control: Locator) => control.locator('svg path').getAttribute('d').then((d) => (d?.startsWith('M229.66') ? 'tick' : 'dash'))

/** The target, the drawn box and the mark, rounded to a tenth, and how far the mark's centre is from the box's. */
const shape = (control: Locator) => control.evaluate((button) => {
  const box = button.querySelector(':scope > span')?.getBoundingClientRect() ?? new DOMRect()
  const mark = button.querySelector('svg')?.getBoundingClientRect() ?? new DOMRect()
  const target = button.getBoundingClientRect()
  const round = (px: number) => Math.round(px * 10) / 10
  const off = Math.max(Math.abs(mark.x + mark.width / 2 - (box.x + box.width / 2)), Math.abs(mark.y + mark.height / 2 - (box.y + box.height / 2)))
  return { target: [round(target.width), round(target.height)], box: [round(box.width), round(box.height)], mark: [round(mark.width), round(mark.height)], centred: off < 0.1 }
})

/** The colour a value resolves to on this page: a token, or a system colour painted as it is. */
const resolve = (page: Page, value: string) => page.evaluate((colour) => {
  const probe = document.createElement('span')
  probe.style.setProperty('forced-color-adjust', 'none')
  probe.style.backgroundColor = colour
  document.body.appendChild(probe)
  return getComputedStyle(probe).backgroundColor
}, value)

test.describe('the five sizes, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  const FINE = {
    xs: { target: [24, 24], box: [16, 16], mark: [11.2, 11.2], centred: true }, sm: { target: [24, 24], box: [20, 20], mark: [14.4, 14.4], centred: true },
    md: { target: [24, 24], box: [24, 24], mark: [17.6, 17.6], centred: true }, lg: { target: [28, 28], box: [28, 28], mark: [20.8, 20.8], centred: true },
    xl: { target: [32, 32], box: [32, 32], mark: [24, 24], centred: true },
  }
  const shapes = async (page: Page) => {
    const out: Record<string, Awaited<ReturnType<typeof shape>>> = {}
    for (const size of SIZES) out[size] = await shape(boxIn(page, NAMES[size]))
    return out
  }

  for (const direction of DIRECTIONS) {
    test(`fine pointer, ${direction}: the box and the tick of each size, centred, in a target of at least 24 px`, async ({ page }) => {
      await page.goto(urlFor('checkbox--sizes', 'light', direction))
      expect(await shapes(page)).toEqual(FINE)
    })
  }

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('the target is 44 x 44 px at every size, and the box keeps its own size inside it', async ({ page }) => {
      await page.goto(urlFor('checkbox--sizes', 'light', 'ltr'))
      expect(await shapes(page)).toEqual(Object.fromEntries(SIZES.map((size) => [size, { ...FINE[size], target: [44, 44] }])))
    })
  })

  test('the radius is 4 px, and 8 px in Ocean, where the xs box is a circle', async ({ page }) => {
    await page.goto(urlFor('checkbox--sizes', 'light', 'ltr'))
    expect(await css(drawn(boxIn(page, 'Medium')), 'border-top-left-radius')).toBe('4px')
    await page.goto(urlFor('checkbox--sizes', 'ocean', 'ltr'))
    expect(await css(drawn(boxIn(page, 'Medium')), 'border-top-left-radius')).toBe('8px')
    expect(await css(drawn(boxIn(page, 'Extra small')), 'border-top-left-radius')).toBe('8px')
  })
})

test.describe('what the server HTML sends, before any script runs', () => {
  test('checkbox--form sends terms=on and news=no, and the target spec measures the buttons and not the inputs', async ({ page }) => {
    await page.goto(urlFor('checkbox--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['terms', 'on'], ['news', 'no']])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.getAttribute('role') ?? el.tagName)))
      .toEqual(['checkbox', 'checkbox', 'BUTTON'])
  })
})

test.describe('the states, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  test('indeterminate is filled as checked is, says mixed and draws the dash', async ({ page }) => {
    await page.goto(urlFor('checkbox--combined', 'light', 'ltr'))
    const [checked, mixed] = [boxIn(page, 'Checked'), boxIn(page, 'Indeterminate')]
    expect(await mixed.getAttribute('aria-checked')).toBe('mixed')
    expect([await markOf(checked), await markOf(mixed)]).toEqual(['tick', 'dash'])
    expect(await css(drawn(mixed), 'background-color')).toBe(await resolve(page, 'var(--tc-primary-solid)'))
    expect(await css(drawn(mixed), 'background-color')).toBe(await css(drawn(checked), 'background-color'))
    expect(await css(drawn(mixed), 'color')).toBe(await css(drawn(checked), 'color'))
    expect(await css(drawn(boxIn(page, 'Unchecked')), 'background-color')).toBe(await resolve(page, 'var(--tc-surface-raised)'))
  })

  test('invalid: the line turns to danger and is 2 px thick, unticked, ticked and mixed', async ({ page }) => {
    await page.goto(urlFor('checkbox--combined', 'light', 'ltr'))
    const danger = await resolve(page, 'var(--tc-danger-solid)')
    for (const name of ['Invalid', 'Invalid, checked', 'Invalid, indeterminate']) {
      expect(await css(drawn(boxIn(page, name)), 'border-top-color'), name).toBe(danger)
      expect(await css(drawn(boxIn(page, name)), 'box-shadow'), name).toContain(`${danger} 0px 0px 0px 1px inset`)
    }
    expect(await css(drawn(boxIn(page, 'Unchecked')), 'box-shadow')).not.toContain('inset')
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    /** The pixels of the drawn box, row by row, 3 px in from its edge so the rounded corners show no page. */
    const rows = async (page: Page, control: Locator) => {
      const box = await boxOf(drawn(control))
      const pixels = await pixelsOf(page, { x: Math.round(box.left), y: Math.round(box.top), width: Math.round(box.width), height: Math.round(box.height) })
      const width = Math.round(box.width)
      return Array.from({ length: Math.round(box.height) }, (_, row) => pixels.slice(row * width + 3, (row + 1) * width - 3))
        .map((row, at, all) => (at < 3 || at >= all.length - 3 ? [] : row))
    }

    test('unticked, ticked and mixed differ by more than a fill: an empty box, a tick and a dash', async ({ page }) => {
      await page.goto(urlFor('checkbox--combined', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const highlight = rgbOf(await resolve(page, 'Highlight'))
      for (const name of ['Checked', 'Indeterminate']) {
        expect(await css(drawn(boxIn(page, name)), 'background-color'), name).toBe(await resolve(page, 'Highlight'))
        expect(await css(drawn(boxIn(page, name)), 'color'), name).toBe(await resolve(page, 'HighlightText'))
      }
      // Ink of the mark above and below the middle four rows: the tick has some, the dash none.
      const outsideMiddle = async (name: string) => {
        const all = await rows(page, boxIn(page, name))
        return all.filter((_, row) => row < 8 || row > 11).reduce((sum, row) => sum + inkOn(row, highlight), 0)
      }
      expect(await outsideMiddle('Checked')).toBeGreaterThan(5)
      expect(await outsideMiddle('Indeterminate')).toBe(0)
      const middle = (await rows(page, boxIn(page, 'Indeterminate'))).slice(8, 12).flat()
      expect(inkOn(middle, highlight)).toBeGreaterThan(5)
      expect(paintedIn(middle, highlight)).toBeLessThan(middle.length)
      // Unticked: no Highlight at all, and a line that stands 3:1 off the page.
      expect(paintedIn((await rows(page, boxIn(page, 'Unchecked'))).flat(), highlight)).toBe(0)
      expect(contrast(rgbOf(await css(drawn(boxIn(page, 'Unchecked')), 'border-top-color')), FORCED_CANVAS[scheme])).toBeGreaterThanOrEqual(3)
    })

    test('invalid and ticked or mixed: a CanvasText line and no author red; disabled and ticked or mixed, prop or fieldset: GrayText', async ({ page }) => {
      await page.goto(urlFor('checkbox--combined', 'light', 'ltr'))
      const [canvasText, grayText] = [await resolve(page, 'CanvasText'), await resolve(page, 'GrayText')]
      for (const name of ['Invalid, checked', 'Invalid, indeterminate']) {
        expect(await css(drawn(boxIn(page, name)), 'border-top-color'), name).toBe(canvasText)
        expect(await css(drawn(boxIn(page, name)), 'box-shadow'), name).not.toMatch(/[1-9]px inset/)
      }
      // The static page runs no script: a mixed box disabled by hand, and a ticked one moved into a disabled fieldset.
      await boxIn(page, 'Indeterminate').evaluate((el) => { el.setAttribute('disabled', '') })
      await boxIn(page, 'Checked').evaluate((el) => {
        const fieldset = document.createElement('fieldset')
        fieldset.disabled = true
        el.before(fieldset)
        fieldset.append(el)
      })
      for (const name of ['Disabled, checked', 'Indeterminate', 'Checked']) {
        expect(await css(drawn(boxIn(page, name)), 'background-color'), name).toBe(grayText)
        expect(await css(drawn(boxIn(page, name)), 'border-top-color'), name).toBe(grayText)
        expect(contrast(rgbOf(await css(drawn(boxIn(page, name)), 'color')), rgbOf(grayText)), name).toBeGreaterThanOrEqual(3)
      }
    })

    // The page in the other theme, where --tc-ring falls to 2.4:1 on Canvas: only a system colour holds in both.
    for (const mode of scheme === 'light' ? ['dark'] as const : ['light', 'ocean'] as const) {
      test(`${mode} page: the ring of a focused box is the user's CanvasText, 3:1 on Canvas, ticked, mixed and invalid too`, async ({ page }) => {
        await page.goto(urlFor('checkbox--combined', mode, 'ltr'))
        const canvasText = await resolve(page, 'CanvasText')
        for (const name of ['Unchecked', 'Checked', 'Indeterminate', 'Invalid, checked', 'Invalid, indeterminate', 'Read-only']) {
          await boxIn(page, name).focus()
          expect(await css(drawn(boxIn(page, name)), 'outline-color'), name).toBe(canvasText)
          const row = await ringRow(page, await boxOf(drawn(boxIn(page, name))))
          expect(inkOn(row, FORCED_CANVAS[scheme]), name).toBe(row.length)
        }
      })
    }

    test('invalid thickens the line to 2 px; disabled dims the whole box; no target has an outline at rest', async ({ page }) => {
      await page.goto(urlFor('checkbox--combined', 'light', 'ltr'))
      for (const name of ['Invalid', 'Invalid, checked', 'Invalid, indeterminate']) {
        expect(await css(drawn(boxIn(page, name)), 'border-top-width'), name).toBe('2px')
      }
      expect(await css(drawn(boxIn(page, 'Unchecked')), 'border-top-width')).toBe('1px')
      expect(await css(boxIn(page, 'Disabled'), 'opacity')).toBe('0.5')
      expect(await css(boxIn(page, 'Disabled, checked'), 'opacity')).toBe('0.5')
      const outlines = await page.locator('#demo [role="checkbox"]').evaluateAll((all) => all.map((el) => getComputedStyle(el).outlineStyle))
      expect(new Set(outlines)).toEqual(new Set(['none']))
    })
  })
}

test.describe('motion', () => {
  test('the fill fades in 150 ms', async ({ page }) => {
    await page.goto(urlFor('checkbox--basic', 'light', 'ltr'))
    const box = drawn(page.locator('#demo [role="checkbox"]').first())
    expect([await css(box, 'transition-duration'), await css(box, 'transition-property')])
      .toEqual(['0.15s', 'color, background-color, border-color, outline-color, opacity, translate'])
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('nothing fades: the box is filled the moment it is pressed', async ({ page }) => {
      await openLive(page, 'checkbox--basic')
      const control = boxIn(page, 'Send me product news')
      expect(await css(drawn(control), 'transition-duration')).toBe('0s')
      await control.click()
      expect(await css(drawn(control), 'background-color')).toBe(await resolve(page, 'var(--tc-primary-solid)'))
    })
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

test.describe('text', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const direction of DIRECTIONS) {
    test(`${direction}: at a root of 32 px the box doubles, the tick stays centred, and the label stays beside it`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor('checkbox--basic', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      const control = page.locator('#demo [role="checkbox"]').first()
      expect(await shape(control)).toEqual({ target: [48, 48], box: [48, 48], mark: [36.8, 36.8], centred: true })
      const [box, label] = [await boxOf(control), await boxOf(page.locator('label[for="checkbox-basic-terms"]'))]
      expect(direction === 'ltr' ? label.left >= box.right : label.right <= box.left).toBe(true)
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: the labels move, the boxes keep their size and nothing overlaps', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('checkbox--basic', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    for (const row of await page.locator('#demo [role="checkbox"]').all()) {
      expect((await shape(row)).box).toEqual([24, 24])
      const [control, label] = [await boxOf(row), await boxOf(page.locator(`label[for="${String(await row.getAttribute('id'))}"]`))]
      expect(label.left, 'the label overlaps its box').toBeGreaterThanOrEqual(control.right)
    }
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: pressing it', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a click on label[for], on a wrapping label, and on the box inside it each toggle it once`, async ({ page }) => {
      await openLive(page, 'checkbox--labelled', { direction })
      const [pointed, wrapped] = [page.locator('#checkbox-labelled-for'), page.locator('#checkbox-labelled-wrap')]
      await page.locator('label[for="checkbox-labelled-for"]').click()
      await expect(pointed).toHaveAttribute('aria-checked', 'true')
      await page.getByText('Named by a label that wraps it').click()
      await expect(wrapped).toHaveAttribute('aria-checked', 'true')
      await wrapped.click()
      await expect(wrapped).toHaveAttribute('aria-checked', 'false')
      expect(await markOf(pointed)).toBe('tick')
    })
  }

  test('an rtl island on an ltr page: each box sits at the right, before its label', async ({ page }) => {
    await openLive(page, 'checkbox--rtl', { direction: 'ltr' })
    for (const id of ['checkbox-rtl-terms', 'checkbox-rtl-news']) {
      const [box, label] = [await boxOf(page.locator(`#${id}`)), await boxOf(page.locator(`label[for="${id}"]`))]
      expect(box.left, id).toBeGreaterThanOrEqual(label.right)
    }
    await page.locator('#checkbox-rtl-news').click()
    await expect(page.locator('#checkbox-rtl-news')).toHaveAttribute('aria-checked', 'true')
  })

  test('Tab reaches it, Space toggles it, and the form sends what it shows', async ({ page }) => {
    await openLive(page, 'checkbox--form')
    await page.keyboard.press('Tab')
    const control = boxIn(page, 'I accept the terms')
    await expect(control).toBeFocused()
    await page.keyboard.press('Space')
    await expect(control).toHaveAttribute('aria-checked', 'false')
    expect(await serverEntries(page)).toEqual([['news', 'no']])
    await page.keyboard.press('Space')
    await expect(control).toHaveAttribute('aria-checked', 'true')
    expect(await serverEntries(page)).toEqual([['terms', 'on'], ['news', 'no']])
    await page.keyboard.press('Tab')
    await expect(boxIn(page, 'Send me product news')).toBeFocused()
  })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring is painted around the box and not the target, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'checkbox--basic')
        await page.keyboard.press('Tab')
        const control = page.locator('#checkbox-basic-terms')
        await expect(control).toBeFocused()
        expect(await css(control, 'outline-style')).toBe('none')
        const box = drawn(control)
        expect([await css(box, 'outline-style'), await css(box, 'outline-width'), await css(box, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
        const ring = await box.evaluate((el) => {
          const r = el.getBoundingClientRect()
          const edge = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
          const cut: string[] = []
          for (let up = el.parentElement; up; up = up.parentElement) {
            const style = getComputedStyle(up)
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const clip = up.getBoundingClientRect()
            if (edge.left < clip.left || edge.top < clip.top || edge.right > clip.right || edge.bottom > clip.bottom) cut.push(up.tagName)
          }
          return { width: edge.right - edge.left, cut }
        })
        expect(ring).toEqual({ width: 32, cut: [] })
      })
    })
  }
})

test.describe('live: a form reset', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/checkbox-reset.tsx' })
    await expect(page.locator('#checkbox-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.checkboxSent?.[name] ?? [], form)
  const state = (page: Page, name: string) => boxIn(page, name).getAttribute('aria-checked')

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each box is back at its default on screen and in the form; a controlled one keeps its owner's value; a mixed one stays mixed`, async ({ page }) => {
      for (const name of ['Terms', 'News', 'Owned', 'Mixed', 'Far']) await boxIn(page, name).click()
      // A mixed box sends nothing while it shows the dash, pressed or not.
      expect(await serverEntries(page, '#plain')).toEqual([['news', 'on'], ['owned', 'on'], ['far', 'on']])
      expect(await state(page, 'Mixed')).toBe('mixed')
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect.poll(() => state(page, 'Terms')).toBe('true')
      expect([await state(page, 'News'), await state(page, 'Far'), await state(page, 'Owned'), await state(page, 'Mixed')]).toEqual(['false', 'false', 'true', 'mixed'])
      await expect(page.locator('#owner')).toHaveText('true')
      expect(await serverEntries(page, '#plain')).toEqual([['terms', 'on'], ['owned', 'on']])
    })
  }

  test('after a React 19 form action settles, the box is back at its default on screen and in the form', async ({ page }) => {
    await boxIn(page, 'Agree').click()
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['agree', 'on']]])
    await expect.poll(() => state(page, 'Agree')).toBe('false')
    expect(await serverEntries(page, '#action')).toEqual([])
  })

  test('Enter on a box leaves it as it is and submits its form, as a native checkbox does', async ({ page }) => {
    await boxIn(page, 'Agree').focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => sent(page, 'action')).toEqual([[]])
    expect(await state(page, 'Agree')).toBe('false')
  })

  test('with the action\'s answer as the new default, the box stays ticked, on screen and in the form, and is sent again', async ({ page }) => {
    await boxIn(page, 'Agree again').click()
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    // The reset lands after the timeout of the hook: wait for a frame past it before reading the box.
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    expect(await state(page, 'Agree again')).toBe('true')
    expect(await serverEntries(page, '#echo')).toEqual([['agree', 'on']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['agree', 'on']], [['agree', 'on']]])
  })
})

test.describe('live: where a page puts a checkbox', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/checkbox-layouts.tsx' })
    await expect(page.locator('#layouts [role="checkbox"]').first()).toBeVisible()
  }
  /** Every box of the fixture, by its case, as target and box sizes. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((holder) => {
    const button = holder.querySelector('[role="checkbox"]')
    const size = (el: Element | null | undefined) => { const r = el?.getBoundingClientRect() ?? new DOMRect(); return [r.width, r.height] }
    return [holder.getAttribute('data-case'), size(button), size(button?.querySelector(':scope > span'))]
  }))
  const ALL = ['grid', 'track', 'flex-1', 'w-fit', 'cell', 'label-row', 'long', 'no-label', 'wrapped'] as const
  const expected = (target: number, large: number) => ALL.map((name) => {
    const box = name === 'long' ? 20 : name === 'no-label' ? 28 : 24
    return [name, name === 'no-label' ? [large, large] : [target, target], [box, box]]
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: laid straight into a grid the target is 24 x 24 px at the start, and every case keeps its size`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, { direction })
      const [grid, target] = [await boxOf(page.locator('#grid')), await boxOf(boxIn(page, 'In a grid'))]
      expect([target.width, target.height]).toEqual([24, 24])
      expect(direction === 'ltr' ? target.left - grid.left : grid.right - target.right).toBe(0)
      expect(await cases(page)).toEqual(expected(24, 28))
      await expectNoSidewaysScroll(page)
    })
  }

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: every case is a 44 px target around its own box, and the page does not scroll sideways`, async ({ page }) => {
        await fixture(page, { direction })
        expect(await cases(page)).toEqual(expected(44, 44))
        await expectNoSidewaysScroll(page)
      })
    }
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: axe finds nothing on the hydrated fixture, the boxes named by aria-label alone and by a wrapping label included`, async ({ page }) => {
      await fixture(page, { direction })
      const results = await new AxeBuilder({ page }).include('#layouts').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
      // A native button with the role is named as a button: axe reads the checkbox through button-name, which passed.
      expect(results.passes.find((pass) => pass.id === 'button-name')?.nodes).toHaveLength(9)
    })
  }
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
