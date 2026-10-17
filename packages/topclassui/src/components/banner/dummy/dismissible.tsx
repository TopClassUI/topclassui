import { bell } from '#icons/data/bell.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

/** Two banners a visitor can dismiss, each remembered by its own id: the x hides one and leaves the other. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Banner
        dismissible
        id="release-v2"
        tone="info"
        aria-label="Release announcement"
        icon={<Svg icon={bell} size="xs" />}
        action={<Button size="sm" variant="outline" tone="info" render={<a href="/changelog" />}>Read the changelog</Button>}
      >
        Version 2 is out, with faster builds and a new theme editor.
      </Banner>
      <Banner dismissible id="maintenance-sunday" tone="warning" aria-label="Maintenance notice">
        Scheduled maintenance starts on Sunday at 02:00 UTC.
      </Banner>
    </div>
  )
}
