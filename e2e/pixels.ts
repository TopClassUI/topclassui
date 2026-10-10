// What a class list and a computed style cannot see: the pixels a page painted, read back for a spec.
import type { Page } from '@playwright/test'

export interface Clip { x: number; y: number; width: number; height: number }
export type Rgb = readonly [number, number, number]

/** Canvas as Chromium emulates it under forced colours, for each palette. */
export const FORCED_CANVAS = { light: [255, 255, 255], dark: [0, 0, 0] } as const satisfies Record<string, Rgb>

/** The pixels of a clip, row by row, decoded in the browser so no image library is needed. */
export async function pixelsOf(page: Page, clip: Clip): Promise<Rgb[]> {
  const png = await page.screenshot({ clip, animations: 'disabled' })
  const flat = await page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const pen = canvas.getContext('2d')
    if (!pen) throw new Error('no canvas')
    pen.drawImage(image, 0, 0)
    return [...pen.getImageData(0, 0, image.width, image.height).data]
  }, png.toString('base64'))

  const pixels: Rgb[] = []
  for (let at = 0; at < flat.length; at += 4) pixels.push([flat[at] ?? 0, flat[at + 1] ?? 0, flat[at + 2] ?? 0])
  return pixels
}

const linear = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)
const luminance = ([r, g, b]: Rgb) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)

/** WCAG contrast of two colours, from 1 to 21. */
export function contrast(a: Rgb, b: Rgb): number {
  const [la, lb] = [luminance(a), luminance(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** How many pixels stand out from a backdrop. At 3:1, the default, a smoothed edge is not counted. */
export function inkOn(pixels: readonly Rgb[], backdrop: Rgb, ratio = 3): number {
  return pixels.filter((pixel) => contrast(pixel, backdrop) >= ratio).length
}

/** How many pixels are not the backdrop at all: zero means nothing was painted over it. */
export function strayOn(pixels: readonly Rgb[], backdrop: Rgb): number {
  return pixels.filter((pixel) => pixel.some((channel, index) => channel !== backdrop[index])).length
}

/** How many pixels are exactly one colour: a fill, as against the smoothed edge of a glyph on it. */
export function paintedIn(pixels: readonly Rgb[], colour: Rgb): number {
  return pixels.length - strayOn(pixels, colour)
}

/** A computed colour as numbers: `rgb(55, 0, 110)` is [55, 0, 110]. */
export function rgbOf(computed: string): Rgb {
  const [r = 0, g = 0, b = 0] = (computed.match(/\d+/g) ?? []).map(Number)
  return [r, g, b]
}
