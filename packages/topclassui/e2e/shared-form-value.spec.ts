import { expect, test, type Page } from '@playwright/test'

import { liveErrors, openLive } from './live.js'

// useFormValue in Chromium, where a reset fires before the inputs go back and React 19 resets a form after its action.
// No control holds the hook yet, so native stand-ins in a fixture module drive it: see e2e/fixtures/shared-form-value.tsx.
const FIXTURE = '/e2e/fixtures/shared-form-value.tsx'

test.beforeEach(async ({ page }) => {
  await openLive(page, 'separator--horizontal')
  await page.addScriptTag({ type: 'module', url: FIXTURE })
  await expect(page.locator('#form-value-fixture')).toHaveAttribute('data-ready', '')
})

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

/** What the form would send now, read by the browser itself. */
const entries = (page: Page, form: string) => page.locator(`#${form}`).evaluate(
  (node) => [...new FormData(node as HTMLFormElement).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name]),
)

const sent = (page: Page, form: string) => page.evaluate((name) => window.formValueSent?.[name] ?? [], form)

const box = (page: Page, name: string) => page.locator(`input#${name}`)
const shown = (page: Page, name: string) => page.locator(`#${name} [data-shown]`)
/** The hook's own state beside a box: the box alone is put back by the browser, whatever the hook holds. */
const held = (page: Page, name: string) => page.locator(`[data-shown="${name}"]`)

/** Moves every value of the plain form away from its default, two of them from outside the form. */
async function changeAll(page: Page): Promise<void> {
  await box(page, 'agree').check()
  await box(page, 'news').uncheck()
  await box(page, 'owned').check()
  await box(page, 'outside').check()
  await page.locator('#size').getByRole('button', { name: 'l' }).click()
  await page.locator('#far').getByRole('button', { name: 's' }).click()
  await expect(shown(page, 'far')).toHaveText('s')
  expect(await entries(page, 'plain')).toEqual([['agree', 'on'], ['owned', 'on'], ['size', 'l'], ['outside', 'on'], ['far', 's']])
}

for (const how of ['form.reset()', 'a reset button'] as const) {
  test(`after ${how}, each value is back at its default on screen and in FormData, and a controlled one stays`, async ({ page }) => {
    await changeAll(page)
    if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
    else await page.getByRole('button', { name: 'Reset' }).first().click()

    await expect(shown(page, 'size')).toHaveText('m')
    await expect(shown(page, 'far')).toHaveText('m')
    await expect(held(page, 'agree')).toHaveText('false')
    await expect(box(page, 'agree')).not.toBeChecked()
    await expect(held(page, 'news')).toHaveText('true')
    await expect(box(page, 'news')).toBeChecked()
    await expect(held(page, 'outside')).toHaveText('false')
    await expect(box(page, 'outside')).not.toBeChecked()
    // Its owner resets it: the box keeps the owner's value, and so does the form.
    await expect(page.locator('#owner')).toHaveText('true')
    await expect(held(page, 'owned')).toHaveText('true')
    await expect(box(page, 'owned')).toBeChecked()
    expect(await entries(page, 'plain')).toEqual([['news', 'on'], ['owned', 'on'], ['size', 'm'], ['far', 'm']])
  })
}

test('after a React 19 form action settles, the form is back at its defaults on screen and in FormData', async ({ page }) => {
  await box(page, 'agree2').check()
  await page.locator('#size2').getByRole('button', { name: 's' }).click()
  await page.locator('#action').getByRole('button', { name: 'Send' }).click()

  await expect.poll(() => sent(page, 'action')).toEqual([[['agree2', 'on'], ['size2', 's']]])
  await expect(shown(page, 'size2')).toHaveText('m')
  await expect(held(page, 'agree2')).toHaveText('false')
  await expect(box(page, 'agree2')).not.toBeChecked()
  expect(await entries(page, 'action')).toEqual([['size2', 'm']])
})

test('with the action\'s answer as the new defaults, every value stays on screen and is sent again', async ({ page }) => {
  await box(page, 'agree3').check()
  await page.locator('#size3').getByRole('button', { name: 'l' }).click()
  const send = page.locator('#echo').getByRole('button', { name: 'Send' })
  await send.click()
  await expect.poll(() => sent(page, 'echo')).toHaveLength(1)

  // The reset lands after the timeout of the hook: wait for a frame past it before reading the box.
  await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
  await expect(shown(page, 'size3')).toHaveText('l')
  await expect(held(page, 'agree3')).toHaveText('true')
  await expect(box(page, 'agree3')).toBeChecked()
  expect(await entries(page, 'echo')).toEqual([['agree3', 'on'], ['size3', 'l']])

  await send.click()
  await expect.poll(() => sent(page, 'echo')).toEqual([[['agree3', 'on'], ['size3', 'l']], [['agree3', 'on'], ['size3', 'l']]])
})

test('a reset that is cancelled moves nothing, as the browser moves none of the inputs', async ({ page }) => {
  await box(page, 'agree4').check()
  await page.locator('#size4').getByRole('button', { name: 'l' }).click()
  await page.locator('#cancelled').getByRole('button', { name: 'Reset' }).click()

  await page.evaluate(() => new Promise((done) => { setTimeout(() => { requestAnimationFrame(() => { done(null) }) }, 0) }))
  await expect(shown(page, 'size4')).toHaveText('l')
  await expect(held(page, 'agree4')).toHaveText('true')
  await expect(box(page, 'agree4')).toBeChecked()
  expect(await entries(page, 'cancelled')).toEqual([['agree4', 'on'], ['size4', 'l']])
})
