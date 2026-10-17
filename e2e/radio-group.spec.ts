import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, pixelsOf, rgbOf } from './pixels.js'

// What happy-dom cannot lay out or press: the target around the circle, the dot inside it, the ring, forced colours,
// the screens, the tab stop before hydration, the arrows in a real browser, and the form, before hydration and after a reset.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['basic', 'form', 'horizontal', 'long-content', 'rtl', 'sizes', 'states'].map((demo) => `radio-group--${demo}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const
const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const

const radioIn = (page: Page, name: string) => page.getByRole('radio', { name, exact: true })
const drawn = (control: Locator) => control.locator(':scope > span')
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
const focusedText = (page: Page) => page.evaluate(() => (document.activeElement?.getAttribute('role') === 'radio' ? document.activeElement.closest('label')?.textContent ?? '' : document.activeElement?.tagName ?? ''))
const checkedIn = (group: Locator) => group.locator('[role="radio"][aria-checked="true"]').evaluateAll((all) => all.map((el) => el.closest('label')?.textContent ?? ''))

/** The target, the drawn circle and the dot, rounded to a tenth, and how far the dot's centre is from the circle's. */
const shape = (control: Locator) => control.evaluate((button) => {
  const box = button.querySelector(':scope > span')?.getBoundingClientRect() ?? new DOMRect()
  const dot = button.querySelector('svg')?.getBoundingClientRect() ?? new DOMRect()
  const target = button.getBoundingClientRect()
  const round = (px: number) => Math.round(px * 10) / 10
  const off = Math.max(Math.abs(dot.x + dot.width / 2 - (box.x + box.width / 2)), Math.abs(dot.y + dot.height / 2 - (box.y + box.height / 2)))
  return { target: [round(target.width), round(target.height)], box: [round(box.width), round(box.height)], dot: [round(dot.width), round(dot.height)], centred: off < 0.1 }
})

/** The colour a value resolves to on this page: a token, or a system colour painted as it is. */
const resolve = (page: Page, value: string) => page.evaluate((colour) => {
  const probe = document.createElement('span')
  probe.style.setProperty('forced-color-adjust', 'none')
  probe.style.backgroundColor = colour
  document.body.appendChild(probe)
  return getComputedStyle(probe).backgroundColor
}, value)

/** A computed colour as the screen paints it: drawn on a canvas and read back, so an oklch token is measured too. */
const painted = (page: Page, colour: string) => page.evaluate((value) => {
  const pen = document.createElement('canvas').getContext('2d')
  if (!pen) throw new Error('no canvas')
  pen.fillStyle = value
  pen.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = pen.getImageData(0, 0, 1, 1).data
  return [r, g, b] as const
}, colour)

test.describe('the five sizes, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  const FINE = {
    xs: { target: [24, 24], box: [14, 14], dot: [6.7, 6.7], centred: true }, sm: { target: [24, 24], box: [16, 16], dot: [7.8, 7.8], centred: true },
    md: { target: [24, 24], box: [20, 20], dot: [10.1, 10.1], centred: true }, lg: { target: [24, 24], box: [24, 24], dot: [12.3, 12.3], centred: true },
    // 56% of the 26 px inside the xl line is 14.56 px; Chromium lays it out on a 1/64 px grid, at 14.546875.
    xl: { target: [28, 28], box: [28, 28], dot: [14.5, 14.5], centred: true },
  }
  const shapes = async (page: Page) => {
    const out: Record<string, Awaited<ReturnType<typeof shape>>> = {}
    for (const size of SIZES) out[size] = await shape(radioIn(page, NAMES[size]))
    return out
  }

  for (const direction of DIRECTIONS) {
    test(`fine pointer, ${direction}: the circle and the dot of each size, centred, in a target of at least 24 px`, async ({ page }) => {
      await page.goto(urlFor('radio-group--sizes', 'light', direction))
      expect(await shapes(page)).toEqual(FINE)
    })
  }

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('the target is 44 x 44 px at every size, and the circle keeps its own size inside it', async ({ page }) => {
      await page.goto(urlFor('radio-group--sizes', 'light', 'ltr'))
      expect(await shapes(page)).toEqual(Object.fromEntries(SIZES.map((size) => [size, { ...FINE[size], target: [44, 44] }])))
    })
  })

  test('the circle is round in every mode: its radius is at least half its side', async ({ page }) => {
    for (const mode of ['light', 'ocean'] as const) {
      await page.goto(urlFor('radio-group--sizes', mode, 'ltr'))
      expect(Number.parseFloat(await css(drawn(radioIn(page, 'Medium')), 'border-top-left-radius')), mode).toBeGreaterThanOrEqual(10)
    }
  })
})

test.describe('the server HTML, before any script runs', () => {
  test('radio-group--form sends plan=pro, and the target spec measures the radios and the button, not the inputs', async ({ page }) => {
    await page.goto(urlFor('radio-group--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['plan', 'pro']])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.getAttribute('role') ?? el.tagName)))
      .toEqual(['radio', 'radio', 'radio', 'BUTTON'])
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab enters the group on its checked radio, the one tab stop, and the next Tab leaves it`, async ({ page }) => {
      await page.goto(urlFor('radio-group--form', 'light', direction))
      await page.keyboard.press('Tab')
      expect(await focusedText(page)).toBe('Pro')
      await page.keyboard.press('Tab')
      expect(await focusedText(page)).toBe('BUTTON')
      await page.keyboard.press('Shift+Tab')
      expect(await focusedText(page)).toBe('Pro')
    })
  }

  test('states: the disabled group has no tab stop, and every other group has one, on its checked radio', async ({ page }) => {
    await page.goto(urlFor('radio-group--states', 'light', 'ltr'))
    const stops: string[] = []
    for (let press = 0; press < 4; press += 1) {
      await page.keyboard.press('Tab')
      stops.push(await focusedText(page))
    }
    expect(stops).toEqual(['Invalid, checked', 'Live, checked', 'Read-only, checked', 'BODY'])
  })
})

test.describe('the states, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  test('checked: the line turns primary and is 2 px; the fill does not change; the dot is primary', async ({ page }) => {
    await page.goto(urlFor('radio-group--basic', 'light', 'ltr'))
    const primary = await resolve(page, 'var(--tc-primary-on-soft)')
    const [on, off] = [drawn(radioIn(page, 'Yearly')), drawn(radioIn(page, 'Monthly'))]
    expect(await css(on, 'border-top-color')).toBe(primary)
    expect(await css(on, 'box-shadow')).toContain(`${primary} 0px 0px 0px 1px inset`)
    expect(await css(on, 'background-color')).toBe(await css(off, 'background-color'))
    expect(await css(off, 'background-color')).toBe(await resolve(page, 'var(--tc-surface-raised)'))
    expect(await css(on.locator('svg'), 'color')).toBe(primary)
    expect(await css(off, 'box-shadow')).not.toContain('inset')
  })

  // RG-1: primary-solid is 2.88:1 on the dark fill, and the old test compared the token in light mode alone.
  for (const mode of MODES) {
    test(`${mode}: the dot and the checked line reach 3:1 on the fill, and the line on the page (R-5.6-4)`, async ({ page }) => {
      await page.goto(urlFor('radio-group--basic', mode, 'ltr'))
      const on = drawn(radioIn(page, 'Yearly'))
      const dot = await painted(page, await css(on.locator('svg'), 'color'))
      const line = await painted(page, await css(on, 'border-top-color'))
      const fill = await painted(page, await css(on, 'background-color'))
      const behind = await painted(page, await resolve(page, 'var(--tc-page)'))
      expect([contrast(dot, fill), contrast(line, fill), contrast(line, behind)].map((ratio) => ratio >= 3)).toEqual([true, true, true])
    })
  }

  test('invalid: every circle of the group turns to danger and is 2 px thick, checked or not', async ({ page }) => {
    await page.goto(urlFor('radio-group--states', 'light', 'ltr'))
    const danger = await resolve(page, 'var(--tc-danger-solid)')
    for (const name of ['Invalid', 'Invalid, checked']) {
      expect(await css(drawn(radioIn(page, name)), 'border-top-color'), name).toBe(danger)
      expect(await css(drawn(radioIn(page, name)), 'box-shadow'), name).toContain(`${danger} 0px 0px 0px 1px inset`)
    }
    expect(await css(drawn(radioIn(page, 'Live')), 'box-shadow')).not.toContain('inset')
  })

  test('disabled: the radio and its text dim to half, a disabled radio alone too, and a live one beside it does not', async ({ page }) => {
    await page.goto(urlFor('radio-group--states', 'light', 'ltr'))
    for (const name of ['Disabled', 'Disabled, checked', 'One disabled']) {
      const control = radioIn(page, name)
      expect([await css(control, 'opacity'), await css(control.locator('xpath=following-sibling::span'), 'opacity')], name).toEqual(['0.5', '0.5'])
    }
    expect(await css(radioIn(page, 'Live'), 'opacity')).toBe('1')
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    /** The pixels of a disc in the middle of the circle, 3 px inside its line, so the line itself is never read. */
    const middle = async (page: Page, control: Locator) => {
      const box = await boxOf(drawn(control))
      const side = Math.round(box.width)
      const pixels = await pixelsOf(page, { x: Math.round(box.left), y: Math.round(box.top), width: side, height: side })
      const radius = side / 2 - 3
      return pixels.filter((_, at) => Math.hypot((at % side) + 0.5 - side / 2, Math.floor(at / side) + 0.5 - side / 2) < radius)
    }

    test('checked differs from unchecked by a dot, not a fill: ink in the middle of a checked circle, none in an empty one', async ({ page }) => {
      await page.goto(urlFor('radio-group--states', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const canvas = FORCED_CANVAS[scheme]
      for (const name of ['Invalid, checked', 'Live, checked', 'Read-only, checked']) expect(inkOn(await middle(page, radioIn(page, name)), canvas), name).toBeGreaterThan(20)
      for (const name of ['Invalid', 'Live', 'Read-only']) expect(inkOn(await middle(page, radioIn(page, name)), canvas), name).toBe(0)
      expect(contrast(rgbOf(await css(drawn(radioIn(page, 'Live')), 'border-top-color')), canvas)).toBeGreaterThanOrEqual(3)
    })

    test('invalid thickens the line to 2 px; disabled dims the radio and its text; no target has an outline at rest', async ({ page }) => {
      await page.goto(urlFor('radio-group--states', 'light', 'ltr'))
      for (const name of ['Invalid', 'Invalid, checked']) expect(await css(drawn(radioIn(page, name)), 'border-top-width'), name).toBe('2px')
      expect(await css(drawn(radioIn(page, 'Live')), 'border-top-width')).toBe('1px')
      for (const name of ['Disabled', 'Disabled, checked', 'One disabled']) expect(await css(radioIn(page, name), 'opacity'), name).toBe('0.5')
      const outlines = await page.locator('#demo [role="radio"]').evaluateAll((all) => all.map((el) => getComputedStyle(el).outlineStyle))
      expect(new Set(outlines)).toEqual(new Set(['none']))
    })
  })
}

test.describe('motion', () => {
  test('the line fades in 150 ms', async ({ page }) => {
    await page.goto(urlFor('radio-group--basic', 'light', 'ltr'))
    const box = drawn(radioIn(page, 'Monthly'))
    expect([await css(box, 'transition-duration'), await css(box, 'transition-property')])
      .toEqual(['0.15s', 'color, background-color, border-color, outline-color, opacity, translate'])
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('nothing fades: the line is primary the moment the radio is pressed', async ({ page }) => {
      await openLive(page, 'radio-group--basic')
      const control = radioIn(page, 'Monthly')
      expect(await css(drawn(control), 'transition-duration')).toBe('0s')
      await control.click()
      expect(await css(drawn(control), 'border-top-color')).toBe(await resolve(page, 'var(--tc-primary-on-soft)'))
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
    test(`${direction}: at a root of 32 px the circle doubles, the dot stays centred, and the text stays beside it`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor('radio-group--basic', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      const control = radioIn(page, 'Yearly')
      expect(await shape(control)).toEqual({ target: [40, 40], box: [40, 40], dot: [21.3, 21.3], centred: true })
      const [box, text] = [await boxOf(control), await boxOf(control.locator('xpath=following-sibling::span'))]
      expect(direction === 'ltr' ? text.left >= box.right : text.right <= box.left).toBe(true)
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: the texts move, the circles keep their size and nothing overlaps', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('radio-group--long-content', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    const rows = await page.locator('#demo label').all()
    expect(rows).toHaveLength(3)
    let above = 0
    for (const row of rows) {
      const control = row.getByRole('radio')
      expect((await shape(control)).box).toEqual([20, 20])
      const [circle, text, label] = [await boxOf(control), await boxOf(row.locator(':scope > span')), await boxOf(row)]
      expect(text.left, 'the text overlaps its circle').toBeGreaterThanOrEqual(circle.right)
      expect(label.top, 'a row overlaps the one above').toBeGreaterThanOrEqual(above)
      above = label.bottom
    }
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: the keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('ltr: Tab enters on the checked radio; the arrows move, select and wrap; Space selects; Tab leaves', async ({ page }) => {
    await openLive(page, 'radio-group--basic')
    const group = page.getByRole('radiogroup')
    await page.keyboard.press('Tab')
    expect(await focusedText(page)).toBe('Yearly')
    const steps: string[] = []
    for (const key of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowLeft']) {
      await page.keyboard.press(key)
      steps.push(`${key}: ${await focusedText(page)} ${(await checkedIn(group)).join()}`)
    }
    expect(steps).toEqual([
      'ArrowDown: Lifetime Lifetime', 'ArrowDown: Monthly Monthly', 'ArrowUp: Lifetime Lifetime',
      'ArrowRight: Monthly Monthly', 'ArrowLeft: Lifetime Lifetime', 'ArrowLeft: Yearly Yearly',
    ])
    await page.keyboard.press('Enter')
    await page.keyboard.press('Home')
    expect(await focusedText(page)).toBe('Yearly')
    await page.keyboard.press('Tab')
    expect(await focusedText(page)).not.toMatch(/Monthly|Yearly|Lifetime/)
    await page.keyboard.press('Shift+Tab')
    expect(await focusedText(page)).toBe('Yearly')
  })

  test('rtl, under the provider: ArrowRight goes to the radio before, ArrowLeft to the one after', async ({ page }) => {
    await openLive(page, 'radio-group--rtl', { direction: 'rtl' })
    const group = page.getByRole('radiogroup')
    await page.keyboard.press('Tab')
    expect(await focusedText(page)).toBe('سنويًا')
    await page.keyboard.press('ArrowRight')
    expect([await focusedText(page), await checkedIn(group)]).toEqual(['شهريًا', ['شهريًا']])
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    expect([await focusedText(page), await checkedIn(group)]).toEqual(['مدى الحياة', ['مدى الحياة']])
    await page.keyboard.press('ArrowLeft')
    expect(await focusedText(page)).toBe('شهريًا')
  })

  test('a disabled radio is skipped by the arrows, and a disabled group is skipped by Tab', async ({ page }) => {
    await openLive(page, 'radio-group--states')
    const group = page.getByRole('radiogroup', { name: 'One disabled' })
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(await focusedText(page)).toBe('Live, checked')
    await page.keyboard.press('ArrowDown')
    expect([await focusedText(page), await checkedIn(group)]).toEqual(['Live', ['Live']])
    await page.keyboard.press('ArrowUp')
    expect(await focusedText(page)).toBe('Live, checked')
  })

  test('the horizontal demo: the same arrows, and Space selects the focused radio', async ({ page }) => {
    await openLive(page, 'radio-group--horizontal')
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowRight')
    expect(await focusedText(page)).toBe('Large')
    await page.keyboard.press('ArrowDown')
    expect(await checkedIn(page.getByRole('radiogroup'))).toEqual(['Extra large'])
  })
})

test.describe('live: pressing it', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a click on the text, and on the circle, each select their radio once`, async ({ page }) => {
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/radio-group-reset.tsx' })
      await expect(page.locator('#radio-group-reset')).toHaveAttribute('data-ready', '')
      await page.getByText('Counted B').click()
      await expect(page.locator('#calls')).toHaveText('b')
      await radioIn(page, 'Counted A').click()
      await expect(page.locator('#calls')).toHaveText('b,a')
      await page.getByText('Counted A').click()
      await expect(page.locator('#calls')).toHaveText('b,a')
    })
  }

  test('an rtl island on an ltr page: each circle sits at the right, before its text', async ({ page }) => {
    await openLive(page, 'radio-group--rtl', { direction: 'ltr' })
    for (const control of await page.locator('#demo [role="radio"]').all()) {
      const [box, text] = [await boxOf(control), await boxOf(control.locator('xpath=following-sibling::span'))]
      expect(box.left).toBeGreaterThanOrEqual(text.right)
    }
  })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring is painted around the circle and not the target, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'radio-group--basic')
        await page.keyboard.press('Tab')
        const control = radioIn(page, 'Yearly')
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
        expect(ring).toEqual({ width: 28, cut: [] })
      })
    })
  }
})

test.describe('live: a form reset', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/radio-group-reset.tsx' })
    await expect(page.locator('#radio-group-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.radioGroupSent?.[name] ?? [], form)
  const checked = (page: Page, name: string) => checkedIn(page.getByRole('radiogroup', { name }))
  // RG-2: the APG tab stop is the checked radio, else the first, and Base UI picks it only on mount.
  const stops = (page: Page, names: string[]) => Promise.all(names.map((name) => page.getByRole('radiogroup', { name })
    .locator('[role="radio"][tabindex="0"]').evaluateAll((all) => all.map((el) => el.closest('label')?.textContent ?? ''))))

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each group is back at its default on screen and in the form; one with none is empty; a controlled one keeps its owner's value`, async ({ page }) => {
      for (const name of ['Plan B', 'Empty B', 'Owned B', 'Far B']) await radioIn(page, name).click()
      expect(await serverEntries(page, '#plain')).toEqual([['plan', 'b'], ['empty', 'b'], ['owned', 'b'], ['far', 'b']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect.poll(() => checked(page, 'Plan')).toEqual(['Plan A'])
      expect([await checked(page, 'Empty'), await checked(page, 'Owned'), await checked(page, 'Far')]).toEqual([[], ['Owned B'], ['Far A']])
      await expect(page.locator('#owner')).toHaveText('b')
      expect(await serverEntries(page, '#plain')).toEqual([['plan', 'a'], ['owned', 'b'], ['far', 'a']])
      expect(await stops(page, ['Plan', 'Empty', 'Owned'])).toEqual([['Plan A'], ['Empty A'], ['Owned B']])
    })
  }

  test('after a React 19 form action settles, the group is back at its default on screen and in the form', async ({ page }) => {
    await radioIn(page, 'Pick B').click()
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['pick', 'b']]])
    await expect.poll(() => checked(page, 'Pick')).toEqual(['Pick A'])
    expect(await serverEntries(page, '#action')).toEqual([['pick', 'a']])
    expect(await stops(page, ['Pick'])).toEqual([['Pick A']])
  })

  test('with the action\'s answer as the new default, the choice stays, on screen and in the form, and is sent again', async ({ page }) => {
    await radioIn(page, 'Again B').click()
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    // The reset lands after the timeout of the hook: wait for a frame past it before reading the group.
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    expect(await checked(page, 'Again')).toEqual(['Again B'])
    expect(await serverEntries(page, '#echo')).toEqual([['again', 'b']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['again', 'b']], [['again', 'b']]])
  })
})

test.describe('live: where a page puts a radio group', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/radio-group-layouts.tsx' })
    await expect(page.locator('#layouts [role="radio"]').first()).toBeVisible()
  }
  /** The first radio of every case, as target and circle sizes. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((holder) => {
    const button = holder.querySelector('[role="radio"]')
    const size = (el: Element | null | undefined) => { const r = el?.getBoundingClientRect() ?? new DOMRect(); return [r.width, r.height] }
    return [holder.getAttribute('data-case'), size(button), size(button?.querySelector(':scope > span'))]
  }))
  const ALL = ['grid', 'track', 'flex-1', 'w-fit', 'cell', 'label-row', 'long', 'horizontal', 'element'] as const
  const expected = (target: number) => ALL.map((name) => {
    const box = name === 'long' ? 16 : 20
    return [name, [target, target], [box, box]]
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: laid straight into a grid the target is 24 x 24 px at the start, and every case keeps its size`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, { direction })
      const [grid, target] = [await boxOf(page.locator('#grid')), await boxOf(radioIn(page, 'First').first())]
      expect([target.width, target.height]).toEqual([24, 24])
      expect(direction === 'ltr' ? target.left - grid.left : grid.right - target.right).toBe(0)
      expect(await cases(page)).toEqual(expected(24))
      await expectNoSidewaysScroll(page)
    })
  }

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: every case is a 44 px target around its own circle, and the page does not scroll sideways`, async ({ page }) => {
        await fixture(page, { direction })
        expect(await cases(page)).toEqual(expected(44))
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
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/radio-group-hostile.tsx' })
    await expect(page.locator('#hostile [role="radio"]').first()).toBeVisible()
  }
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: the long word wraps inside the page, sixty radios wrap, and every target stays 44 px`, async ({ page }) => {
        await fixture(page, { direction })
        await expectNoSidewaysScroll(page)
        const word = await boxOf(page.getByText(/^(Supercalifragilistic)+$/))
        expect(word.right).toBeLessThanOrEqual(320)
        expect(word.left).toBeGreaterThanOrEqual(0)
        const sizes = await page.locator('#hostile [role="radio"]').evaluateAll((all) => [...new Set(all.map((el) => `${String(el.getBoundingClientRect().width)}x${String(el.getBoundingClientRect().height)}`))])
        expect(sizes).toEqual(['44x44'])
        expect(await page.locator('#hostile [role="radio"]').count()).toBe(65)
      })
    }
  })

  test('the empty value is a value: it is checked by default, sent as name=, and a reset of the arrows reaches it', async ({ page }) => {
    await fixture(page)
    expect(await serverEntries(page, '#hostile')).toEqual([['word', 'long'], ['empty', ''], ['sixty', '1']])
    await radioIn(page, 'None').focus()
    await page.keyboard.press('ArrowDown')
    expect(await serverEntries(page, '#hostile')).toEqual([['word', 'long'], ['empty', 'some'], ['sixty', '1']])
    await page.keyboard.press('ArrowUp')
    expect(await serverEntries(page, '#hostile')).toEqual([['word', 'long'], ['empty', ''], ['sixty', '1']])
  })

  test('sixty radios: the last is reached by one ArrowUp from the first, and scrolled into view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 500 })
    await fixture(page)
    await radioIn(page, 'Option 1').focus()
    await page.keyboard.press('ArrowUp')
    const last = radioIn(page, 'Option 60')
    await expect(last).toBeFocused()
    await expect(last).toHaveAttribute('aria-checked', 'true')
    await expect(last).toBeInViewport()
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
