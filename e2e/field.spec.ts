import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { CLIENT_ENTRY } from '../scripts/lib/live-harness.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'

// What happy-dom cannot show: the browser's own accessibility tree before and after hydration, the form with no script,
// the label's click, where a page puts a field, forced colours, text zoom, and FieldLive under a real React form action.

const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['basic', 'controls', 'form', 'group', 'hint-error', 'inline', 'live', 'long-content', 'required', 'rtl'].map((name) => `field--${name}`)
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const

const axeOf = async (page: Page, scope: string) => (await new AxeBuilder({ page }).include(scope).analyze()).violations
  .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)

interface AxNode { role?: { value?: string }, name?: { value?: string }, description?: { value?: string }, ignored?: boolean, properties?: { name: string, value: { value?: unknown } }[] }
const CONTROL_ROLES = ['textbox', 'checkbox', 'switch', 'radiogroup', 'slider', 'combobox', 'spinbutton']

/** Chromium's own accessibility tree, read through the DevTools protocol: each control a label names, by role, name,
 * description and states, in the order of the names given (the protocol lists the tree in its own order). */
async function controlsInTree(page: Page, names: readonly string[]): Promise<string[]> {
  const cdp = await page.context().newCDPSession(page)
  const { nodes } = await cdp.send('Accessibility.getFullAXTree') as { nodes: AxNode[] }
  await cdp.detach()
  const at = (node: AxNode) => names.indexOf(node.name?.value ?? '')
  return nodes.filter((node) => !node.ignored && CONTROL_ROLES.includes(node.role?.value ?? '') && at(node) !== -1).sort((a, b) => at(a) - at(b)).map((node) => {
    const state = (name: string) => node.properties?.find((p) => p.name === name)?.value.value
    const invalid = state('invalid') === 'true' ? 'invalid' : ''
    const required = state('required') === true ? 'required' : ''
    return `${node.role?.value ?? ''} ${node.name?.value ?? ''} | ${node.description?.value ?? ''} | ${invalid} | ${required}`
  })
}

const CONTROL_NAMES = ['Email', 'Bio', 'Terms', 'Digest', 'Plan', 'View', 'Volume', 'Guests', 'Code', 'Country', 'City']

/** The eleven controls of field--controls as a screen reader meets them: named by the label, the hint then the error read
 * after. Chromium exposes no required state on a role="checkbox", though the Checkbox writes aria-required="true". */
const CONTROLS_TREE = [
  'textbox Email | Input hint Input error | invalid | required',
  'textbox Bio | Textarea hint Textarea error | invalid | ',
  'checkbox Terms | Checkbox hint Checkbox error | invalid | ',
  'switch Digest | Switch hint Switch error | invalid | ',
  'radiogroup Plan | RadioGroup hint RadioGroup error | invalid | required',
  'radiogroup View | SegmentedControl hint SegmentedControl error | invalid | ',
  'slider Volume | Slider hint Slider error |  | ',
  'textbox Guests | NumberField hint NumberField error | invalid | ',
  'textbox Code | OTPField hint OTPField error | invalid | ',
  'combobox Country | Select hint Select error | invalid | required',
  'combobox City | Combobox hint Combobox error | invalid | ',
]

/** Base UI writes no aria-invalid on the range input, so the Slider sets it from an effect: invalid once hydrated. */
const HYDRATED_TREE = CONTROLS_TREE.map((row) => (row.startsWith('slider ') ? 'slider Volume | Slider hint Slider error | invalid | ' : row))

/** Opens a live page with its script held back, so what is read first is the server HTML alone; release() hydrates it. */
async function heldBack(page: Page, demo: string, options: LiveOptions = {}) {
  let release: () => void = () => undefined
  const held = new Promise<void>((done) => { release = done })
  await page.route(`**${CLIENT_ENTRY}*`, async (route) => { await held; await route.continue() })
  // Not 'load' nor DOMContentLoaded: both wait for the module script this route holds back.
  await page.goto(liveUrl(demo, options), { waitUntil: 'commit' })
  return async () => {
    release()
    await page.waitForFunction(() => document.documentElement.dataset['harness'] === 'hydrated')
  }
}

test.describe('the accessibility tree: every control named, described and invalid, before hydration and after', () => {
  for (const direction of DIRECTIONS) {
    test(`field--controls, ${direction}`, async ({ page }) => {
      const hydrate = await heldBack(page, 'field--controls', { direction })
      await expect(page.getByText('Combobox error')).toBeAttached()
      expect(await page.evaluate(() => document.documentElement.dataset['harness'])).not.toBe('hydrated')
      expect(await controlsInTree(page, CONTROL_NAMES), 'before hydration').toEqual(CONTROLS_TREE)
      await hydrate()
      expect(await controlsInTree(page, CONTROL_NAMES), 'after hydration').toEqual(HYDRATED_TREE)
      expect(await liveErrors(page)).toEqual([])
    })
  }

  test('field--live, FieldLive: the same before hydration and after', async ({ page }) => {
    const expected = ['textbox Nickname | Shown to other players |  | ', 'combobox Size | Pick the size you ordered | invalid | required']
    const hydrate = await heldBack(page, 'field--live')
    await expect(page.getByText('Pick the size you ordered')).toBeAttached()
    expect(await controlsInTree(page, ['Nickname', 'Size'])).toEqual(expected)
    await hydrate()
    expect(await controlsInTree(page, ['Nickname', 'Size'])).toEqual(expected)
  })

  test('axe finds nothing on the hydrated controls, in both directions', async ({ page }) => {
    for (const direction of DIRECTIONS) {
      await openLive(page, 'field--controls', { direction })
      expect(await axeOf(page, '#demo'), direction).toEqual([])
    }
  })
})

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false })

  test('a click on a label focuses its input, and the form sends what the controls hold: Field adds nothing', async ({ page }) => {
    await page.goto(liveUrl('field--form'))
    await page.getByText('Email', { exact: true }).click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('new@example.com')
    await page.getByText('Message', { exact: true }).click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('Typed with no script')
    let sent = ''
    await page.route('**/*?email=*', async (route) => { sent = new URL(route.request().url()).search; await route.fulfill({ body: 'sent' }) })
    await page.getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => sent).toBe('?email=new%40example.com&message=Typed+with+no+script&terms=on')
  })
})

test.describe('what the server HTML sends, read on the static page', () => {
  test('the three defaults; then what is typed; then a reset button puts the defaults back', async ({ page }) => {
    await page.goto(urlFor('field--form', 'light', 'ltr'))
    expect(await serverEntries(page)).toEqual([['email', 'omar@example.com'], ['message', 'Hello'], ['terms', 'on']])
    await page.getByRole('textbox', { name: 'Message' }).fill('Changed')
    expect(await serverEntries(page)).toEqual([['email', 'omar@example.com'], ['message', 'Changed'], ['terms', 'on']])
    await page.getByRole('button', { name: 'Clear' }).click()
    expect(await serverEntries(page)).toEqual([['email', 'omar@example.com'], ['message', 'Hello'], ['terms', 'on']])
  })

  test('the label, the hint and the error are linked in the server HTML: each reference resolves to its own text', async ({ page }) => {
    await page.goto(urlFor('field--hint-error', 'light', 'ltr'))
    const linked = await page.locator('#demo [aria-describedby]').evaluateAll((all) => all.map((el) => [
      document.getElementById(el.getAttribute('aria-labelledby') ?? '')?.textContent,
      (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' / '),
      document.querySelector(`label[for="${el.id}"]`)?.textContent,
    ]))
    expect(linked).toEqual([
      ['Username', 'Letters and numbers only / That name is taken', 'Username'],
      ['About you', 'Shown on your profile / Too shortAdd at least one sentence', 'About you'],
      ['Website', 'Optional', 'Website'],
    ])
  })
})

test.describe('live: the label and the keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: a click on an inline label toggles its Checkbox and its Switch; a click on a stacked label focuses its Input`, async ({ page }) => {
      await openLive(page, 'field--inline', { direction })
      const box = page.getByRole('checkbox', { name: 'Send me product news' })
      await page.getByText('Send me product news').click()
      await expect(box).toBeChecked()
      await page.getByText('Send me product news').click()
      await expect(box).not.toBeChecked()
      await page.getByText('Weekly digest').click()
      await expect(page.getByRole('switch', { name: 'Weekly digest' })).toBeChecked()
      await openLive(page, 'field--basic', { direction })
      await page.getByText('Email').click()
      await expect(page.getByRole('textbox', { name: 'Email' })).toBeFocused()
    })

    test(`${direction}: Tab stops on each control and never on a label, a hint or an error; Space ticks the box`, async ({ page }) => {
      await openLive(page, 'field--form', { direction })
      const stops: string[] = []
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab')
        stops.push(await page.evaluate(() => `${document.activeElement?.tagName ?? ''} ${document.activeElement?.getAttribute('role') ?? ''}`.trim()))
      }
      expect(stops).toEqual(['INPUT', 'TEXTAREA', 'BUTTON checkbox', 'BUTTON'])
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Space')
      await expect(page.getByRole('checkbox', { name: 'I accept the terms' })).not.toBeChecked()
    })
  }
})

for (const pointer of ['fine', 'coarse'] as const) {
  test.describe(`the focus ring, ${pointer} pointer`, () => {
    test.use(pointer === 'coarse' ? COARSE : {})

    test('Tab paints the control its whole ring, and no part of the Field cuts it', async ({ page }) => {
      await openLive(page, 'field--form')
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab')
        const cut = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement
          // A Checkbox draws its ring on the box inside the button, which takes the 24 px target.
          const own = getComputedStyle(el).outlineStyle
          const ring = own === 'none' ? getComputedStyle(el.querySelector('span') ?? el).outlineStyle : own
          const r = el.getBoundingClientRect()
          const outer = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
          const clipped: string[] = []
          for (let up = el.parentElement; up; up = up.parentElement) {
            const style = getComputedStyle(up)
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const clip = up.getBoundingClientRect()
            if (outer.left < clip.left || outer.top < clip.top || outer.right > clip.right || outer.bottom > clip.bottom) clipped.push(up.tagName)
          }
          return { ring, clipped }
        })
        expect(cut.clipped, String(i)).toEqual([])
        expect(cut.ring, String(i)).toBe('solid')
      }
    })
  })
}

test.describe('where the parts sit', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: inline puts the box at the inline start and the hint and the error under the label, never under the box`, async ({ page }) => {
      await page.goto(urlFor('field--inline', 'light', direction))
      const box = await boxOf(page.getByRole('checkbox', { name: 'Send me product news' }))
      const label = await boxOf(page.getByText('Send me product news'))
      const hint = await boxOf(page.getByText('About once a month'))
      const error = await boxOf(page.getByText('Turn it on to get the summary'))
      const digest = await boxOf(page.getByText('Weekly digest'))
      if (direction === 'ltr') expect(box.right).toBeLessThanOrEqual(label.left)
      else expect(box.left).toBeGreaterThanOrEqual(label.right)
      expect(hint.top).toBeGreaterThanOrEqual(label.bottom)
      expect(direction === 'ltr' ? hint.left : hint.right).toBe(direction === 'ltr' ? label.left : label.right)
      expect(error.top).toBeGreaterThanOrEqual(digest.bottom)
    })

    test(`${direction}: stacked, the label, the control, the hint and the error follow each other down the page`, async ({ page }) => {
      await page.goto(urlFor('field--hint-error', 'light', direction))
      const tops = [
        await boxOf(page.getByText('Username', { exact: true })), await boxOf(page.getByRole('textbox', { name: 'Username' })),
        await boxOf(page.getByText('Letters and numbers only')), await boxOf(page.getByText('That name is taken')),
      ]
      for (let i = 1; i < tops.length; i++) expect(tops[i]?.top ?? 0, String(i)).toBeGreaterThanOrEqual(tops[i - 1]?.bottom ?? Infinity)
    })
  }
})

for (const direction of DIRECTIONS) {
  test.describe(`screens, ${direction}`, () => {
    for (const screen of SCREENS) {
      test(`${String(screen.width)} x ${String(screen.height)}: no demo scrolls the page sideways, and every Field stays inside the body`, async ({ page }) => {
        await page.setViewportSize(screen)
        for (const demo of DEMOS) {
          await page.goto(urlFor(demo, 'light', direction))
          await expectNoSidewaysScroll(page)
          const outside = await page.evaluate(() => {
            const page = document.body.getBoundingClientRect()
            return [...document.querySelectorAll('#demo label[id$="-label"]')].map((label) => label.parentElement?.getBoundingClientRect())
              .filter((r) => r !== undefined && (r.left < page.left - 0.5 || r.right > page.right + 0.5)).length
          })
          expect(outside, demo).toBe(0)
        }
      })
    }
  })
}

test.describe('hostile text where a page puts a field', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/field-layouts.tsx' })
    await expect(page.locator('#layouts [data-field]').first()).toBeVisible()
  }
  /** Each Field's root against its case's box: whether it overflows it, and how many lines its label takes. */
  const fields = (page: Page) => page.locator('#layouts [data-field]').evaluateAll((all) => all.map((root) => {
    const box = root.closest('[data-case]')?.getBoundingClientRect() ?? new DOMRect()
    const r = root.getBoundingClientRect()
    const label = root.querySelector('label')?.getBoundingClientRect() ?? new DOMRect()
    return [root.getAttribute('data-field'), r.left >= box.left - 0.5 && r.right <= box.right + 0.5, label.height > 25]
  }))

  for (const direction of DIRECTIONS) {
    for (const width of [320, 1280]) {
      test(`${String(width)} px, ${direction}: a 300-character word wraps in a grid track, a flex-1 column, a w-fit parent and a table cell`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 })
        await fixture(page, { direction })
        const expected = ['track', 'flex', 'fit', 'cell'].flatMap((at) => [[`${at}-stacked`, true, true], [`${at}-inline`, true, true]])
        expect(await fields(page)).toEqual(expected)
        await expectNoSidewaysScroll(page)
        expect(await liveErrors(page)).toEqual([])
      })
    }
  }

  test('in the grid track the Field takes the track and gives the real Input beside it its own half', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await fixture(page)
    const [field, input] = [await boxOf(page.locator('[data-field="track-stacked"]')), await boxOf(page.getByRole('textbox', { name: 'A real Input beside it' }))]
    expect(field.width).toBe(input.width)
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('the asterisk and the error icon are drawn in the text colour, not lost with the fills', async ({ page }) => {
      await page.goto(urlFor('field--rtl', 'light', 'ltr'))
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const marks = await page.locator('#demo label svg, #demo [id$="-err"] svg').evaluateAll((all) => all.map((svg) => {
        const r = svg.getBoundingClientRect()
        const probe = document.createElement('span')
        probe.style.color = 'CanvasText'
        document.body.appendChild(probe)
        const text = getComputedStyle(probe).color
        probe.remove()
        return [Math.round(r.width) > 0 && Math.round(r.height) > 0, getComputedStyle(svg.querySelector('path') ?? svg).fill === text]
      }))
      expect(marks).toEqual([[true, true], [true, true]])
    })
  })
}

test.describe('text and motion', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: at a root of 32 px nothing overlaps and nothing scrolls sideways on a 320 px screen`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      for (const demo of ['field--controls', 'field--form', 'field--hint-error', 'field--inline', 'field--required']) {
        await page.goto(urlFor(demo, 'light', direction))
        await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
        await expectNoSidewaysScroll(page)
        expect(await offScreen(page), demo).toEqual([])
        expect(await overlaps(page), demo).toEqual([])
      }
    })
  }

  test('WCAG 1.4.12 spacing: the label, the hint and the error grow and still do not overlap', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    for (const demo of ['field--hint-error', 'field--inline']) {
      await page.goto(urlFor(demo, 'light', 'ltr'))
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
      await expectNoSidewaysScroll(page)
      expect(await overlaps(page), demo).toEqual([])
    }
  })

  test('Field moves nothing of its own, with or without reduced motion', async ({ browser }) => {
    for (const motion of ['no-preference', 'reduce'] as const) {
      const page = await browser.newPage({ reducedMotion: motion })
      await page.goto(urlFor('field--hint-error', 'light', 'ltr'))
      const moving = await page.locator('#demo label, #demo [id$="-hint"], #demo [id$="-err"]').evaluateAll((all) => all
        .map((el) => getComputedStyle(el)).filter((s) => s.transitionDuration !== '0s' || s.animationName !== 'none').length)
      expect(moving, motion).toBe(0)
      await page.close()
    }
  })
})

/** Every element of the demo that starts before the screen's left edge or ends past its right, by tag and text: a page
 * in RTL overflows to the left, where the scroll width does not see it. An element its own scroller clips is skipped. */
function offScreen(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const demo = document.getElementById('demo')
    const width = document.documentElement.clientWidth
    const clipped = (el: Element) => {
      for (let up = el.parentElement; up && up !== demo; up = up.parentElement) if (getComputedStyle(up).overflowX !== 'visible') return true
      return false
    }
    return [...document.querySelectorAll('#demo *')].filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && (r.left < -0.5 || r.right > width + 0.5) && !clipped(el)
    }).map((el) => `${el.tagName.toLowerCase()} ${el.textContent.slice(0, 20)}`)
  })
}

/** Every pair of a Field's parts (label, control, hint, error) whose boxes cross, by the text of the first. */
function overlaps(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = []
    for (const label of document.querySelectorAll('#demo label[id$="-label"]')) {
      const parts = [...(label.parentElement?.children ?? [])].map((el) => el.getBoundingClientRect())
      for (let a = 0; a < parts.length; a++) {
        for (let b = a + 1; b < parts.length; b++) {
          const [x, y] = [parts[a], parts[b]]
          if (x && y && x.left < y.right - 0.5 && y.left < x.right - 0.5 && x.top < y.bottom - 0.5 && y.top < x.bottom - 0.5) out.push(`${label.textContent} ${String(a)}/${String(b)}`)
        }
      }
    }
    return out
  })
}

test.describe('live: FieldLive under a React 19 form action', () => {
  const fixture = async (page: Page) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/field-live.tsx' })
    await expect(page.locator('#field-live')).toHaveAttribute('data-answers', '0')
  }
  const errorOf = (page: Page, name: string) => page.locator('#field-live label').filter({ hasText: name }).evaluate((label) =>
    document.getElementById(`${label.id.slice(0, -'-label'.length)}-err`)?.textContent ?? '')
  /** Two rounds of a frame and then a task: the hook's effect has run, and the task it queued to record the entries too. */
  const settle = async (page: Page) => {
    for (let i = 0; i < 2; i++) await page.evaluate(() => new Promise((done) => { requestAnimationFrame(() => { setTimeout(done, 0) }) }))
  }
  const send = async (page: Page, answers: string) => {
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.locator('#field-live')).toHaveAttribute('data-answers', answers)
    await settle(page)
  }
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('the errors show on their fields; what was typed survives the reset, on screen and in the form', async ({ page }) => {
    await fixture(page)
    await page.getByRole('textbox', { name: 'Email' }).fill('taken@example.com')
    await page.getByRole('checkbox', { name: 'Terms' }).click()
    await send(page, '1')
    expect(await page.evaluate(() => window.fieldSent)).toEqual([[['email', 'taken@example.com'], ['terms', 'on'], ['country', 'jo']]])
    expect([await errorOf(page, 'Email'), await errorOf(page, 'Terms'), await errorOf(page, 'Country')])
      .toEqual(['That email is taken', 'Accept the terms', 'We do not ship therePick another'])
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('taken@example.com')
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
    expect(await serverEntries(page, '#field-live')).toEqual([['email', 'taken@example.com'], ['terms', 'on'], ['country', 'jo']])
  })

  test('each error goes once its value changes: typing, a tick, an option in the popup; a click that changes nothing keeps it', async ({ page }) => {
    await fixture(page)
    await send(page, '1')
    await page.getByRole('textbox', { name: 'Email' }).click()
    await page.getByRole('combobox', { name: 'Country' }).click()
    await page.getByRole('option', { name: 'Jordan' }).click()
    await expect(page.getByRole('listbox')).toBeHidden()
    await settle(page)
    expect([await errorOf(page, 'Email'), await errorOf(page, 'Country')]).toEqual(['That email is taken', 'We do not ship therePick another'])
    await page.getByRole('textbox', { name: 'Email' }).pressSequentially('me@example.com')
    await expect.poll(() => errorOf(page, 'Email')).toBe('')
    await expect(page.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-invalid')
    await page.getByText('Terms', { exact: true }).click()
    await expect.poll(() => errorOf(page, 'Terms')).toBe('')
    await page.getByRole('combobox', { name: 'Country' }).click()
    await page.getByRole('option', { name: 'Egypt' }).click()
    await expect.poll(() => errorOf(page, 'Country')).toBe('')
  })

  test('the next answer brings each error back, and what the user chose is what was sent', async ({ page }) => {
    await fixture(page)
    await send(page, '1')
    await page.getByRole('textbox', { name: 'Email' }).fill('second@example.com')
    await expect.poll(() => errorOf(page, 'Email')).toBe('')
    await send(page, '2')
    await expect.poll(() => errorOf(page, 'Email')).toBe('That email is taken')
    expect((await page.evaluate(() => window.fieldSent))?.[1]).toEqual([['email', 'second@example.com'], ['country', 'jo']])
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('second@example.com')
  })
})

test.describe('live: one name on several FieldLive, under a React 19 form action (choice 33)', () => {
  const FORM = '#field-shared-name'
  /** By label: the error text the field shows, and whether its control is invalid. */
  const shown = (page: Page) => page.locator(`${FORM} label[id$="-label"]`).evaluateAll((labels) => labels.map((label) => {
    const control = document.querySelector(`[aria-labelledby="${label.id}"]`)
    const error = document.getElementById(`${label.id.slice(0, -'-label'.length)}-err`)?.textContent ?? ''
    return `${label.textContent} | ${error} | ${control?.getAttribute('aria-invalid') === 'true' ? 'invalid' : ''}`
  }))
  const send = async (page: Page, answers: string) => {
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.locator(FORM)).toHaveAttribute('data-answers', answers)
  }
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const how of ['a click', 'the space bar'] as const) {
    test(`${how} on one box clears the group's error from every box of the name, and from no other field`, async ({ page }) => {
      await openLive(page, 'separator--horizontal')
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/field-shared-name.tsx' })
      await expect(page.locator(FORM)).toHaveAttribute('data-answers', '0')
      await send(page, '1')
      await expect.poll(() => shown(page)).toEqual(['Email me | Pick one | invalid', 'Text me | Pick one | invalid', 'Note | Add a note | invalid'])
      const email = page.getByRole('checkbox', { name: 'Email me' })
      if (how === 'a click') await email.click()
      else { await email.focus(); await page.keyboard.press('Space') }
      await expect(email).toBeChecked()
      await expect.poll(() => shown(page)).toEqual(['Email me |  | ', 'Text me |  | ', 'Note | Add a note | invalid'])
      await send(page, '2')
      await expect.poll(() => shown(page)).toEqual(['Email me | Pick one | invalid', 'Text me | Pick one | invalid', 'Note | Add a note | invalid'])
      await expect(email).toBeChecked()
    })
  }
})

test.describe('live: a reset', () => {
  test('form.reset() and the reset button put the server defaults back; Field keeps every id and reference', async ({ page }) => {
    await openLive(page, 'field--form')
    const before = await page.locator('#demo [aria-labelledby]').evaluateAll((all) => all.map((el) => `${el.id} ${el.getAttribute('aria-labelledby') ?? ''}`))
    await page.getByRole('textbox', { name: 'Email' }).fill('changed@example.com')
    await page.getByRole('checkbox', { name: 'I accept the terms' }).click()
    expect(await serverEntries(page)).toEqual([['email', 'changed@example.com'], ['message', 'Hello']])
    await page.locator('#demo form').evaluate((form) => { (form as HTMLFormElement).reset() })
    await expect.poll(() => serverEntries(page)).toEqual([['email', 'omar@example.com'], ['message', 'Hello'], ['terms', 'on']])
    await page.getByRole('textbox', { name: 'Message' }).fill('Again')
    await page.getByRole('button', { name: 'Clear' }).click()
    await expect.poll(() => serverEntries(page)).toEqual([['email', 'omar@example.com'], ['message', 'Hello'], ['terms', 'on']])
    expect(await page.locator('#demo [aria-labelledby]').evaluateAll((all) => all.map((el) => `${el.id} ${el.getAttribute('aria-labelledby') ?? ''}`))).toEqual(before)
    expect(await liveErrors(page)).toEqual([])
  })
})

declare global { interface Window { fieldSent?: [string, string][][] } }
