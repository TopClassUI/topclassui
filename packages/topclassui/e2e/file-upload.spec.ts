import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { DIRECTIONS, MODES } from '../scripts/lib/harness.js'
import { CLIENT_ENTRY } from '../scripts/lib/live-harness.js'
import { serverEntries } from './form.js'
import { type LiveOptions, expectNoSidewaysScroll, liveErrors, liveUrl, openLive } from './live.js'
import { boxOf } from './overlay.js'
import { urlFor } from './pages.js'
import { FORCED_CANVAS, contrast, pixelsOf } from './pixels.js'

// What happy-dom cannot do: a real picker's files, a real multipart post with and without script, a drop built in the
// page, the ring, the targets, forced colours, the screens and the reset of a real form.

const MB = 1024 * 1024
const SCREENS = [{ width: 320, height: 480 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }] as const
const DEMOS = ['file-upload--basic', 'file-upload--form', 'file-upload--in-field', 'file-upload--multiple', 'file-upload--playground', 'file-upload--rtl', 'file-upload--states'] as const
const COARSE = { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } as const
const LONG = `${'quarterly-report-final-'.repeat(13).slice(0, 296)}.pdf`

type Payload = { name: string, mimeType: string, buffer: Buffer }
const pdf = (name: string, size = 4): Payload => ({ name, mimeType: 'application/pdf', buffer: Buffer.alloc(size, 37) })
const txt = (name: string): Payload => ({ name, mimeType: 'text/plain', buffer: Buffer.from('notes') })

const inputIn = (page: Page, scope = '#demo') => page.locator(`${scope} input[type="file"]`).first()
const zoneOf = (input: Locator) => input.locator('xpath=..')
const css = (element: Locator, property: string) => element.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
/** Each row of a list as its name and what follows it: the size, or the reason. */
const rowsIn = (page: Page, scope = '#demo') => page.locator(`${scope} li`).evaluateAll((all) => all.map((row) => {
  const [, name, note] = [...row.children].map((child) => child.textContent)
  return `${name ?? ''} | ${note ?? ''}`
}))
const statusIn = (page: Page, scope = '#demo') => page.locator(`${scope} [role="status"]`).allTextContents()
/** How many rows a list shows whole, the heights its first and last rows are drawn at, and whether it scrolls. */
const shownIn = (list: Locator) => list.evaluate((el) => {
  const box = el.getBoundingClientRect()
  const rows = [...el.querySelectorAll('li')].map((row) => row.getBoundingClientRect())
  const heights = [...new Set([rows[0], rows.at(-1)].map((r) => Math.round(r?.height ?? 0)))]
  return { whole: rows.filter((r) => r.top >= box.top - 0.5 && r.bottom <= box.bottom + 0.5).length, rowHeights: heights, scrolls: el.scrollHeight > el.clientHeight }
})

/** A computed colour as sRGB numbers, painted on a canvas: the tokens compute to oklch, which rgbOf cannot read. */
const srgb = (page: Page, computed: string) => page.evaluate((colour): [number, number, number] => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const pen = canvas.getContext('2d')
  if (!pen) throw new Error('no canvas')
  pen.fillStyle = colour
  pen.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = pen.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}, computed)

/** The word the harness's provider gives a remove button: the rtl pages mount the Arabic labels. */
const REMOVE = { ltr: 'Remove', rtl: 'إزالة' } as const

/** A drag of files from the desktop, built in the page and dispatched on the input, which covers the zone. A drag of
 * files carries the Files type from its first event, so every event here carries one file at least. */
const drag = (input: Locator, type: 'dragenter' | 'dragover' | 'dragleave' | 'drop', names: string[] = ['dragged.pdf']) => input.evaluate((el, [kind, files]) => {
  const transfer = new DataTransfer()
  for (const name of files) transfer.items.add(new File(['%PDF'], name, { type: 'application/pdf' }))
  return el.dispatchEvent(new DragEvent(kind, { bubbles: true, cancelable: true, dataTransfer: transfer }))
}, [type, names] as const)

test.describe('what the server HTML sends, with no script at all', () => {
  test.use({ javaScriptEnabled: false })

  /** Posts land here: each multipart body, as the file names its parts carry. */
  const catchPosts = async (page: Page, url: string) => {
    const posts: string[][] = []
    await page.route(url, async (route) => {
      if (route.request().method() !== 'POST') { await route.continue(); return }
      const body = route.request().postDataBuffer()?.toString('latin1') ?? ''
      posts.push([...body.matchAll(/name="attachments"; filename="([^"]*)"/g)].map((match) => match[1] ?? ''))
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<p id="sent">sent</p>' })
    })
    return posts
  }

  test('file-upload--form: two picked files post as two parts of one multipart body', async ({ page }) => {
    const url = liveUrl('file-upload--form')
    const posts = await catchPosts(page, url)
    await page.goto(url)
    await inputIn(page).setInputFiles([pdf('brief.pdf'), pdf('logo.pdf')])
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.locator('#sent')).toBeVisible()
    expect(posts).toEqual([['brief.pdf', 'logo.pdf']])
  })

  test('an empty required input sends nothing: the first press is blocked, and only the press after a pick posts', async ({ page }) => {
    const url = liveUrl('file-upload--form')
    const posts = await catchPosts(page, url)
    await page.goto(url)
    await page.getByRole('button', { name: 'Send' }).click()
    expect(await inputIn(page).evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).toBe(true)
    await inputIn(page).setInputFiles([pdf('late.pdf')])
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.locator('#sent')).toBeVisible()
    expect(posts).toEqual([['late.pdf']])
  })
})

test.describe('the box, on the static page', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: the input fills the zone inside its 1 px line, and the zone is 128 px tall`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto(urlFor('file-upload--basic', 'light', direction))
      const [zone, input] = [await boxOf(zoneOf(inputIn(page))), await boxOf(inputIn(page))]
      expect([input.left - zone.left, zone.right - input.right, input.top - zone.top, zone.bottom - input.bottom]).toEqual([1, 1, 1, 1])
      expect(zone.height).toBe(128)
      expect(await css(zoneOf(inputIn(page)), 'border-top-style')).toBe('dashed')
    })
  }

  test('the list and the two status lines take no room while empty: the root is as tall as the zone', async ({ page }) => {
    await page.goto(urlFor('file-upload--basic', 'light', 'ltr'))
    const root = inputIn(page).locator('xpath=../..')
    expect((await boxOf(root)).height).toBe((await boxOf(zoneOf(inputIn(page)))).height)
  })
})

test.describe('live: the limits and the list', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('six files with maxFiles 5: five rows, the message, and five files in the form', async ({ page }) => {
    await openLive(page, 'file-upload--multiple')
    await inputIn(page).setInputFiles(['a', 'b', 'c', 'd', 'e', 'f'].map((name) => pdf(`${name}.pdf`)))
    expect(await rowsIn(page)).toEqual(['a.pdf | 4 bytes', 'b.pdf | 4 bytes', 'c.pdf | 4 bytes', 'd.pdf | 4 bytes', 'e.pdf | 4 bytes'])
    expect(await statusIn(page)).toEqual(['Only 5 files allowed', ''])
    expect(await inputIn(page).evaluate((el) => [...((el as HTMLInputElement).files ?? [])].map((file) => file.name))).toEqual(['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf', 'e.pdf'])
  })

  test('a 6 MB file with maxSize 5 MB and a text file: two refused rows with their reasons, read out, and never in the form', async ({ page }) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/file-upload-reset.tsx' })
    await expect(page.locator('#file-upload-reset')).toHaveAttribute('data-ready', '')
    const input = page.getByLabel('Attach')
    await input.setInputFiles([pdf('big.pdf', 6 * MB), pdf('ok.pdf', 2.4 * MB)])
    expect(await rowsIn(page, '#action')).toEqual(['ok.pdf | 2.4 MB', 'big.pdf | Too large'])
    expect(await statusIn(page, '#action')).toEqual(['', 'big.pdf Too large'])
    expect(await serverEntries(page, '#action')).toEqual([['attach', 'ok.pdf']])
    await input.setInputFiles([pdf('next.pdf')])
    expect(await statusIn(page, '#action')).toEqual(['', ''])
    expect(await rowsIn(page, '#action')).toEqual(['ok.pdf | 2.4 MB', 'next.pdf | 4 bytes'])
  })

  test('the wrong type, in English and in Arabic, with the Arabic unit names', async ({ page }) => {
    await openLive(page, 'file-upload--multiple')
    await inputIn(page).setInputFiles([txt('notes.txt'), pdf('big.pdf', 6 * MB)])
    expect(await rowsIn(page)).toEqual(['notes.txt | Not an accepted type', 'big.pdf | Too large'])
    await openLive(page, 'file-upload--rtl', { direction: 'rtl' })
    await inputIn(page).setInputFiles([txt('notes.txt'), pdf('big.pdf', 6 * MB), pdf('ok.pdf', 512 * 1024)])
    expect(await rowsIn(page)).toEqual(['ok.pdf | 512 كيلوبايت', 'notes.txt | نوع غير مقبول', 'big.pdf | الحجم كبير جدًا'])
    expect(await statusIn(page)).toEqual(['', 'notes.txt نوع غير مقبولbig.pdf الحجم كبير جدًا'])
  })

  test('picks add up, and a remove takes the file out of the form, focus on the next row\'s remove, then the previous', async ({ page }) => {
    await openLive(page, 'file-upload--form')
    await inputIn(page).setInputFiles([pdf('a.pdf'), pdf('b.pdf')])
    await inputIn(page).setInputFiles([pdf('c.pdf')])
    expect(await serverEntries(page)).toEqual([['attachments', 'a.pdf'], ['attachments', 'b.pdf'], ['attachments', 'c.pdf']])
    await page.getByRole('button', { name: 'Remove b.pdf' }).click()
    await expect(page.getByRole('button', { name: 'Remove c.pdf' })).toBeFocused()
    expect(await serverEntries(page)).toEqual([['attachments', 'a.pdf'], ['attachments', 'c.pdf']])
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Remove a.pdf' })).toBeFocused()
    await page.keyboard.press('Space')
    await expect(inputIn(page)).toBeFocused()
    expect(await serverEntries(page)).toEqual([['attachments', '']])
  })

  test('a drop built in the page: dragover marks the zone, a leave clears it, a drop adds its files to the form', async ({ page }) => {
    await openLive(page, 'file-upload--form')
    const input = inputIn(page)
    await input.setInputFiles([pdf('picked.pdf')])
    expect(await drag(input, 'dragenter')).toBe(false)
    expect(await drag(input, 'dragover')).toBe(false)
    await expect(zoneOf(input)).toHaveAttribute('data-dragging', '')
    const primary = await page.evaluate(() => { const probe = document.createElement('i'); probe.style.color = 'var(--tc-primary-solid)'; document.body.append(probe); return getComputedStyle(probe).color })
    // The colour eases in over 150 ms; the style changes at once.
    expect(await css(zoneOf(input), 'border-top-style')).toBe('dashed')
    await expect.poll(() => css(zoneOf(input), 'border-top-color')).toBe(primary)
    await drag(input, 'dragleave')
    await expect(zoneOf(input)).not.toHaveAttribute('data-dragging')
    await drag(input, 'dragenter')
    expect(await drag(input, 'drop', ['dropped-1.pdf', 'dropped-2.pdf'])).toBe(false)
    await expect(zoneOf(input)).not.toHaveAttribute('data-dragging')
    expect(await serverEntries(page)).toEqual([['attachments', 'picked.pdf'], ['attachments', 'dropped-1.pdf'], ['attachments', 'dropped-2.pdf']])
    expect(await rowsIn(page)).toHaveLength(3)
  })

  test('a disabled upload: a drag never marks it, and its drop is prevented so the browser keeps the page', async ({ page }) => {
    await openLive(page, 'file-upload--states')
    const input = page.locator('#file-upload-disabled')
    expect(await drag(input, 'dragover')).toBe(false)
    await expect(zoneOf(input)).not.toHaveAttribute('data-dragging')
    expect(await drag(input, 'drop', ['x.pdf'])).toBe(false)
    expect(await page.locator('#demo li').count()).toBe(0)
  })
})

test.describe('live: the keyboard', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`${direction}: Shift+Tab reaches the input and the zone draws the whole ring; the next stops are the removes, then Send`, async ({ page }) => {
      await openLive(page, 'file-upload--form', { direction })
      await inputIn(page).setInputFiles([pdf('a.pdf'), pdf('b.pdf')])
      await page.getByRole('button', { name: `${REMOVE[direction]} a.pdf` }).focus()
      await page.keyboard.press('Shift+Tab')
      await expect(inputIn(page)).toBeFocused()
      const zone = zoneOf(inputIn(page))
      expect([await css(zone, 'outline-style'), await css(zone, 'outline-width'), await css(zone, 'outline-offset')]).toEqual(['solid', '2px', '2px'])
      const cut = await zone.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const box = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
        const out: string[] = []
        for (let up = el.parentElement; up; up = up.parentElement) {
          const style = getComputedStyle(up)
          if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
          const clip = up.getBoundingClientRect()
          if (box.left < clip.left || box.top < clip.top || box.right > clip.right || box.bottom > clip.bottom) out.push(up.tagName)
        }
        return out
      })
      expect(cut).toEqual([])
      const stops: string[] = []
      for (let step = 0; step < 3; step += 1) {
        await page.keyboard.press('Tab')
        stops.push(await page.evaluate(() => {
          const at = document.activeElement
          const named = at?.getAttribute('aria-labelledby')?.split(' ').map((id) => document.getElementById(id)?.getAttribute('aria-label') ?? document.getElementById(id)?.textContent).join(' ')
          return named ?? at?.textContent ?? ''
        }))
      }
      expect(stops).toEqual([`${REMOVE[direction]} a.pdf`, `${REMOVE[direction]} b.pdf`, 'Send'])
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Shift+Tab')
      await expect(inputIn(page)).toBeFocused()
    })
  }

  // The picker itself for Space; keyboard-file-upload.spec.ts proves Enter and Space each activate the input in both directions.
  for (const key of ['Space'] as const) {
    test(`${key} on the input opens the picker (native), and the picked file joins the list`, async ({ page }) => {
      await openLive(page, 'file-upload--basic')
      await inputIn(page).focus()
      await expect(inputIn(page)).toBeFocused()
      const [picker] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10_000 }), page.keyboard.press(key)])
      expect(picker.isMultiple()).toBe(false)
      await picker.setFiles([pdf('chosen.pdf')])
      expect(await rowsIn(page)).toEqual(['chosen.pdf | 4 bytes'])
    })
  }
})

test.describe('inside a Field', () => {
  test('with no script, the input is named by the Field label and described by the zone hint, then the Field hint', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(liveUrl('file-upload--in-field'))
    await expect(inputIn(page)).toHaveAccessibleName('Attachments')
    await expect(inputIn(page)).toHaveAccessibleDescription('Drop them here, 5 MB each PDF or PNG, up to 5 files')
    await context.close()
  })

  test('a click on the Field label opens the picker', async ({ page }) => {
    await openLive(page, 'file-upload--in-field')
    const [picker] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10_000 }), page.locator('#demo label').click()])
    expect(picker.isMultiple()).toBe(true)
  })
})

test.describe('live: the picker by pointer', () => {
  test('a click anywhere on the zone, the prompt included, opens the picker', async ({ page }) => {
    await openLive(page, 'file-upload--basic')
    const prompt = await boxOf(zoneOf(inputIn(page)).locator('span').nth(1))
    const [picker] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10_000 }), page.mouse.click(prompt.left + 4, prompt.top + 4)])
    expect(picker.isMultiple()).toBe(false)
    await picker.setFiles([pdf('chosen.pdf')])
    expect(await rowsIn(page)).toEqual(['chosen.pdf | 4 bytes'])
  })
})

for (const pointer of ['fine', 'coarse'] as const) {
  test.describe(`live: targets, ${pointer} pointer`, () => {
    test.use(pointer === 'coarse' ? COARSE : {})

    test(`each remove is ${pointer === 'fine' ? '24' : '44'} px square inside a row at least as tall, and the input covers the zone`, async ({ page }) => {
      await openLive(page, 'file-upload--multiple')
      await inputIn(page).setInputFiles([pdf('a.pdf'), pdf('b.pdf')])
      const remove = await boxOf(page.getByRole('button', { name: 'Remove a.pdf' }))
      const row = await boxOf(page.locator('#demo li').first())
      const size = pointer === 'fine' ? 24 : 44
      expect([remove.width, remove.height]).toEqual([size, size])
      expect(row.height).toBe(pointer === 'fine' ? 34 : 54)
      expect(await css(page.locator('#demo li [dir="auto"]').first(), 'font-size')).toBe('14px')
      expect(await liveErrors(page)).toEqual([])
    })
  })
}

test.describe('live: hostile content', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/file-upload-layouts.tsx' })
    await expect(page.locator('#layouts input[type="file"]').first()).toBeAttached()
  }
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    for (const width of [320, 1280]) {
      test(`${direction}, ${String(width)} px: a 300-character name truncates inside its row in every layout, and the page never scrolls sideways`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 })
        await fixture(page, { direction })
        for (const input of await page.locator('#layouts input[type="file"]').all()) await input.setInputFiles([pdf(LONG), pdf('short.pdf')])
        const rows = await page.locator('#layouts li').evaluateAll((all) => all.map((row) => {
          const name = row.querySelector('[dir="auto"]') as HTMLElement
          const [r, list] = [row.getBoundingClientRect(), (row.closest('ul') as HTMLElement).getBoundingClientRect()]
          return { inside: r.left >= list.left - 0.5 && r.right <= list.right + 0.5, cut: name.scrollWidth > name.clientWidth || name.textContent.length < 10 }
        }))
        expect(rows).toHaveLength(12)
        expect(rows.filter((row) => !row.inside || !row.cut)).toEqual([])
        await expectNoSidewaysScroll(page)
      })
    }
  }

  test('sixty files: the list shows seven whole rows and scrolls inside itself, and becomes a tab stop while it does', async ({ page }) => {
    await fixture(page)
    const input = page.getByLabel('In a grid', { exact: true })
    await input.setInputFiles(Array.from({ length: 60 }, (_, index) => pdf(`file-${String(index + 1)}.pdf`)))
    const list = page.locator('#grid ul')
    expect(await list.locator('li').count()).toBe(60)
    await expect(list).toHaveAttribute('tabindex', '0')
    expect(await shownIn(list)).toEqual({ whole: 7, rowHeights: [34], scrolls: true })
    await expectNoSidewaysScroll(page)
  })

  test('visibleRows 2: two whole rows', async ({ page }) => {
    await fixture(page)
    await page.getByLabel('Two rows', { exact: true }).setInputFiles(['a', 'b', 'c', 'd', 'e'].map((name) => pdf(`${name}.pdf`)))
    expect(await shownIn(page.locator('#two-rows ul'))).toEqual({ whole: 2, rowHeights: [34], scrolls: true })
  })

  test('a link in the hint takes the pointer from the input over the zone; the hint\'s words leave it to the input', async ({ page }) => {
    await fixture(page)
    const hit = (x: number, y: number) => page.evaluate(([px, py]) => {
      const at = document.elementFromPoint(px ?? 0, py ?? 0)
      return at?.id === 'two-rows-link' ? 'link' : at?.tagName ?? ''
    }, [x, y])
    await page.locator('#two-rows').scrollIntoViewIfNeeded()
    const [link, hint] = [await boxOf(page.locator('#two-rows-link')), await boxOf(page.locator('#two-rows-link').locator('xpath=..'))]
    expect([await hit(link.left + link.width / 2, link.top + link.height / 2), await hit(hint.left + 2, hint.top + hint.height / 2)]).toEqual(['link', 'INPUT'])
    await page.locator('#two-rows-link').click()
    expect(await page.evaluate(() => location.hash)).toBe('#rules')
  })

  for (const direction of DIRECTIONS) {
    test(`${direction}, 320 px: a hint and a prompt with no space to break at wrap inside the zone, and nothing crosses either edge of the page`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openLive(page, 'file-upload--basic', { direction })
      const zone = zoneOf(inputIn(page))
      for (const hint of ['image/png,image/jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'x'.repeat(300)]) {
        await page.evaluate((text) => {
          const hintSpan = document.querySelector('#demo [id$="-hint"]')
          const drop = document.querySelector('#demo input[type="file"]')?.parentElement?.querySelectorAll('span span')[0]
          if (!hintSpan || !drop) throw new Error('no hint or prompt')
          hintSpan.textContent = text
          drop.textContent = 'y'.repeat(120)
        }, hint)
        const outside = await zone.evaluate((el) => {
          const z = el.getBoundingClientRect()
          return [...el.querySelectorAll('span')].map((span) => span.getBoundingClientRect())
            .filter((r) => r.left < z.left - 0.5 || r.right > z.right + 0.5 || r.left < 0).length
        })
        expect(outside, hint.slice(0, 12)).toBe(0)
        await expectNoSidewaysScroll(page)
      }
    })
  }
})

test.describe('live: a long list under a coarse pointer', () => {
  test.use(COARSE)

  for (const direction of DIRECTIONS) {
    test(`${direction}: seven whole rows of 54 px; each remove sits inside its row, and the first remove's ring inside the list`, async ({ page }) => {
      await openLive(page, 'separator--horizontal', { direction })
      await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/file-upload-layouts.tsx' })
      await expect(page.locator('#layouts input[type="file"]').first()).toBeAttached()
      await page.locator('#grid input[type="file"]').setInputFiles(Array.from({ length: 12 }, (_, index) => pdf(`f${String(index)}.pdf`)))
      const list = page.locator('#grid ul')
      expect(await shownIn(list)).toEqual({ whole: 7, rowHeights: [54], scrolls: true })
      const outside = await list.locator('li').evaluateAll((rows) => rows.filter((row) => {
        const [r, b] = [row.getBoundingClientRect(), (row.querySelector('button') as HTMLElement).getBoundingClientRect()]
        return b.top <= r.top || b.bottom >= r.bottom
      }).length)
      expect(outside).toBe(0)
      await page.locator('#grid input[type="file"]').focus()
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      const first = list.locator('button').first()
      await expect(first).toBeFocused()
      const ring = await first.evaluate((el) => {
        const style = getComputedStyle(el)
        const reach = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset)
        const [b, l] = [el.getBoundingClientRect(), (el.closest('ul') as HTMLElement).getBoundingClientRect()]
        return { visible: el.matches(':focus-visible'), inside: b.top - reach >= l.top - 0.5 && b.bottom + reach <= l.bottom + 0.5 }
      })
      expect(ring).toEqual({ visible: true, inside: true })
      // At a 32 px root the coarse row is --tc-row-height, the floor ROW_TOUCH keeps, and seven of them still fit.
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      expect(await shownIn(list)).toEqual({ whole: 7, rowHeights: [64], scrolls: true })
    })
  }
})

test.describe('live: a disabled upload that already holds files', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  test('its remove buttons dim with the zone and take no pointer', async ({ page }) => {
    await openLive(page, 'file-upload--states')
    const input = page.locator('#file-upload-disabled')
    // A form disables the upload while it sends: the rows are there first. Lifted in the DOM only, React's prop stays.
    await input.evaluate((el) => { (el as HTMLInputElement).disabled = false })
    await input.setInputFiles([pdf('report.pdf')])
    await input.evaluate((el) => { (el as HTMLInputElement).disabled = true })
    const remove = page.getByRole('button', { name: 'Remove report.pdf' })
    await expect(remove).toBeDisabled()
    expect([await css(remove, 'opacity'), await css(remove, 'pointer-events')]).toEqual(['0.5', 'none'])
  })
})

test.describe('live: where a page puts an upload', () => {
  const fixture = async (page: Page, options: LiveOptions = {}) => {
    await openLive(page, 'separator--horizontal', options)
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/file-upload-layouts.tsx' })
    await expect(page.locator('#layouts input[type="file"]').first()).toBeAttached()
  }
  /** Each case: the zone's width, and the width inside the padding of the box the upload sits in. */
  const cases = (page: Page) => page.locator('#layouts [data-case]').evaluateAll((all) => all.map((box) => {
    const zone = box.querySelector('input[type="file"]')?.parentElement as HTMLElement
    const holder = (zone.parentElement as HTMLElement).parentElement as HTMLElement
    const style = getComputedStyle(holder)
    const inner = holder.clientWidth - Number.parseFloat(style.paddingInlineStart) - Number.parseFloat(style.paddingInlineEnd)
    return [box.getAttribute('data-case'), Math.round(zone.getBoundingClientRect().width), Math.round(inner)]
  }))
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const direction of DIRECTIONS) {
    test(`1280 px, ${direction}: the zone fills its parent in every case; in a label row that aligns to the start it takes its content`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await fixture(page, { direction })
      const found = await cases(page)
      expect(found.map(([name]) => name)).toEqual(['grid', 'track', 'flex-1', 'w-fit', 'cell', 'label-row'])
      for (const [name, zone, holder] of found) {
        if (name === 'label-row') expect(zone, name).toBeLessThan(holder as number)
        else expect(zone, String(name)).toBe(holder)
      }
      await expectNoSidewaysScroll(page)
    })
  }

  test.describe('320 px, coarse pointer', () => {
    test.use({ ...COARSE, viewport: { width: 320, height: 480 } })

    for (const direction of DIRECTIONS) {
      test(`${direction}: every case fits the screen with files in it, and the page does not scroll sideways`, async ({ page }) => {
        await fixture(page, { direction })
        for (const input of await page.locator('#layouts input[type="file"]').all()) await input.setInputFiles([pdf(LONG)])
        const outside = await page.locator('#layouts [data-case]').evaluateAll((all) => all.filter((box) => {
          const zone = box.querySelector('input[type="file"]')?.parentElement as HTMLElement
          const r = zone.getBoundingClientRect()
          return r.left < 0 || r.right > document.body.clientWidth
        }).map((box) => box.getAttribute('data-case')))
        expect(outside).toEqual([])
        await expectNoSidewaysScroll(page)
      })
    }
  })
})

test.describe('live: a form reset, and the form before hydration', () => {
  const fixture = async (page: Page) => {
    await openLive(page, 'separator--horizontal')
    await page.addScriptTag({ type: 'module', url: '/e2e/fixtures/file-upload-reset.tsx' })
    await expect(page.locator('#file-upload-reset')).toHaveAttribute('data-ready', '')
  }
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const how of ['form.reset()', 'a reset button'] as const) {
    test(`after ${how}, both lists are empty on screen and in the form, the one tied by form included`, async ({ page }) => {
      await fixture(page)
      await page.getByLabel('Docs').setInputFiles([pdf('a.pdf'), pdf('b.pdf')])
      await page.getByLabel('Far').setInputFiles([pdf('far.pdf')])
      expect(await serverEntries(page, '#plain')).toEqual([['docs', 'a.pdf'], ['docs', 'b.pdf'], ['far', 'far.pdf']])
      if (how === 'form.reset()') await page.locator('#plain').evaluate((node) => { (node as HTMLFormElement).reset() })
      else await page.getByRole('button', { name: 'Reset' }).click()
      await expect(page.locator('#file-upload-reset li')).toHaveCount(0)
      expect(await serverEntries(page, '#plain')).toEqual([['docs', ''], ['far', '']])
    })
  }

  test('a React 19 form action receives the kept files and not the refused one, then the list is empty', async ({ page }) => {
    await fixture(page)
    await page.getByLabel('Attach').setInputFiles([pdf('ok.pdf'), pdf('big.pdf', 6 * MB)])
    await page.locator('#action').getByRole('button', { name: 'Send' }).click()
    await expect.poll(() => page.evaluate(() => window.fileUploadSent?.['action'] ?? [])).toEqual([[['attach', 'ok.pdf']]])
    await expect(page.locator('#action li')).toHaveCount(0)
    expect(await serverEntries(page, '#action')).toEqual([['attach', '']])
  })

  test('picked before a late script: the files join the list at hydration, inside the limits, and the form sends the same', async ({ page }) => {
    let release: () => void = () => undefined
    const held = new Promise<void>((done) => { release = done })
    await page.route(`**${CLIENT_ENTRY}*`, async (route) => { await held; await route.continue() })
    // Not 'load' nor DOMContentLoaded: both wait for the module script this route holds back.
    await page.goto(liveUrl('file-upload--multiple'), { waitUntil: 'commit' })
    await inputIn(page).setInputFiles([pdf('a.pdf'), pdf('big.pdf', 6 * MB), pdf('b.pdf')])
    expect(await inputIn(page).evaluate((el) => (el as HTMLInputElement).files?.length)).toBe(3)
    release()
    await page.waitForFunction(() => document.documentElement.dataset['harness'] === 'hydrated')
    await expect(page.locator('#demo li')).toHaveCount(3)
    expect(await rowsIn(page)).toEqual(['a.pdf | 4 bytes', 'b.pdf | 4 bytes', 'big.pdf | Too large'])
    expect(await inputIn(page).evaluate((el) => [...((el as HTMLInputElement).files ?? [])].map((file) => file.name))).toEqual(['a.pdf', 'b.pdf'])
    expect(await liveErrors(page)).toEqual([])
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' })

    test('the dashed edge stands 3:1 off the page; a drag turns it solid and Highlight, not only a fill; invalid is 2 px', async ({ page }) => {
      await openLive(page, 'file-upload--form')
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
      const zone = zoneOf(inputIn(page))
      const box = await boxOf(zone)
      const edge = await pixelsOf(page, { x: Math.round(box.left), y: Math.round(box.top + box.height / 2) - 10, width: 1, height: 20 })
      expect(edge.filter((pixel) => contrast(pixel, FORCED_CANVAS[scheme]) >= 3).length, 'the dashes').toBeGreaterThan(5)
      await drag(inputIn(page), 'dragenter')
      await drag(inputIn(page), 'dragover')
      const system = await page.evaluate(() => {
        const probe = document.createElement('i')
        probe.style.setProperty('forced-color-adjust', 'none')
        probe.style.color = 'Highlight'
        document.body.append(probe)
        return getComputedStyle(probe).color
      })
      expect([await css(zone, 'border-top-style'), await css(zone, 'border-top-color')]).toEqual(['solid', system])
      await openLive(page, 'file-upload--states')
      expect(await css(zoneOf(page.locator('#file-upload-invalid')), 'border-top-width')).toBe('2px')
      expect(await css(zoneOf(page.locator('#file-upload-disabled')), 'border-top-width')).toBe('1px')
    })

    test('a refused row keeps its mark and its words, and the remove x is painted', async ({ page }) => {
      await openLive(page, 'file-upload--multiple')
      await inputIn(page).setInputFiles([pdf('big.pdf', 6 * MB)])
      const icon = await boxOf(page.locator('#demo li > span').first())
      const ink = await pixelsOf(page, { x: Math.round(icon.left), y: Math.round(icon.top), width: Math.round(icon.width), height: Math.round(icon.height) })
      expect(ink.filter((pixel) => contrast(pixel, FORCED_CANVAS[scheme]) >= 3).length, 'the warning mark').toBeGreaterThan(10)
      const x = await boxOf(page.getByRole('button', { name: 'Remove big.pdf' }))
      const cross = await pixelsOf(page, { x: Math.round(x.left), y: Math.round(x.top), width: Math.round(x.width), height: Math.round(x.height) })
      expect(cross.filter((pixel) => contrast(pixel, FORCED_CANVAS[scheme]) >= 3).length, 'the x').toBeGreaterThan(10)
    })
  })
}

test.describe('colour, in the three modes', () => {
  for (const mode of MODES) {
    test(`${mode}: Browse and the hint read 4.5:1 on the zone, a reason 4.5:1 on the page, the dashed line 3:1`, async ({ page }) => {
      await openLive(page, 'file-upload--multiple', { mode })
      await inputIn(page).setInputFiles([pdf('big.pdf', 6 * MB)])
      const zone = zoneOf(inputIn(page))
      const surface = await srgb(page, await css(zone, 'background-color'))
      const colour = async (element: Locator) => srgb(page, await css(element, 'color'))
      const backdrop = await srgb(page, await css(page.locator('body'), 'background-color'))
      expect(contrast(await colour(zone.locator('span span').nth(1)), surface), 'Browse').toBeGreaterThanOrEqual(4.5)
      expect(contrast(await colour(zone.locator('span[id]')), surface), 'the hint').toBeGreaterThanOrEqual(4.5)
      expect(contrast(await colour(page.locator('#demo li > span').nth(2)), backdrop), 'the reason').toBeGreaterThanOrEqual(4.5)
      expect(contrast(await srgb(page, await css(zone, 'border-top-color')), surface), 'the line').toBeGreaterThanOrEqual(3)
    })
  }
})

test.describe('motion', () => {
  test('the zone eases its colours in 150 ms; reduced, not at all', async ({ browser }) => {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      const context = await browser.newContext({ reducedMotion })
      const page = await context.newPage()
      await page.goto(urlFor('file-upload--basic', 'light', 'ltr'))
      expect(await css(zoneOf(inputIn(page)), 'transition-duration'), reducedMotion).toBe(reducedMotion === 'reduce' ? '0s' : '0.15s')
      await context.close()
    }
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
    test(`${direction}: at a root of 32 px the zone grows with its words, the rows with theirs, and nothing scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 })
      await openLive(page, 'file-upload--multiple', { direction })
      await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
      await inputIn(page).setInputFiles([pdf(LONG), pdf('b.pdf')])
      expect((await boxOf(zoneOf(inputIn(page)))).height).toBeGreaterThan(152 * 1.5)
      const remove = await boxOf(page.getByRole('button', { name: `${REMOVE[direction]} b.pdf` }))
      expect(remove.width).toBeGreaterThanOrEqual(24)
      await expectNoSidewaysScroll(page)
      expect(await liveErrors(page)).toEqual([])
    })
  }

  test('WCAG 1.4.12 spacing: the words move, nothing overlaps in a row, and nothing scrolls sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await openLive(page, 'file-upload--multiple')
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }' })
    await inputIn(page).setInputFiles([pdf('quarterly report.pdf', 2.4 * MB)])
    const [name, size, remove] = await page.locator('#demo li > *').evaluateAll((all) => all.slice(1).map((el) => el.getBoundingClientRect().left))
    expect((name ?? 0) < (size ?? 0) && (size ?? 0) < (remove ?? 0)).toBe(true)
    await expectNoSidewaysScroll(page)
  })
})

test.describe('axe on the hydrated demos, with files in the lists', () => {
  for (const demo of DEMOS) {
    for (const direction of DIRECTIONS) {
      test(`${demo} ${direction}: no violation with a kept and a refused file`, async ({ page }) => {
        await openLive(page, demo, { direction })
        const input = inputIn(page)
        // One file where the input takes one: a text file, refused by an accept and kept where there is none.
        if (await input.evaluate((el) => (el as HTMLInputElement).multiple)) await input.setInputFiles([pdf('ok.pdf'), txt('notes.txt')])
        else if (!(await input.isDisabled())) await input.setInputFiles([txt('notes.txt')])
        expect(await page.locator('#demo li').count()).toBeGreaterThan(0)
        const results = await new AxeBuilder({ page }).include('#demo').analyze()
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
      })
    }
  }
})
