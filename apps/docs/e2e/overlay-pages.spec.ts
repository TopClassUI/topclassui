import AxeBuilder from '@axe-core/playwright'
import { type Locator, type Page, expect, test } from '@playwright/test'

const SLUGS = ['dialog', 'drawer', 'popover', 'tooltip', 'dropdown', 'command'] as const
const LOCALES = [{ locale: 'en', dir: 'ltr' }, { locale: 'ar', dir: 'rtl' }] as const
const MODES = ['light', 'dark', 'ocean'] as const
const EVERY_STATE = { en: 'Every state', ar: 'كل الحالات، بدون تمرير الفأرة' } as const

/** The popup each overlay opens: a popup renders only in the browser, so it is the proof that the trigger hydrated. A tooltip has no role. */
const TOOLTIP = '[data-placement][data-open]'
const POPUP = { dialog: '[role="dialog"]', drawer: '[role="dialog"]', popover: '[role="dialog"]', tooltip: TOOLTIP, dropdown: '[role="menu"]', command: '[role="dialog"]' } as const
const ANY_POPUP = `[role="dialog"], [role="menu"], ${TOOLTIP}`

/** Every state demo's triggers, in the order the demo writes them; a disabled tooltip opens nothing. */
const STATES = {
  dialog: ['Open', 'Alert', 'Scrolled', 'Focus trapped', 'Non-modal'],
  drawer: ['Side sheet', 'Bottom sheet', 'Scrolled', 'Focus trapped', 'Non-modal'],
  popover: ['Open', 'Above', 'With close', 'Modal', 'On hover'],
  tooltip: ['Top', 'Bottom', 'Delayed'],
  dropdown: ['Open', 'Disabled row', 'Danger row', 'Grouped'],
  command: ['Open', 'Empty', 'Loading'],
} as const

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
const popup = (page: Page, slug: (typeof SLUGS)[number]) => page.locator(POPUP[slug]).last()

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

/** A tooltip opens on hover; every other overlay on a press. The trigger sits mid-screen, so a popup has room on every side. */
async function drive(slug: (typeof SLUGS)[number], trigger: Locator) {
  await trigger.evaluate((element) => { element.scrollIntoView({ block: 'center', behavior: 'instant' }) })
  await (slug === 'tooltip' ? trigger.hover() : trigger.click())
}

async function close(page: Page, slug: (typeof SLUGS)[number]) {
  await page.keyboard.press('Escape')
  await expect(page.locator(POPUP[slug])).toHaveCount(0)
}

for (const slug of SLUGS) {
  for (const { locale, dir } of LOCALES) {
    for (const mode of MODES) {
      test(`${slug} renders in ${locale} in ${mode}, opens from its stage, and passes axe closed and open`, async ({ page }) => {
        const errors = collectErrors(page)
        await openIn(page, `/${locale}/docs/components/${slug}`, mode)
        const html = page.locator('html')
        await expect(html).toHaveAttribute('lang', locale)
        await expect(html).toHaveAttribute('dir', dir)
        await expect(html).toHaveAttribute('data-theme', mode)
        await expect(page.locator('h1')).toHaveCount(1)
        await card(page, slug).scrollIntoViewIfNeeded()
        await page.waitForLoadState('networkidle')
        const closed = await new AxeBuilder({ page }).analyze()
        expect(closed.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])

        await drive(slug, stage(page, slug).locator('button').first())
        await expect(popup(page, slug)).toBeVisible()
        await atRest(popup(page, slug))
        expect(await popup(page, slug).evaluate((element) => getComputedStyle(element).direction)).toBe(dir)
        const open = await new AxeBuilder({ page }).include(POPUP[slug]).analyze()
        expect(open.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
        await close(page, slug)
        expect(errors).toEqual([])
      })
    }

    test(`${slug} in ${locale}: every state's trigger opens its popup`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(`/${locale}/docs/components/${slug}`)
      const states = card(page, slug).locator('div').filter({ has: page.getByRole('heading', { name: EVERY_STATE[locale], exact: true }) }).last().locator('..')
      for (const name of STATES[slug]) {
        await drive(slug, states.getByRole('button', { name, exact: true }))
        await expect(popup(page, slug), name).toBeVisible()
        await close(page, slug)
      }
      if (slug === 'tooltip') {
        await drive(slug, states.getByRole('button', { name: 'Disabled', exact: true }))
        await expect(page.locator(TOOLTIP)).toHaveCount(0)
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
        await drive(slug, previews.nth(index).locator('button').first())
        if (slug === 'tooltip' && name === 'disabled') {
          // The demo's own default delay passes before the check, so a tooltip that was going to open would have.
          await page.waitForTimeout(1000)
          await expect(page.locator(TOOLTIP)).toHaveCount(0)
          continue
        }
        // A menu example may open a dialog from its trigger instead.
        await expect(page.locator(ANY_POPUP).last(), name ?? String(index)).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.locator(ANY_POPUP)).toHaveCount(0)
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
  await card(page, 'dialog').getByRole('button', { name: 'Publish', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveAttribute('data-size', 'lg')
  await close(page, 'dialog')
  await card(page, 'dialog').getByRole('checkbox', { name: 'closeButton' }).click()
  await card(page, 'dialog').getByRole('button', { name: 'Publish', exact: true }).click()
  await expect(page.getByRole('dialog').getByRole('button')).toHaveText(['Cancel', 'Publish now'])
  expect(errors).toEqual([])
})

test('Drawer: placement start opens on the right in Arabic', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/ar/docs/components/drawer')
  await card(page, 'drawer').scrollIntoViewIfNeeded()
  await choose(page, 'drawer', 'placement', 'start')
  await expect(card(page, 'drawer').locator('pre').first()).toContainText('placement="start"')
  await stage(page, 'drawer').getByRole('button').click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toHaveAttribute('data-placement', 'start')
  // The sheet slides in, so its box settles a transition after it opens; the scroll lock may keep a scrollbar's gutter beside it.
  await expect.poll(async () => sheet.evaluate((element) => {
    const { left, right } = element.getBoundingClientRect()
    return left > window.innerWidth / 2 && right >= window.innerWidth - 20
  })).toBe(true)
  expect(errors).toEqual([])
})

test('Popover: placement top opens above its trigger', async ({ page }) => {
  await page.goto('/en/docs/components/popover')
  await card(page, 'popover').scrollIntoViewIfNeeded()
  await choose(page, 'popover', 'placement', 'top')
  const trigger = card(page, 'popover').getByRole('button', { name: 'Share', exact: true })
  await drive('popover', trigger)
  const surface = page.getByRole('dialog')
  await expect(surface).toHaveAttribute('data-side', 'top')
  const [above, below] = await Promise.all([surface.boundingBox(), trigger.boundingBox()])
  expect((above?.y ?? 0) + (above?.height ?? 0)).toBeLessThanOrEqual(below?.y ?? 0)
})

test('Tooltip: placement bottom opens below its trigger', async ({ page }) => {
  await page.goto('/en/docs/components/tooltip')
  await card(page, 'tooltip').scrollIntoViewIfNeeded()
  await choose(page, 'tooltip', 'placement', 'bottom')
  const trigger = stage(page, 'tooltip').getByRole('button', { name: 'Copy link' })
  await drive('tooltip', trigger)
  const tip = page.locator(TOOLTIP)
  await expect(tip).toHaveAttribute('data-side', 'bottom')
  const [under, over] = await Promise.all([tip.boundingBox(), trigger.boundingBox()])
  expect(under?.y ?? 0).toBeGreaterThanOrEqual((over?.y ?? 0) + (over?.height ?? 0))
})

test('Dropdown: tone danger colours the last row', async ({ page }) => {
  await page.goto('/en/docs/components/dropdown')
  await card(page, 'dropdown').scrollIntoViewIfNeeded()
  await card(page, 'dropdown').getByRole('combobox', { name: 'tone' }).click()
  await page.getByRole('option', { name: 'danger', exact: true }).click()
  await expect(card(page, 'dropdown').locator('pre').first()).toContainText('tone="danger"')
  await card(page, 'dropdown').getByRole('button', { name: 'Actions', exact: true }).click()
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-tone', 'danger')
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
