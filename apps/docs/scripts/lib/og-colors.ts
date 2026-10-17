// Dark mode's colours as hex for the Open Graph images, which Satori draws from inline styles that no stylesheet reaches (S6).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { toLinearRgb } from '../../../../packages/topclassui/scripts/lib/color.js'
import { readBlocks, readPalette, resolve, tokensFor } from '../../../../packages/topclassui/scripts/lib/tokens.js'
import { LIBRARY } from './library.js'

export interface OgColors { page: string; surface: string; line: string; body: string; muted: string; primary: string }

const TOKENS = { page: '--tc-page', surface: '--tc-surface', line: '--tc-line-strong', body: '--tc-body', muted: '--tc-muted', primary: '--tc-primary-on-soft' } as const

const encode = (v: number) => {
  const n = Math.min(1, Math.max(0, v))
  return n <= 0.0031308 ? 12.92 * n : 1.055 * Math.pow(n, 1 / 2.4) - 0.055
}

export function ogColors(root = LIBRARY): OgColors {
  const tokens = tokensFor(readBlocks(readFileSync(join(root, 'src', 'tokens.css'), 'utf8')), 'dark')
  const palette = readPalette()
  return Object.fromEntries(Object.entries(TOKENS).map(([key, token]) => {
    const color = resolve(token, tokens, palette)
    if (color === null) throw new Error(`${token} does not resolve in dark mode`)
    const { r, g, b } = toLinearRgb(color)
    return [key, `#${[r, g, b].map((v) => Math.round(encode(v) * 255).toString(16).padStart(2, '0')).join('')}`]
  })) as unknown as OgColors
}
