import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { CLIENT_ENTRY } from '../scripts/lib/live-harness.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, inkOn, pixelsOf } from './pixels.js'

// What happy-dom cannot lay out or press: the box at every size and where a page puts it, the steppers as targets, the
// ring, forced colours, the side each stepper takes in each direction, and the form a real browser sends.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['basic', 'form', 'limits', 'row', 'rtl', 'sizes', 'states'].map((demo) => `number-field--${demo}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const

const input = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true })
const groupOf = (field: Locator) => field.locator('xpath=ancestor::*[@role="group"][1]')
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)

/** The width and height of the field, its decrease stepper, its input and its increase stepper, in document order. */
const shape = (field: Locator) => groupOf(field).evaluate((group) => {
  const size = (el: Element | undefined) => { const r = el?.getBoundingClientRect() ?? new DOMRect(); return [Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100] }
  const [decrease, increase] = [...group.querySelectorAll('button')]
  return { field: size(group), decrease: size(decrease), input: size(group.querySelector('input') ?? undefined), increase: size(increase) }
})

/** Left edges of decrease, the input and increase, so the order on screen can be read in each direction. */
const order = (field: Locator) => groupOf(field).evaluate((group) => [...group.querySelectorAll('button, input')]
  .map((el) => [el.getAttribute('aria-label') ?? 'input', el.getBoundingClientRect().left] as const)
  .sort((a, b) => a[1] - b[1]).map(([name]) => name))

test.describe('the five sizes, on the static page', () => {
  const FINE = {
    xs: { field: [165.59, 28], decrease: [28, 28], input: [107.59, 28], increase: [28, 28] },
    sm: { field: [193.19, 32], decrease: [32, 32], input: [127.19, 32], increase: [32, 32] },
    md: { field: [193.19, 40], decrease: [40, 40], input: [111.19, 40], increase: [40, 40] },
    lg: { field: [220.8, 48], decrease: [48, 48], input: [122.8, 48], increase: [48, 48] },
    xl: { field: [220.8, 56], decrease: [56, 56], input: [106.8, 56], increase: [56, 56] },
  }
  const shapes = async (page: Page) => Object.fromEntries(await Promise.all(SIZES.map(async (size) => [size, await shape(input(page, NAMES[size]))] as const)))

  for (const direction of DIRECTIONS) {
    test(`fine pointer, ${direction}: the field, its square steppers and the number between them, at each size`, async ({ page }) => {
      await page.goto(urlFor('number-field--sizes', 'light', direction))
      expect(await shapes(page)).toEqual(FINE)
    })
  }

  test('each size is as wide as an Input of that size', async ({ page }) => {
    const widths = [165.59, 193.19, 193.19, 220.8, 220.8]
    await page.goto(urlFor('input--sizes', 'light', 'ltr'))
    expect(await page.locator('#demo input').evaluateAll((all) => all.map((el) => Math.round(el.getBoundingClientRect().width * 100) / 100))).toEqual(widths)
    await page.goto(urlFor('number-field--sizes', 'light', 'ltr'))
    expect(Object.values(await shapes(page)).map(({ field }) => field[0])).toEqual(widths)
  })

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('every stepper and the input are 44 px tall at least, and the text typed into is 16 px', async ({ page }) => {
      await page.goto(urlFor('number-field--sizes', 'light', 'ltr'))
      const at = (side: number, input: number) => ({ field: [220.8, side], decrease: [side, side], input: [input, side], increase: [side, side] })
      expect(await shapes(page)).toEqual({ xs: at(44, 130.8), sm: at(44, 130.8), md: at(44, 130.8), lg: at(48, 122.8), xl: at(56, 106.8) })
      expect(await page.locator('#demo input[type="text"]').evaluateAll((all) => all.map((el) => getComputedStyle(el).fontSize))).toEqual(Array(5).fill('16px'))
    })

    test('number-field--row at 320 px: the two fields are 124 px each and the page does not scroll sideways', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor('number-field--row', 'light', 'ltr'))
      expect([(await shape(input(page, 'Adults'))).field[0], (await shape(input(page, 'Children'))).field[0]]).toEqual([124, 124])
      await expectNoSidewaysScroll(page)
      await page.setViewportSize({ width: 390, height: 844 })
      expect((await shape(input(page, 'Adults'))).field[0]).toBe(159)
    })
  })
})

test.describe('what the server HTML sends, before any script runs', () => {
  test('the plain number of each named field, never the formatted text', async ({ page }) => {
    await page.goto(urlFor('number-field--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['guests', '2']])
    await page.goto(urlFor('number-field--rtl', 'light', 'rtl'))
    expect(await page.locator('#demo input[type="number"]').evaluateAll((all) => all.map((el) => [(el as HTMLInputElement).name, (el as HTMLInputElement).value])))
      .toEqual([['change', '-5'], ['guests', '1234.5']])
  })
})

test.describe('the look of each state, on the static page', () => {
  test('disabled: the box is at 0.5 and a stepper inside it at 1, so each is painted once at half', async ({ page }) => {
    await page.goto(urlFor('number-field--states', 'light', 'ltr'))
    const group = groupOf(input(page, 'Disabled'))
    expect([await css(group, 'opacity'), ...await group.locator('button').evaluateAll((all) => all.map((el) => getComputedStyle(el).opacity))]).toEqual(['0.5', '1', '1'])
  })

  test('at max in a live field the increase stepper is at 0.5, decrease at 1', async ({ page }) => {
    await page.goto(urlFor('number-field--limits', 'light', 'ltr'))
    const group = groupOf(input(page, 'Seats'))
    expect([await css(group, 'opacity'), ...await group.locator('button').evaluateAll((all) => all.map((el) => getComputedStyle(el).opacity))]).toEqual(['1', '1', '0.5'])
  })

  test('read-only: both steppers at 0.5, the box tinted, and the pointer paints no hover on a stepper', async ({ page }) => {
    await page.goto(urlFor('number-field--states', 'light', 'ltr'))
    const group = groupOf(input(page, 'Read-only'))
    expect(await group.locator('button').evaluateAll((all) => all.map((el) => getComputedStyle(el).opacity))).toEqual(['0.5', '0.5'])
    expect(await css(group, 'background-color')).not.toBe(await css(groupOf(input(page, 'Invalid')), 'background-color'))
    const plus = group.getByRole('button', { name: 'Increase' })
    const before = await css(plus, 'background-color')
    await page.mouse.move(0, 0)
    const box = await boxOf(plus)
    await page.mouse.move(box.left + box.width / 2, box.top + box.height / 2)
    expect(await css(plus, 'background-color')).toBe(before)
  })

  test('invalid: the line of the box turns to danger and is 2 px thick', async ({ page }) => {
    await page.goto(urlFor('number-field--states', 'light', 'ltr'))
    const danger = await page.evaluate(() => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--tc-danger-solid)'
      document.body.appendChild(probe)
      return getComputedStyle(probe).color
    })
    const group = groupOf(input(page, 'Invalid'))
    expect(await css(group, 'border-top-color')).toBe(danger)
    expect(await css(group, 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    expect(await css(groupOf(input(page, 'Empty')), 'box-shadow')).not.toContain('inset')
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    /** How many pixels of an element's box stand 3:1 off Canvas, a few px inside its edges. */
    const ink = async (page: Page, element: Locator) => {
      const box = await boxOf(element)
      return inkOn(await pixelsOf(page, { x: Math.round(box.left + 3), y: Math.round(box.top + 3), width: Math.round(box.width - 6), height: Math.round(box.height - 6) }), FORCED_CANVAS[scheme])
    }

    test('the box keeps its line, invalid thickens it to 2 px, and a stepper at its limit has less ink than a live one', async ({ page }) => {
      await page.goto(urlFor('number-field--limits', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const group = groupOf(input(page, 'Seats'))
      expect(await css(group, 'border-top-style')).toBe('solid')
      const [minus, plus] = [group.getByRole('button', { name: 'Decrease' }), group.getByRole('button', { name: 'Increase' })]
      expect(await ink(page, minus)).toBeGreaterThan(10)
      expect(await ink(page, plus)).toBeLessThan(await ink(page, minus))
      await page.goto(urlFor('number-field--states', 'light', 'ltr'))
      expect(await css(groupOf(input(page, 'Invalid')), 'border-top-width')).toBe('2px')
      expect(await css(groupOf(input(page, 'Empty')), 'border-top-width')).toBe('1px')
    })
  })
}

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
  for (const width of [390, 1280]) {
    test(`at a root of 32 px and ${String(width)} px the field doubles, and the number still fits its input`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(urlFor('number-field--basic', 'light', 'rtl'))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      const typed = input(page, 'Guests')
      expect((await shape(typed)).decrease).toEqual([80, 80])
      expect(await typed.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
      await expectNoSidewaysScroll(page)
    })
  }

  test('WCAG 1.4.12 spacing: the field keeps its size and the label does not overlap it', async ({ page }) => {
    await page.goto(urlFor('number-field--basic', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    const field = input(page, 'Guests')
    expect((await shape(field)).field).toEqual([193.19, 40])
    expect((await boxOf(page.locator('label'))).bottom).toBeLessThanOrEqual((await boxOf(groupOf(field))).top)
  })
})

test.describe('live: steppers, typing and the keys', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('a click on each stepper moves by one, and the form sends what the screen shows', async ({ page }) => {
    await openLive(page, 'number-field--form')
    const field = input(page, 'Guests')
    await page.getByRole('button', { name: 'Increase' }).click()
    await page.getByRole('button', { name: 'Increase' }).click()
    await expect(field).toHaveValue('4')
    await page.getByRole('button', { name: 'Decrease' }).click()
    await expect(field).toHaveValue('3')
    expect(await serverEntries(page)).toEqual([['guests', '3']])
  })

  test('typing past max is lowered to it on blur, and the steppers are not tab stops', async ({ page }) => {
    await openLive(page, 'number-field--form')
    await page.keyboard.press('Tab')
    const field = input(page, 'Guests')
    await expect(field).toBeFocused()
    await field.fill('250')
    await page.keyboard.press('Tab')
    await expect(field).toHaveValue('8')
    await expect(page.getByRole('button', { name: 'Book' })).toBeFocused()
    expect(await serverEntries(page)).toEqual([['guests', '8']])
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: ArrowUp increases, ArrowDown decreases, Home and End go to min and max`, async ({ page }) => {
      await openLive(page, 'number-field--basic', { direction })
      const field = input(page, 'Guests')
      await field.focus()
      await page.keyboard.press('ArrowUp')
      await expect(field).toHaveValue('3')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await expect(field).toHaveValue('1')
      await page.keyboard.press('End')
      await expect(field).toHaveValue('8')
      await page.keyboard.press('Home')
      await expect(field).toHaveValue('1')
    })
  }

  test('ar-u-nu-arab: Arabic-Indic digits are typed and shown, a pasted 1,234.5 is 1234.5, and the form gets the plain number', async ({ page }) => {
    await openLive(page, 'number-field--rtl', { direction: 'rtl' })
    const field = input(page, 'عدد الضيوف')
    await field.fill('٤٢')
    await page.keyboard.press('Tab')
    await expect(field).toHaveValue('٤٢')
    await field.selectText()
    // The clipboard needs a focused window, which a parallel run does not promise: the event carries the text instead.
    await field.evaluate((el) => {
      const data = new DataTransfer()
      data.setData('text/plain', '1,234.5')
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
    })
    await page.keyboard.press('Tab')
    await expect(field).toHaveValue('١٬٢٣٤٫٥')
    expect(await page.locator('input[name="guests"]').inputValue()).toBe('1234.5')
  })

  test('ar-u-nu-arab: a Latin 1,234 typed on the keyboard is 1234 once the field is left, on screen and in the form, not 1', async ({ page }) => {
    await openLive(page, 'number-field--rtl', { direction: 'rtl' })
    const field = input(page, 'عدد الضيوف')
    await field.click()
    await field.selectText()
    await page.keyboard.type('1,234')
    await expect(field).toHaveValue('1,234')
    await page.keyboard.press('Tab')
    await expect(field).toHaveValue('١٬٢٣٤')
    expect(await page.locator('input[name="guests"]').inputValue()).toBe('1234')
  })

  for (const direction of DIRECTIONS) {
    test(`the rtl demo on a ${direction} page: increase at the left, and a typed negative number keeps its sign at the left`, async ({ page }) => {
      await openLive(page, 'number-field--rtl', { direction })
      const field = input(page, 'الفرق')
      expect(await order(field)).toEqual(['زيادة', 'input', 'إنقاص'])
      await field.fill('-7')
      await expect(field).toHaveValue('-7')
      const box = await boxOf(field)
      const clip = { x: Math.round(box.left), y: Math.round(box.top + 4), width: Math.round(box.width), height: Math.round(box.height - 8) }
      const pixels = await pixelsOf(page, clip)
      const backdrop = pixels[0] ?? [255, 255, 255]
      const columns = Array.from({ length: clip.width }, (_, x) => Array.from({ length: clip.height }, (_, y) => pixels[y * clip.width + x] ?? backdrop).filter((p) => contrast(p, backdrop) >= 3).length)
      // Runs of inked columns, left to right: a minus is a run no column of which is over 3 px tall, a 7 has its stem.
      const runs: number[][] = []
      columns.forEach((count, x) => {
        if (count === 0) return
        if (!columns[x - 1]) runs.push([])
        runs.at(-1)?.push(count)
      })
      expect(runs.map((run) => Math.max(...run) > 3 ? 'digit' : 'sign')).toEqual(['sign', 'digit'])
    })
  }

  test('basic on an ltr page: decrease at the left', async ({ page }) => {
    await openLive(page, 'number-field--basic')
    expect(await order(input(page, 'Guests'))).toEqual(['Decrease', 'input', 'Increase'])
  })

  test('typed before a late script, the number is replaced by the default once the page hydrates, and the form holds the default', async ({ page }) => {
    let release: () => void = () => undefined
    const held = new Promise<void>((done) => { release = done })
    await page.route(`**${CLIENT_ENTRY}*`, async (route) => { await held; await route.continue() })
    // Not 'load' nor DOMContentLoaded: both wait for the module script this route holds back.
    await page.goto(liveUrl('number-field--form'), { waitUntil: 'commit' })
    const field = input(page, 'Guests')
    await field.fill('7')
    expect(await field.inputValue()).toBe('7')
    release()
    await page.waitForFunction(() => document.documentElement.dataset['harness'] === 'hydrated')
    await expect(field).toHaveValue('2')
    await page.keyboard.press('Tab')
    await expect(field).toHaveValue('2')
    expect(await serverEntries(page)).toEqual([['guests', '2']])
  })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('the ring is painted around the whole field while the input has the focus, and no parent cuts it', async ({ page }) => {
        await openLive(page, 'number-field--basic')
        await page.keyboard.press('Tab')
        const field = input(page, 'Guests')
        await expect(field).toBeFocused()
        expect(await css(field, 'outline-style')).toBe('none')
        const group = groupOf(field)
        expect([await css(group, 'outline-style'), await css(group, 'outline-width'), await css(group, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
        const cut = await group.evaluate((el) => {
          const r = el.getBoundingClientRect()
          const ring = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
          const out: string[] = []
          for (let up = el.parentElement; up; up = up.parentElement) {
            const style = getComputedStyle(up)
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const clip = up.getBoundingClientRect()
            if (ring.left < clip.left || ring.top < clip.top || ring.right > clip.right || ring.bottom > clip.bottom) out.push(up.tagName)
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
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/number-field-reset.tsx' })
    await expect(page.locator('#number-field-reset')).toHaveAttribute('data-ready', '')
  })
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const sent = (page: Page, form: string) => page.evaluate((name) => window.numberFieldSent?.[name] ?? [], form)
  const step = (page: Page, name: string) => groupOf(input(page, name)).getByRole('button', { name: 'Increase' }).click()

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, each field is back at its default on screen and in the form, and a controlled one keeps its owner's value`, async ({ page }) => {
      for (const name of ['Guests', 'Rooms', 'Owned', 'Far']) await step(page, name)
      expect(await serverEntries(page, '#plain')).toEqual([['guests', '3'], ['rooms', '0'], ['owned', '6'], ['far', '2']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect(input(page, 'Guests')).toHaveValue('2')
      expect([await input(page, 'Rooms').inputValue(), await input(page, 'Owned').inputValue(), await input(page, 'Far').inputValue()]).toEqual(['', '6', '1'])
      await expect(page.locator('#owner')).toHaveText('6')
      expect(await serverEntries(page, '#plain')).toEqual([['guests', '2'], ['rooms', ''], ['owned', '6'], ['far', '1']])
    })
  }

  test('a number typed and still focused is put back by form.reset(), and stays back after a blur', async ({ page }) => {
    const field = input(page, 'Guests')
    await field.fill('7')
    await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
    await expect(field).toHaveValue('2')
    await expect(field).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(field).toHaveValue('2')
    expect(await serverEntries(page, '#plain')).toEqual([['guests', '2'], ['rooms', ''], ['owned', '5'], ['far', '1']])
  })

  test('after a React 19 form action settles, the field is back at its default on screen and in the form', async ({ page }) => {
    await step(page, 'Seats')
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent(page, 'action')).toEqual([[['seats', '2']]])
    await expect(input(page, 'Seats')).toHaveValue('1')
    expect(await serverEntries(page, '#action')).toEqual([['seats', '1']])
  })

  test('with the action\'s answer as the new default, the field keeps the number, on screen and in the form, and sends it again', async ({ page }) => {
    await step(page, 'Seats again')
    const send = page.locator('#echo').getByRole('button', { name: 'Send' })
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toHaveLength(1)
    // The reset lands after the timeout of the hook: wait for a frame past it before reading the field.
    await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
    expect(await input(page, 'Seats again').inputValue()).toBe('2')
    expect(await serverEntries(page, '#echo')).toEqual([['seats', '2']])
    await send.click()
    await expect.poll(() => sent(page, 'echo')).toEqual([[['seats', '2']], [['seats', '2']]])
  })
})

test.describe('live: where a page puts a number field', () => {
  const fixture = async (page: Page, name: string, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: `/e2e/fixtures/${name}.tsx` })
    await expect(page.locator('[role="group"]').first()).toBeVisible()
  }
  /** Every field of the fixture by its case, as widths: an Input of the pair-input case counts as a field. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((box) => [
    box.getAttribute('data-case'),
    ...[...box.querySelectorAll('[role="group"], [data-case="pair-input"] input')].map((el) => Math.round(el.getBoundingClientRect().width * 100) / 100),
  ]))
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: every case is as wide as an Input, 193.19 px`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, 'number-field-layouts', { direction })
      const one = 193.19
      expect(await cases(page)).toEqual([
        ['grid', one], ['track', one], ['flex-1', one], ['w-fit', one], ['cell', one], ['label-row', one],
        ['pair-grid', one, one], ['pair-flex', one, one], ['pair-div', one, one], ['pair-input', one, one], ['beside-label', one], ['wrapping-label', one],
      ])
      await expectNoSidewaysScroll(page)
    })
  }

  test.describe('coarse pointer', () => {
    test.use(COARSE)

    for (const direction of DIRECTIONS) {
      test(`320 px, ${direction}: two side by side are as wide as two Inputs, each case shrinks to its room, and nothing scrolls`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 480 })
        await fixture(page, 'number-field-layouts', { direction })
        expect(await cases(page)).toEqual([
          ['grid', 220.8], ['track', 140], ['flex-1', 200], ['w-fit', 220.8], ['cell', 205.59], ['label-row', 195.91],
          ['pair-grid', 140, 140], ['pair-flex', 140, 140], ['pair-div', 140, 140], ['pair-input', 140, 140], ['beside-label', 183.44], ['wrapping-label', 220.8],
        ])
        await expectNoSidewaysScroll(page)
      })

      test(`320 px, ${direction}: hostile content keeps every field inside the page, and the largest value is clamped to 1e15`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 480 })
        await fixture(page, 'number-field-hostile', { direction })
        expect(await page.locator('#hostile [role="group"]').evaluateAll((all) => all.map((el) => Math.round(el.getBoundingClientRect().width)))).toEqual([221, 221, 221, 221, 221, 288])
        expect(await page.locator('#hostile input[type="number"][name]').evaluateAll((all) => all.map((el) => [(el as HTMLInputElement).name, (el as HTMLInputElement).value])))
          .toEqual([['empty', ''], ['largest', '1000000000000000'], ['smallest', '-1000000000000000'], ['decimal', '0.3333333333333333']])
        await expectNoSidewaysScroll(page)
      })
    }
  })

  test('a label that wraps the field labels its input, not a stepper: a click on it focuses the input and steps nothing', async ({ page }) => {
    await fixture(page, 'number-field-layouts')
    const label = page.locator('[data-case="wrapping-label"]')
    expect(await label.evaluate((node) => (node as HTMLLabelElement).control?.tagName)).toBe('INPUT')
    await label.getByText('Inside a label').click()
    const field = page.getByRole('textbox', { name: 'Wrapped by a label' })
    await expect(field).toBeFocused()
    await expect(field).toHaveValue('12')
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}: axe finds nothing on the hydrated fixtures`, async ({ page }) => {
      for (const name of ['number-field-layouts', 'number-field-hostile']) {
        await fixture(page, name, { direction })
        const results = await new AxeBuilder({ page }).include(name === 'number-field-layouts' ? '#layouts' : '#hostile').analyze()
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`), name).toEqual([])
      }
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

