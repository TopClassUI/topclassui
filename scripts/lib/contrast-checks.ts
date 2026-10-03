// R-5.6-4: every pair in every mode, against every surface it can sit on, taking the
// worse of the two gamut readings and then failing anything within MARGIN of its floor.
import { type Color, contrastRange } from './color.js'
import { declaredModes, readBlocks, resolve, tokensFor } from './tokens.js'

/** The worse of the two gamut readings, so the margin covers browsers, not our maths. */
const worst = (a: Color, b: Color) => contrastRange(a, b).min

const MARGIN = 0.15
const VISIBLE_STEP = 1.06
const STATE_STEP = 1.02

export const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const
export const SURFACES = ['page', 'surface', 'surface-raised'] as const
export const MODES = ['light', 'dark', 'ocean'] as const

export interface Report { failures: string[]; pairs: number }

export function checkTokens(css: string, palette: Map<string, Color>): Report {
  const blocks = readBlocks(css)
  const failures: string[] = []
  let pairs = 0

  // Without this a renamed or misquoted block is measured with the base values and passes.
  const declared = declaredModes(blocks)
  for (const mode of MODES) {
    if (mode !== 'light' && !declared.has(mode)) {
      failures.push(`${mode}: no block declares [data-theme='${mode}'], so it would be measured as light`)
    }
  }

  const check = (label: string, ratio: number | null, min: number) => {
    if (ratio === null) { failures.push(`${label}: could not be resolved`); return }
    pairs++
    if (ratio < min + MARGIN) {
      const why = ratio < min ? 'fails' : `is within ${String(MARGIN)} of the threshold`
      failures.push(`${label}: ${ratio.toFixed(2)}:1 ${why}, needs ${String(min)}:1`)
    }
  }

  for (const mode of MODES) {
    const tokens = tokensFor(blocks, mode)
    const get = (name: string) => resolve(name, tokens, palette)
    const surfaces = SURFACES.map((s) => ({ name: s, color: get(`--tc-${s}`) }))

    for (const surface of surfaces) {
      if (!surface.color) { failures.push(`${mode}: --tc-${surface.name} missing`); continue }

      // Body and muted text must read on every surface.
      for (const text of ['body', 'muted'] as const) {
        const c = get(`--tc-${text}`)
        check(`${mode}: ${text} on ${surface.name}`, c && worst(c, surface.color), 4.5)
      }

      // A control boundary, the focus ring and a meaningful icon need 3:1 everywhere.
      for (const token of ['line-strong', 'ring'] as const) {
        const c = get(`--tc-${token}`)
        check(`${mode}: ${token} on ${surface.name}`, c && worst(c, surface.color), 3)
      }
    }

    for (const tone of TONES) {
      const solid = get(`--tc-${tone}-solid`)
      const onSolid = get(`--tc-${tone}-on-solid`)
      const soft = get(`--tc-${tone}-soft`)
      const onSoft = get(`--tc-${tone}-on-soft`)

      check(`${mode}: ${tone} label on its fill`, solid && onSolid && worst(onSolid, solid), 4.5)
      check(`${mode}: ${tone} text on its tint`, soft && onSoft && worst(onSoft, soft), 4.5)

      if (!soft) { failures.push(`${mode}: --tc-${tone}-soft could not be resolved`); continue }

      // A tint nobody can see is not a tint, so it must step away from every surface.
      for (const surface of surfaces) {
        if (!surface.color) continue
        const step = worst(soft, surface.color)
        pairs++
        if (step < VISIBLE_STEP) {
          failures.push(
            `${mode}: ${tone}-soft is invisible on ${surface.name}`
            + ` (${step.toFixed(3)}, needs a ${String(VISIBLE_STEP)} step)`,
          )
        }
      }
    }

    // A label must stay readable while the control is hovered or pressed.
    const onSolid = get('--tc-primary-on-solid')
    for (const state of ['hover', 'active'] as const) {
      const fill = get(`--tc-${state}`)
      check(`${mode}: primary label on its ${state} fill`, onSolid && fill && worst(onSolid, fill), 4.5)
    }

    // The hover and active tints must keep stepping, or a hover does nothing.
    let previous = get('--tc-primary-soft')
    for (const token of ['soft-hover', 'soft-active'] as const) {
      const c = get(`--tc-${token}`)
      if (!c || !previous) { failures.push(`${mode}: --tc-${token} could not be resolved`); continue }
      pairs++
      const step = worst(c, previous)
      if (step < STATE_STEP) {
        failures.push(`${mode}: ${token} does not step away from the tint before it (${step.toFixed(3)})`)
      }
      previous = c
    }
  }
  return { failures, pairs }
}
