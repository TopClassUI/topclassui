import { ar } from './ar.js'
import { en } from './en.js'
import type { Labels, PartialLabels } from './types.js'

export type NumberingSystem = 'latn' | 'arab'

const BUILT_IN: Record<string, Labels> = { en, ar }

/** Spelled out rather than looped, so a new group in Labels fails to compile until it is handled. */
function withOverrides(base: Labels, overrides?: PartialLabels): Labels {
  if (!overrides) return base
  return {
    common: { ...base.common, ...overrides.common },
    state: { ...base.state, ...overrides.state },
    collection: { ...base.collection, ...overrides.collection },
    pagination: { ...base.pagination, ...overrides.pagination },
    select: { ...base.select, ...overrides.select },
    dialog: { ...base.dialog, ...overrides.dialog },
    file: { ...base.file, ...overrides.file },
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
  const language = locale.split('-')[0] ?? 'en'
  const base = BUILT_IN[language] ?? en
  return { locale, labels: withOverrides(base, overrides) }
}

/** One formatter per provider, because creating an Intl.NumberFormat is not cheap. */
export function createNumberFormat(locale: string, numberingSystem: NumberingSystem = 'latn') {
  return new Intl.NumberFormat(locale, { numberingSystem })
}
