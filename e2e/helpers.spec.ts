import { expect, test, type Page } from '@playwright/test'

import { openLive } from './live.js'
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
