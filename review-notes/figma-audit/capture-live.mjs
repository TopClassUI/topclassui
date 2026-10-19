// Screenshots the live site pages at the Figma frame width (1440, dark, ltr) and a phone width, full page.
// Usage: node capture-live.mjs [origin] ; writes into ./live/<name>-<width>.png
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire('C:/Users/Omarf/Downloads/www/www/TopClassUi/topclassui/packages/topclassui/package.json')
const { chromium } = require('@playwright/test')

const ORIGIN = process.argv[2] ?? 'https://topclassui.com'
const OUT = join(import.meta.dirname, 'live')
mkdirSync(OUT, { recursive: true })

const PAGES = [
  ['home', '/en'], ['home-ar', '/ar'],
  ['installation', '/en/docs/installation'], ['css', '/en/docs/css'], ['provider', '/en/docs/provider'],
  ['first-component', '/en/docs/first-component'], ['colors', '/en/docs/colors'], ['icons', '/en/docs/icons'],
  ['theming', '/en/docs/theming'], ['rtl', '/en/docs/rtl'], ['server-first', '/en/docs/server-first'],
  ['accessibility', '/en/docs/accessibility'], ['components', '/en/docs/components'], ['components-ar', '/ar/docs/components'],
  ['changelog', '/en/changelog'],
  ['c-button', '/en/docs/components/button'], ['c-table', '/en/docs/components/table'], ['c-dialog', '/en/docs/components/dialog'],
  ['c-toast', '/en/docs/components/toast'], ['c-select', '/en/docs/components/select'], ['c-pagination', '/en/docs/components/pagination'],
  ['c-command', '/en/docs/components/command'], ['c-tabs', '/en/docs/components/tabs'], ['c-input', '/en/docs/components/input'],
]
const WIDTHS = [[1440, 900], [390, 844]]
const MODES = ['dark', 'light']

const browser = await chromium.launch()
for (const [w, h] of WIDTHS) {
  for (const mode of MODES) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: mode })
    await context.addInitScript((m) => { try { localStorage.setItem('tc-theme', m) } catch {} }, mode)
    const page = await context.newPage()
    for (const [name, path] of PAGES) {
      if (w === 390 && mode === 'light') continue
      try {
        await page.goto(`${ORIGIN}${path}`, { waitUntil: 'networkidle', timeout: 60_000 })
        await page.evaluate((m) => document.documentElement.setAttribute('data-theme', m), mode)
        await page.waitForTimeout(400)
        await page.screenshot({ path: join(OUT, `${name}-${w}-${mode}.png`), fullPage: true })
        console.log('ok', name, w, mode)
      } catch (e) {
        console.log('FAIL', name, w, mode, String(e).slice(0, 120))
      }
    }
    await context.close()
  }
}
await browser.close()
