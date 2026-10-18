// The library facts Home, the manifest and the Shiki contrast test print, read from the library's own sources.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { type Color, contrast, toLinearRgb, toOklch } from '../../../../packages/topclassui/scripts/lib/color.js'
import { checkTokens } from '../../../../packages/topclassui/scripts/lib/contrast-checks.js'
import { DIRECTIONS, MODES, findDemos } from '../../../../packages/topclassui/scripts/lib/harness.js'
import { readBlocks, readPalette, resolve, tokensFor } from '../../../../packages/topclassui/scripts/lib/tokens.js'
import type { LibraryFacts } from '../../lib/library-facts.js'
import { LIBRARY } from './library.js'

export type { LibraryFacts } from '../../lib/library-facts.js'

const encode = (v: number) => {
  const n = Math.min(1, Math.max(0, v))
  return n <= 0.0031308 ? 12.92 * n : 1.055 * Math.pow(n, 1 / 2.4) - 0.055
}
const decode = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))

export function hexOf(color: Color): string {
  const { r, g, b } = toLinearRgb(color)
  return `#${[r, g, b].map((v) => Math.round(encode(v) * 255).toString(16).padStart(2, '0')).join('')}`
}

export function colorOfHex(hex: string): Color {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => decode(parseInt(hex.slice(i, i + 2), 16) / 255))
  return toOklch({ r, g, b })
}

/** WCAG contrast of two `#rrggbb` colours. */
export function contrastOfHex(a: string, b: string): number {
  return contrast(colorOfHex(a), colorOfHex(b))
}

export function libraryFacts(root = LIBRARY): LibraryFacts {
  const css = readFileSync(join(root, 'src', 'tokens.css'), 'utf8')
  const palette = readPalette()
  const blocks = readBlocks(css)
  const read = (token: string, mode: (typeof MODES)[number]) => {
    const color = resolve(token, tokensFor(blocks, mode), palette)
    if (color === null) throw new Error(`${token} does not resolve in ${mode}`)
    return hexOf(color)
  }
  const byMode = (token: string) => Object.fromEntries(MODES.map((mode) => [mode, read(token, mode)])) as LibraryFacts['page']
  const demos = findDemos(root).length
  return {
    page: byMode('--tc-page'),
    codeSurface: byMode('--tc-neutral-solid'),
    dark: { body: read('--tc-body', 'dark'), muted: read('--tc-muted', 'dark'), primary: read('--tc-primary-solid', 'dark') },
    checks: {
      demos,
      modes: MODES.length,
      directions: DIRECTIONS.length,
      pages: demos * MODES.length * DIRECTIONS.length,
      contrastPairs: checkTokens(css, palette).pairs,
    },
  }
}
