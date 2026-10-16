// R-5.6-4: every pair in every mode, against every surface it can sit on, taking the
// worse of the two gamut readings and then failing anything within MARGIN of its floor.
import { type Color, contrastRange } from './color.js'
import { TONES } from '#shared/contracts/tone.js'

import { declaredModes, readBlocks, resolve, tokensFor } from './tokens.js'

/** A colour as a key, so the same reading taken twice is counted once. */
const key = (c: Color) => `${c.l.toFixed(6)}/${c.c.toFixed(6)}/${c.h.toFixed(4)}/${c.alpha.toFixed(4)}`

export const MARGIN = 0.15
export const VISIBLE_STEP = 1.06
export const STATE_STEP = 1.02

/** Re-exported from the contract, so a new tone is measured without touching this file. */
export { TONES } from '#shared/contracts/tone.js'
export const SURFACES = ['page', 'surface', 'surface-raised'] as const
export const MODES = ['light', 'dark', 'ocean'] as const

export interface Report { failures: string[]; pairs: number; distinct: number }

export function checkTokens(css: string, palette: Map<string, Color>): Report {
  const blocks = readBlocks(css)
  const failures: string[] = []
  let pairs = 0

  // Light and ocean share most tokens, so the call count overstates what was measured.
  const readings = new Set<string>()
  /** The worse of the two gamut readings, so the margin covers browsers, not our maths. */
  const worst = (a: Color, b: Color) => {
    readings.add([key(a), key(b)].sort().join(' vs '))
    return contrastRange(a, b).min
  }

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
    const track = get('--tc-neutral-soft')

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
      // Meter and Progress paint the bar in the text colour on the neutral track: a graphic, so 3:1.
      check(`${mode}: ${tone} bar on the neutral track`, onSoft && track && worst(onSoft, track), 3)

      if (!soft) { failures.push(`${mode}: --tc-${tone}-soft could not be resolved`); continue }
      if (!solid) { failures.push(`${mode}: --tc-${tone}-solid could not be resolved`); continue }

      // The solid ramp must keep stepping, or a hover that paints the resting colour passes.
      let fill = solid
      for (const state of ['hover', 'active'] as const) {
        const next = get(`--tc-${tone}-${state}`)
        if (!next) { failures.push(`${mode}: --tc-${tone}-${state} could not be resolved`); continue }
        pairs++
        const moved = Math.min(worst(next, fill), worst(next, solid))
        if (moved < STATE_STEP) {
          failures.push(`${mode}: ${tone}-${state} does not step away from the resting fill (${moved.toFixed(3)})`)
        }
        // A label must stay readable while the control is hovered or pressed.
        check(`${mode}: ${tone} label on its ${state} fill`, onSolid && worst(onSolid, next), 4.5)
        fill = next
      }

      // The soft ramp must keep stepping, or hovering a tinted control does nothing.
      let tint = soft
      for (const step of ['soft-hover', 'soft-active'] as const) {
        const next = get(`--tc-${tone}-${step}`)
        if (!next) { failures.push(`${mode}: --tc-${tone}-${step} could not be resolved`); continue }
        pairs++
        const moved = Math.min(worst(next, tint), worst(next, soft))
        if (moved < STATE_STEP) {
          failures.push(`${mode}: ${tone}-${step} does not step away from the resting tint (${moved.toFixed(3)})`)
        }
        // The label sits on the hovered and pressed tint too, not only on the resting one.
        check(`${mode}: ${tone} text on its ${step} tint`, onSoft && worst(onSoft, next), 4.5)
        tint = next
      }

      // A tint nobody can see is not a tint, so it must step away from every surface.
      for (const surface of surfaces) {
        if (!surface.color) continue
        // outline, ghost and link have no fill, so the label rests straight on the surface.
        check(`${mode}: ${tone} text on ${surface.name}`, onSoft && worst(onSoft, surface.color), 4.5)
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

    // A component with no tone reads the globals, which must be the primary tone.
    for (const name of ['soft', 'hover', 'active', 'soft-hover', 'soft-active'] as const) {
      const global = get(`--tc-${name}`)
      const primary = get(`--tc-primary-${name}`)
      if (!global || !primary) { failures.push(`${mode}: --tc-${name} could not be resolved`); continue }
      pairs++
      if (worst(global, primary) > 1.001) {
        failures.push(`${mode}: --tc-${name} is not the primary tone, so a toneless control is off-palette`)
      }
    }
  }
  return { failures, pairs, distinct: readings.size }
}
