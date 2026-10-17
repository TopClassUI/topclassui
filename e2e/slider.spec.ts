import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out, press or drag: the thumb as a target, the knob and its ring, the width of an Input, the
// track under forced colours, a press and a drag by mouse and by finger in both directions, and the form after a reset.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['basic', 'form', 'range', 'rtl', 'show-value', 'sizes', 'skeleton', 'states'].map((demo) => `slider--${demo}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const

/** The range input of a thumb, named as a screen reader names it. */
const thumbIn = (page: Page, name: string) => page.getByRole('slider', { name, exact: true })
const thumbOf = (input: Locator) => input.locator('xpath=..')
const knobOf = (input: Locator) => input.locator('xpath=../span')
const trackOf = (input: Locator) => input.locator('xpath=../..')
const fillOf = (input: Locator) => trackOf(input).locator(':scope > div:not([data-index])')
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
const valueOf = (input: Locator) => input.getAttribute('aria-valuenow')

/** Where the centre of a thumb sits on its track, in percent from the left edge, to a tenth. */
const fromLeft = (input: Locator) => input.evaluate((el) => {
  const thumb = el.parentElement?.getBoundingClientRect() ?? new DOMRect()
  const track = el.parentElement?.parentElement?.getBoundingClientRect() ?? new DOMRect()
  return Math.round(((thumb.left + thumb.width / 2 - track.left) / track.width) * 1000) / 10
})

/** The root, the track height, the knob and the thumb of a slider, to a tenth of a pixel. */
const shape = (input: Locator) => input.evaluate((el) => {
  const size = (node: Element | null | undefined) => { const r = node?.getBoundingClientRect() ?? new DOMRect(); return [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10] }
  return { root: size(el.closest('[role="group"]'))[0], track: size(el.parentElement?.parentElement)[1], knob: size(el.previousElementSibling), thumb: size(el.parentElement) }
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
  const FINE = {
    xs: { root: 165.6, track: 4, knob: [14, 14], thumb: [24, 24] }, sm: { root: 193.2, track: 4, knob: [16, 16], thumb: [24, 24] },
    md: { root: 193.2, track: 6, knob: [20, 20], thumb: [24, 24] }, lg: { root: 220.8, track: 8, knob: [24, 24], thumb: [24, 24] },
    xl: { root: 220.8, track: 8, knob: [28, 28], thumb: [28, 28] },
  }
  const shapes = async (page: Page) => Object.fromEntries(await Promise.all(SIZES.map(async (size) => [size, await shape(thumbIn(page, NAMES[size]))] as const)))

  for (const direction of DIRECTIONS) {
    test(`fine pointer, ${direction}: an Input wide, the knob of the toggle scale, in a thumb of at least 24 px`, async ({ page }) => {
      await page.goto(urlFor('slider--sizes', 'light', direction))
      expect(await shapes(page)).toEqual(FINE)
    })
  }

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('every size is 220.8 px wide, as an Input at 16 px text, and every thumb is 44 x 44 px around its own knob', async ({ page }) => {
      await page.goto(urlFor('slider--sizes', 'light', 'ltr'))
      expect(await shapes(page)).toEqual(Object.fromEntries(SIZES.map((size) => [size, { ...FINE[size], root: 220.8, thumb: [44, 44] }])))
    })
  })

  test('the range input fills its thumb, so the shared target spec measures what a finger hits', async ({ page }) => {
    await page.goto(urlFor('slider--sizes', 'light', 'ltr'))
    const input = thumbIn(page, 'Medium')
    const [box, thumb] = [await boxOf(input), await boxOf(thumbOf(input))]
    expect([box.width, box.height]).toEqual([thumb.width, thumb.height])
  })
})

test.describe('the server HTML, before any script runs', () => {
  test('slider--form sends volume=60, and the target spec measures the range input and the button', async ({ page }) => {
    await page.goto(urlFor('slider--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['volume', '60']])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.getAttribute('type') ?? el.tagName))).toEqual(['range', 'submit'])
  })

  test('a range serves both thumbs at their values, each a tab stop', async ({ page }) => {
    await page.goto(urlFor('slider--range', 'light', 'ltr'))
    expect([await fromLeft(thumbIn(page, 'Minimum')), await fromLeft(thumbIn(page, 'Maximum'))]).toEqual([20, 80])
    await page.keyboard.press('Tab')
    await expect(thumbIn(page, 'Minimum')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(thumbIn(page, 'Maximum')).toBeFocused()
  })

  // unit-4.md, "What the form receives": no demo and no test may promise a slider is inert before hydration.
  test('the range input already takes an arrow: the form sends the new number while the thumb stays at the default', async ({ page }) => {
    await page.goto(urlFor('slider--form', 'light', 'ltr'))
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowRight')
    expect(await serverEntries(page)).toEqual([['volume', '65']])
    expect(await fromLeft(thumbIn(page, 'Volume'))).toBe(60)
  })
})

test.describe('the states, on the static page', () => {
  test('primary: the fill, the knob\'s 2 px line on the raised surface, and a 1 px line-strong edge around the track', async ({ page }) => {
    await page.goto(urlFor('slider--states', 'light', 'ltr'))
    const primary = await resolve(page, 'var(--tc-primary-solid)')
    const live = thumbIn(page, 'Live')
    expect(await css(fillOf(live), 'background-color')).toBe(primary)
    expect([await css(knobOf(live), 'border-top-color'), await css(knobOf(live), 'border-top-width')]).toEqual([primary, '2px'])
    expect(await css(knobOf(live), 'background-color')).toBe(await resolve(page, 'var(--tc-surface-raised)'))
    expect([await css(trackOf(live), 'outline-style'), await css(trackOf(live), 'outline-width'), await css(trackOf(live), 'outline-color')])
      .toEqual(['solid', '1px', await resolve(page, 'var(--tc-line-strong)')])
  })

  test('invalid: the fill and the knob turn to danger, and a danger line is drawn around the track, not hue alone', async ({ page }) => {
    await page.goto(urlFor('slider--states', 'light', 'ltr'))
    const danger = await resolve(page, 'var(--tc-danger-solid)')
    for (const name of ['Invalid', 'Minimum', 'Maximum']) {
      const input = thumbIn(page, name)
      expect(await css(fillOf(input), 'background-color'), name).toBe(danger)
      expect(await css(knobOf(input), 'border-top-color'), name).toBe(danger)
      expect([await css(trackOf(input), 'outline-style'), await css(trackOf(input), 'outline-width'), await css(trackOf(input), 'outline-color')], name)
        .toEqual(['solid', '1px', danger])
    }
  })

  test('disabled: the whole slider dims to half; the others do not', async ({ page }) => {
    await page.goto(urlFor('slider--states', 'light', 'ltr'))
    const opacity = (name: string) => thumbIn(page, name).evaluate((el) => getComputedStyle(el.closest('[role="group"]') as Element).opacity)
    expect([await opacity('Disabled'), await opacity('Live'), await opacity('Invalid')]).toEqual(['0.5', '1', '1'])
  })
})

test.describe('the edge of the empty track, read from the pixels a page painted', () => {
  for (const mode of ['light', 'dark', 'ocean'] as const) {
    test(`${mode}: a line at 3:1 against the page runs along the empty track, so the end of the range can be seen`, async ({ page }) => {
      await page.goto(urlFor('slider--states', mode, 'ltr'))
      const input = thumbIn(page, 'Live')
      const [thumb, track] = [await boxOf(thumbOf(input)), await boxOf(trackOf(input))]
      const [x, width] = [Math.round(thumb.right + 4), Math.round(track.right - thumb.right - 12)]
      // The page itself, 6 px above the track inside the slider's own box, where nothing is painted.
      const [backdrop] = await pixelsOf(page, { x, y: Math.round(track.top - 6), width: 1, height: 1 })
      const edge = await pixelsOf(page, { x, y: Math.round(track.top - 2), width, height: 3 })
      expect(inkOn(edge, backdrop ?? [0, 0, 0]), `${String(width)} columns`).toBeGreaterThanOrEqual(width)
    })
  }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    /** The pixels of the empty part of a track, from 4 px past the thumb to its end, with 3 px above and below. */
    const emptyTrack = async (page: Page, input: Locator) => {
      const [thumb, track] = [await boxOf(thumbOf(input)), await boxOf(trackOf(input))]
      return pixelsOf(page, { x: Math.round(thumb.right + 4), y: Math.round(track.top - 3), width: Math.round(track.right - thumb.right - 8), height: Math.round(track.height + 6) })
    }

    test('the empty track keeps a line, the fill is Highlight, and the knob a line at 3:1: the value is told by more than a fill', async ({ page }) => {
      await page.goto(urlFor('slider--states', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const canvas = FORCED_CANVAS[scheme]
      const live = thumbIn(page, 'Live')
      expect(inkOn(await emptyTrack(page, live), canvas), 'pixels of the empty track at 3:1').toBeGreaterThan(100)
      expect(await css(fillOf(live), 'background-color')).toBe(await resolve(page, 'Highlight'))
      expect(contrast(rgbOf(await css(knobOf(live), 'border-top-color')), canvas)).toBeGreaterThanOrEqual(3)
    })

    test('invalid draws the line around the track 2 px thick; no range input has an outline at rest', async ({ page }) => {
      await page.goto(urlFor('slider--states', 'light', 'ltr'))
      expect(await css(trackOf(thumbIn(page, 'Invalid')), 'outline-width')).toBe('2px')
      expect(await css(trackOf(thumbIn(page, 'Live')), 'outline-width')).toBe('1px')
      // The user's palette, not the author's red: the 2 px line already tells invalid apart.
      const highlight = await resolve(page, 'Highlight')
      expect(await Promise.all(['Invalid', 'Minimum', 'Maximum'].map((name) => css(fillOf(thumbIn(page, name)), 'background-color')))).toEqual([highlight, highlight, highlight])
      const outlines = await page.locator('#demo input').evaluateAll((all) => all.map((el) => getComputedStyle(el).outlineStyle))
      expect(new Set(outlines)).toEqual(new Set(['none']))
    })
  })
}

test.describe('motion', () => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test.describe(reducedMotion, () => {
      test.use({ reducedMotion })

      test('nothing animates: the thumb and the fill follow the value at once', async ({ page }) => {
        await openLive(page, 'slider--basic')
        const input = thumbIn(page, 'Volume')
        const parts = [thumbOf(input), knobOf(input), fillOf(input)]
        expect(await Promise.all(parts.map((part) => css(part, 'transition-duration')))).toEqual(['0s', '0s', '0s'])
        await input.focus()
        await page.keyboard.press('End')
        expect(await fromLeft(input)).toBe(100)
      })
    })
  }
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
  for (const direction of DIRECTIONS) {
    test(`${direction}: at a root of 32 px the knob doubles and stays centred in its thumb, and the slider fits the page`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor('slider--show-value', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      const input = thumbIn(page, 'Brightness')
      const [knob, thumb, root] = [await boxOf(knobOf(input)), await boxOf(thumbOf(input)), await boxOf(input.locator('xpath=ancestor::*[@role="group"]'))]
      expect([knob.width, thumb.width]).toEqual([40, 40])
      expect(Math.abs(knob.left + knob.width / 2 - (thumb.left + thumb.width / 2))).toBeLessThan(0.1)
      expect(root.right).toBeLessThanOrEqual(320)
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: the value moves, beside the track or below it, the knob keeps its size, and the value never covers the track', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('slider--show-value', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    for (const name of ['Brightness', 'Maximum']) {
      const input = thumbIn(page, name)
      expect((await boxOf(knobOf(input))).width).toBe(20)
      const output = input.locator('xpath=ancestor::*[@role="group"]//output')
      const [value, track] = [await boxOf(output), await boxOf(trackOf(input))]
      // Beside the track, or on its own line below it when the wider letters no longer fit beside it.
      expect(value.left >= track.right || value.top >= track.bottom, name).toBe(true)
    }
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: the keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('ltr: Tab enters on the thumb; each key moves it, and the thumb moves right as the value rises', async ({ page }) => {
    await openLive(page, 'slider--basic')
    const input = thumbIn(page, 'Volume')
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    const steps: string[] = []
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Shift+ArrowRight', 'Shift+ArrowLeft', 'End', 'Home']) {
      await page.keyboard.press(key)
      steps.push(`${key} ${String(await valueOf(input))} at ${String(await fromLeft(input))}%`)
    }
    expect(steps).toEqual([
      'ArrowRight 65 at 65%', 'ArrowLeft 60 at 60%', 'ArrowUp 65 at 65%', 'ArrowDown 60 at 60%', 'PageUp 70 at 70%', 'PageDown 60 at 60%',
      'Shift+ArrowRight 70 at 70%', 'Shift+ArrowLeft 60 at 60%', 'End 100 at 100%', 'Home 0 at 0%',
    ])
  })

  test('rtl, under the provider: the track runs from the right; ArrowLeft raises the value and ArrowRight lowers it', async ({ page }) => {
    await openLive(page, 'slider--rtl', { direction: 'rtl' })
    const input = thumbIn(page, 'مستوى الصوت')
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    const steps: string[] = []
    for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowRight', 'ArrowUp', 'PageUp', 'End', 'Home']) {
      await page.keyboard.press(key)
      steps.push(`${key} ${String(await valueOf(input))} at ${String(await fromLeft(input))}%`)
    }
    expect(steps).toEqual([
      'ArrowLeft 31 at 69%', 'ArrowRight 30 at 70%', 'ArrowRight 29 at 71%', 'ArrowUp 30 at 70%', 'PageUp 40 at 60%', 'End 100 at 0%', 'Home 0 at 100%',
    ])
  })

  test('a range: two tab stops, and End on Minimum stops at Maximum: the thumbs cannot cross', async ({ page }) => {
    await openLive(page, 'slider--range')
    await page.keyboard.press('Tab')
    await expect(thumbIn(page, 'Minimum')).toBeFocused()
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowRight')
    expect([await valueOf(thumbIn(page, 'Minimum')), await valueOf(thumbIn(page, 'Maximum'))]).toEqual(['80', '80'])
    await page.keyboard.press('Tab')
    await expect(thumbIn(page, 'Maximum')).toBeFocused()
    await page.keyboard.press('Home')
    expect(await valueOf(thumbIn(page, 'Maximum'))).toBe('80')
  })
})

test.describe('live: what a screen reader is handed', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('the focused range input of an invalid slider is invalid, one thumb and both of a range; a valid one is not', async ({ page }) => {
    await openLive(page, 'slider--states')
    const cdp = await page.context().newCDPSession(page)
    const { nodes } = await cdp.send('Accessibility.getFullAXTree') as { nodes: { ignored: boolean; role?: { value: string }; name?: { value: string }; properties?: { name: string; value: { value?: string | boolean } }[] }[] }
    const sliders = nodes.filter((node) => !node.ignored && node.role?.value === 'slider')
      .map((node) => `${String(node.name?.value)} ${String(node.properties?.find((p) => p.name === 'invalid')?.value.value ?? 'false')}`)
    expect(sliders).toEqual(expect.arrayContaining(['Live false', 'Invalid true', 'Minimum true', 'Maximum true']))
  })
})

test.describe('live: a press and a drag', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  /** A point on the track of a slider, a fraction of the way from its left edge. */
  const pointOn = async (input: Locator, fraction: number) => {
    const track = await boxOf(trackOf(input))
    return { x: track.left + track.width * fraction, y: track.top + track.height / 2 }
  }

  test('a click at three quarters of the track gives 75 in ltr, and 25 in rtl, where the track starts at the right', async ({ page }) => {
    await openLive(page, 'slider--basic')
    const ltr = thumbIn(page, 'Volume')
    const at = await pointOn(ltr, 0.75)
    await page.mouse.click(at.x, at.y)
    expect(await valueOf(ltr)).toBe('75')
    await openLive(page, 'slider--rtl', { direction: 'rtl' })
    const rtl = thumbIn(page, 'مستوى الصوت')
    // The thumb of 30 sits under three quarters from the left: move it away first.
    await rtl.focus()
    await page.keyboard.press('Home')
    const there = await pointOn(rtl, 0.75)
    await page.mouse.click(there.x, there.y)
    expect([await valueOf(rtl), await fromLeft(rtl)]).toEqual(['25', 75])
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a mouse drag moves the thumb with the pointer`, async ({ page }) => {
      await openLive(page, direction === 'ltr' ? 'slider--basic' : 'slider--rtl', { direction })
      const input = thumbIn(page, direction === 'ltr' ? 'Volume' : 'مستوى الصوت')
      const start = await boxOf(thumbOf(input))
      const end = await pointOn(input, 0.2)
      await page.mouse.move(start.left + start.width / 2, start.top + start.height / 2)
      await page.mouse.down()
      await page.mouse.move(end.x, end.y, { steps: 8 })
      await page.mouse.up()
      expect([await valueOf(input), await fromLeft(input)]).toEqual([direction === 'ltr' ? '20' : '80', 20])
    })
  }

  test.describe('a finger', () => {
    test.use(COARSE)

    for (const direction of DIRECTIONS) {
      test(`${direction}: a touch drag, sent as raw touch events, moves the thumb and never scrolls the page`, async ({ page }) => {
        // A page taller than the screen, so a finger that the slider does not hold would scroll it.
        await openLive(page, direction === 'ltr' ? 'slider--basic' : 'slider--rtl', { direction, tall: true })
        const input = thumbIn(page, direction === 'ltr' ? 'Volume' : 'مستوى الصوت')
        const start = await boxOf(thumbOf(input))
        const end = await pointOn(input, 0.9)
        const cdp = await page.context().newCDPSession(page)
        const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
        const [x0, y0] = [start.left + start.width / 2, start.top + start.height / 2]
        await touch('touchStart', x0, y0)
        // Sideways and a little down, as a thumb drags: the page must neither scroll nor pan.
        for (let step = 1; step <= 8; step += 1) await touch('touchMove', x0 + ((end.x - x0) * step) / 8, y0 + step * 3)
        await touch('touchEnd', end.x, end.y)
        expect([await valueOf(input), await fromLeft(input)]).toEqual([direction === 'ltr' ? '90' : '10', 90])
        // Straight up from the thumb: on a control without touch-action: none the page scrolls instead.
        const moved = await boxOf(thumbOf(input))
        const [x1, y1] = [moved.left + moved.width / 2, moved.top + moved.height / 2]
        await touch('touchStart', x1, y1)
        for (let step = 1; step <= 8; step += 1) await touch('touchMove', x1, y1 - step * 20)
        await touch('touchEnd', x1, y1 - 160)
        expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0])
        expect(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)).toBe(true)
      })
    }
  })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring is painted around the knob and not the thumb, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'slider--basic')
        await page.keyboard.press('Tab')
        const input = thumbIn(page, 'Volume')
        await expect(input).toBeFocused()
        expect(await css(thumbOf(input), 'outline-style')).toBe('none')
        const knob = knobOf(input)
        expect([await css(knob, 'outline-style'), await css(knob, 'outline-width'), await css(knob, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
        const ring = await knob.evaluate((el) => {
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
        expect(ring).toEqual({ width: 28, cut: [] })
      })
    })
  }

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`no provider on an rtl page, ${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the slider runs left to right as its keys do: the thumb of 30 sits 30% from the left, and a press lands under the finger', async ({ page }) => {
        await openLive(page, 'separator--horizontal', { direction: 'rtl' })
        await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/slider-no-provider.tsx' })
        const input = thumbIn(page, 'No provider')
        await expect(input).toBeVisible()
        expect(await fromLeft(input)).toBe(30)
        const at = await pointOn(input, 0.75)
        if (pointer === 'fine') await page.mouse.click(at.x, at.y)
        else await page.touchscreen.tap(at.x, at.y)
        expect([await valueOf(input), await fromLeft(input)]).toEqual(['75', 75])
      })
    })
  }

  test('an rtl island on an ltr page: the thumb of 30 sits 30% in from the right', async ({ page }) => {
    await openLive(page, 'slider--rtl', { direction: 'ltr' })
    expect(await fromLeft(thumbIn(page, 'مستوى الصوت'))).toBe(70)
    expect([await fromLeft(thumbIn(page, 'الحد الأدنى')), await fromLeft(thumbIn(page, 'الحد الأقصى'))]).toEqual([80, 20])
  })
})

test.describe('live: a finger on a slider inside a Drawer', () => {
  test.use(COARSE)
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: dragging the thumb toward the side the sheet closes on moves the thumb, and the sheet stays`, async ({ page }) => {
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/slider-drawer.tsx' })
      const popup = page.getByRole('dialog', { name: 'Filters' })
      await expect(popup).toBeVisible()
      // Let the sheet finish sliding in, so its edge is still.
      await expect.poll(() => popup.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0)
      const input = thumbIn(page, 'Price')
      const [thumb, track, before] = [await boxOf(thumbOf(input)), await boxOf(trackOf(input)), await boxOf(popup)]
      const cdp = await page.context().newCDPSession(page)
      const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
      const [x0, y0] = [thumb.left + thumb.width / 2, thumb.top + thumb.height / 2]
      // Past the end of the track on the side the inline-end sheet is dismissed toward: right in ltr, left in rtl.
      const x1 = direction === 'ltr' ? track.right + 40 : track.left - 40
      await touch('touchStart', x0, y0)
      for (let step = 1; step <= 10; step += 1) await touch('touchMove', x0 + ((x1 - x0) * step) / 10, y0)
      const during = await boxOf(popup)
      await touch('touchEnd', x1, y0)
      expect(during.left).toBe(before.left)
      await expect(popup).toBeVisible()
      expect(await page.evaluate(() => window.sliderDrawer ?? [])).toEqual([])
      expect(await valueOf(input)).toBe('100')
    })
  }
})

test.describe('live: a form reset', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/slider-reset.tsx' })
    await expect(page.locator('#slider-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.sliderSent?.[name] ?? [], form)
  /** A thumb by its name; the two of the range in the plain form by theirs, as the action's range has the same two. */
  const thumbAt = (page: Page, name: string) => (['Minimum', 'Maximum'].includes(name)
    ? page.getByRole('group', { name: 'Price' }).getByRole('slider', { name, exact: true })
    : thumbIn(page, name))
  const press = async (page: Page, name: string, key: string) => { await thumbAt(page, name).focus(); await page.keyboard.press(key) }
  const values = (page: Page, names: string[]) => Promise.all(names.map((name) => valueOf(thumbAt(page, name))))
  const ALL = ['Volume', 'Minimum', 'Maximum', 'Empty', 'Owned', 'Far']

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each slider is back at its default on screen and in the form; a controlled one keeps its owner's value`, async ({ page }) => {
      for (const name of ['Volume', 'Minimum', 'Empty', 'Owned', 'Far']) await press(page, name, 'End')
      expect(await serverEntries(page, '#plain')).toEqual([['volume', '100'], ['price', '80'], ['price', '80'], ['empty', '100'], ['owned', '100'], ['far', '100']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect.poll(() => values(page, ALL)).toEqual(['60', '20', '80', '5', '100', '25'])
      await expect(page.locator('#owner')).toHaveText('100')
      expect(await serverEntries(page, '#plain')).toEqual([['volume', '60'], ['price', '20'], ['price', '80'], ['empty', '5'], ['owned', '100'], ['far', '25']])
      expect(await fromLeft(thumbIn(page, 'Volume'))).toBe(60)
    })
  }

  test('after a React 19 form action settles, a range is back at its default on screen and in the form', async ({ page }) => {
    const form = page.locator('#action')
    await form.getByRole('slider', { name: 'Minimum' }).focus()
    await page.keyboard.press('Home')
    await form.getByRole('slider', { name: 'Maximum' }).focus()
    await page.keyboard.press('End')
    await form.getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['pick', '0'], ['pick', '100']]])
    await expect.poll(() => form.getByRole('slider').evaluateAll((all) => all.map((el) => el.getAttribute('aria-valuenow')))).toEqual(['10', '90'])
    expect(await serverEntries(page, '#action')).toEqual([['pick', '10'], ['pick', '90']])
  })

  test('with the action\'s answer as the new default, the value stays, on screen and in the form, and is sent again', async ({ page }) => {
    await press(page, 'Again', 'PageUp')
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    // The reset lands after the timeout of the hook: wait for a frame past it before reading the slider.
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    expect(await valueOf(thumbIn(page, 'Again'))).toBe('60')
    expect(await serverEntries(page, '#echo')).toEqual([['again', '60']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['again', '60']], [['again', '60']]])
  })
})

for (const pointer of ['fine', 'coarse'] as const) {
  test.describe(`live: a disabled fieldset, ${pointer} pointer`, () => {
    test.use(pointer === 'coarse' ? COARSE : {})
    test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

    test('the slider dims to half, a press on its track moves nothing, and the form sends nothing', async ({ page }) => {
      await openLive(page, 'separator--horizontal')
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/slider-reset.tsx' })
      await expect(page.locator('#slider-reset')).toHaveAttribute('data-ready', '')
      const input = thumbIn(page, 'Fenced')
      expect(await input.evaluate((el) => getComputedStyle(el.closest('[role="group"]') as Element).opacity)).toBe('0.5')
      const track = await boxOf(trackOf(input))
      const [x, y] = [track.left + track.width * 0.9, track.top + track.height / 2]
      if (pointer === 'fine') await page.mouse.click(x, y)
      else await page.touchscreen.tap(x, y)
      expect([await valueOf(input), await input.inputValue(), await fromLeft(input)]).toEqual(['20', '20', 20])
      expect(await serverEntries(page, '#fenced')).toEqual([])
    })
  })
}

for (const pointer of ['fine', 'coarse'] as const) {
  test.describe(`live: the two ends, ${pointer} pointer`, () => {
    test.use(pointer === 'coarse' ? COARSE : {})
    test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

    for (const direction of DIRECTIONS) {
      for (const rootSize of [16, 32]) {
        test(`${direction}, a ${String(rootSize)} px root: at 0 and at 100 the knob and its focus ring stay inside the slider's box, at every size`, async ({ page }) => {
          await openLive(page, 'separator--horizontal', { direction })
          await page.evaluate((px) => { document.documentElement.style.fontSize = `${String(px)}px` }, rootSize)
          await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/slider-edges.tsx' })
          await expect(page.locator('#slider-edges [data-index]').first()).toBeVisible()
          // How far the ring of each knob, its offset plus its width outside the knob, pokes out of its group: 0 when inside.
          const past = await page.locator('#slider-edges [data-index] > span').evaluateAll((all) => all.map((knob) => {
            const style = getComputedStyle(knob)
            const ring = parseFloat(style.getPropertyValue('--tc-ring-offset')) + parseFloat(style.getPropertyValue('--tc-ring-width'))
            const [k, g] = [knob.getBoundingClientRect(), (knob.closest('[role="group"]') as Element).getBoundingClientRect()]
            return Math.max(0, Math.round((g.left - (k.left - ring)) * 10) / 10, Math.round((k.right + ring - g.right) * 10) / 10)
          }))
          expect(past).toEqual(Array.from({ length: 10 }, () => 0))
        })
      }
    }
  })
}

for (const [width, pointer] of [[320, 'coarse'], [390, 'coarse'], [1280, 'fine'], [1280, 'coarse']] as const) {
  test.describe(`live: showValue, ${String(width)} px, ${pointer} pointer`, () => {
    test.use({ ...(pointer === 'coarse' ? COARSE : {}), viewport: { width, height: 800 } })
    test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

    for (const direction of DIRECTIONS) {
      test(`${direction}: a long value moves below the track instead of eating it; the track holds its thumbs and nothing leaves the slider`, async ({ page }) => {
        await openLive(page, 'separator--horizontal', { direction })
        await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/slider-values.tsx' })
        await expect(page.locator('#slider-values output').first()).toBeVisible()
        const rows = await page.locator('#slider-values [role="group"]').evaluateAll((all) => all.map((group) => {
          const box = (el: Element | null) => el?.getBoundingClientRect() ?? new DOMRect()
          const [g, track, output] = [box(group), box(group.querySelector('[data-index]')?.parentElement ?? null), box(group.querySelector('output'))]
          const thumbs = [...group.querySelectorAll('[data-index]')].reduce((sum, thumb) => sum + thumb.getBoundingClientRect().width, 0)
          const inside = output.left >= g.left - 0.5 && output.right <= g.right + 0.5 && track.left >= g.left - 0.5 && track.right <= g.right + 0.5
          return { holds: track.width > thumbs, inside, overlap: output.top < track.bottom && output.bottom > track.top && output.left < track.right && output.right > track.left }
        }))
        expect(rows).toEqual(Array.from({ length: 5 }, () => ({ holds: true, inside: true, overlap: false })))
        await expectNoSidewaysScroll(page)
      })
    }
  })
}

test.describe('live: where a page puts a slider', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/slider-layouts.tsx' })
    await expect(page.locator('#layouts [data-index]').first()).toBeVisible()
  }
  /** The width of the slider of every single case, and of both sliders of every pair, to a tenth. */
  const widths = (page: Page, selector: string, attribute: string) => page.locator(selector).evaluateAll((all, name) => all.map((holder) => [
    holder.getAttribute(name),
    ...[...holder.querySelectorAll('[role="group"]')].map((group) => Math.round(group.getBoundingClientRect().width * 10) / 10),
  ]), attribute)
  const cases = (page: Page) => widths(page, '#layouts [data-case]', 'data-case')
  const pairs = (page: Page) => widths(page, '#layouts [data-pair]:not([data-pair="ends"])', 'data-pair')
  const inputs = (page: Page) => page.locator('#input-a, #input-b').evaluateAll((all) => all.map((el) => Math.round(el.getBoundingClientRect().width * 10) / 10))
  /** How far each thumb of the two ends pokes out of its slider, in px: 0 when inside. */
  const outside = (page: Page) => page.locator('#layouts [data-pair="ends"] [data-index]').evaluateAll((all) => all.map((thumb) => {
    const [t, r] = [thumb.getBoundingClientRect(), (thumb.closest('[role="group"]') as Element).getBoundingClientRect()]
    return Math.max(0, r.left - t.left, t.right - r.right)
  }))
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: an Input wide in every case and every pair, and 120 px in a 120 px row`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, { direction })
      expect(await cases(page)).toEqual([
        ['grid', 193.2], ['track', 193.2], ['flex-1', 193.2], ['w-fit', 193.2], ['cell', 193.2], ['label-row', 193.2], ['narrow', 120],
      ])
      expect(await pairs(page)).toEqual([['grid', 193.2, 193.2], ['grid-divs', 193.2, 193.2], ['row', 193.2, 193.2], ['row-divs', 193.2, 193.2], ['label', 193.2]])
      expect(await outside(page)).toEqual([0, 0, 0, 0])
      await expectNoSidewaysScroll(page)
    })
  }

  for (const [width, pair, room] of [[320, 140, [200, 199.6, 195.9, 136.8]], [390, 175, [220.8, 220.8, 220.8, 206.8]]] as const) {
    test.describe(`${String(width)} px, coarse pointer`, () => {
      test.use({ ...COARSE, viewport: { width, height: 800 } })

      for (const direction of DIRECTIONS) {
        test(`${direction}: two side by side are as wide as two Inputs, one alone is an Input wide or its room, and nothing scrolls`, async ({ page }) => {
          await fixture(page, { direction })
          expect(await inputs(page)).toEqual([pair, pair])
          const [flex, cell, row, label] = room
          expect(await cases(page)).toEqual([
            ['grid', 220.8], ['track', pair], ['flex-1', flex], ['w-fit', 220.8], ['cell', cell], ['label-row', row], ['narrow', 120],
          ])
          expect(await pairs(page)).toEqual([['grid', pair, pair], ['grid-divs', pair, pair], ['row', pair, pair], ['row-divs', pair, pair], ['label', label]])
          expect(await outside(page)).toEqual([0, 0, 0, 0])
          await expectNoSidewaysScroll(page)
        })
      }
    })
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: axe finds nothing on the hydrated fixture`, async ({ page }) => {
      await fixture(page, { direction })
      const results = await new AxeBuilder({ page }).include('#layouts').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
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

test.describe('the skeleton', () => {
  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      for (const direction of DIRECTIONS) {
        test(`${direction}: is the box of the slider it stands in for at every size: the width, the padded control and the track`, async ({ page }) => {
          await page.goto(urlFor('slider--skeleton', 'light', direction))
          const pairs = await page.locator('[data-pair]').evaluateAll((all) => all.map((pair) => {
            const box = (el: Element | null) => {
              const r = el?.getBoundingClientRect() ?? new DOMRect()
              return [Math.round(r.x * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10]
            }
            const root = pair.querySelector('[role="group"]')
            const control = root?.querySelector('[data-base-ui-swipe-ignore]') ?? null
            const skeleton = pair.querySelector('span[aria-hidden]')
            const inner = skeleton?.querySelector('span') ?? null
            return [pair.getAttribute('data-pair'), [box(root), box(control), box(control?.firstElementChild ?? null)], [box(skeleton), box(inner), box(inner?.querySelector('span') ?? null)]]
          }))
          expect(pairs.map(([name]) => name)).toEqual([...SIZES, 'full'])
          for (const [name, real, skeleton] of pairs) expect(skeleton, String(name)).toEqual(real)
          expect((pairs[0]?.[1] as number[][])[1]?.[2]).toBe(pointer === 'coarse' ? 44 : 24)
        })
      }
    })
  }
})
