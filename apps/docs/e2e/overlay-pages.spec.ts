import { type Locator, type Page, expect, test } from '@playwright/test'

import { axeViolations } from './pages'

const SLUGS = ['dialog', 'drawer', 'popover', 'tooltip', 'dropdown', 'command'] as const
const LOCALES = [{ locale: 'en', dir: 'ltr' }, { locale: 'ar', dir: 'rtl' }] as const
const MODES = ['light', 'dark', 'ocean'] as const
const EVERY_STATE = { en: 'Every state', ar: 'كل الحالات، بدون تمرير الفأرة' } as const

/** The popup each overlay opens: a popup renders only in the browser, so it is the proof that the trigger hydrated. A tooltip has no role. */
const TOOLTIP = '[data-placement][data-open]'
const POPUP = { dialog: '[role="dialog"]', drawer: '[role="dialog"]', popover: '[role="dialog"]', tooltip: TOOLTIP, dropdown: '[role="menu"]', command: '[role="dialog"]' } as const

/** Each states strip: the cells drawn open, and the trigger of its one closed cell, the first button of that name.
 * Command draws its open cells as pictures hidden from a reader, and its closed one waits behind the site's own Ctrl K. */
const STATES = {
  dialog: { open: 4, trigger: 'Open' },
  drawer: { open: 4, trigger: 'Open' },
  popover: { open: 2, trigger: 'Share' },
  tooltip: { open: 2, trigger: 'Copy link' },
  dropdown: { open: 3, trigger: 'Actions' },
  command: { open: 0, trigger: null },
} as const
const COMMAND_PICTURES = 5

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  // The site's icon is the shell's (S6 manifest.ts); until it lands the browser's own /favicon.ico request 404s.
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(`${message.text()} ${message.location().url}`)
  })
  return errors
}

async function openIn(page: Page, path: string, mode: string) {
  await page.addInitScript((stored) => { localStorage.setItem('tc-theme', stored) }, mode)
  const response = await page.goto(path)
  expect(response?.status()).toBe(200)
}

const card = (page: Page, slug: string) => page.locator(`[data-component="${slug}"]`)

/** Waits until nothing animates in the popup's portal, as the library's e2e does: axe reads a fading popup as low contrast. */
async function atRest(target: Locator): Promise<void> {
  await target.evaluate(async (element) => {
    const layer = element.closest('[data-base-ui-portal]') ?? element
    const running = () => layer.getAnimations({ subtree: true }).filter((animation) => {
      const end = animation.effect?.getComputedTiming().endTime
      return animation.playState === 'running' && typeof end === 'number' && Number.isFinite(end)
    })
    for (let pending = running(); pending.length > 0; pending = running()) {
      await Promise.allSettled(pending.map((animation) => animation.finished))
    }
  })
}

const stage = (page: Page, slug: string) => card(page, slug).locator('[style*="--tc-stage-height"]')
/** The popup the stage draws open; Command's stage is a picture of the modal palette, so its drawn box stands in. */
const stagePopup = (page: Page, slug: (typeof SLUGS)[number]) => stage(page, slug).locator(slug === 'command' ? '[data-stage]' : POPUP[slug])
/** The states strip under its Every state heading, found even while a modal it opened hides the rest of the page. */
const strip = (page: Page, slug: string, locale: (typeof LOCALES)[number]['locale']) =>
  card(page, slug).locator('div').filter({ has: page.getByRole('heading', { name: EVERY_STATE[locale], exact: true, includeHidden: true }) }).last().locator('..')

/** A tooltip opens on hover; every other overlay on a press. The trigger sits mid-screen, so a popup has room on every side. */
async function drive(slug: (typeof SLUGS)[number], trigger: Locator) {
  await trigger.evaluate((element) => { element.scrollIntoView({ block: 'center', behavior: 'instant' }) })
  await (slug === 'tooltip' ? trigger.hover() : trigger.click())
}

for (const slug of SLUGS) {
  for (const { locale, dir } of LOCALES) {
    for (const mode of MODES) {
      test(`${slug} renders in ${locale} in ${mode}, draws its popup open in its stage, and passes axe`, async ({ page }) => {
        const errors = collectErrors(page)
        await openIn(page, `/${locale}/docs/components/${slug}`, mode)
        const html = page.locator('html')
        await expect(html).toHaveAttribute('lang', locale)
        await expect(html).toHaveAttribute('dir', dir)
        await expect(html).toHaveAttribute('data-theme', mode)
        await expect(page.locator('h1')).toHaveCount(1)
        await card(page, slug).scrollIntoViewIfNeeded()
        await page.waitForLoadState('networkidle')
        const drawn = stagePopup(page, slug)
        await expect(drawn).toHaveCount(1)
        await expect(drawn).toBeVisible()
        await atRest(drawn)
        expect(await drawn.evaluate((element) => getComputedStyle(element).direction)).toBe(dir)
        expect(await axeViolations(page)).toEqual([])
        expect(errors).toEqual([])
      })
    }

    test(`${slug} in ${locale}: every state's cell draws its popup, and the closed one opens on its trigger`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(`/${locale}/docs/components/${slug}`)
      const states = strip(page, slug, locale)
      await states.scrollIntoViewIfNeeded()
      const { open, trigger } = STATES[slug]
      await expect(states.locator(POPUP[slug])).toHaveCount(open)
      // A popup whose trigger has scrolled out of view hides itself, so each cell comes on screen for its check.
      for (const drawn of await states.locator(POPUP[slug]).all()) {
        await drawn.evaluate((element) => { element.scrollIntoView({ block: 'center', behavior: 'instant' }) })
        await expect(drawn).toBeVisible()
      }
      if (trigger === null) {
        await expect(states.locator('[aria-hidden="true"]:has(svg)')).toHaveCount(COMMAND_PICTURES)
      } else {
        // A modal dialog hides the rest of the page from the accessibility tree once it opens, its own trigger included.
        const closed = states.getByRole('button', { name: trigger, exact: true, includeHidden: true }).first()
        // The stage loads after the strip, and its tooltip, held open, closes any other open one of the shared delay group.
        await expect(stagePopup(page, slug)).toHaveCount(1)
        await expect(closed).not.toHaveAttribute('data-popup-open')
        await drive(slug, closed)
        await expect(closed).toHaveAttribute('data-popup-open', '')
      }
      expect(errors).toEqual([])
    })

    test(`${slug} in ${locale}: every example hydrates and opens`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(`/${locale}/docs/components/${slug}`)
      await page.waitForLoadState('networkidle')
      const previews = page.locator('section[aria-labelledby="examples"] [data-example-stage]')
      const count = await previews.count()
      expect(count).toBeGreaterThan(0)
      for (let index = 0; index < count; index += 1) {
        const name = await previews.nth(index).locator('xpath=..').locator('[data-example-name]').getAttribute('data-example-name')
        // The stage and the states strip hold popups drawn open, so each example is read from its own trigger.
        const trigger = previews.nth(index).locator('button').first()
        await drive(slug, trigger)
        if (slug === 'tooltip' && name === 'disabled') {
          // The demo's own default delay passes before the check, so a tooltip that was going to open would have.
          await page.waitForTimeout(1000)
          await expect(trigger).not.toHaveAttribute('data-popup-open')
          continue
        }
        // Command's example opens its palette from a plain button, so the palette itself is the proof.
        if (slug === 'command') await expect(page.locator(POPUP.command), name ?? String(index)).toBeVisible()
        else await expect(trigger, name ?? String(index)).toHaveAttribute('data-popup-open', '')
        await page.keyboard.press('Escape')
        if (slug === 'command') await expect(page.locator(POPUP.command)).toHaveCount(0)
        else await expect(trigger, name ?? String(index)).not.toHaveAttribute('data-popup-open')
      }
      expect(errors).toEqual([])
    })
  }
}

test('no overlay page scrolls sideways at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of SLUGS) {
    for (const { locale } of LOCALES) {
      await page.goto(`/${locale}/docs/components/${slug}`)
      const wider = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(wider, `${locale}/${slug}`).toBe(false)
    }
  }
})

test('every overlay code block shows the rewritten imports, never a path into the library', async ({ page }) => {
  for (const slug of SLUGS) {
    await page.goto(`/en/docs/components/${slug}`)
    const text = (await page.locator('pre').allTextContents()).join('\n')
    expect(text).toContain(`from 'topclassui/${slug}'`)
    expect(text).not.toMatch(/from '(\.\.?\/|#)/)
  }
})

async function choose(page: Page, slug: string, prop: string, option: string) {
  await card(page, slug).getByRole('combobox', { name: prop }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}

test('Dialog: size from Try it reaches the open popup and the code', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/dialog')
  await card(page, 'dialog').scrollIntoViewIfNeeded()
  await choose(page, 'dialog', 'size', 'lg')
  await expect(card(page, 'dialog').locator('pre').first()).toContainText('size="lg"')
  await expect(stagePopup(page, 'dialog')).toHaveAttribute('data-size', 'lg')
  await card(page, 'dialog').getByRole('checkbox', { name: 'closeButton' }).click()
  await expect(stagePopup(page, 'dialog').getByRole('button')).toHaveText(['Cancel', 'Delete'])
  expect(errors).toEqual([])
})

test('Drawer: placement start opens on the right in Arabic', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/ar/docs/components/drawer')
  await card(page, 'drawer').scrollIntoViewIfNeeded()
  await choose(page, 'drawer', 'placement', 'start')
  await expect(card(page, 'drawer').locator('pre').first()).toContainText('placement="start"')
  const sheet = stagePopup(page, 'drawer')
  await expect(sheet).toHaveAttribute('data-placement', 'start')
  // The stage draws the sheet inside its own box, so the right is the stage's; the sheet settles a transition after it moves.
  await expect.poll(async () => sheet.evaluate((element) => {
    const { left, right } = element.getBoundingClientRect()
    const box = element.closest('[data-stage]')?.getBoundingClientRect()
    return box !== undefined && left > box.left && (left + right) / 2 > box.left + box.width / 2 && right >= box.right - 20
  })).toBe(true)
  expect(errors).toEqual([])
})

test('Popover: placement top opens above its trigger', async ({ page }) => {
  await page.goto('/en/docs/components/popover')
  await card(page, 'popover').scrollIntoViewIfNeeded()
  await choose(page, 'popover', 'placement', 'top')
  const trigger = stage(page, 'popover').getByRole('button', { name: 'Share', exact: true })
  const surface = stagePopup(page, 'popover')
  await expect(surface).toHaveAttribute('data-side', 'top')
  await atRest(surface)
  const [above, below] = await Promise.all([surface.boundingBox(), trigger.boundingBox()])
  expect((above?.y ?? 0) + (above?.height ?? 0)).toBeLessThanOrEqual(below?.y ?? 0)
})

test('Tooltip: placement bottom opens below its trigger', async ({ page }) => {
  await page.goto('/en/docs/components/tooltip')
  await card(page, 'tooltip').scrollIntoViewIfNeeded()
  await choose(page, 'tooltip', 'placement', 'bottom')
  const trigger = stage(page, 'tooltip').getByRole('button', { name: 'Copy link' })
  const tip = stagePopup(page, 'tooltip')
  await expect(tip).toHaveAttribute('data-side', 'bottom')
  await atRest(tip)
  const [under, over] = await Promise.all([tip.boundingBox(), trigger.boundingBox()])
  expect(under?.y ?? 0).toBeGreaterThanOrEqual((over?.y ?? 0) + (over?.height ?? 0))
})

test('Dropdown: tone danger colours the last row', async ({ page }) => {
  await page.goto('/en/docs/components/dropdown')
  await card(page, 'dropdown').scrollIntoViewIfNeeded()
  await card(page, 'dropdown').getByRole('combobox', { name: 'tone' }).click()
  await page.getByRole('option', { name: 'danger', exact: true }).click()
  await expect(card(page, 'dropdown').locator('pre').first()).toContainText('tone="danger"')
  await expect(stagePopup(page, 'dropdown').getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-tone', 'danger')
})

test('Command: defaultOpen from Try it opens the palette with its list', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/en/docs/components/command')
  await card(page, 'command').scrollIntoViewIfNeeded()
  // Pressed once the demo has mounted, so Try it must remount it for defaultOpen to take effect.
  await page.waitForLoadState('networkidle')
  await card(page, 'command').getByRole('checkbox', { name: 'defaultOpen' }).click()
  const palette = page.getByRole('dialog')
  await expect(palette).toBeVisible()
  await expect(palette.getByRole('option', { name: 'Dialog' })).toBeVisible()
  await page.keyboard.type('draw')
  await expect(palette.getByRole('option')).toHaveText(['Drawer'])
  expect(errors).toEqual([])
})
