import { expect, test, type Locator, type Page } from '@playwright/test'

import { liveErrors, openLive } from './live.js'

// Layer 2 of validation in a real browser: the native attribute is removed or skipped first, as a DevTools edit, a
// script or a paste would, and the check must still stop the form. A submit that gets through is counted, not sent.

/** Counts every submit that reaches the window, and keeps the page where it is. */
async function countSubmits(page: Page): Promise<void> {
  await page.evaluate(() => {
    const counted = window as unknown as { __submits: number }
    counted.__submits = 0
    window.addEventListener('submit', (event) => { counted.__submits += 1; event.preventDefault() })
  })
}

const submits = (page: Page) => page.evaluate(() => (window as unknown as { __submits: number }).__submits)

/** Writes the value as a script would, with no event at all, and drops the attributes named first. */
async function script(element: Locator, value: string, drop: readonly string[] = []): Promise<void> {
  await element.evaluate((node, { text, names }) => {
    if (!(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)) throw new Error(`${node.tagName} is no field`)
    for (const name of names) node.removeAttribute(name)
    node.value = text
  }, { text: value, names: [...drop] })
}

/** What the check left on a field: the message the browser would show, aria-invalid and the fault. */
const markOf = (element: Locator) => element.evaluate((node) => ({
  message: node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement ? node.validationMessage : '',
  invalid: node.getAttribute('aria-invalid'),
  fault: node.getAttribute('data-value-fault'),
}))

const inputOf = (page: Page, name: string) => page.locator(`input[name="${name}"]`)

test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

test.describe('Input with validate', () => {
  test('a value set from script past a removed maxlength is held to the cap, and the form is not sent', async ({ page }) => {
    await openLive(page, 'input--validate')
    await countSubmits(page)
    const handle = page.getByRole('textbox', { name: 'Handle' })
    await script(handle, 'a'.repeat(13), ['maxlength'])
    await page.getByRole('button', { name: 'Send' }).click()
    expect(await submits(page)).toBe(0)
    expect(await markOf(handle)).toEqual({ message: 'Use at most 12 characters', invalid: 'true', fault: 'tooLong' })
    await expect(handle).toBeFocused()
    // Back inside the cap, the same click sends it.
    await handle.fill('omar')
    await page.getByRole('button', { name: 'Send' }).click()
    expect(await submits(page)).toBe(1)
    expect(await markOf(handle)).toEqual({ message: '', invalid: null, fault: null })
  })

  test('a paste past a removed maxlength is marked as it lands', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await openLive(page, 'input--validate')
    await countSubmits(page)
    const handle = page.getByRole('textbox', { name: 'Handle' })
    await handle.evaluate((node) => { node.removeAttribute('maxlength') })
    await page.evaluate(() => navigator.clipboard.writeText('a-handle-far-too-long'))
    await handle.focus()
    await page.keyboard.press('ControlOrMeta+V')
    await expect(handle).toHaveValue('a-handle-far-too-long')
    expect(await markOf(handle)).toEqual({ message: 'Use at most 12 characters', invalid: 'true', fault: 'tooLong' })
    await page.getByRole('button', { name: 'Send' }).click()
    expect(await submits(page)).toBe(0)
  })

  test('with maxlength in place, the browser cuts the same paste and the check has nothing to say', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await openLive(page, 'input--validate')
    const handle = page.getByRole('textbox', { name: 'Handle' })
    await page.evaluate(() => navigator.clipboard.writeText('a-handle-far-too-long'))
    await handle.focus()
    await page.keyboard.press('ControlOrMeta+V')
    await expect(handle).toHaveValue('a-handle-far')
    expect(await markOf(handle)).toEqual({ message: '', invalid: null, fault: null })
  })

  test('a value off the pattern, with the pattern removed, is held to it', async ({ page }) => {
    await openLive(page, 'input--validate')
    await countSubmits(page)
    const postcode = page.getByRole('textbox', { name: 'Postcode' })
    await script(postcode, '1234a', ['pattern'])
    await page.getByRole('button', { name: 'Send' }).click()
    expect(await submits(page)).toBe(0)
    expect(await markOf(postcode)).toEqual({ message: 'Use the format asked for', invalid: 'true', fault: 'patternMismatch' })
  })

  test('a number past a removed max, under a removed min and off a removed step is held to each', async ({ page }) => {
    await openLive(page, 'input--validate')
    await countSubmits(page)
    const guests = page.getByRole('spinbutton', { name: 'Guests' })
    const send = page.getByRole('button', { name: 'Send' })
    await script(guests, '50', ['min', 'max', 'step'])
    await send.click()
    expect(await markOf(guests)).toEqual({ message: 'Enter 8 or less', invalid: 'true', fault: 'rangeOverflow' })
    await script(guests, '0')
    await send.click()
    expect(await markOf(guests)).toEqual({ message: 'Enter 1 or more', invalid: 'true', fault: 'rangeUnderflow' })
    await script(guests, '2.5')
    await send.click()
    expect(await markOf(guests)).toEqual({ message: 'Enter one of the allowed values', invalid: 'true', fault: 'stepMismatch' })
    expect(await submits(page)).toBe(0)
    await script(guests, '3')
    await send.click()
    expect(await submits(page)).toBe(1)
  })
})

test.describe('Textarea, in the holder showCount loads', () => {
  test('a value set from script past a removed maxlength is held to the cap of 5000, and the form is not sent', async ({ page }) => {
    await openLive(page, 'textarea--form')
    await countSubmits(page)
    const notes = page.getByRole('textbox', { name: 'Notes' })
    await script(notes, 'x'.repeat(5001), ['maxlength'])
    await page.getByRole('button', { name: 'Send' }).click()
    expect(await submits(page)).toBe(0)
    expect(await markOf(notes)).toEqual({ message: 'Use at most 5,000 characters', invalid: 'true', fault: 'tooLong' })
    await expect(notes).toBeFocused()
  })
})

test.describe('Combobox', () => {
  test('a query set from script past a removed maxlength is held to the search cap of 256', async ({ page }) => {
    await openLive(page, 'combobox--form')
    await countSubmits(page)
    const query = page.getByRole('combobox', { name: 'Framework' })
    await script(query, 'q'.repeat(257), ['maxlength'])
    await page.getByRole('button', { name: 'Save' }).click()
    expect(await submits(page)).toBe(0)
    expect(await markOf(query)).toEqual({ message: 'Use at most 256 characters', invalid: 'true', fault: 'tooLong' })
  })
})

test.describe('OTPField', () => {
  test('a code written into the hidden input it sends is held to six digits, and every cell is marked', async ({ page }) => {
    await openLive(page, 'otp-field--form')
    await countSubmits(page)
    await script(inputOf(page, 'code'), '12a456', ['pattern'])
    await page.getByRole('button', { name: 'Verify' }).click()
    expect(await submits(page)).toBe(0)
    const cells = page.locator('[role="group"] input')
    expect(await cells.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-invalid')))).toEqual(Array(6).fill('true'))
    expect(await markOf(cells.first())).toEqual({ message: 'Use the format asked for', invalid: 'true', fault: 'patternMismatch' })
    await expect(cells.first()).toBeFocused()
  })

  test('a code longer than the cells, with maxlength removed, is held to six', async ({ page }) => {
    await openLive(page, 'otp-field--form')
    await countSubmits(page)
    await script(inputOf(page, 'code'), '1234567', ['maxlength'])
    await page.getByRole('button', { name: 'Verify' }).click()
    expect(await submits(page)).toBe(0)
    expect(await markOf(page.locator('[role="group"] input').first())).toEqual({ message: 'Use at most 6 characters', invalid: 'true', fault: 'tooLong' })
  })
})

test.describe('NumberField', () => {
  test('a number written into the hidden input it sends, past its removed max, is held to it on the visible input', async ({ page }) => {
    await openLive(page, 'number-field--form')
    await countSubmits(page)
    await script(inputOf(page, 'guests'), '50', ['min', 'max', 'step'])
    await page.getByRole('button', { name: 'Book' }).click()
    expect(await submits(page)).toBe(0)
    const shown = page.getByRole('textbox', { name: 'Guests' })
    expect(await markOf(shown)).toEqual({ message: 'Enter 8 or less', invalid: 'true', fault: 'rangeOverflow' })
    await expect(shown).toBeFocused()
  })
})
