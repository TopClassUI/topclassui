import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS, type Direction } from '../scripts/lib/harness.js'
import { expectRing, expectRowRing, focused, pressTo, rowRingOf, tabStops } from './keyboard.js'

// The helpers of the keyboard specs, proved on static pages: each passes on a page that keeps the rule and
// fails on one that breaks it (no ring, a thin or dashed ring, two tab stops, a key that moves nothing).

const RING = 'button:focus-visible, [data-highlighted] { outline: 2px solid blue }'

async function load(page: Page, direction: Direction, style: string, body: string): Promise<void> {
  await page.setContent(`<!doctype html><html dir="${direction}"><head><style>${style}</style></head><body>${body}</body></html>`)
}

for (const direction of DIRECTIONS) {
  test.describe(direction, () => {
    test('expectRing passes on a 2 px solid ring shown by the keyboard', async ({ page }) => {
      await load(page, direction, RING, '<button>Save</button>')
      await page.keyboard.press('Tab')
      await expectRing(page, 'Save')
    })

    for (const [what, style] of [
      ['no ring at all', 'button { outline: none }'],
      ['a 1 px ring', 'button:focus-visible { outline: 1px solid blue }'],
      ['a dashed ring', 'button:focus-visible { outline: 2px dashed blue }'],
    ] as const) {
      test(`expectRing fails on ${what}`, async ({ page }) => {
        await load(page, direction, style, '<button>Save</button>')
        await page.keyboard.press('Tab')
        await expect(expectRing(page, 'Save')).rejects.toThrow('Save: no focus-visible ring')
      })
    }

    test('expectRing fails on a ring a pointer put there, which :focus-visible does not match', async ({ page }) => {
      await load(page, direction, 'button:focus { outline: 2px solid blue }', '<button>Save</button>')
      await page.getByRole('button', { name: 'Save' }).click()
      await expect(expectRing(page, 'Save')).rejects.toThrow('Save: no focus-visible ring')
    })

    test('expectRing throws when nothing has the focus', async ({ page }) => {
      await load(page, direction, RING, '<button>Save</button>')
      expect(await focused(page)).toBe('(nothing)')
      await expect(expectRing(page, 'the body')).rejects.toThrow('nothing is focused')
    })

    test('pressTo passes when the key lands on the named element, and fails when it moves nothing', async ({ page }) => {
      await load(page, direction, RING, '<button>One</button><button>Two</button>')
      await pressTo(page, 'Tab', 'One')
      await pressTo(page, 'Tab', 'Two')
      await expect(pressTo(page, 'ArrowDown', 'One')).rejects.toThrow('ArrowDown did not land on One')
      expect(await focused(page)).toBe('Two')
    })

    test('tabStops is one name for a roving group, and every name for a group that breaks it', async ({ page }) => {
      await load(page, direction, RING, `
        <div id="roving"><button tabindex="0">A</button><button tabindex="-1">B</button><button tabindex="-1">C</button></div>
        <div id="broken"><button>A</button><button>B</button><button disabled>C</button></div>
        <div id="dimmed"><button tabindex="-1">A</button><button tabindex="0" aria-disabled="true">B</button></div>`)
      expect(await tabStops(page.locator('#roving button'))).toEqual(['A'])
      expect(await tabStops(page.locator('#broken button'))).toEqual(['A', 'B'])
      expect(await tabStops(page.locator('#dimmed button')), 'an aria-disabled item keeps its stop, as APG roving groups do').toEqual(['B'])
    })

    test('rowRingOf and expectRowRing follow data-highlighted, and fail on a row without it or without a ring', async ({ page }) => {
      await load(page, direction, RING, `
        <div role="menu"><div role="menuitem" id="lit" data-highlighted>Lit</div><div role="menuitem" id="dark">Dark</div></div>
        <div role="menu"><div role="menuitem" id="bare" data-highlighted style="outline: none">Bare</div></div>`)
      expect(await rowRingOf(page.locator('#lit'))).toEqual({ visible: true, style: 'solid', width: '2px' })
      expect(await rowRingOf(page.locator('#dark'))).toEqual({ visible: false, style: 'none', width: '0px' })
      await expectRowRing(page.locator('#lit'), 'Lit')
      await expect(expectRowRing(page.locator('#dark'), 'Dark')).rejects.toThrow('Dark: the highlighted row has no ring')
      await expect(expectRowRing(page.locator('#bare'), 'Bare')).rejects.toThrow('Bare: the highlighted row has no ring')
    })
  })
}
