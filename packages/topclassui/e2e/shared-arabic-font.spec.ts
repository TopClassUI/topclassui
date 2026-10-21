import { expect, test, type Page } from '@playwright/test'

import { urlFor } from './pages.js'

// What the lang rules of src/tokens.css do in a page: an Arabic page or island takes --tc-font-arabic, and every element
// that is font-mono (CodeBlock, Kbd, the Textarea counter) keeps its monospace for everything inside it, the caller's
// highlighted spans too. :lang(ar) on every descendant drew Arabic code in a proportional font and broke its indents.

/** Every element inside the demo whose font is not monospace though an ancestor's own font is, as tag: family. */
const lostMono = (page: Page) => page.evaluate(() => {
  const mono = (element: Element) => /monospace/.test(getComputedStyle(element).fontFamily)
  const underMono = (element: Element) => {
    for (let owner = element.parentElement; owner !== null && owner.id !== 'demo'; owner = owner.parentElement) if (mono(owner)) return true
    return false
  }
  const lost = [...document.querySelectorAll('#demo *')].filter((element) => !element.closest('svg') && !mono(element) && underMono(element))
  return lost.map((element) => `${element.tagName.toLowerCase()}: ${getComputedStyle(element).fontFamily}`)
})

/** How many elements in the demo are monospace, the same in either direction, so a demo that lost its font-mono cannot pass. */
const monoCount = (page: Page) => page.evaluate(() => [...document.querySelectorAll('#demo *')].filter((element) => /monospace/.test(getComputedStyle(element).fontFamily)).length)

/** The width of four narrow and four wide letters set in the code's own font: equal only in a monospace font. */
const codeWidths = (page: Page) => page.evaluate(() => {
  const code = document.querySelector('#demo pre code')
  if (!code) return null
  const width = (text: string) => {
    const probe = document.createElement('span')
    probe.textContent = text
    code.append(probe)
    const { width: measured } = probe.getBoundingClientRect()
    probe.remove()
    return Math.round(measured * 10) / 10
  }
  return width('iiii') === width('MMMM')
})

const PAGES = [
  ['code-block--basic', 3], ['code-block--rtl', 3], ['code-block--highlighted', 9],
  ['kbd--combination', 4], ['kbd--with-icon', 4], ['textarea--show-count', 7],
] as const

for (const direction of ['ltr', 'rtl'] as const) {
  test(`${direction}: nothing inside a monospace element is drawn in another font`, async ({ page }) => {
    for (const [demo, count] of PAGES) {
      await page.goto(urlFor(demo, 'light', direction))
      expect(await page.evaluate(() => document.documentElement.lang), demo).toBe(direction === 'rtl' ? 'ar' : 'en')
      expect(await monoCount(page), demo).toBe(count)
      expect(await lostMono(page), demo).toEqual([])
      if (demo.startsWith('code-block')) expect(await codeWidths(page), `${demo}: iiii as wide as MMMM`).toBe(true)
    }
  })
}

test('rtl: a span the caller puts inside a Kbd keeps the monospace', async ({ page }) => {
  await page.goto(urlFor('kbd--combination', 'light', 'rtl'))
  await page.locator('#demo kbd').first().evaluate((kbd) => { kbd.innerHTML = '<span>Ctrl</span>' })
  expect(await lostMono(page)).toEqual([])
})

/** The computed font of the page, of an element inside the demo, and of a span put inside it. */
const fonts = (page: Page, selector: string) => page.evaluate((target) => {
  const element = document.querySelector(target)
  if (!element) return null
  const child = element.appendChild(document.createElement('span'))
  const read = { body: getComputedStyle(document.body).fontFamily, element: getComputedStyle(element).fontFamily, child: getComputedStyle(child).fontFamily }
  child.remove()
  return read
}, selector)

test.describe('the Arabic font still lands, set apart from the Latin one', () => {
  const ARABIC = ':root { --tc-font-arabic: serif }'

  test('rtl: the page takes it, and the code and the keycap keep the monospace', async ({ page }) => {
    await page.goto(urlFor('code-block--highlighted', 'light', 'rtl'))
    await page.addStyleTag({ content: ARABIC })
    expect(await fonts(page, '#demo pre code')).toEqual({ body: 'serif', element: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace', child: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace' })
    await page.goto(urlFor('kbd--combination', 'light', 'rtl'))
    await page.addStyleTag({ content: ARABIC })
    expect(await fonts(page, '#demo kbd')).toEqual({ body: 'serif', element: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace', child: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace' })
  })

  test('ltr: an island marked lang="ar-EG" takes it, and its keycap keeps the monospace; the page keeps the Latin one', async ({ page }) => {
    await page.goto(urlFor('kbd--combination', 'light', 'ltr'))
    await page.addStyleTag({ content: ARABIC })
    await page.locator('#demo').evaluate((demo) => { demo.setAttribute('lang', 'ar-EG') })
    expect(await fonts(page, '#demo')).toEqual({ body: 'ui-sans-serif, system-ui, sans-serif', element: 'serif', child: 'serif' })
    expect(await fonts(page, '#demo kbd')).toEqual({ body: 'ui-sans-serif, system-ui, sans-serif', element: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace', child: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace' })
  })
})

test('rtl: a letter-spaced ancestor does not space the Arabic letters inside it (R-5.3-3)', async ({ page }) => {
  await page.goto(urlFor('kbd--combination', 'light', 'rtl'))
  const spacing = await page.locator('#demo').evaluate((demo) => {
    const wrapper = demo.appendChild(document.createElement('div'))
    wrapper.style.letterSpacing = '4px'
    const text = wrapper.appendChild(document.createElement('span'))
    text.textContent = 'نص'
    return { wrapper: getComputedStyle(wrapper).letterSpacing, text: getComputedStyle(text).letterSpacing }
  })
  // Chromium reports a letter-spacing of 0 as normal.
  expect(spacing).toEqual({ wrapper: '4px', text: 'normal' })
})
