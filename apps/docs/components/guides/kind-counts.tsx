import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import { KIND_COUNTS } from '../../lib/guides'

/** How many imports are of each kind today, counted from meta.ts at build time (docs-site page 11). */
export function KindCounts({ locale }: { locale: Locale }) {
  const { server, split, client, total } = KIND_COUNTS
  return <p className="text-base text-muted">{guideLabelsFor(locale).kinds(server, split, client, total)}</p>
}
