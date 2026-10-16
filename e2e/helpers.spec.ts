import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { expectInsideViewport, expectNoSidewaysScroll, openLive, viewportBox } from './live.js'
import { demoListProblem, newerSource } from './pages.js'
import { paintedRgb, pixelsOf, rgbOf } from './pixels.js'

// The measuring helpers themselves: each one fails on the case it exists to catch, so a spec built on it can fail too.

test.describe('rgbOf', () => {
  test('reads rgb() and an opaque rgba(), with or without spaces', () => {
    expect(rgbOf('rgb(55, 0, 110)')).toEqual([55, 0, 110])
    expect(rgbOf('rgb(226,237,245)')).toEqual([226, 237, 245])
    expect(rgbOf('rgba(26, 235, 255, 1)')).toEqual([26, 235, 255])
  })

  test('throws on any other syntax, whose digits are not channels', () => {
    expect(() => rgbOf('oklch(0.939995 0.0161238 242.749)')).toThrow(/use paintedRgb/)
    expect(() => rgbOf('color(srgb 0.5 0.2 0.1)')).toThrow(/use paintedRgb/)
    expect(() => rgbOf('rgb(256, 0, 0)')).toThrow(/use paintedRgb/)
    expect(() => rgbOf('CanvasText')).toThrow(/use paintedRgb/)
    expect(() => rgbOf('')).toThrow(/use paintedRgb/)
  })

  test('throws on a translucent colour, which is not what the page painted', () => {
    expect(() => rgbOf('rgba(0, 0, 0, 0)')).toThrow(/opaque/)
    expect(() => rgbOf('rgba(10, 20, 30, 0.5)')).toThrow(/opaque/)
  })
})

/** A box on the open page, styled by hand, placed first in the demo. */
const addBox = (page: Page, css: string, parentCss = '') => page.evaluate(([own, parent]) => {
  const box = document.createElement('div')
  box.id = 'probe'
  box.textContent = 'probe'
  box.style.cssText = own ?? ''
  const holder = document.createElement('div')
  holder.style.cssText = parent ?? ''
  holder.append(box)
  document.querySelector('#demo')?.prepend(holder)
}, [css, parentCss])

test.describe('paintedRgb', () => {
  test('reads an oklch token colour as the sRGB the page paints, which rgbOf refuses', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    await addBox(page, 'width: 40px; height: 40px; background-color: oklch(0.939995 0.0161238 242.749)')
    const probe = page.locator('#probe')
    expect(await paintedRgb(probe, 'background-color')).toEqual([226, 237, 245])
    const box = await probe.boundingBox()
    if (!box) throw new Error('no probe')
    const [middle] = await pixelsOf(page, { x: Math.round(box.x) + 20, y: Math.round(box.y) + 20, width: 1, height: 1 })
    expect(middle).toEqual([226, 237, 245])
  })

  test('throws on a colour that is not opaque', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    await addBox(page, 'background-color: transparent')
    await expect(paintedRgb(page.locator('#probe'), 'background-color')).rejects.toThrow(/not opaque/)
  })
})

test.describe('viewportBox', () => {
  test('throws for a box that is not rendered, whose zeros would read as inside', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    await addBox(page, 'display: none; position: fixed; left: -5000px; width: 9000px')
    await expect(viewportBox(page.locator('#probe'))).rejects.toThrow(/not rendered/)
    await expect(expectInsideViewport(page.locator('#probe'))).rejects.toThrow(/not rendered/)
  })
})

test.describe('expectNoSidewaysScroll', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: fails for a box lost past the inline start, which scrollWidth never counts`, async ({ page }) => {
      await openLive(page, 'tooltip--basic', { direction })
      await expectNoSidewaysScroll(page)
      await addBox(page, 'width: 600px; height: 40px; margin-inline-start: -400px')
      await expect(expectNoSidewaysScroll(page)).rejects.toThrow(/lost past the inline start[\s\S]*div#probe/)
    })

    test(`${direction}: passes for the same box inside a scroll container or clipped away`, async ({ page }) => {
      await openLive(page, 'tooltip--basic', { direction })
      await addBox(page, 'width: 600px; height: 40px; margin-inline-start: -400px', 'overflow-x: auto')
      await expectNoSidewaysScroll(page)
      await page.locator('#probe').evaluate((box) => { box.parentElement?.remove() })
      await addBox(page, 'width: 600px; height: 40px; margin-inline-start: -400px; clip-path: inset(50%)')
      await expectNoSidewaysScroll(page)
    })
  }
})

test.describe('the static page list', () => {
  /** A repository of one component with the given demos, in a folder of its own. */
  const repo = (demos: readonly string[]) => {
    const root = mkdtempSync(join(tmpdir(), 'tc-pages-'))
    mkdirSync(join(root, 'src', 'components', 'tag', 'dummy'), { recursive: true })
    for (const demo of demos) writeFileSync(join(root, 'src', 'components', 'tag', 'dummy', `${demo}.tsx`), '')
    return root
  }

  test('a list that matches the demos on disk is fine; one missing or extra demo is named', () => {
    const root = repo(['basic', 'tones'])
    try {
      expect(demoListProblem(['tag--basic', 'tag--tones'], root)).toBeNull()
      expect(demoListProblem(['tag--basic'], root)).toBe('run pnpm harness:build first: .harness lists 1 demos, src has 2 (not built: tag--tones; gone: none)')
      expect(demoListProblem(['tag--basic', 'tag--tones', 'button--basic'], root)).toBe('run pnpm harness:build first: .harness lists 3 demos, src has 2 (not built: none; gone: button--basic)')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('a source file changed after the build is found, in a folder or named alone', () => {
    const root = repo(['basic'])
    const demo = join(root, 'src', 'components', 'tag', 'dummy', 'basic.tsx')
    try {
      utimesSync(demo, new Date(2000, 0, 1), new Date(2000, 0, 1))
      const built = new Date(2001, 0, 1).getTime()
      expect(newerSource(built, [join(root, 'src'), demo])).toBeNull()
      utimesSync(demo, new Date(2002, 0, 1), new Date(2002, 0, 1))
      expect(newerSource(built, [join(root, 'src')])).toBe(demo)
      expect(newerSource(built, [demo])).toBe(demo)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
