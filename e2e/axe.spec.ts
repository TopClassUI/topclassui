import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { EVERY_PAGE, urlFor } from './pages.js'

// PLAN 20: axe reports zero violations. Every mode and both directions, because
// contrast and reading order are exactly what change between them. Scoped to the
// demo: landmarks and document structure belong to the docs app, not a component.
for (const { demo, mode, direction } of EVERY_PAGE) {
  test(`${demo} ${mode} ${direction}: no axe violations`, async ({ page }) => {
    await page.goto(urlFor(demo, mode, direction))
    const results = await new AxeBuilder({ page }).include('#demo').analyze()
    const found = results.violations.map((v) => `${v.id}: ${String(v.nodes.length)} node(s)`)
    expect(found).toEqual([])
  })
}
