import type { Locale } from '../content/pages'
import { guidesAr } from './guides-ar'
import { guidesEn } from './guides-en'
import type { GuideLabels } from './guides-types'

export type { GuideLabels } from './guides-types'

const BY_LOCALE: Record<Locale, GuideLabels> = { en: guidesEn, ar: guidesAr }

export function guideLabelsFor(locale: Locale): GuideLabels {
  return BY_LOCALE[locale]
}
