import { expect, test } from '@playwright/test'

import { MODES } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

/** Runs in the page: each icon's computed scale and which way its path is painted on screen. */
function icons() {
  return [...document.querySelectorAll<SVGSVGElement>('#demo svg')].map((svg) => {
    const matrix = svg.querySelector('path')?.getScreenCTM()
    return {
      label: svg.getAttribute('aria-label'),
      scale: getComputedStyle(svg).scale,
      painted: matrix && matrix.a < 0 ? 'mirrored' : 'as drawn',
    }
  })
}

const LTR = [
  { label: 'Next', scale: '1', painted: 'as drawn' },
  { label: 'Right', scale: 'none', painted: 'as drawn' },
  { label: 'Done', scale: 'none', painted: 'as drawn' },
]
const RTL = [
  { label: 'Next', scale: '-1 1', painted: 'mirrored' },
  { label: 'Right', scale: 'none', painted: 'as drawn' },
  { label: 'Done', scale: 'none', painted: 'as drawn' },
]

for (const forced of ['none', 'active'] as const) {
  test.describe(`R-5.3-2: the directional icon mirrors through --tc-dir, forced colours ${forced}`, () => {
    test.use({ forcedColors: forced })

    for (const mode of MODES) {
      test(`${mode}, left to right: only the directional arrow carries the knob, and nothing is mirrored`, async ({ page }) => {
        await page.goto(urlFor('svg--directional', mode, 'ltr'))
        expect(await page.evaluate(icons)).toEqual(LTR)
      })

      test(`${mode}, right to left: the directional arrow alone is mirrored`, async ({ page }) => {
        await page.goto(urlFor('svg--directional', mode, 'rtl'))
        expect(await page.evaluate(icons)).toEqual(RTL)
      })
    }

    test('an ltr block inside an rtl page resets the knob, so its arrow is drawn as is', async ({ page }) => {
      await page.goto(urlFor('svg--directional', 'light', 'rtl'))
      await page.evaluate(() => document.querySelector('#demo')?.setAttribute('dir', 'ltr'))
      expect(await page.evaluate(icons)).toEqual(LTR)
    })
  })
}
