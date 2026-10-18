import { Icon } from 'topclassui/icon'
import type { IconName } from 'topclassui/icons'

import type { Locale } from '../../content/pages'
import { GUIDES } from '../../lib/guides'
import { IconFinder } from './icon-finder'

/** All 84, each drawn on the server with `<Icon name>`; the search and the filter are a small client island over them. */
export function IconGrid({ locale }: { locale: Locale }) {
  const icons = GUIDES.icons.all.map((icon) => ({ ...icon, glyph: <Icon name={icon.name as IconName} /> }))
  return <IconFinder icons={icons} locale={locale} />
}
