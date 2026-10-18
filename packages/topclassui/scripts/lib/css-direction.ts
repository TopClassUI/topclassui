// R-5.3-2 reaches CSS too: the eslint rule reads class strings, and this reads the stylesheets.
import { findPhysicalDeclaration } from '../../eslint-rules/dir-aware.ts'
import { parseCss } from './css-parse.js'

export interface DirOffence { line: number; property: string; value: string; hint: string }

const DIR_SCOPE = /dir=["']?(rtl|ltr)|:dir\((rtl|ltr)\)/

/** Every declaration that translates, sets an origin, points a gradient or places a position along a physical x. */
export function findPhysicalDirection(css: string): DirOffence[] {
  const out: DirOffence[] = []
  for (const rule of parseCss(css).rules) {
    const scoped = [...rule.ancestors, rule.prelude].some((p) => DIR_SCOPE.test(p))
    for (const d of rule.declarations) {
      const hint = findPhysicalDeclaration(d.property, d.value, scoped)
      if (hint) out.push({ line: d.line, property: d.property, value: d.value, hint })
    }
  }
  return out
}
