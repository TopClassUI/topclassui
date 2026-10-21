import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { CLIENT_ENTRY } from '../scripts/lib/live-harness.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'

// What happy-dom cannot lay out or type: the box at every size and where a page puts it, the rows that follow the
// text, the counter at the cap, the ring, forced colours, the screens, and the form with no script, after one and late.

const SIZES = ['Extra small', 'Small', 'Medium', 'Large', 'Extra large'] as const
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['autosize', 'basic', 'form', 'long-content', 'playground', 'row', 'rtl', 'show-count', 'sizes', 'skeleton', 'states'].map((name) => `textarea--${name}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const

const field = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true })
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
/** Width and height to a tenth of a pixel. */
const sizeOf = async (element: Locator) => { const { width, height } = await boxOf(element); return [width, height] }
/** The counter a field names as its description: what is seen, and its limit state. */
const counterOf = (element: Locator) => element.evaluate((el) => {
  const counter = document.getElementById(el.getAttribute('aria-describedby')?.split(' ').at(-1) ?? '')
  const shown = counter !== null && getComputedStyle(counter).display !== 'none'
  return { seen: shown ? counter.querySelector('[aria-hidden]')?.textContent ?? '' : '(hidden)', at: counter?.hasAttribute('data-at-limit') ?? false }
})
const resolved = (page: Page, value: string) => page.evaluate((colour) => {
  const probe = document.createElement('span')
  probe.style.color = colour
  document.body.appendChild(probe)
  return getComputedStyle(probe).color
}, value)

test.describe('the five sizes, on the static page', () => {
  test('fine pointer: an Input wide, three rows tall, and the type step of each size', async ({ page }) => {
    await page.goto(urlFor('textarea--sizes', 'light', 'ltr'))
    expect(await Promise.all(SIZES.map((name) => sizeOf(field(page, name))))).toEqual([[165.6, 62], [193.2, 74], [193.2, 82], [220.8, 98], [220.8, 106]])
    expect(await Promise.all(SIZES.map((name) => css(field(page, name), 'font-size')))).toEqual(['12px', '14px', '14px', '16px', '16px'])
  })

  test.describe('under a coarse pointer', () => {
    test.use(COARSE)

    test('16 px text, so iOS does not zoom, and the box grows with it', async ({ page }) => {
      await page.goto(urlFor('textarea--sizes', 'light', 'ltr'))
      expect(await Promise.all(SIZES.map((name) => sizeOf(field(page, name))))).toEqual([[220.8, 78], [220.8, 82.5], [220.8, 90.5], [220.8, 98], [220.8, 106]])
    })

    test('with a 14 px root the text of every size is still 16 px, lg and xl too', async ({ page }) => {
      await page.goto(urlFor('textarea--sizes', 'light', 'ltr'))
      await page.addStyleTag({ content: 'html { font-size: 14px }' })
      expect(await Promise.all(SIZES.map((name) => css(field(page, name), 'font-size')))).toEqual(['16px', '16px', '16px', '16px', '16px'])
    })
  })

  for (const pointer of ['fine', 'coarse'] as const) {
    test.describe(`${pointer} pointer`, () => {
      test.use(pointer === 'coarse' ? COARSE : {})

      test('a skeleton is the box of the textarea it stands in for, one row under a finger included', async ({ page }) => {
        await page.goto(urlFor('textarea--skeleton', 'light', 'ltr'))
        const pairs = await page.locator('[data-pair]').evaluateAll((all) => all.map((pair) => {
          const size = (el: Element | null) => { const r = el?.getBoundingClientRect() ?? new DOMRect(); return [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10] }
          return [pair.getAttribute('data-pair'), size(pair.querySelector('textarea')), size(pair.querySelector('span[aria-hidden]'))]
        }))
        expect(pairs.map(([name]) => name)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'one-row', 'full'])
        for (const [name, textarea, skeleton] of pairs) expect(skeleton, String(name)).toEqual(textarea)
        expect(pairs[5]?.[1]).toEqual(pointer === 'coarse' ? [220.8, 44] : [165.6, 30])
      })
    })
  }
})

test.describe('what the server HTML sends, with no script at all', () => {
  test('the default and an empty field; then what is typed; then a reset button puts the default back', async ({ page }) => {
    await page.goto(urlFor('textarea--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['message', 'Hello'], ['notes', '']])
    await field(page, 'Notes').fill('Typed with no script')
    await field(page, 'Message').fill('Hello, again')
    expect(await serverEntries(page)).toEqual([['message', 'Hello, again'], ['notes', 'Typed with no script']])
    await page.getByRole('button', { name: 'Clear' }).click()
    expect(await serverEntries(page)).toEqual([['message', 'Hello'], ['notes', '']])
  })
})

test.describe('invalid is told by more than colour', () => {
  test('the line turns to danger and an inset ring makes it 2 px thick; a valid field has neither', async ({ page }) => {
    await page.goto(urlFor('textarea--states', 'light', 'ltr'))
    const danger = await resolved(page, 'var(--tc-danger-solid)')
    expect(await css(field(page, 'invalid'), 'border-top-color')).toBe(danger)
    expect(await css(field(page, 'invalid'), 'box-shadow')).toContain(`${danger} 0px 0px 0px 1px inset`)
    expect(await css(field(page, 'hover'), 'box-shadow')).not.toContain('inset')
  })

  for (const scheme of ['light', 'dark'] as const) {
    test.describe(`forced colours, ${scheme} palette`, () => {
      test.use({ forcedColors: 'active', colorScheme: scheme })

      test('the line of an invalid field grows to 2 px, since the inset ring is not painted; the others keep 1 px', async ({ page }) => {
        await page.goto(urlFor('textarea--states', 'light', 'ltr'))
        expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
        expect(await css(field(page, 'invalid'), 'border-top-width')).toBe('2px')
        for (const name of ['idle', 'hover', 'disabled']) expect(await css(field(page, name), 'border-top-width'), name).toBe('1px')
      })
    })
  }
})

for (const direction of DIRECTIONS) {
  test.describe(`screens, ${direction}`, () => {
    for (const screen of SCREENS) {
      test(`${String(screen.width)} x ${String(screen.height)}: no demo scrolls the page sideways, hostile text included`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of DEMOS) {
          await page.goto(urlFor(demo, 'light', direction))
          await expectNoSidewaysScroll(page)
        }
      })
    }
  })
}

test.describe('text and motion', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: at a root of 32 px the fields fill a 320 px screen, the counter stays under its field, and nothing scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await page.goto(urlFor('textarea--sizes', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      // 13.8em of 28 px is 386 px: the own width gives way to the 288 px the screen has.
      expect((await boxOf(field(page, 'Medium'))).width).toBe((await boxOf(page.locator('#demo > div'))).width)
      await expectNoSidewaysScroll(page)
      await page.goto(urlFor('textarea--show-count', 'light', direction))
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      const box = await boxOf(field(page, 'Always counted'))
      expect(box.width).toBe((await boxOf(page.locator('#demo > div'))).width)
      expect((await boxOf(page.locator('#demo [data-at-limit]'))).top).toBeGreaterThanOrEqual((await boxOf(field(page, 'At the cap'))).bottom)
      await expectNoSidewaysScroll(page)
    })
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}: at a root of 32 px on a 320 px screen no demo scrolls sideways, nor spills past the start edge where no scrollbar shows it`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      for (const demo of DEMOS) {
        await page.goto(urlFor(demo, 'light', direction))
        await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.body.clientWidth), `${demo} scrolls sideways`).toBeLessThanOrEqual(0)
        const spilt = await page.locator('#demo :is(textarea, button, label, span[aria-hidden])').evaluateAll((all) => all.flatMap((el) => {
          const { left, right } = el.getBoundingClientRect()
          return left < 0 || right > document.documentElement.clientWidth ? [`${el.tagName} ${String(Math.round(left))}..${String(Math.round(right))}`] : []
        }))
        expect(spilt, demo).toEqual([])
      }
    })
  }

  test('WCAG 1.4.12 spacing: the rows grow with the line height, and the counter and the hint stay clear of their fields', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto(urlFor('textarea--basic', 'light', 'ltr'))
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    const [bio, hint] = [await boxOf(field(page, 'About you')), await boxOf(page.locator('#textarea-basic-hint'))]
    expect(bio.height).toBe(3 * 21 + 20 + 2)
    expect(hint.top, 'the hint overlaps its field').toBeGreaterThanOrEqual(bio.bottom)
    await expectNoSidewaysScroll(page)
  })

  test('the line changes colour in 150 ms; with reduced motion it does not move, and the skeleton stops its pulse', async ({ browser }) => {
    for (const [motion, duration, pulse] of [['no-preference', '0.15s', 'pulse'], ['reduce', '0s', 'none']] as const) {
      const page = await browser.newPage({ reducedMotion: motion })
      await page.goto(urlFor('textarea--skeleton', 'light', 'ltr'))
      expect([await css(page.locator('textarea').first(), 'transition-duration'), await css(page.locator('span[aria-hidden]').first(), 'animation-name')]).toEqual([duration, pulse])
      await page.close()
    }
  })
})

for (const pointer of ['fine', 'coarse'] as const) {
  test.describe(`the focus ring, ${pointer} pointer`, () => {
    test.use(pointer === 'coarse' ? COARSE : {})

    test('Tab paints a 2 px ring 2 px outside the field, the one in the holder too, and no parent cuts it', async ({ page }) => {
      await openLive(page, 'textarea--form')
      for (const name of ['Message', 'Notes']) {
        await page.keyboard.press('Tab')
        const focused = field(page, name)
        await expect(focused).toBeFocused()
        expect([await css(focused, 'outline-style'), await css(focused, 'outline-width'), await css(focused, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
        const cut = await focused.evaluate((el) => {
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
        expect(cut, name).toEqual([])
      }
    })
  })
}

test.describe('live: the rows follow the text', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('3 rows, then 4, then 6, where it stops and scrolls; and back to 3 when the lines go', async ({ page }) => {
    await openLive(page, 'textarea--autosize')
    const grows = field(page, 'Grows')
    const height = async () => (await boxOf(grows)).height
    expect(await height()).toBe(82)
    await grows.fill('One\nTwo\nThree\nFour')
    await expect.poll(height).toBe(102)
    await grows.fill('One\nTwo\nThree\nFour\nFive\nSix')
    await expect.poll(height).toBe(142)
    await grows.fill('One\nTwo\nThree\nFour\nFive\nSix\nSeven\nEight\nNine')
    await expect.poll(height).toBe(142)
    expect(await grows.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
    await grows.fill('One')
    await expect.poll(height).toBe(82)
  })

  for (const direction of DIRECTIONS) {
    for (const pointer of ['fine', 'coarse'] as const) {
      test(`${direction}, ${pointer} pointer: typing at the foot of a scrolled page, or of a scrolling box, moves neither`, async ({ browser }) => {
        const page = await browser.newPage({ ...(pointer === 'coarse' ? COARSE : {}), viewport: { width: 390, height: 260 } })
        await openLive(page, 'textarea--autosize', { direction })
        const past = field(page, 'Past six rows')
        const typeAtFoot = async (scroller: string) => {
          await past.focus()
          await page.keyboard.press('Control+End')
          await page.locator(scroller).evaluate((el) => { el.scrollTop = el.scrollHeight })
          const before = await page.locator(scroller).evaluate((el) => el.scrollTop)
          await page.keyboard.type('x')
          await expect(past).toHaveValue(/x$/)
          return [before, await page.locator(scroller).evaluate((el) => el.scrollTop)]
        }
        const [top, after] = await typeAtFoot('html')
        expect(top, 'the page is not scrolled at all').toBeGreaterThan(0)
        expect(after).toBe(top)
        await page.addStyleTag({ content: '#demo { block-size: 150px; overflow: auto }' })
        const [boxTop, boxAfter] = await typeAtFoot('#demo')
        expect(boxTop, 'the box does not scroll at all').toBeGreaterThan(0)
        expect(boxAfter).toBe(boxTop)
        expect(await liveErrors(page)).toEqual([])
        await page.close()
      })
    }
  }

  for (const pointer of ['fine', 'coarse'] as const) {
    test(`${pointer} pointer: one row at every size is the box of a plain field, under the touch floor too, and still grows to two lines`, async ({ browser }) => {
      const page = await browser.newPage(pointer === 'coarse' ? COARSE : {})
      await openLive(page, 'separator--horizontal')
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/textarea-rows.tsx' })
      await expect(page.locator('#rows textarea')).toHaveCount(10)
      const heights = () => Promise.all(['xs', 'sm', 'md', 'lg', 'xl'].map(async (size) => [
        size, (await boxOf(field(page, `${size} plain`))).height, (await boxOf(field(page, `${size} autosize`))).height,
      ]))
      // A single row of xs and sm is under 44 px, so under a finger the floor is the box.
      expect(await heights()).toEqual(pointer === 'coarse'
        ? [['xs', 44, 44], ['sm', 44, 44], ['md', 44.8, 44.8], ['lg', 50, 50], ['xl', 58, 58]]
        : [['xs', 30, 30], ['sm', 34, 34], ['md', 42, 42], ['lg', 50, 50], ['xl', 58, 58]])
      for (const size of ['xs', 'sm']) {
        const grows = field(page, `${size} autosize`)
        await grows.fill('One\nTwo')
        await expect.poll(() => grows.evaluate((el: HTMLTextAreaElement) => [el.rows, el.scrollHeight <= el.clientHeight])).toEqual([2, true])
      }
      expect(await liveErrors(page)).toEqual([])
      await page.close()
    })
  }

  for (const direction of DIRECTIONS) {
    test(`${direction}, coarse pointer, 14 px root: a field in its holder is as wide as a plain one at every size, lg and xl too`, async ({ browser }) => {
      const page = await browser.newPage(COARSE)
      await openLive(page, 'separator--horizontal', { direction })
      await page.addStyleTag({ content: 'html { font-size: 14px }' })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/textarea-rows.tsx' })
      await expect(page.locator('#rows textarea')).toHaveCount(10)
      expect(await Promise.all(['xs', 'sm', 'md', 'lg', 'xl'].map(async (size) => [
        size, (await boxOf(field(page, `${size} plain`))).width, (await boxOf(field(page, `${size} autosize`))).width,
      ]))).toEqual([['xs', 220.8, 220.8], ['sm', 220.8, 220.8], ['md', 220.8, 220.8], ['lg', 220.8, 220.8], ['xl', 220.8, 220.8]])
      expect(await liveErrors(page)).toEqual([])
      await page.close()
    })
  }

  test('a field pre-filled past six rows has the same height on the server and once hydrated', async ({ page }) => {
    await page.goto(urlFor('textarea--autosize', 'light', 'ltr'))
    const served = (await boxOf(field(page, 'Past six rows'))).height
    await openLive(page, 'textarea--autosize')
    expect([served, (await boxOf(field(page, 'Past six rows'))).height]).toEqual([142, 142])
  })
})

test.describe('live: the counter', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('with autosize alone it appears at nine tenths of the cap, at the inline end, and turns bold at the cap, where typing stops', async ({ page }) => {
    await openLive(page, 'textarea--show-count')
    const near = field(page, 'Counted near the cap')
    await near.fill('x'.repeat(53))
    expect(await counterOf(near)).toEqual({ seen: '(hidden)', at: false })
    await near.press('End')
    await page.keyboard.type('x')
    expect(await counterOf(near)).toEqual({ seen: '54 / 60', at: false })
    const counter = page.locator(`[id="${String(await near.getAttribute('aria-describedby'))}"]`)
    expect((await boxOf(counter)).right).toBe((await boxOf(near)).right)
    await page.keyboard.type('x'.repeat(10))
    expect([await near.inputValue().then((value) => value.length), await counterOf(near)]).toEqual([60, { seen: '60 / 60', at: true }])
    expect([await css(counter, 'font-weight'), await css(counter, 'color')]).toEqual(['600', await resolved(page, 'var(--tc-body)')])
  })

  test('a pasted megabyte stops at the cap of 5,000; with maxLength={null} nothing stops it and no counter shows', async ({ page }) => {
    await openLive(page, 'textarea--form')
    await field(page, 'Notes').focus()
    await page.keyboard.insertText('x'.repeat(1_000_000))
    expect([(await field(page, 'Notes').inputValue()).length, await counterOf(field(page, 'Notes'))]).toEqual([5000, { seen: '5,000 / 5,000', at: true }])
    await openLive(page, 'textarea--show-count')
    await field(page, 'No cap').focus()
    await page.keyboard.insertText('x'.repeat(6000))
    expect([(await field(page, 'No cap').inputValue()).length, await field(page, 'No cap').getAttribute('maxlength')]).toEqual([6000, null])
    expect(await field(page, 'No cap').getAttribute('aria-describedby')).toBeNull()
  })

  test('an rtl island on an ltr page: the counter reads Arabic-Indic digits in their own order, at the left, the inline end', async ({ page }) => {
    await openLive(page, 'textarea--rtl', { direction: 'ltr' })
    const bio = field(page, 'نبذة عنك')
    expect(await counterOf(bio)).toEqual({ seen: '٢٤ / ٥٠٠', at: false })
    await bio.press('End')
    await page.keyboard.type('!')
    expect(await counterOf(bio)).toEqual({ seen: '٢٥ / ٥٠٠', at: false })
    const counter = page.locator(`[id="${String((await bio.getAttribute('aria-describedby'))?.split(' ').at(-1))}"]`)
    expect([(await boxOf(counter)).left, await css(counter.locator('[aria-hidden]'), 'direction')]).toEqual([(await boxOf(bio)).left, 'ltr'])
  })

  test('dir="auto": a field takes the direction of the first strong letter typed into it', async ({ page }) => {
    await openLive(page, 'textarea--rtl', { direction: 'ltr' })
    const note = field(page, 'ملاحظة')
    await note.fill('Hello')
    expect(await note.evaluate((el) => el.matches(':dir(ltr)'))).toBe(true)
    await note.fill('مرحبا')
    expect(await note.evaluate((el) => el.matches(':dir(rtl)'))).toBe(true)
  })
})

test.describe('live: the form', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  const fixture = async (page: Page) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/textarea-reset.tsx' })
    await expect(page.locator('#textarea-reset')).toHaveAttribute('data-ready', '')
  }

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, the text, the rows and the counter are back at the default, and a field tied by form follows`, async ({ page }) => {
      await fixture(page)
      await field(page, 'Bio').fill('One\nTwo\nThree\nFour\nFive')
      await field(page, 'Far').fill('far away')
      expect(await serverEntries(page, '#plain')).toEqual([['bio', 'One\nTwo\nThree\nFour\nFive'], ['note', ''], ['far', 'far away']])
      await expect.poll(async () => (await boxOf(field(page, 'Bio'))).height).toBe(122)
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      expect(await serverEntries(page, '#plain')).toEqual([['bio', 'Hello'], ['note', ''], ['far', '']])
      await expect.poll(() => counterOf(field(page, 'Bio'))).toEqual({ seen: '5 / 60', at: false })
      await expect.poll(async () => (await boxOf(field(page, 'Bio'))).height).toBe(82)
      expect(await counterOf(field(page, 'Far'))).toEqual({ seen: '0 / 5,000', at: false })
    })
  }

  test('a React 19 form action sends the text, then the form resets it and the counter follows', async ({ page }) => {
    await fixture(page)
    await field(page, 'Message').fill('Sent by an action')
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => page.evaluate(() => window.textareaSent ?? [])).toEqual([[['message', 'Sent by an action']]])
    await expect(field(page, 'Message')).toHaveValue('')
    await expect.poll(() => counterOf(field(page, 'Message'))).toEqual({ seen: '0 / 5,000', at: false })
  })

  test('typed before a late script: a field with no default keeps it and the counter catches up; one with a default is put back by React', async ({ page }) => {
    let release: () => void = () => undefined
    const held = new Promise<void>((done) => { release = done })
    await page.route(`**${CLIENT_ENTRY}*`, async (route) => { await held; await route.continue() })
    // Not 'load' nor DOMContentLoaded: both wait for the module script this route holds back.
    await page.goto(liveUrl('textarea--form'), { waitUntil: 'commit' })
    await field(page, 'Message').fill('typed early')
    await field(page, 'Notes').fill('typed early')
    release()
    await page.waitForFunction(() => document.documentElement.dataset['harness'] === 'hydrated')
    expect([await field(page, 'Message').inputValue(), await field(page, 'Notes').inputValue()]).toEqual(['Hello', 'typed early'])
    await expect.poll(() => counterOf(field(page, 'Notes'))).toEqual({ seen: '11 / 5,000', at: false })
    expect(await liveErrors(page)).toEqual([])
  })
})

test.describe('live: where a page puts a textarea', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/textarea-layouts.tsx' })
    await expect(page.locator('#layouts textarea').first()).toBeVisible()
  }
  /** The width of every textarea of each case, to a tenth of a pixel, and whether one scrolls sideways inside. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((box) => [
    box.getAttribute('data-case'),
    ...[...box.querySelectorAll('textarea')].map((el) => Math.round(el.getBoundingClientRect().width * 10) / 10 + (el.scrollWidth > el.clientWidth ? 1000 : 0)),
  ]))
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  // The browser's own width reserves the vertical bar: the thin one is 10 px where the classic was 15, so 173 where it was 178.
  const WIDE = [
    ['grid', 193.2], ['track', 193.2], ['flex-1', 193.2], ['w-fit', 173], ['cell', 193.2], ['label-row', 180.5], ['held-w-fit', 173], ['held-cell', 193.2],
    ['pair-grid', 193.2, 193.2], ['pair-flex', 193.2, 193.2], ['pair-div', 193.2, 193.2], ['pair-held', 193.2, 193.2], ['beside-label', 193.2],
    ['word', 193.2, 193.2, 1238], ['word-cell', 173], ['empty', 193.2], ['lines', 193.2, 193.2],
  ]
  const PHONE = (pair: number, flex: number, cell: number, beside: number, full: number) => [
    ['grid', 220.8], ['track', pair], ['flex-1', flex], ['w-fit', 185], ['cell', cell], ['label-row', 197], ['held-w-fit', 185], ['held-cell', cell],
    ['pair-grid', pair, pair], ['pair-flex', pair, pair], ['pair-div', pair, pair], ['pair-held', pair, pair], ['beside-label', beside],
    ['word', 220.8, 220.8, full], ['word-cell', 185], ['empty', 220.8], ['lines', 220.8, 220.8],
  ]

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: an Input wide in a block, the browser's 173 px where the parent sizes to its content`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, { direction })
      expect(await cases(page)).toEqual(WIDE)
      await expectNoSidewaysScroll(page)
    })

    for (const [width, expected] of [[390, PHONE(175, 220.8, 220.8, 220.8, 358)], [320, PHONE(140, 200, 205.2, 183.4, 288)]] as const) {
      test(`${String(width)} px coarse, ${direction}: two side by side are two Inputs wide, and the page does not scroll sideways`, async ({ browser }) => {
        const page = await browser.newPage({ ...COARSE, viewport: { width, height: 800 } })
        await fixture(page, { direction })
        expect(await cases(page)).toEqual(expected)
        await expectNoSidewaysScroll(page)
        expect(await liveErrors(page)).toEqual([])
        await page.close()
      })
    }

    test(`${direction}: axe finds nothing on the hydrated fixture, the label row and the holders included`, async ({ page }) => {
      await fixture(page, { direction })
      const results = await new AxeBuilder({ page }).include('#layouts').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }
})

test.describe('axe on the hydrated demos that load the holder', () => {
  for (const demo of ['textarea--autosize', 'textarea--form', 'textarea--rtl', 'textarea--show-count', 'textarea--row', 'textarea--long-content']) {
    for (const direction of DIRECTIONS) {
      test(`${demo} ${direction}: no violation once the counter is live`, async ({ page }) => {
        await openLive(page, demo, { direction })
        const results = await new AxeBuilder({ page }).include('#demo').analyze()
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
      })
    }
  }
})
