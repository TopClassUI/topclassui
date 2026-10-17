// R-9.2-4, R-10.5-1, R-10.5-3: the predicates check-structure runs on an overlay's exports and a bar's sources.

/** PLAN 10.5 rules 3 and 4: the overlays that scroll a body between a sticky header and footer, built or not. */
export const SCROLLING_OVERLAYS = ['dialog', 'alert-dialog', 'drawer'] as const

/** The sticky edges of shared/classes.ts and the variable each one's wearer writes its height to. */
export const STICKY_EDGES = [
  { constant: 'STICKY_TOP', variable: '--tc-sticky-top' },
  { constant: 'STICKY_BOTTOM', variable: '--tc-sticky-bottom' },
] as const

/** The folder name as the part prefix: date-picker is DatePicker. */
export function pascalOf(slug: string): string {
  return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')
}

/** Every value an index re-exports or declares, never a type: `export type { ... }` names no part. */
export function exportedValueNames(source: string): string[] {
  const names: string[] = []
  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of (match[1] ?? '').split(',')) {
      const spec = part.trim()
      if (!spec || spec.startsWith('type ')) continue
      names.push((spec.split(/\s+as\s+/)[1] ?? spec).trim())
    }
  }
  for (const match of source.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([\w$]+)/gm)) names.push(match[1] ?? '')
  return names
}

/** The `category` a meta.ts declares, or null when it declares none. */
export function categoryOf(meta: string): string | null {
  return /\bcategory:\s*['"]([\w-]+)['"]/.exec(meta)?.[1] ?? null
}

/**
 * Why an overlay folder breaks R-9.2-4, or null. A scrolling overlay is one PLAN 10.5 names, or any overlay
 * that exports a Header or a Footer: chrome around a content that must scroll, which only a Body can do.
 */
export function missingBody(slug: string, category: string | null, names: readonly string[]): string | null {
  const prefix = pascalOf(slug)
  const named = (SCROLLING_OVERLAYS as readonly string[]).includes(slug)
  const chrome = category === 'overlays' && (names.includes(`${prefix}Header`) || names.includes(`${prefix}Footer`))
  if (!named && !chrome || names.includes(`${prefix}Body`)) return null
  const why = named ? 'PLAN 10.5 names it a scrolling overlay' : `it exports a ${prefix}Header or a ${prefix}Footer`
  return `index.tsx exports no ${prefix}Body, and ${why}: the Body is its scroll container (R-9.2-4, R-10.5-1).`
}

/** The sticky variables a folder's sources wear the constant for and never write (R-10.5-3). Only the name as a
 * whole string counts, which is what setProperty takes: a comment or a description that mentions it writes nothing. */
export function unpublishedStickyEdges(sources: readonly string[]): string[] {
  const text = sources.join('\n')
  return STICKY_EDGES
    .filter(({ constant, variable }) => new RegExp(String.raw`\b${constant}\b`).test(text) && !new RegExp(`(['"\`])${variable}\\1`).test(text))
    .map(({ variable }) => variable)
}
