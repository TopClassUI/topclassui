// R-4-1: an unlayered rule outranks every consumer utility whatever its specificity,
// and cn() cannot fix that, so only custom properties may sit outside a layer.
import { isAtRule, parseCss } from './css-parse.js'

/** At-rules whose contents a cascade layer cannot reorder, so layering them is moot. */
const EXEMPT = [
  '@layer', '@keyframes', '@utility', '@custom-variant',
  '@font-face', '@property', '@counter-style', '@font-palette-values',
]

export interface Offence { line: number; property: string; selector: string }

/** Every declaration that is not a custom property and sits outside a cascade layer. */
export function findUnlayeredDeclarations(css: string): Offence[] {
  const out: Offence[] = []
  for (const rule of parseCss(css).rules) {
    const chain = [...rule.ancestors, rule.prelude]
    if (chain.some((p) => EXEMPT.some((at) => isAtRule(p, at)))) continue
    for (const d of rule.declarations) {
      if (d.property.startsWith('--')) continue
      out.push({ line: d.line, property: d.property, selector: rule.prelude })
    }
  }
  return out
}

/** R-4-3: R-5.12-3 reaches CSS too, and no linter in the toolchain reads a stylesheet. */
export function findLongComments(css: string): Comment[] {
  return parseCss(css).comments.filter((c) => c.span > 1)
}

export interface Comment { line: number; span: number }
