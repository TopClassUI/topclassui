import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
const require = createRequire('C:/Users/Omarf/Downloads/www/www/TopClassUi/topclassui/packages/topclassui/package.json')
const { chromium } = require('@playwright/test')
const OUT = join(import.meta.dirname, 'live'); mkdirSync(OUT, { recursive: true })
const DEMOS = [['table','basic'],['table','sorted'],['table','striped'],['dialog','basic'],['toast','basic'],['toast','tones'],['command','basic'],['select','basic'],['pagination','basic'],['tabs','basic'],['input','states']]
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 960, height: 700 }, deviceScaleFactor: 1, colorScheme: 'dark' })
const page = await context.newPage()
for (const [c, d] of DEMOS) {
  try {
    await page.goto(`https://topclassui.com/preview/dark/ltr/${c}/${d}`, { waitUntil: 'networkidle', timeout: 60_000 })
    await page.waitForTimeout(300)
    if (c === 'dialog' || c === 'command') { await page.locator('button').first().click(); await page.waitForTimeout(500) }
    if (c === 'toast') { await page.locator('button').first().click(); await page.waitForTimeout(600) }
    await page.screenshot({ path: join(OUT, `preview-${c}-${d}.png`), fullPage: true })
    console.log('ok', c, d)
  } catch (e) { console.log('FAIL', c, d, String(e).slice(0, 100)) }
}
await browser.close()
