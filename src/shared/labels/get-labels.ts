import { ar } from './ar.js'
import { en } from './en.js'
import type { Labels, PartialLabels } from './types.js'

export type NumberingSystem = 'latn' | 'arab'

const BUILT_IN: Record<string, Labels> = { en, ar }

/** A spread would write an explicit undefined over the default and crash at render. */
function group<T extends object>(base: T, over: Partial<T> | undefined): T {
  if (!over) return base
  const out = { ...base }
  for (const [key, value] of Object.entries(over)) {
    if (value !== undefined) (out as Record<string, unknown>)[key] = value
  }
  return out
}

/** Spelled out rather than looped, so a new group in Labels fails to compile until it is handled. */
function withOverrides(base: Labels, overrides?: PartialLabels): Labels {
  if (!overrides) return base
  return {
    common: group(base.common, overrides.common),
    state: group(base.state, overrides.state),
    collection: group(base.collection, overrides.collection),
    pagination: group(base.pagination, overrides.pagination),
    select: group(base.select, overrides.select),
    dialog: group(base.dialog, overrides.dialog),
    file: group(base.file, overrides.file),
  }
}

/**
 * R-5.11-1: locale travels with labels, so a Server Component receives both as props
 * and never has to read context, which does not exist in its render.
 */
export function getLabels(
  locale = 'en',
  overrides?: PartialLabels,
): { locale: string; labels: Labels } {
  const language = locale.split(/[-_]/)[0] ?? 'en'
  const base = BUILT_IN[language] ?? en
  return { locale, labels: withOverrides(base, overrides) }
}

/** One formatter per provider, because creating an Intl.NumberFormat is not cheap. */
export function createNumberFormat(locale: string, numberingSystem: NumberingSystem = 'latn') {
  // An invalid tag throws RangeError, and a bad prop must not take the whole tree down.
  for (const tag of [locale, locale.split(/[-_]/)[0] ?? 'en']) {
    try {
      return new Intl.NumberFormat(tag, { numberingSystem })
    } catch {
      continue
    }
  }
  return new Intl.NumberFormat('en', { numberingSystem })
}
