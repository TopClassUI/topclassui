import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { ar } from '#shared/labels/ar.js'
import { AvatarGroup } from '../index.js'

/** One letter each: two Arabic initials are wider than the part of a circle an overlap leaves. */
const TEAM = [
  ['ع', 'عمر فتحي'], ['ل', 'لينا حداد'], ['س', 'سارة خليل'], ['م', 'منى ناصر'],
  ['ر', 'رامي طحان'], ['ي', 'يارا بكري'], ['د', 'دانا فارس'],
] as const

/** The row starts on the right and overlaps toward it; the counter is named in Arabic. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-col items-start gap-4">
      <AvatarGroup labels={ar} locale="ar" aria-label="فريق التصميم">
        {TEAM.map(([initials, name]) => (
          <AvatarRoot key={initials} role="img" aria-label={name}>
            <AvatarFallback>{initials}</AvatarFallback>
          </AvatarRoot>
        ))}
      </AvatarGroup>
      <AvatarGroup labels={ar} locale="ar" aria-label="المراجعون">
        {TEAM.slice(0, 2).map(([initials, name]) => (
          <AvatarRoot key={initials} role="img" aria-label={name}>
            <AvatarFallback>{initials}</AvatarFallback>
          </AvatarRoot>
        ))}
      </AvatarGroup>
    </div>
  )
}
