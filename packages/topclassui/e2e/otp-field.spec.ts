import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { TARGETS } from '../scripts/lib/targets.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out or type: the cells at each size and screen, the row that wraps, the group at the start
// of an Arabic form, the ring, forced colours, the tab stop before hydration, the keys and a paste in a real browser,
// and the form, before hydration and after a reset.

const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['basic', 'form', 'grouped', 'long', 'playground', 'rtl', 'sizes', 'states'].map((demo) => `otp-field--${demo}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const

const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
/** Each field of the demo: the distinct boxes of its cells, its type size, and its rows of cells. */
const fields = (page: Page) => page.locator('#demo [role="group"]').evaluateAll((all) => all.map((group) => {
  const cells = [...group.querySelectorAll('input')].map((cell) => cell.getBoundingClientRect())
  const sizes = [...new Set(cells.map((r) => `${String(Math.round(r.width * 10) / 10)}x${String(Math.round(r.height * 10) / 10)}`))]
  const rows = [...new Set(cells.map((r) => Math.round(r.top)))].map((top) => cells.filter((r) => Math.round(r.top) === top).length)
  return { cells: sizes.join(' '), font: getComputedStyle(group.querySelector('input') as Element).fontSize, rows: rows.join('+') }
}))
/** Where the focus is: a cell by its index in its field, or the tag of anything else. */
const focused = (page: Page) => page.evaluate(() => {
  const active = document.activeElement
  const group = active?.closest('[role="group"]')
  return group ? [...group.querySelectorAll('input')].indexOf(active as HTMLInputElement) : active?.tagName ?? ''
})
const code = (group: Locator) => group.locator('input').evaluateAll((all) => all.map((cell) => (cell as HTMLInputElement).value || '_').join(''))

/** The colour a value resolves to on this page: a token, or a system colour painted as it is. */
const resolve = (page: Page, value: string) => page.evaluate((colour) => {
  const probe = document.createElement('span')
  probe.style.setProperty('forced-color-adjust', 'none')
  probe.style.backgroundColor = colour
  document.body.appendChild(probe)
  return getComputedStyle(probe).backgroundColor
}, value)

/** Any computed colour as numbers, through a canvas: the tokens compute to oklch(), which rgbOf cannot read. */
const toRgb = (page: Page, colour: string) => page.evaluate((value): [number, number, number] => {
  const pen = document.createElement('canvas').getContext('2d')
  if (!pen) throw new Error('no canvas')
  pen.fillStyle = value
  pen.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = pen.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}, colour)

test.describe('the five sizes, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const direction of DIRECTIONS) {
    test(`fine pointer, ${direction}: one control step taller than wide at each size, with its type step`, async ({ page }) => {
      await page.goto(urlFor('otp-field--sizes', 'light', direction))
      expect(await fields(page)).toEqual([
        { cells: '28x32', font: '14px', rows: '6' }, { cells: '32x40', font: '16px', rows: '6' }, { cells: '40x48', font: '18px', rows: '6' },
        { cells: '48x56', font: '20px', rows: '6' }, { cells: '56x64', font: '24px', rows: '6' },
      ])
    })
  }

  test.describe('under a coarse pointer, at 390 px', () => {
    test.use(COARSE)

    test('every cell is at least 44 x 44 px, the small three 44 wide, and typed text is never under 16 px', async ({ page }) => {
      await page.goto(urlFor('otp-field--sizes', 'light', 'ltr'))
      expect(await fields(page)).toEqual([
        { cells: '44x44', font: '16px', rows: '6' }, { cells: '44x44', font: '16px', rows: '6' }, { cells: '44x48', font: '18px', rows: '6' },
        // Six cells of 48 or 56 px do not fit 326 px: the cells give up width down to 44, never height.
        { cells: '47.7x56', font: '20px', rows: '6' }, { cells: '47.7x64', font: '24px', rows: '6' },
      ])
    })
  })
})

test.describe('phones, on the static page', () => {
  test.use({ ...COARSE, reducedMotion: 'reduce' })

  for (const direction of DIRECTIONS) {
    test(`${direction}, 390 px: six cells are 44 x 48 px, with a separator too, and twelve wrap 6 + 6`, async ({ page }) => {
      for (const [demo, rows] of [['basic', '6'], ['grouped', '6'], ['long', '6+6']] as const) {
        await page.goto(urlFor(`otp-field--${demo}`, 'light', direction))
        expect(await fields(page), demo).toEqual([{ cells: '44x48', font: '18px', rows }])
        await expectNoSidewaysScroll(page)
      }
    })

    test(`${direction}, 320 px: cells keep 44 px of width under a finger (R-5.6-2), so six wrap 5 + 1, 4 + 2 with a separator, and twelve 5 + 5 + 2`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      for (const [demo, cells, rows] of [['basic', '44x48', '5+1'], ['grouped', '44x48', '4+2'], ['long', '44x48', '5+5+2']] as const) {
        await page.goto(urlFor(`otp-field--${demo}`, 'light', direction))
        expect(await fields(page), demo).toEqual([{ cells, font: '18px', rows }])
        await expectNoSidewaysScroll(page)
      }
    })
  }
})

test.describe('left to right, in an Arabic form', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction} page: the group ends at the inline start of its block, and its cells run left to right`, async ({ page }) => {
      await page.goto(urlFor('otp-field--rtl', 'light', direction))
      const group = page.locator('#demo [role="group"]')
      const [box, parent] = [await boxOf(group), await boxOf(group.locator('xpath=..'))]
      expect([box.left, box.right, parent.right]).toEqual([953, 1233, 1233])
      const lefts = await group.locator('input').evaluateAll((all) => all.map((cell) => cell.getBoundingClientRect().left))
      expect(lefts).toEqual([953, 1001, 1049, 1097, 1145, 1193])
    })
  }
})

test.describe('the server HTML, before any script runs', () => {
  test('otp-field--form sends code=, and the target spec measures the six cells and the button, not the hidden input', async ({ page }) => {
    await page.goto(urlFor('otp-field--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['code', '']])
    expect(await page.locator(`#demo :is(${TARGETS})`).evaluateAll((all) => all.map((el) => el.tagName)))
      .toEqual(['INPUT', 'INPUT', 'INPUT', 'INPUT', 'INPUT', 'INPUT', 'BUTTON'])
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: Tab enters the field on its one tab stop, and the next Tab leaves it`, async ({ page }) => {
      await page.goto(urlFor('otp-field--form', 'light', direction))
      await page.keyboard.press('Tab')
      expect(await focused(page)).toBe(0)
      await page.keyboard.press('Tab')
      expect(await focused(page)).toBe('BUTTON')
    })
  }

  test('sizes: the tab stop of a field with a default is its first empty cell', async ({ page }) => {
    await page.goto(urlFor('otp-field--sizes', 'light', 'ltr'))
    await page.keyboard.press('Tab')
    expect(await focused(page)).toBe(3)
  })
})

test.describe('the states, on the static page', () => {
  test.use({ reducedMotion: 'reduce' })

  test('invalid: every cell turns to danger and is 2 px thick; read-only looks like a live field; disabled dims to half', async ({ page }) => {
    await page.goto(urlFor('otp-field--states', 'light', 'ltr'))
    const danger = await resolve(page, 'var(--tc-danger-solid)')
    const line = await resolve(page, 'var(--tc-line-strong)')
    const [invalid, disabled, readOnly] = await page.locator('#demo [role="group"]').all()
    for (const cell of await (invalid as Locator).locator('input').all()) {
      expect(await css(cell, 'border-top-color')).toBe(danger)
      expect(await css(cell, 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    }
    const plain = (readOnly as Locator).locator('input').first()
    expect([await css(plain, 'border-top-color'), await css(plain, 'opacity')]).toEqual([line, '1'])
    expect(await css(plain, 'box-shadow')).not.toContain('inset')
    expect(await (disabled as Locator).locator('input').evaluateAll((all) => all.map((cell) => getComputedStyle(cell).opacity))).toEqual(['0.5', '0.5', '0.5', '0.5', '0.5', '0.5'])
  })

  test('the line of a cell is 3:1 against the page, and the separator is the strong line', async ({ page }) => {
    await page.goto(urlFor('otp-field--grouped', 'light', 'ltr'))
    const cell = page.locator('#demo input').first()
    const [line, ground] = [await toRgb(page, await css(cell, 'border-top-color')), await toRgb(page, await resolve(page, 'var(--tc-page)'))]
    expect(contrast(line, ground)).toBeGreaterThanOrEqual(3)
    const bar = page.locator('#demo [role="group"] > span')
    expect([await css(bar, 'background-color'), (await boxOf(bar)).width, (await boxOf(bar)).height]).toEqual([await resolve(page, 'var(--tc-line-strong)'), 10, 2])
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    /** The pixels inside a cell, 4 px inside its line, so the line itself is never read. */
    const inside = async (page: Page, cell: Locator) => {
      const box = await boxOf(cell)
      return pixelsOf(page, { x: Math.round(box.left) + 4, y: Math.round(box.top) + 4, width: Math.round(box.width) - 8, height: Math.round(box.height) - 8 })
    }

    test('a filled cell differs from an empty one by its digit, not a fill; invalid thickens the line; the bar keeps its ink', async ({ page }) => {
      await page.goto(urlFor('otp-field--sizes', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const canvas = FORCED_CANVAS[scheme]
      const cells = page.locator('#demo [role="group"]').nth(2).locator('input')
      expect(inkOn(await inside(page, cells.nth(0)), canvas)).toBeGreaterThan(20)
      expect(inkOn(await inside(page, cells.nth(4)), canvas)).toBe(0)
      expect(contrast(await toRgb(page, await css(cells.nth(4), 'border-top-color')), canvas)).toBeGreaterThanOrEqual(3)

      await page.goto(urlFor('otp-field--states', 'light', 'ltr'))
      const [invalid, , readOnly] = await page.locator('#demo [role="group"]').all()
      expect(await css((invalid as Locator).locator('input').first(), 'border-top-width')).toBe('2px')
      expect(await css((readOnly as Locator).locator('input').first(), 'border-top-width')).toBe('1px')

      await page.goto(urlFor('otp-field--grouped', 'light', 'ltr'))
      const bar = await boxOf(page.locator('#demo [role="group"] > span'))
      const ink = await pixelsOf(page, { x: Math.round(bar.left), y: Math.round(bar.top), width: Math.round(bar.width), height: Math.round(bar.height) })
      expect(inkOn(ink, canvas)).toBeGreaterThan(10)
    })
  })
}

test.describe('motion', () => {
  test('the line fades in 150 ms', async ({ page }) => {
    await page.goto(urlFor('otp-field--basic', 'light', 'ltr'))
    const cell = page.locator('#demo input').first()
    expect([await css(cell, 'transition-duration'), await css(cell, 'transition-property')])
      .toEqual(['0.15s', 'color, background-color, border-color, outline-color, opacity, translate'])
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('nothing fades', async ({ page }) => {
      await page.goto(urlFor('otp-field--basic', 'light', 'ltr'))
      expect(await css(page.locator('#demo input').first(), 'transition-duration')).toBe('0s')
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
    // At 320 px the demo's parent is 177 px, under the 224 px floor of six cells and 16 px gaps: the row breaks, never overflows.
    test(`${direction}: at a root of 32 px a cell doubles; at 320 px the row breaks inside its parent and the page does not scroll`, async ({ page }) => {
      await page.goto(urlFor('otp-field--basic', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      expect(await fields(page)).toEqual([{ cells: '80x96', font: '36px', rows: '6' }])
      await page.setViewportSize({ width: 320, height: 480 })
      expect(await fields(page)).toEqual([{ cells: '32.3x96 80x96', font: '36px', rows: '4+2' }])
      const outside = await page.locator('#demo [role="group"]').evaluate((group) => {
        const parent = (group.parentElement as HTMLElement).getBoundingClientRect()
        return [...group.querySelectorAll('input')].filter((cell) => {
          const r = cell.getBoundingClientRect()
          return r.left < parent.left - 0.5 || r.right > parent.right + 0.5
        }).length
      })
      expect(outside, 'cells painted past the parent').toBe(0)
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: the cells keep their size and the labels do not overlap them', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto(urlFor('otp-field--sizes', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    expect((await fields(page)).map((field) => field.cells)).toEqual(['28x32', '32x40', '33.5x48', '33.5x56', '33.5x64'])
    let above = 0
    for (const label of await page.locator('#demo span[id]').all()) {
      const [text, group] = [await boxOf(label), await boxOf(label.locator('xpath=following-sibling::div[1]'))]
      expect(text.top).toBeGreaterThanOrEqual(above)
      expect(group.top).toBeGreaterThanOrEqual(text.bottom)
      above = group.bottom
    }
    await expectNoSidewaysScroll(page)
  })
})

test.describe('live: the keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const [demo, direction] of [['basic', 'ltr'], ['rtl', 'rtl']] as const) {
    test(`${direction}: typing moves on, ArrowLeft goes to the cell before and ArrowRight after, Backspace clears and moves back`, async ({ page }) => {
      await openLive(page, `otp-field--${demo}`, { direction })
      const group = page.locator('#demo [role="group"]')
      await page.keyboard.press('Tab')
      const steps: string[] = []
      for (const key of ['4', '8', '2', 'ArrowLeft', 'ArrowLeft', 'ArrowRight', 'End', 'Backspace', 'Backspace', 'Home', 'Delete']) {
        await page.keyboard.press(key)
        steps.push(`${key}: ${String(await focused(page))} ${await code(group)}`)
      }
      expect(steps).toEqual([
        '4: 1 4_____', '8: 2 48____', '2: 3 482___', 'ArrowLeft: 2 482___', 'ArrowLeft: 1 482___', 'ArrowRight: 2 482___',
        'End: 3 482___', 'Backspace: 2 48____', 'Backspace: 1 4_____', 'Home: 0 4_____', 'Delete: 0 ______',
      ])
      await page.keyboard.press('Tab')
      expect(await focused(page)).not.toBe(0)
    })
  }

  test('an Arabic-Indic and a Persian digit typed in Chromium are stored as 1 and 2, and a letter is refused', async ({ page }) => {
    await openLive(page, 'otp-field--form')
    await page.keyboard.press('Tab')
    await page.keyboard.type('١۲a3')
    expect(await serverEntries(page)).toEqual([['code', '123']])
  })
})

test.describe('live: the label, a paste and the ring', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('a click on the label focuses the first cell', async ({ page }) => {
    await openLive(page, 'otp-field--basic')
    await page.getByText('Verification code').click()
    expect(await focused(page)).toBe(0)
  })

  for (const [what, text] of [['six digits', '482913'], ['digits with spaces, in Arabic-Indic', ' ٤٨٢ ٩١٣ ']] as const) {
    test(`a paste of ${what} fills every cell, and the form sends six ASCII digits`, async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      await openLive(page, 'otp-field--form')
      await page.evaluate((value) => navigator.clipboard.writeText(value), text)
      await page.keyboard.press('Tab')
      await page.keyboard.press('ControlOrMeta+V')
      expect(await code(page.locator('#demo [role="group"]'))).toBe('482913')
      expect([await focused(page), await serverEntries(page)]).toEqual([5, [['code', '482913']]])
    })
  }

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring of a focused cell is painted whole, 2 px at 2 px, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'otp-field--grouped')
        await page.keyboard.press('Tab')
        const cell = page.locator('#demo input').first()
        await expect(cell).toBeFocused()
        expect([await css(cell, 'outline-style'), await css(cell, 'outline-width'), await css(cell, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
        const cut = await cell.evaluate((el) => {
          const r = el.getBoundingClientRect()
          const edge = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
          const out: string[] = []
          for (let up = el.parentElement; up; up = up.parentElement) {
            const style = getComputedStyle(up)
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const clip = up.getBoundingClientRect()
            if (edge.left < clip.left || edge.top < clip.top || edge.right > clip.right || edge.bottom > clip.bottom) out.push(up.tagName)
          }
          return out
        })
        expect(cut).toEqual([])
      })
    })
  }
})

test.describe('live: a form reset', () => {
  test.beforeEach(async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/otp-field-reset.tsx' })
    await expect(page.locator('#otp-field-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.otpFieldSent?.[name] ?? [], form)
  const field = (page: Page, name: string) => page.locator(`[role="group"]:has(input[aria-labelledby="${name.toLowerCase()}-label"])`)
  /** Click the first empty cell of a field, which Base UI focuses whatever cell is clicked, and type. */
  const typeInto = async (page: Page, name: string, keys: string) => {
    await field(page, name).locator('input').last().click()
    await page.keyboard.type(keys)
  }

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each field is back at its default on screen and in the form; a controlled one keeps its owner's value`, async ({ page }) => {
      for (const [name, keys] of [['Plan', '9'], ['Empty', '7'], ['Owned', '3'], ['Far', '9']] as const) await typeInto(page, name, keys)
      expect(await serverEntries(page, '#plain')).toEqual([['plan', '129'], ['empty', '7'], ['owned', '123'], ['far', '129']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect.poll(() => code(field(page, 'Plan'))).toBe('12__')
      expect([await code(field(page, 'Empty')), await code(field(page, 'Owned')), await code(field(page, 'Far'))]).toEqual(['____', '123_', '12__'])
      await expect(page.locator('#owner')).toHaveText('123')
      expect(await serverEntries(page, '#plain')).toEqual([['plan', '12'], ['empty', ''], ['owned', '123'], ['far', '12']])
    })
  }

  test('after a React 19 form action settles, the field is back at its default on screen and in the form', async ({ page }) => {
    await typeInto(page, 'Pick', '9')
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['pick', '129']]])
    await expect.poll(() => code(field(page, 'Pick'))).toBe('12__')
    expect(await serverEntries(page, '#action')).toEqual([['pick', '12']])
  })

  test('with the action\'s answer as the new default, the code stays, on screen and in the form, and is sent again', async ({ page }) => {
    await typeInto(page, 'Again', '9')
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    // The reset lands after the timeout of the hook: wait for a frame past it before reading the field.
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    expect(await code(field(page, 'Again'))).toBe('129_')
    expect(await serverEntries(page, '#echo')).toEqual([['again', '129']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['again', '129']], [['again', '129']]])
  })

  test('autoSubmit sends the field\'s own form, or the one its form attribute names, never the form of a field mounted after it', async ({ page }) => {
    await typeInto(page, 'Auto', '4321')
    await expect.poll(() => sent(page, 'auto')).toEqual([[['auto', '4321']]])
    await typeInto(page, 'Tied', '8765')
    await expect.poll(() => sent(page, 'tied')).toEqual([[['tied', '8765']]])
    expect([await sent(page, 'outer'), await sent(page, 'later')]).toEqual([[], []])
  })
})

test.describe('live: where a page puts a code field', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/otp-field-layouts.tsx' })
    await expect(page.locator('#layouts [role="group"]').first()).toBeVisible()
  }
  /** The distinct cell boxes of the fields in every case, and its lines of cells when a field breaks. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((holder) => {
    const cells = [...holder.querySelectorAll('[role="group"] input')].map((cell) => cell.getBoundingClientRect())
    const lines = [...holder.querySelectorAll('[role="group"]')].map((group) => {
      const tops = [...group.querySelectorAll('input')].map((cell) => Math.round(cell.getBoundingClientRect().top))
      return [...new Set(tops)].map((top) => tops.filter((t) => t === top).length).join('+')
    })
    const broken = lines.some((line) => line.includes('+')) ? ` in ${[...new Set(lines)].join(' ')}` : ''
    return `${holder.getAttribute('data-case') ?? ''}: ${[...new Set(cells.map((r) => `${String(Math.round(r.width * 10) / 10)}x${String(r.height)}`))].join(' ')}${broken}`
  }))
  /** Every cell painted outside its own group, or over the text that names a field. */
  const strays = (page: Page) => page.locator('#layouts [role="group"]').evaluateAll((groups) => groups.flatMap((group) => {
    const box = group.getBoundingClientRect()
    const label = document.getElementById(group.querySelector('input')?.getAttribute('aria-labelledby') ?? '')?.getBoundingClientRect()
    return [...group.querySelectorAll('input')].flatMap((cell, index) => {
      const r = cell.getBoundingClientRect()
      const outside = r.left < box.left - 0.5 || r.right > box.right + 0.5 || r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5
      const over = label !== undefined && r.left < label.right - 0.5 && r.right > label.left + 0.5 && r.top < label.bottom - 0.5 && r.bottom > label.top + 0.5
      return [outside ? `${group.getAttribute('aria-labelledby') ?? ''} cell ${String(index + 1)} outside its group` : '', over ? `${group.getAttribute('aria-labelledby') ?? ''} cell ${String(index + 1)} over its label` : ''].filter(Boolean)
    })
  }))
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: every case holds six cells of 40 x 48 px`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, { direction })
      expect(await cases(page)).toEqual(['block', 'grid', 'track', 'flex-column', 'label-row', 'flex-1', 'w-fit', 'cell', 'auto-1fr', 'pair', 'halves', 'halves-direct'].map((name) => `${name}: 40x48`))
      expect(await strays(page)).toEqual([])
      await expectNoSidewaysScroll(page)
    })
  }

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      // 288 px inside the fixture's padding: six cells of 44 px and their gaps are 304 px, so every case wraps, never under 44 px a cell.
      test(`${direction}: every cell keeps 44 px of width and its height, inside its group, and the page does not scroll sideways`, async ({ page }) => {
        await fixture(page, { direction })
        expect(await cases(page)).toEqual([
          'block: 44x48 in 5+1', 'grid: 44x48 in 5+1', 'track: 44x48 in 2+2+2', 'flex-column: 44x48 in 5+1', 'label-row: 44x48 in 4+2', 'flex-1: 44x48 in 4+2',
          'w-fit: 44x48 in 5+1', 'cell: 44x48 in 4+2', 'auto-1fr: 44x48 in 3+3', 'pair: 44x48 in 5+1', 'halves: 44x48 in 2+2+2', 'halves-direct: 44x48 in 2+2+2',
        ])
        expect(await strays(page)).toEqual([])
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
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/otp-field-hostile.tsx' })
    await expect(page.locator('#hostile [role="group"]').first()).toBeVisible()
  }
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: the long word wraps inside the page, a length of 99 is twelve cells that wrap, and nothing scrolls sideways`, async ({ page }) => {
        await fixture(page, { direction })
        await expectNoSidewaysScroll(page)
        const word = await boxOf(page.locator('#hostile-long'))
        expect([word.left >= 0, word.right <= 320]).toEqual([true, true])
        const many = page.locator('#hostile [role="group"]').last()
        expect([await many.locator('input').count(), await many.locator('span').count()]).toEqual([12, 0])
        const sizes = await page.locator('#hostile [role="group"] input').evaluateAll((all) => [...new Set(all.map((el) => el.getBoundingClientRect().height))])
        expect(sizes).toEqual([48])
      })
    }
  })

  test('a default longer than the field is cut, one of letters and Arabic-Indic digits keeps its digits, an empty one sends name=', async ({ page }) => {
    await fixture(page)
    expect(await serverEntries(page, '#hostile')).toEqual([['long', '999999'], ['empty', ''], ['mixed', '482'], ['many', '']])
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
