import { FOCUS_RING, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'

import { LOCALES, type Locale } from '../../content/pages'
import { LANGUAGE_NAMES } from '../../labels/index'

export interface LanguageSwitchProps {
  locale: Locale
  /** The path after the locale, the same page in either language: `/docs/css`, or empty for Home. */
  path: string
  label: string
}

const LINK = `inline-flex items-center rounded-control px-2 text-sm text-muted aria-[current=page]:font-semibold aria-[current=page]:text-body ${TOUCH_TARGET} ${FOCUS_RING} ${TRANSITION}`

/** Two links to the same page in each language; the direction follows the locale. TODO(tc): LanguageSwitcher (docs-site S4). */
export function LanguageSwitch({ locale, path, label }: LanguageSwitchProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex items-center gap-1">
        {LOCALES.map((target) => (
          <li key={target}>
            <a
              href={`/${target}${path}`}
              hrefLang={target}
              lang={target}
              aria-current={target === locale ? 'page' : undefined}
              className={LINK}
            >
              {LANGUAGE_NAMES[target]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
