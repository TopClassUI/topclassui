import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, type Direction } from '../scripts/lib/harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, pixelsOf, rgbOf, ringRow } from './pixels.js'

// What happy-dom cannot lay out or press: the target around the track, where the thumb lands in each direction,
// the ring, forced colours, the screens, and the form a real browser sends, before hydration and after a reset.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['switch--basic', 'switch--form', 'switch--playground', 'switch--rtl', 'switch--sizes', 'switch--state-matrix', 'switch--states', 'switch--unchecked-value'] as const
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const

const switchOf = (page: Page, name: string) => page.getByRole('switch', { name, exact: true })
const trackOf = (control: Locator) => control.locator(':scope > span')
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)

/** The target, the track and the thumb of a switch, and how far the thumb sits from each end of the track. */
const shape = (control: Locator) => control.evaluate((button) => {
  const size = (el: Element | null) => { const r = el?.getBoundingClientRect() ?? new DOMRect(); return [r.width, r.height] }
  const track = button.querySelector(':scope > span')
  const thumb = track?.querySelector('span')
  const [t, h] = [track?.getBoundingClientRect() ?? new DOMRect(), thumb?.getBoundingClientRect() ?? new DOMRect()]
  const round = (px: number) => Math.round(px * 100) / 100
  return { target: size(button), track: size(track ?? null), thumb: size(thumb ?? null), left: round(h.left - t.left), right: round(t.right - h.right) }
})

/** How far the thumb sits from the inline start and the inline end of its track. */
const gaps = async (control: Locator, direction: Direction) => {
  const { left, right } = await shape(control)
  return direction === 'ltr' ? { start: left, end: right } : { start: right, end: left }
}

const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const

test.describe('the five sizes, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  const FINE = {
    xs: { target: [28, 24], track: [28, 16], thumb: [12, 12] }, sm: { target: [35, 24], track: [35, 20], thumb: [16, 16] },
    md: { target: [42, 24], track: [42, 24], thumb: [20, 20] }, lg: { target: [49, 28], track: [49, 28], thumb: [24, 24] },
    xl: { target: [56, 32], track: [56, 32], thumb: [28, 28] },
  }
  const shapes = async (page: Page) => {
    const out: Record<string, { target: number[], track: number[], thumb: number[] }> = {}
    for (const size of SIZES) {
      const { target, track, thumb } = await shape(switchOf(page, NAMES[size]))
      out[size] = { target, track, thumb }
    }
    return out
  }

  for (const direction of DIRECTIONS) {
    test(`fine pointer, ${direction}: the drawn track and thumb of each size, and a target of at least 24 px around them`, async ({ page }) => {
      await page.goto(urlFor('switch--sizes', 'light', direction))
      expect(await shapes(page)).toEqual(FINE)
    })

    test(`${direction}: on, the thumb is 2 px from the inline end; off, 2 px from the inline start`, async ({ page }) => {
      await page.goto(urlFor('switch--sizes', 'light', direction))
      for (const size of SIZES) expect(await gaps(switchOf(page, NAMES[size]), direction), size).toMatchObject({ end: 2 })
      await page.goto(urlFor('switch--state-matrix', 'light', direction))
      expect(await gaps(switchOf(page, 'Off'), direction)).toEqual({ start: 2, end: 20 })
      expect(await gaps(switchOf(page, 'On'), direction)).toEqual({ start: 20, end: 2 })
    })
  }

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('the target is 44 x 44 px at every size, 49 wide at lg and 56 at xl, and the track keeps its own size inside it', async ({ page }) => {
      await page.goto(urlFor('switch--sizes', 'light', 'ltr'))
      expect(await shapes(page)).toEqual({
        xs: { ...FINE.xs, target: [44, 44] }, sm: { ...FINE.sm, target: [44, 44] }, md: { ...FINE.md, target: [44, 44] },
        lg: { ...FINE.lg, target: [49, 44] }, xl: { ...FINE.xl, target: [56, 44] },
      })
    })
  })
})

test.describe('what the server HTML sends, before any script runs', () => {
  test('switch--form sends digest=on', async ({ page }) => {
    await page.goto(urlFor('switch--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['digest', 'on']])
  })

  test('switch--unchecked-value sends news=no while it is off, and the target spec measures the switch and not its inputs', async ({ page }) => {
    await page.goto(urlFor('switch--unchecked-value', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['news', 'no']])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.tagName))).toEqual(['BUTTON'])
  })
})

test.describe('invalid, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the line of the track turns to danger and is 2 px thick, on and off', async ({ page }) => {
    await page.goto(urlFor('switch--state-matrix', 'light', 'ltr'))
    const danger = await page.evaluate(() => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--tc-danger-solid)'
      document.body.appendChild(probe)
      return getComputedStyle(probe).color
    })
    for (const name of ['Invalid', 'Invalid, on']) {
      const track = trackOf(switchOf(page, name))
      expect(await css(track, 'border-top-color'), name).toBe(danger)
      expect(await css(track, 'box-shadow'), name).toContain(`${danger} 0px 0px 0px 1px inset`)
    }
    expect(await css(trackOf(switchOf(page, 'Off')), 'box-shadow')).not.toContain('inset')
  })
})

test.describe('the off thumb against its track, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  /** The thumb's centre against the fill halfway between it and the far end of the track, clear of the line and its edge. */
  const thumbOnTrack = async (page: Page, control: Locator, direction: Direction) => {
    const [track, thumb] = [await boxOf(trackOf(control)), await boxOf(control.locator('span span'))]
    const y = Math.round(thumb.top + thumb.height / 2)
    const far = direction === 'ltr' ? (thumb.right + track.right) / 2 : (thumb.left + track.left) / 2
    const [knob] = await pixelsOf(page, { x: Math.round(thumb.left + thumb.width / 2), y, width: 1, height: 1 })
    const [fill] = await pixelsOf(page, { x: Math.round(far), y, width: 1, height: 1 })
    return contrast(knob ?? [0, 0, 0], fill ?? [0, 0, 0])
  }

  for (const mode of ['light', 'dark', 'ocean'] as const) {
    test(`${mode}: the thumb that shows the state stands 3:1 off the track around it (WCAG 1.4.11), at every size`, async ({ page }) => {
      await page.goto(urlFor('switch--state-matrix', mode, 'ltr'))
      expect(await thumbOnTrack(page, switchOf(page, 'Off'), 'ltr')).toBeGreaterThanOrEqual(3)
      expect(await thumbOnTrack(page, switchOf(page, 'Invalid'), 'ltr')).toBeGreaterThanOrEqual(3)
      // The sizes demo is on: turned off by hand on the static page, where no script puts it back.
      await page.goto(urlFor('switch--sizes', mode, 'rtl'))
      for (const size of SIZES) {
        const control = switchOf(page, NAMES[size])
        await control.evaluate((el) => { el.removeAttribute('data-checked'); el.setAttribute('data-unchecked', '') })
        expect(await thumbOnTrack(page, control, 'rtl'), size).toBeGreaterThanOrEqual(3)
      }
    })
  }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    const centre = async (page: Page, element: Locator) => {
      const box = await boxOf(element)
      const [pixel] = await pixelsOf(page, { x: Math.round(box.left + box.width / 2), y: Math.round(box.top + box.height / 2), width: 1, height: 1 })
      return pixel ?? [0, 0, 0]
    }

    test('on is filled Highlight with a HighlightText thumb at the end; off has a ButtonText thumb at the start: more than a fill', async ({ page }) => {
      await page.goto(urlFor('switch--state-matrix', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const [on, off] = [switchOf(page, 'On'), switchOf(page, 'Off')]
      const system = (colour: string) => page.evaluate((value) => {
        const probe = document.createElement('span')
        probe.style.setProperty('forced-color-adjust', 'none')
        probe.style.backgroundColor = value
        document.body.appendChild(probe)
        return getComputedStyle(probe).backgroundColor
      }, colour)
      expect(await css(trackOf(on), 'background-color')).toBe(await system('Highlight'))
      expect(await css(on.locator('span span'), 'background-color')).toBe(await system('HighlightText'))
      expect(await css(off.locator('span span'), 'background-color')).toBe(await system('ButtonText'))
      // The thumb is seen: its pixels differ from the fill around it, and the off thumb stands 3:1 off the page.
      expect(await centre(page, on.locator('span span'))).toEqual(rgbOf(await system('HighlightText')))
      expect(contrast(await centre(page, off.locator('span span')), FORCED_CANVAS[scheme])).toBeGreaterThanOrEqual(3)
      expect(await gaps(on, 'ltr')).toMatchObject({ end: 2 })
      expect(await gaps(off, 'ltr')).toMatchObject({ start: 2 })
    })

    test('invalid and on: a CanvasText line and no author red; disabled and on, prop or fieldset: GrayText under its thumb', async ({ page }) => {
      await page.goto(urlFor('switch--state-matrix', 'light', 'ltr'))
      const system = (colour: string) => page.evaluate((value) => {
        const probe = document.createElement('span')
        probe.style.setProperty('forced-color-adjust', 'none')
        probe.style.backgroundColor = value
        document.body.appendChild(probe)
        return getComputedStyle(probe).backgroundColor
      }, colour)
      const [canvasText, grayText] = [await system('CanvasText'), await system('GrayText')]
      expect(await css(trackOf(switchOf(page, 'Invalid, on')), 'border-top-color')).toBe(canvasText)
      expect(await css(trackOf(switchOf(page, 'Invalid, on')), 'box-shadow')).not.toMatch(/[1-9]px inset/)
      // The static page runs no script: an on switch moved into a disabled fieldset.
      await switchOf(page, 'On').evaluate((el) => {
        const fieldset = document.createElement('fieldset')
        fieldset.disabled = true
        el.before(fieldset)
        fieldset.append(el)
      })
      for (const name of ['Disabled, on', 'On']) {
        expect(await css(trackOf(switchOf(page, name)), 'background-color'), name).toBe(grayText)
        expect(await css(trackOf(switchOf(page, name)), 'border-top-color'), name).toBe(grayText)
        const thumb = rgbOf(await css(switchOf(page, name).locator('span span'), 'background-color'))
        expect(contrast(thumb, rgbOf(grayText)), name).toBeGreaterThanOrEqual(3)
      }
    })

    // The page in the other theme, where --tc-ring falls to 2.4:1 on Canvas: only a system colour holds in both.
    for (const mode of scheme === 'light' ? ['dark'] as const : ['light', 'ocean'] as const) {
      test(`${mode} page: the ring of a focused switch is the user's CanvasText, 3:1 on Canvas, on and invalid too`, async ({ page }) => {
        await page.goto(urlFor('switch--state-matrix', mode, 'ltr'))
        const canvasText = await page.evaluate(() => {
          const probe = document.createElement('span')
          probe.style.setProperty('forced-color-adjust', 'none')
          probe.style.color = 'CanvasText'
          document.body.appendChild(probe)
          return getComputedStyle(probe).color
        })
        for (const name of ['Off', 'On', 'Invalid, on', 'Read-only']) {
          await switchOf(page, name).focus()
          expect(await css(trackOf(switchOf(page, name)), 'outline-color'), name).toBe(canvasText)
          // A pill: the ring runs straight only between the two half circles.
          const track = await boxOf(trackOf(switchOf(page, name)))
          const row = await ringRow(page, { left: track.left + track.height / 2, top: track.top, width: track.width - track.height })
          expect(inkOn(row, FORCED_CANVAS[scheme]), name).toBe(row.length)
        }
      })
    }

    test('invalid thickens the line to 2 px; disabled dims the whole switch; no target has an outline at rest', async ({ page }) => {
      await page.goto(urlFor('switch--state-matrix', 'light', 'ltr'))
      expect(await css(trackOf(switchOf(page, 'Invalid')), 'border-top-width')).toBe('2px')
      expect(await css(trackOf(switchOf(page, 'Off')), 'border-top-width')).toBe('1px')
      expect(await css(switchOf(page, 'Disabled'), 'opacity')).toBe('0.5')
      expect(contrast(await centre(page, switchOf(page, 'Disabled').locator('span span')), FORCED_CANVAS[scheme])).toBeGreaterThan(1)
      const outlines = await page.locator('#demo [role="switch"]').evaluateAll((all) => all.map((el) => getComputedStyle(el).outlineStyle))
      expect(new Set(outlines)).toEqual(new Set(['none']))
    })
  })
}

test.describe('motion', () => {
  test('the thumb slides in 150 ms by translate', async ({ page }) => {
    await page.goto(urlFor('switch--basic', 'light', 'ltr'))
    const thumb = page.locator('#demo [role="switch"] span span').first()
    expect([await css(thumb, 'transition-duration'), await css(thumb, 'transition-property')])
      .toEqual(['0.15s', 'color, background-color, border-color, outline-color, opacity, translate'])
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('the thumb does not slide: it is at the end the moment it is pressed', async ({ page }) => {
      await openLive(page, 'switch--basic')
      const control = switchOf(page, 'Email me when I am mentioned')
      expect(await css(control.locator('span span'), 'transition-duration')).toBe('0s')
      await control.click()
      expect(await gaps(control, 'ltr')).toEqual({ start: 20, end: 2 })
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
    test(`${direction}: at a root of 32 px the track doubles, the thumb keeps its 2 px at the end, and the label stays beside it`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor('switch--basic', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      const control = page.locator('#demo [role="switch"]').first()
      expect(await shape(control)).toMatchObject({ target: [84, 48], track: [84, 48], thumb: [44, 44] })
      expect(await gaps(control, direction)).toEqual({ start: 38, end: 2 })
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: the labels move, the switches keep their size and nothing overlaps', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('switch--basic', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    for (const row of await page.locator('#demo [role="switch"]').all()) {
      expect((await shape(row)).track).toEqual([42, 24])
      const [control, label] = [await boxOf(row), await boxOf(page.locator(`label[for="${String(await row.getAttribute('id'))}"]`))]
      expect(label.left, 'the label overlaps its switch').toBeGreaterThanOrEqual(control.right)
    }
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: pressing it', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a click on label[for] toggles it, and the thumb moves to the inline end`, async ({ page }) => {
      await openLive(page, 'switch--basic', { direction })
      const control = page.locator('#switch-basic-mentions')
      await page.locator('label[for="switch-basic-mentions"]').click()
      await expect(control).toHaveAttribute('aria-checked', 'true')
      await expect.poll(() => gaps(control, direction)).toEqual({ start: 20, end: 2 })
    })
  }

  test('an rtl island on an ltr page: the thumb of a switch that is on sits at the left', async ({ page }) => {
    await openLive(page, 'switch--rtl', { direction: 'ltr' })
    await expect.poll(() => gaps(page.locator('#switch-rtl-digest'), 'rtl')).toEqual({ start: 20, end: 2 })
    await page.locator('#switch-rtl-mentions').click()
    await expect.poll(() => gaps(page.locator('#switch-rtl-mentions'), 'rtl')).toEqual({ start: 20, end: 2 })
  })

  test('Tab reaches it, Space and Enter toggle it, and the form sends what it shows', async ({ page }) => {
    await openLive(page, 'switch--form')
    await page.keyboard.press('Tab')
    const control = switchOf(page, 'Weekly digest')
    await expect(control).toBeFocused()
    await page.keyboard.press('Space')
    await expect(control).toHaveAttribute('aria-checked', 'false')
    expect(await serverEntries(page)).toEqual([])
    await page.keyboard.press('Enter')
    await expect(control).toHaveAttribute('aria-checked', 'true')
    expect(await serverEntries(page)).toEqual([['digest', 'on']])
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Save' })).toBeFocused()
  })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring is painted around the track and not the target, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'switch--basic')
        await page.keyboard.press('Tab')
        const control = page.locator('#switch-basic-digest')
        await expect(control).toBeFocused()
        expect(await css(control, 'outline-style')).toBe('none')
        const track = trackOf(control)
        expect([await css(track, 'outline-style'), await css(track, 'outline-width'), await css(track, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
        const ring = await track.evaluate((el) => {
          const r = el.getBoundingClientRect()
          const box = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
          const cut: string[] = []
          for (let up = el.parentElement; up; up = up.parentElement) {
            const style = getComputedStyle(up)
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const clip = up.getBoundingClientRect()
            if (box.left < clip.left || box.top < clip.top || box.right > clip.right || box.bottom > clip.bottom) cut.push(up.tagName)
          }
          return { width: box.right - box.left, cut }
        })
        expect(ring).toEqual({ width: 50, cut: [] })
      })
    })
  }
})

test.describe('live: a form reset', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/switch-reset.tsx' })
    await expect(page.locator('#switch-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.switchSent?.[name] ?? [], form)
  const checked = (page: Page, name: string) => switchOf(page, name).getAttribute('aria-checked')

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each switch is back at its default on screen and in the form, and a controlled one keeps its owner's value`, async ({ page }) => {
      for (const name of ['Digest', 'News', 'Owned', 'Far']) await switchOf(page, name).click()
      expect(await serverEntries(page, '#plain')).toEqual([['news', 'on'], ['owned', 'on'], ['far', 'on']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect.poll(() => checked(page, 'Digest')).toBe('true')
      expect([await checked(page, 'News'), await checked(page, 'Far'), await checked(page, 'Owned')]).toEqual(['false', 'false', 'true'])
      await expect(page.locator('#owner')).toHaveText('true')
      expect(await serverEntries(page, '#plain')).toEqual([['digest', 'on'], ['owned', 'on']])
    })
  }

  test('after a React 19 form action settles, the switch is back at its default on screen and in the form', async ({ page }) => {
    await switchOf(page, 'Agree').click()
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['agree', 'on']]])
    await expect.poll(() => checked(page, 'Agree')).toBe('false')
    expect(await serverEntries(page, '#action')).toEqual([])
  })

  test('with the action\'s answer as the new default, the switch stays on, on screen and in the form, and is sent again', async ({ page }) => {
    await switchOf(page, 'Agree again').click()
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    // The reset lands after the timeout of the hook: wait for a frame past it before reading the switch.
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    expect(await checked(page, 'Agree again')).toBe('true')
    expect(await serverEntries(page, '#echo')).toEqual([['agree', 'on']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['agree', 'on']], [['agree', 'on']]])
  })
})

test.describe('live: where a page puts a switch', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/switch-layouts.tsx' })
    await expect(page.locator('#layouts [role="switch"]').first()).toBeVisible()
  }
  /** Every switch of the fixture, by its case, as target and track sizes. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((box) => {
    const button = box.querySelector('[role="switch"]')
    const size = (el: Element | null | undefined) => { const r = el?.getBoundingClientRect() ?? new DOMRect(); return [r.width, r.height] }
    return [box.getAttribute('data-case'), size(button), size(button?.querySelector(':scope > span'))]
  }))
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: laid straight into a grid the target is 42 x 24 px at the start, and every case keeps its size`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, { direction })
      const [grid, target] = [await boxOf(page.locator('#grid')), await boxOf(switchOf(page, 'In a grid'))]
      expect([target.width, target.height]).toEqual([42, 24])
      expect(direction === 'ltr' ? target.left - grid.left : grid.right - target.right).toBe(0)
      expect(await cases(page)).toEqual([
        ['grid', [42, 24], [42, 24]], ['track', [42, 24], [42, 24]], ['flex-1', [42, 24], [42, 24]], ['w-fit', [42, 24], [42, 24]],
        ['cell', [42, 24], [42, 24]], ['label-row', [42, 24], [42, 24]], ['long', [35, 24], [35, 20]], ['no-label', [49, 28], [49, 28]],
        ['custom', [48, 24], [48, 24]],
      ])
      await expectNoSidewaysScroll(page)
    })

    test(`${direction}: size="custom" sized by the caller's CSS has a thumb as tall as its inside, at the start off and at the end on`, async ({ page }) => {
      await fixture(page, { direction })
      expect(await shape(switchOf(page, 'Custom, off'))).toMatchObject({ track: [48, 24], thumb: [20, 20] })
      await expect.poll(() => gaps(switchOf(page, 'Custom, off'), direction)).toEqual({ start: 2, end: 26 })
      await expect.poll(() => gaps(switchOf(page, 'Custom, on'), direction)).toEqual({ start: 26, end: 2 })
      await switchOf(page, 'Custom, off').click()
      await expect.poll(() => gaps(switchOf(page, 'Custom, off'), direction)).toEqual({ start: 26, end: 2 })
      await switchOf(page, 'Custom, on').click()
      await expect.poll(() => gaps(switchOf(page, 'Custom, on'), direction)).toEqual({ start: 2, end: 26 })
      // At a root of 32 px a track sized in rem doubles, and the thumb still lands 2 px from the end.
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      await expect.poll(() => shape(switchOf(page, 'Custom in rem, on')).then(({ track }) => track)).toEqual([96, 40])
      await expect.poll(() => gaps(switchOf(page, 'Custom in rem, on'), direction)).toEqual({ start: 58, end: 2 })
    })
  }

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: every case is a 44 px target around its own track, and the page does not scroll sideways`, async ({ page }) => {
        await fixture(page, { direction })
        expect(await cases(page)).toEqual([
          ['grid', [44, 44], [42, 24]], ['track', [44, 44], [42, 24]], ['flex-1', [44, 44], [42, 24]], ['w-fit', [44, 44], [42, 24]],
          ['cell', [44, 44], [42, 24]], ['label-row', [44, 44], [42, 24]], ['long', [44, 44], [35, 20]], ['no-label', [49, 44], [49, 28]],
          ['custom', [48, 44], [48, 24]],
        ])
        await expectNoSidewaysScroll(page)
      })
    }
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: axe finds nothing on the hydrated fixture, the switch named by aria-label alone included`, async ({ page }) => {
      await fixture(page, { direction })
      const results = await new AxeBuilder({ page }).include('#layouts').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
      // A native button with the role is named as a button: axe reads the switch through button-name, which passed.
      expect(results.passes.find((pass) => pass.id === 'button-name')?.nodes).toHaveLength(11)
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
